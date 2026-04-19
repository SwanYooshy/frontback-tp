import { AuthProvider }    from './context/AuthContext.jsx';
import ProtectedRoute      from './components/ProtectedRoute.jsx';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing             from './pages/Landing.jsx';
import Login               from './pages/Login.jsx';
import Register            from './pages/Register.jsx';
import Game                from './pages/Game.jsx';
import Results             from './pages/Results.jsx';
import Leaderboard         from './pages/Leaderboard.jsx';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/"            element={<Landing />} />
          <Route path="/login"       element={<Login />} />
          <Route path="/register"    element={<Register />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/game" element={
            <ProtectedRoute><Game /></ProtectedRoute>
          }/>
          <Route path="/results/:id" element={
            <ProtectedRoute><Results /></ProtectedRoute>
          }/>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}