import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken]   = useState(() => localStorage.getItem('token'));
  const [player, setPlayer] = useState(() => {
    const p = localStorage.getItem('player');
    return p ? JSON.parse(p) : null;
  });

  function login(token, player) {
    localStorage.setItem('token', token);
    localStorage.setItem('player', JSON.stringify(player));
    setToken(token);
    setPlayer(player);
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('player');
    setToken(null);
    setPlayer(null);
  }

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ token, player, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}