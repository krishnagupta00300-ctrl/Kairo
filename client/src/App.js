import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('kairo_user');
    const token = localStorage.getItem('kairo_token');
    if (stored && token) setUser(JSON.parse(stored));
    setLoading(false);
  }, []);

  function login(userData, token) {
    localStorage.setItem('kairo_user', JSON.stringify(userData));
    localStorage.setItem('kairo_token', token);
    setUser(userData);
  }

  function logout() {
    localStorage.removeItem('kairo_user');
    localStorage.removeItem('kairo_token');
    setUser(null);
  }

  if (loading) return null;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={!user ? <Landing /> : <Navigate to="/dashboard" />} />
        <Route path="/login" element={!user ? <Login onLogin={login} /> : <Navigate to="/dashboard" />} />
        <Route path="/register" element={!user ? <Register onLogin={login} /> : <Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={user ? <Dashboard user={user} onLogout={logout} /> : <Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}