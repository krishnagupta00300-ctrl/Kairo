import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FloatingPaths } from '../components/FloatingPaths';

export default function Login({ onLogin }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await fetch('https://kairo-isfu.onrender.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.error) { setError(data.error); setLoading(false); return; }
      onLogin(data.user, data.token);
    } catch {
      setError('Could not connect to server.');
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', position: 'relative', overflow: 'hidden' }}>
      <style>{`body{background:#000!important;margin:0}*{box-sizing:border-box}input{color-scheme:dark}input::placeholder{color:rgba(255,255,255,0.2)}`}</style>

      {/* Animated background */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <FloatingPaths position={1} />
        <FloatingPaths position={-1} />
      </div>

      {/* Back to home */}
      <Link to="/" style={{ position: 'absolute', top: '1.5rem', left: '2rem', display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', zIndex: 10 }}>
        <svg width="22" height="22" viewBox="0 0 100 100" fill="none">
          <defs><linearGradient id="kgl" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#9B7FFF"/><stop offset="100%" stopColor="#00CFFF"/></linearGradient></defs>
          <rect x="15" y="10" width="16" height="80" rx="4" fill="url(#kgl)"/>
          <path d="M31 50 L72 10 L90 10 L49 50Z" fill="url(#kgl)"/>
          <path d="M31 50 L72 90 L90 90 L49 50Z" fill="url(#kgl)" opacity="0.9"/>
        </svg>
        <span style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '0.15em', background: 'linear-gradient(135deg,#9B7FFF,#00CFFF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>KAIRO</span>
      </Link>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: '420px', padding: '0 1.5rem' }}
      >
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '2.5rem', backdropFilter: 'blur(20px)', boxShadow: '0 0 80px rgba(155,127,255,0.08)' }}>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'white', marginBottom: '0.3rem', letterSpacing: '-0.5px', textAlign: 'center' }}>
              Welcome back
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.88rem', marginBottom: '2rem', textAlign: 'center' }}>
              Log in to your Kairo workspace
            </p>
          </motion.div>

          {error && (
            <div style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.25)', color: '#fca5a5', padding: '10px 14px', borderRadius: '8px', fontSize: '0.84rem', marginBottom: '1.2rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {[
              { label: 'Email', key: 'email', type: 'email', placeholder: 'you@example.com' },
              { label: 'Password', key: 'password', type: 'password', placeholder: '••••••••' },
            ].map(({ label, key, type, placeholder }, idx) => (
              <motion.div key={key} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + idx * 0.1 }} style={{ marginBottom: '1.1rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)', marginBottom: '6px', fontWeight: 500 }}>{label}</label>
                <input
                  type={type} placeholder={placeholder} value={form[key]}
                  onChange={e => setForm({ ...form, [key]: e.target.value })} required
                  style={{ width: '100%', padding: '11px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'white', fontSize: '0.92rem', outline: 'none', transition: 'border-color 0.2s' }}
                  onFocus={e => e.target.style.borderColor = 'rgba(155,127,255,0.6)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </motion.div>
            ))}

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}>
              {/* Gradient border button */}
              <div style={{ background: 'linear-gradient(135deg,#9B7FFF,#00CFFF)', borderRadius: '11px', padding: '1.5px', marginTop: '0.5rem' }}>
                <button type="submit" disabled={loading}
                  style={{ width: '100%', padding: '12px', background: loading ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.9)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '0.95rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', backdropFilter: 'blur(10px)', transition: 'background 0.2s' }}
                  onMouseEnter={e => !loading && (e.target.style.background = 'rgba(0,0,0,0.7)')}
                  onMouseLeave={e => e.target.style.background = 'rgba(0,0,0,0.9)'}
                >
                  {loading ? 'Logging in...' : 'Log in →'}
                </button>
              </div>
            </motion.div>
          </form>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.65 }}
            style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.84rem', color: 'rgba(255,255,255,0.3)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#9B7FFF', textDecoration: 'none', fontWeight: 500 }}>Sign up free</Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}