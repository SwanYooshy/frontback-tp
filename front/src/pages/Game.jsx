import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import HUD          from '../components/game/HUD';
import TowerPanel   from '../components/game/TowerPanel';
import AIComment    from '../components/game/AIComment';
import PhaserGame   from '../components/game/PhaserGame';

const LEVEL_ID    = 1;
const TOTAL_WAVES = 10;
const GOLD_START  = 200;
const SELL_RATIO  = 0.5;

export default function Game() {
  const navigate = useNavigate();

  // État partie
  const [gameId,          setGameId]          = useState(null);
  const [phase,           setPhase]           = useState('idle');
  const [lives,           setLives]           = useState(20);
  const [gold,            setGold]            = useState(GOLD_START);
  const [goldSpent,       setGoldSpent]       = useState(0);
  const [score,           setScore]           = useState(0);
  const [waveNumber,      setWaveNumber]      = useState(0);
  const [aiComment,       setAiComment]       = useState('');
  const [blobsEliminated, setBlobsEliminated] = useState(0);

  // Tours
  const [towerTypes,           setTowerTypes]           = useState([]);
  const [placedTowers,         setPlacedTowers]         = useState([]);
  const [selectedTowerType,    setSelectedTowerType]    = useState(null);
  const [selectedPlacedTower,  setSelectedPlacedTower]  = useState(null);

  // Blobs
  const [blobsActive,   setBlobsActive]   = useState([]);
  const blobIntervalRef = useRef(null);

  // Refs pour éviter les valeurs stales dans les closures
  const livesRef        = useRef(lives);
  const scoreRef        = useRef(score);
  const blobsElimRef    = useRef(blobsEliminated);
  const goldRef         = useRef(gold);

  useEffect(() => { livesRef.current     = lives;          }, [lives]);
  useEffect(() => { scoreRef.current     = score;          }, [score]);
  useEffect(() => { blobsElimRef.current = blobsEliminated;}, [blobsEliminated]);
  useEffect(() => { goldRef.current      = gold;           }, [gold]);

  useEffect(() => {
    fetchTowerTypes();
    startGame();
  }, []);

  async function fetchTowerTypes() {
    try {
      const { data } = await client.get('/tour-types');
      setTowerTypes(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function startGame() {
    try {
      const { data } = await client.post('/parties', { id_niveau: LEVEL_ID });
      setGameId(data.id_partie);
    } catch (err) {
      console.error(err);
    }
  }

  async function launchWave() {
    if (!gameId || phase === 'wave') return;
    setPhase('wave');
    setSelectedTowerType(null);
    setSelectedPlacedTower(null);

    try {
      const { data } = await client.post(`/parties/${gameId}/vagues`);
      const nextWave = waveNumber + 1;
      setWaveNumber(nextWave);
      simulateWave(data.composition, nextWave);
    } catch (err) {
      console.error(err);
      setPhase('between');
    }
  }

  function simulateWave(composition, waveNum) {
    const blobs = [];
    composition.forEach(c => {
        for (let i = 0; i < c.quantite; i++) {
        blobs.push({
            id:           Math.random(),
            id_blob_type: c.id_blob_type,
            nom:          c.nom,
            pv:           c.pv_base,
            pv_max:       c.pv_base,
            hp_ratio:     1,
            progress:     -(i * 0.08),
            speed:        c.vitesse * 0.003,
            alive:        true,
        });
        }
    });

    setBlobsActive(blobs);

    let eliminated = 0;
    let livesLost  = 0;
    const blobsRef        = { current: blobs };
    const placedTowersRef = { current: placedTowers };

    // Snapshot des tours au début de la vague
    refreshTowers().then(() => {
        placedTowersRef.current = placedTowers;
    });

    blobIntervalRef.current = setInterval(() => {
        blobsRef.current = blobsRef.current.map(blob => {
        if (!blob.alive) return blob;

        const newProgress = blob.progress + blob.speed;
        let newPv = blob.pv;

        // Calcul des dégâts des tours
        if (newProgress >= 0) {
            const pathIndex = Math.min(
            Math.floor(newProgress * (16 - 1)),
            15
            );
            const blobGridX = [0,1,2,3,3,4,5,5,6,7,7,8,9,9,10,11][pathIndex] ?? 0;
            const blobGridY = [3,3,3,3,1,1,1,4,4,4,2,2,2,4,4,4][pathIndex]  ?? 0;

            placedTowersRef.current.forEach(tower => {
            const dist = Math.hypot(tower.pos_x - blobGridX, tower.pos_y - blobGridY);
            if (dist <= tower.portee) {
                // Chaque tick à 50ms, vitesse_attaque = attaques/seconde
                // Probabilité de toucher ce tick = vitesse_attaque * 0.05
                if (Math.random() < tower.vitesse_attaque * 0.05) {
                newPv -= tower.degats_base;
                }
            }
            });
        }

        // Blob mort
        if (newPv <= 0) {
            eliminated++;
            setBlobsEliminated(prev => prev + 1);
            setGold(prev => prev + 10);
            setScore(prev => prev + 100);
            return { ...blob, alive: false, progress: newProgress };
        }

        // Blob arrivé à destination
        if (newProgress >= 1) {
            livesLost++;
            setLives(prev => {
            const next = prev - 1;
            if (next <= 0) {
                clearInterval(blobIntervalRef.current);
                setBlobsActive([]);
                finishWave(waveNum, eliminated, livesLost);
            }
            return Math.max(0, next);
            });
            return { ...blob, alive: false, progress: newProgress };
        }

        return { ...blob, pv: newPv, hp_ratio: newPv / blob.pv_max, progress: newProgress };
        });

        setBlobsActive([...blobsRef.current]);

        const allDone = blobsRef.current.every(b => !b.alive || b.progress >= 1);
        if (allDone) {
        clearInterval(blobIntervalRef.current);
        setBlobsActive([]);
        finishWave(waveNum, eliminated, livesLost);
        }
    }, 50);
    }

  async function finishWave(waveNum, eliminated, livesLost) {
    try {
      const { data } = await client.patch(`/parties/${gameId}/vagues/${waveNum}/terminer`, {
        blobs_elimines: eliminated,
        or_gagne:       eliminated * 10,
        vies_perdues:   livesLost,
      });
      setAiComment(data.comment);
    } catch (err) {
      console.error(err);
    }

    if (livesRef.current <= 0 || waveNum >= TOTAL_WAVES) {
      endGame();
    } else {
      setPhase('between');
    }
  }

  async function endGame() {
    clearInterval(blobIntervalRef.current);
    setPhase('gameover');

    try {
      await client.patch(`/parties/${gameId}/terminer`, {
        score: {
          points:         scoreRef.current,
          blobs_elimines: blobsElimRef.current,
          or_depense:     goldSpent,
          vagues_passees: waveNumber,
        }
      });
    } catch (err) {
      console.error(err);
    }

    navigate(`/results/${gameId}`);
  }

  async function handleTilePlaceTower(col, row) {
    if (!gameId || !selectedTowerType || phase === 'wave') return;
    if (gold < selectedTowerType.cout_or) return;

    try {
      await client.post(`/parties/${gameId}/tours`, {
        id_tour_type: selectedTowerType.id_tour_type,
        pos_x: col,
        pos_y: row,
      });
      setGold(prev => prev - selectedTowerType.cout_or);
      setGoldSpent(prev => prev + selectedTowerType.cout_or);
      setSelectedTowerType(null);
      refreshTowers();
    } catch (err) {
      console.error(err);
    }
  }

  async function refreshTowers() {
    try {
      const { data } = await client.get(`/parties/${gameId}/tours`);
      setPlacedTowers(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleUpgrade() {
    if (!selectedPlacedTower) return;
    const upgradeCost = Math.floor(selectedPlacedTower.cout_or * 0.6);
    try {
      await client.patch(`/parties/${gameId}/tours/${selectedPlacedTower.id_tour_placee}/upgrade`);
      setGold(prev => prev - upgradeCost);
      setGoldSpent(prev => prev + upgradeCost);
      setSelectedPlacedTower(prev => ({ ...prev, niveau_upgrade: prev.niveau_upgrade + 1 }));
      refreshTowers();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleSell() {
    if (!selectedPlacedTower) return;
    const refund = Math.floor(selectedPlacedTower.cout_or * SELL_RATIO);
    try {
      await client.delete(`/parties/${gameId}/tours/${selectedPlacedTower.id_tour_placee}`);
      setGold(prev => prev + refund);
      setSelectedPlacedTower(null);
      refreshTowers();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="h-screen bg-gray-950 text-white flex flex-col overflow-hidden">

      <HUD
        lives={lives}
        gold={gold}
        waveNumber={waveNumber}
        totalWaves={TOTAL_WAVES}
        score={score}
      />

      <div className="flex flex-1 overflow-hidden">

        {/* Canvas */}
        <div className="flex-1 flex items-center justify-center relative bg-gray-950 overflow-hidden">
          <div className="relative flex-shrink-0">
            <PhaserGame
              placedTowers={placedTowers}
              selectedTowerType={selectedTowerType}
              onTilePlaceTower={handleTilePlaceTower}
              onSelectPlacedTower={(t) => {
                setSelectedPlacedTower(t);
                setSelectedTowerType(null);
              }}
              blobsActive={blobsActive}
            />
            <AIComment comment={aiComment} />
          </div>

          {(phase === 'idle' || phase === 'between') && (
            <button
              onClick={launchWave}
              className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white text-gray-900 px-8 py-3 rounded-xl font-bold text-lg hover:bg-gray-200 transition shadow-lg"
            >
              {phase === 'idle' ? 'Lancer la partie' : `Lancer la vague ${waveNumber + 1}`}
            </button>
          )}

          {phase === 'wave' && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-gray-800 text-gray-400 px-6 py-3 rounded-xl text-sm">
              Vague en cours...
            </div>
          )}
        </div>

        {/* Panneau tours */}
        <TowerPanel
          towerTypes={towerTypes}
          selectedTowerType={selectedTowerType}
          selectedPlacedTower={selectedPlacedTower}
          gold={gold}
          onSelectType={setSelectedTowerType}
          onUpgrade={handleUpgrade}
          onSell={handleSell}
        />
      </div>
    </div>
  );
}