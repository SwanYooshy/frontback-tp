const TOWER_COLORS = {
  'Archer':    'bg-green-700',
  'Magicien':  'bg-purple-700',
  'Catapulte': 'bg-orange-700',
};

export default function TowerPanel({
  towerTypes,
  selectedTowerType,
  selectedPlacedTower,
  gold,
  onSelectType,
  onUpgrade,
  onSell,
}) {
  return (
    <div className="flex flex-col h-full bg-gray-900 border-l border-gray-800 w-64">

      {/* Tours disponibles */}
      <div className="p-4 border-b border-gray-800">
        <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-3">Tours disponibles</h3>
        <div className="space-y-2">
          {towerTypes.map(t => {
            const affordable = gold >= t.cout_or;
            const selected   = selectedTowerType?.id_tour_type === t.id_tour_type;
            return (
              <button
                key={t.id_tour_type}
                onClick={() => affordable && onSelectType(selected ? null : t)}
                className={`w-full text-left px-3 py-2.5 rounded-lg border transition
                  ${selected
                    ? 'border-white bg-gray-700'
                    : affordable
                      ? 'border-gray-700 hover:border-gray-500 bg-gray-800'
                      : 'border-gray-800 bg-gray-800/50 opacity-50 cursor-not-allowed'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-sm ${TOWER_COLORS[t.nom] ?? 'bg-gray-500'}`}/>
                    <span className="text-sm font-medium text-white">{t.nom}</span>
                  </div>
                  <span className="text-xs text-yellow-400 font-bold">{t.cout_or}g</span>
                </div>
                <div className="flex gap-3 mt-1 text-xs text-gray-400">
                  <span>⚔️ {t.degats_base}</span>
                  <span>🎯 {t.portee}</span>
                  <span>⚡ {t.vitesse_attaque}/s</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tour sélectionnée sur la grille */}
      {selectedPlacedTower && (
        <div className="p-4">
          <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-3">Tour sélectionnée</h3>
          <div className="bg-gray-800 rounded-lg p-3 mb-3">
            <div className="flex items-center gap-2 mb-2">
              <span className={`w-3 h-3 rounded-sm ${TOWER_COLORS[selectedPlacedTower.nom] ?? 'bg-gray-500'}`}/>
              <span className="font-medium text-white">{selectedPlacedTower.nom}</span>
              <span className="ml-auto text-xs text-gray-400">Niv. {selectedPlacedTower.niveau_upgrade}</span>
            </div>
            <div className="grid grid-cols-2 gap-1 text-xs text-gray-400">
              <span>⚔️ {selectedPlacedTower.degats_base * selectedPlacedTower.niveau_upgrade}</span>
              <span>🎯 {selectedPlacedTower.portee}</span>
              <span>📍 ({selectedPlacedTower.pos_x}, {selectedPlacedTower.pos_y})</span>
            </div>
          </div>
          <div className="flex gap-2">
            {selectedPlacedTower.niveau_upgrade < 3 && (
              <button
                onClick={onUpgrade}
                className="flex-1 bg-blue-700 hover:bg-blue-600 text-white text-sm py-2 rounded-lg font-medium transition"
              >
                Upgrade
              </button>
            )}
            <button
              onClick={onSell}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white text-sm py-2 rounded-lg font-medium transition"
            >
              Vendre
            </button>
          </div>
        </div>
      )}

      {/* Aide */}
      {!selectedPlacedTower && (
        <div className="p-4 mt-auto">
          <p className="text-xs text-gray-600 text-center">
            {selectedTowerType
              ? `Cliquez sur une case libre pour placer ${selectedTowerType.nom}`
              : 'Sélectionnez une tour à placer ou cliquez sur une tour existante'}
          </p>
        </div>
      )}
    </div>
  );
}