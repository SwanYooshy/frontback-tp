export default function HUD({ lives, gold, waveNumber, totalWaves, score }) {
  return (
    <div className="flex items-center justify-between px-6 py-3 bg-gray-900 border-b border-gray-800">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="text-red-400 text-lg">❤️</span>
          <span className="font-bold text-white">{lives}</span>
          <span className="text-gray-500 text-sm">vies</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-yellow-400 text-lg">💰</span>
          <span className="font-bold text-white">{gold}</span>
          <span className="text-gray-500 text-sm">or</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-blue-400 text-lg">🌊</span>
        <span className="font-bold text-white">Vague {waveNumber} / {totalWaves}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-yellow-300 text-lg">⭐</span>
        <span className="font-bold text-white">{score.toLocaleString()}</span>
        <span className="text-gray-500 text-sm">pts</span>
      </div>
    </div>
  );
}