import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth();

  function handleLogout() {
    logout();
  }

  return (
    <nav className="flex items-center justify-between px-8 py-4 border-b border-gray-800">
      <Link to="/" className="text-xl font-bold tracking-tight">
        Blob Tower Defense
      </Link>
      <div className="flex gap-3">
        <Link
          to="/leaderboard"
          className="text-gray-400 px-4 py-2 hover:text-white transition"
        >
          Classement
        </Link>
        {isAuthenticated ? (
          <>
            <Link
              to="/game"
              className="border border-gray-600 px-4 py-2 rounded-lg hover:border-gray-400 transition"
            >
              Jouer
            </Link>
            <button
              onClick={handleLogout}
              className="bg-white text-gray-900 px-4 py-2 rounded-lg font-semibold hover:bg-gray-200 transition"
            >
              Déconnexion
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="border border-gray-600 px-4 py-2 rounded-lg hover:border-gray-400 transition"
            >
              Connexion
            </Link>
            <Link
              to="/register"
              className="bg-white text-gray-900 px-4 py-2 rounded-lg font-semibold hover:bg-gray-200 transition"
            >
              Inscription
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}