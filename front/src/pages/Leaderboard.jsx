import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import client from '../api/client';
import Layout from '../components/Layout';

export default function Leaderboard() {
  const { isAuthenticated, player } = useAuth();

  const [scores, setScores]         = useState([]);
  const [myScores, setMyScores]     = useState([]);
  const [levelFilter, setLevelFilter] = useState('');
  const [levels, setLevels]         = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    fetchScores();
    if (isAuthenticated) fetchMyScores();
  }, [levelFilter]);

  async function fetchScores() {
    setLoading(true);
    try {
      const params = levelFilter ? `?level_id=${levelFilter}` : '';
      const { data } = await client.get(`/leaderboard${params}`);
      setScores(data);

      // Extraire les niveaux uniques pour le filtre
      const uniqueLevels = [...new Map(data.map(s => [s.id_niveau, { id: s.id_niveau, name: s.level_name }])).values()];
      setLevels(uniqueLevels);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchMyScores() {
    try {
      const { data } = await client.get('/leaderboard/me');
      setMyScores(data);
    } catch (err) {
      console.error(err);
    }
  }

  function getRankDisplay(index) {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `#${index + 1}`;
  }

  function formatDate(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('fr-FR');
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
    <Layout>
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-10">

        <h1 className="text-3xl font-bold mb-8">Classement mondial</h1>

        {/* Filtre niveau */}
        <div className="flex items-center gap-4 mb-6">
          <span className="text-gray-400 text-sm">Filtrer par niveau :</span>
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            <option value="">Tous les niveaux</option>
            {levels.map(l => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
        </div>

        {/* Tableau global */}
        {loading ? (
          <div className="text-center text-gray-500 py-20">Chargement...</div>
        ) : scores.length === 0 ? (
          <div className="text-center text-gray-500 py-20">
            Aucun score pour l'instant. Soyez le premier !
          </div>
        ) : (
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden mb-10">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400 text-left">
                  <th className="px-4 py-3 w-16">Rang</th>
                  <th className="px-4 py-3">Joueur</th>
                  <th className="px-4 py-3">Score</th>
                  <th className="px-4 py-3 hidden md:table-cell">Niveau</th>
                  <th className="px-4 py-3 hidden md:table-cell">Blobs</th>
                  <th className="px-4 py-3 hidden md:table-cell">Date</th>
                </tr>
              </thead>
              <tbody>
                {scores.map((s, i) => (
                  <tr
                    key={i}
                    className={`border-b border-gray-800 last:border-0 transition
                      ${s.pseudo === player?.pseudo ? 'bg-gray-800' : 'hover:bg-gray-800/50'}`}
                  >
                    <td className="px-4 py-3 text-lg">{getRankDisplay(i)}</td>
                    <td className="px-4 py-3 font-medium">
                      {s.pseudo}
                      {s.pseudo === player?.pseudo && (
                        <span className="ml-2 text-xs text-gray-400">(vous)</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-bold text-white">
                      {s.points.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-gray-400 hidden md:table-cell">
                      {s.level_name}
                    </td>
                    <td className="px-4 py-3 text-gray-400 hidden md:table-cell">
                      {s.blobs_elimines}
                    </td>
                    <td className="px-4 py-3 text-gray-400 hidden md:table-cell">
                      {formatDate(s.played_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Mes meilleurs scores */}
        {isAuthenticated && (
          <div>
            <h2 className="text-xl font-bold mb-4">Mes meilleurs scores</h2>
            {myScores.length === 0 ? (
              <div className="bg-gray-900 border border-gray-800 rounded-xl px-6 py-10 text-center text-gray-500">
                Vous n'avez pas encore terminé de partie.{' '}
                <Link to="/game" className="text-white underline">Jouer maintenant</Link>
              </div>
            ) : (
              <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800 text-gray-400 text-left">
                      <th className="px-4 py-3">Score</th>
                      <th className="px-4 py-3">Niveau</th>
                      <th className="px-4 py-3 hidden md:table-cell">Vagues</th>
                      <th className="px-4 py-3 hidden md:table-cell">Blobs</th>
                      <th className="px-4 py-3 hidden md:table-cell">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myScores.map((s, i) => (
                      <tr key={i} className="border-b border-gray-800 last:border-0 hover:bg-gray-800/50 transition">
                        <td className="px-4 py-3 font-bold">{s.points.toLocaleString()}</td>
                        <td className="px-4 py-3 text-gray-400">{s.level_name}</td>
                        <td className="px-4 py-3 text-gray-400 hidden md:table-cell">{s.vagues_passees}</td>
                        <td className="px-4 py-3 text-gray-400 hidden md:table-cell">{s.blobs_elimines}</td>
                        <td className="px-4 py-3 text-gray-400 hidden md:table-cell">{formatDate(s.played_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </Layout>
    </div>
  );
}