import { useEffect, useRef } from 'react';
import * as Phaser from 'phaser';

const BLOB_PATH = [
  { x: 0,  y: 3 }, { x: 1,  y: 3 }, { x: 2,  y: 3 },
  { x: 3,  y: 3 }, { x: 3,  y: 1 }, { x: 4,  y: 1 },
  { x: 5,  y: 1 }, { x: 5,  y: 4 }, { x: 6,  y: 4 },
  { x: 7,  y: 4 }, { x: 7,  y: 2 }, { x: 8,  y: 2 },
  { x: 9,  y: 2 }, { x: 9,  y: 4 }, { x: 10, y: 4 },
  { x: 11, y: 4 },
];

const TILE_SIZE  = 60;
const GRID_COLS  = 12;
const GRID_ROWS  = 7;

const TOWER_COLORS = { 'Archer': 0x16a34a, 'Magicien': 0x7c3aed, 'Catapulte': 0xea580c };
const BLOB_COLORS  = { 1: 0x4ade80, 2: 0xf87171, 3: 0x374151, 4: 0xfbbf24 };

export default function PhaserGame({
  placedTowers,
  selectedTowerType,
  onTilePlaceTower,
  onSelectPlacedTower,
  blobsActive,
}) {
  const containerRef           = useRef(null);
  const gameRef                = useRef(null);
  const sceneRef               = useRef(null);
  const onTilePlaceTowerRef    = useRef(onTilePlaceTower);
  const onSelectPlacedTowerRef = useRef(onSelectPlacedTower);

  const pathSet = new Set(BLOB_PATH.map(p => `${p.x},${p.y}`));

  // Maintenir les callbacks à jour
  useEffect(() => {
    onTilePlaceTowerRef.current    = onTilePlaceTower;
    onSelectPlacedTowerRef.current = onSelectPlacedTower;
  }, [onTilePlaceTower, onSelectPlacedTower]);

  // Init Phaser
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver(() => {
      if (gameRef.current) return;
      if (!containerRef.current) return;

      const scene = {
        key: 'GameScene',
        create() {
          sceneRef.current = this;
          drawGrid(this);
          drawPath(this);
        },
        update() {},
      };

      gameRef.current = new Phaser.Game({
        type:            Phaser.AUTO,
        width:           TILE_SIZE * GRID_COLS,
        height:          TILE_SIZE * GRID_ROWS,
        parent:          containerRef.current,
        backgroundColor: '#111827',
        scene,
      });

      observer.disconnect();
    });

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
      gameRef.current?.destroy(true);
      gameRef.current  = null;
      sceneRef.current = null;
    };
  }, []);

  // Redessine les tours
  useEffect(() => {
    if (!sceneRef.current) return;
    sceneRef.current.children.list
      .filter(c => c.getData?.('type') === 'tower')
      .forEach(c => c.destroy());
    drawTowers(sceneRef.current);
  }, [placedTowers]);

  // Redessine les blobs
  useEffect(() => {
    if (!sceneRef.current) return;
    drawBlobs(sceneRef.current, blobsActive);
  }, [blobsActive]);

  function drawGrid(scene) {
    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        const isPath = pathSet.has(`${col},${row}`);
        const x = col * TILE_SIZE;
        const y = row * TILE_SIZE;

        const tile = scene.add.rectangle(
          x + TILE_SIZE / 2,
          y + TILE_SIZE / 2,
          TILE_SIZE - 2,
          TILE_SIZE - 2,
          isPath ? 0x374151 : 0x1f2937
        );

        if (!isPath) {
          tile.setInteractive({ useHandCursor: true });
          tile.setData('col', col);
          tile.setData('row', row);
          tile.setData('type', 'tile');

          tile.on('pointerover', () => tile.setFillStyle(0x374151));
          tile.on('pointerout',  () => tile.setFillStyle(0x1f2937));
          tile.on('pointerdown', () => onTilePlaceTowerRef.current(col, row));
        }
      }
    }
  }

  function drawPath(scene) {
    const graphics = scene.add.graphics();
    graphics.lineStyle(3, 0x6b7280, 0.4);

    for (let i = 0; i < BLOB_PATH.length - 1; i++) {
      const from = BLOB_PATH[i];
      const to   = BLOB_PATH[i + 1];
      graphics.lineBetween(
        from.x * TILE_SIZE + TILE_SIZE / 2,
        from.y * TILE_SIZE + TILE_SIZE / 2,
        to.x   * TILE_SIZE + TILE_SIZE / 2,
        to.y   * TILE_SIZE + TILE_SIZE / 2
      );
    }
  }

  function drawTowers(scene) {
    placedTowers.forEach(t => {
      const x     = t.pos_x * TILE_SIZE + TILE_SIZE / 2;
      const y     = t.pos_y * TILE_SIZE + TILE_SIZE / 2;
      const color = TOWER_COLORS[t.nom] ?? 0x6b7280;
      const size  = 30 + (t.niveau_upgrade - 1) * 6;

      const rect = scene.add.rectangle(x, y, size, size, color);
      rect.setData('type', 'tower');
      rect.setInteractive({ useHandCursor: true });

      const label = scene.add.text(x, y, `${t.niveau_upgrade}`, {
        fontSize: '11px', color: '#ffffff', fontStyle: 'bold'
      }).setOrigin(0.5);
      label.setData('type', 'tower');

      rect.on('pointerdown', () => onSelectPlacedTowerRef.current(t));
      rect.on('pointerover', () => rect.setStrokeStyle(2, 0xffffff));
      rect.on('pointerout',  () => rect.setStrokeStyle(0));
    });
  }

  function drawBlobs(scene, blobs) {
    scene.children.list
      .filter(c => c.getData?.('type') === 'blob')
      .forEach(c => c.destroy());

    blobs.forEach(blob => {
      if (!blob.alive) return;
      if (blob.progress < 0) return;

      const pathIndex = Math.min(
        Math.floor(blob.progress * (BLOB_PATH.length - 1)),
        BLOB_PATH.length - 1
      );

      const pos = BLOB_PATH[pathIndex];
      if (!pos) return;

      const x      = pos.x * TILE_SIZE + TILE_SIZE / 2;
      const y      = pos.y * TILE_SIZE + TILE_SIZE / 2;
      const color  = BLOB_COLORS[blob.id_blob_type] ?? 0x4ade80;

      const circle = scene.add.circle(x, y, 14, color);
      circle.setData('type', 'blob');

      const barBg = scene.add.rectangle(x, y - 20, 24, 4, 0x374151);
      const barFg = scene.add.rectangle(
        x - 12 + (24 * blob.hp_ratio) / 2,
        y - 20,
        24 * blob.hp_ratio,
        4,
        0x4ade80
      );
      barBg.setData('type', 'blob');
      barFg.setData('type', 'blob');
    });
  }

  return (
    <div
      ref={containerRef}
      style={{
        width:    `${TILE_SIZE * GRID_COLS}px`,
        height:   `${TILE_SIZE * GRID_ROWS}px`,
        display:  'block',
        position: 'relative',
      }}
    />
  );
}