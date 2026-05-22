import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import client from '../api/client';
import Layout from '../components/Layout';

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [form, setForm]   = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { data } = await client.post('/auth/login', form);
      login(data.token, data.joueur);
      navigate('/game');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur serveur');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="bg-white rounded-2xl shadow-md w-full max-w-md p-8">

                <h1 className="text-2xl font-bold text-center mb-2">Blob Tower Defense</h1>
                <p className="text-center text-gray-500 mb-8">Connexion</p>

                {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-6 text-sm">
                    {error}
                </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg text-black px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
                    placeholder="ton@email.com"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
                    <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg text-black px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
                    placeholder="••••••••"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gray-900 text-white rounded-lg py-2.5 font-semibold hover:bg-gray-700 transition disabled:opacity-50"
                >
                    {loading ? 'Connexion...' : 'Se connecter'}
                </button>
                </form>

                <p className="text-center text-sm text-gray-500 mt-6">
                Pas encore de compte ?{' '}
                <Link to="/register" className="text-gray-900 font-medium underline">
                    S'inscrire
                </Link>
                </p>
            </div>
        </div>
    </Layout>
  );
}