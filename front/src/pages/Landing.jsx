import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Layout from '../components/Layout';

export default function Landing() {
  const { isAuthenticated } = useAuth();

  return (
    <Layout>
      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-4 py-20">
        <h1 className="text-5xl font-bold mb-6 leading-tight">
          Défendez votre château<br />
          <span className="text-gray-400">contre les blobs</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-xl mb-10">
          Un tower defense médiéval fantasy solo. Placez vos tours, résistez aux
          vagues de blobs et grimpez au classement mondial.
        </p>
        <div className="flex gap-4">
          <Link
            to={isAuthenticated ? '/game' : '/register'}
            className="bg-white text-gray-900 px-8 py-3 rounded-lg font-bold text-lg hover:bg-gray-200 transition"
          >
            Jouer maintenant
          </Link>
          <Link
            to="/leaderboard"
            className="border border-gray-600 px-8 py-3 rounded-lg font-semibold text-lg hover:border-gray-400 transition"
          >
            Classement
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 px-8 pb-16 max-w-5xl mx-auto w-full">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="text-3xl mb-3">🗼</div>
          <h3 className="font-bold text-lg mb-2">Placez vos tours</h3>
          <p className="text-gray-400 text-sm">
            Archers, Magiciens, Catapultes — chaque tour a ses propres stats.
            Upgradez-les jusqu'au niveau 3.
          </p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="text-3xl mb-3">🟢</div>
          <h3 className="font-bold text-lg mb-2">Survivez aux vagues</h3>
          <p className="text-gray-400 text-sm">
            Des blobs de plus en plus coriaces défilent vague après vague.
            Ne laissez personne franchir vos lignes.
          </p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="text-3xl mb-3">🏆</div>
          <h3 className="font-bold text-lg mb-2">Grimpez au classement</h3>
          <p className="text-gray-400 text-sm">
            Vos scores sont sauvegardés. Comparez vos performances avec les
            autres joueurs en temps réel.
          </p>
        </div>
      </section>
    </Layout>
  );
}