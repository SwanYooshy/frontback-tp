import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import client from '../api/client';

export default function Results() {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    fetchResult();
  }, [id]);

  async function fetchResult() {
    try {
      const { data } = await client.get(`/parties/${id}`);
      setResult(data);
    } catch (err) {
      setError('Impossible de charger les résultats.');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-40 text-gray-500">
          Chargement des résultats...
        </div>
      </Layout>
    );
  }

  if (error || !result) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-40 gap-4">
          <p className="text-gray-500">{error ?? 'Résultats introuvables.'}</p>
          <Link to="/game" className="text-white underline">Rejouer</Link>
        </div>
      </Layout>
    );
  }

  const stats = [
    { icon: '⭐', label: 'Score',          value: result.points?.toLocaleString() ?? '0',  highlight: true },
    { icon: '🟢', label: 'Blobs éliminés', value: result.blobs_elimines ?? 0 },
    { icon: '🌊', label: 'Vagues passées', value: result.vagues_passees ?? 0 },
    { icon: '💰', label: 'Or dépensé',     value: result.or_depense ?? 0 },
  ];

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">

        {/* Titre */}
        <h1 className="text-4xl font-bold mb-2">
          {result.vies_restantes > 0 ? '🏆 Partie terminée !' : '💀 Défaite !'}
        </h1>
        <p className="text-gray-500 mb-12">
          {result.vies_restantes > 0
            ? 'Vous avez repoussé toutes les vagues, m\'lord !'
            : 'Les blobs ont franchi vos défenses...'}
        </p>

        {/* Score principal */}
        <div className="mb-10">
          <div className="text-8xl font-bold text-white mb-2">
            {result.points?.toLocaleString() ?? '0'}
          </div>
          <div className="text-gray-500 text-lg">points</div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {stats.slice(1).map((s, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <div className="text-2xl mb-2">{s.icon}</div>
              <div className="text-2xl font-bold text-white">{s.value}</div>
              <div className="text-gray-500 text-sm mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Commentaire IA */}
        {result.ai_comment && (
          <div className="bg-gray-900 border border-gray-700 rounded-xl px-6 py-5 mb-10 text-left">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 font-semibold">
              Chroniqueur royal
            </p>
            <p className="text-gray-200 italic">"{result.ai_comment}"</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-center gap-4">
          <button
            onClick={() => navigate('/game')}
            className="bg-white text-gray-900 px-8 py-3 rounded-xl font-bold text-lg hover:bg-gray-200 transition"
          >
            Rejouer
          </button>
          <Link
            to="/leaderboard"
            className="border border-gray-600 px-8 py-3 rounded-xl font-semibold text-lg hover:border-gray-400 transition"
          >
            Classement
          </Link>
          <Link
            to="/"
            className="border border-gray-700 px-8 py-3 rounded-xl text-gray-400 text-lg hover:border-gray-500 transition"
          >
            Accueil
          </Link>
        </div>
      </div>
    </Layout>
  );
}