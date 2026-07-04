import { Link } from 'react-router-dom';
import { Suspense, lazy } from 'react';

const Spline = lazy(() => import('@splinetool/react-spline'));

export default function Landing() {
  return (
    <div style={{ minHeight: '100vh', background: '#000000', color: 'white', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #000 !important; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        a:hover { opacity: 0.85; }
        input::placeholder { color: rgba(255,255,255,0.2); }
      `}</style>

      {/* NAV */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.2rem 3rem', borderBottom: '1px solid rgba(255,255,255,0.07)', position: 'sticky', top: 0, background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(12px)', zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <svg width="28" height="28" viewBox="0 0 100 100" fill="none">
            <defs>
              <linearGradient id="kg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#9B7FFF" />
                <stop offset="100%" stopColor="#00CFFF" />
              </linearGradient>
            </defs>
            <rect x="15" y="10" width="16" height="80" rx="4" fill="url(#kg)" />
            <path d="M31 50 L72 10 L90 10 L49 50Z" fill="url(#kg)" />
            <path d="M31 50 L72 90 L90 90 L49 50Z" fill="url(#kg)" opacity="0.9" />
            <rect x="55" y="47" width="28" height="3" rx="1.5" fill="url(#kg)" opacity="0.5" />
            <rect x="60" y="53" width="20" height="2" rx="1" fill="url(#kg)" opacity="0.3" />
          </svg>
          <span style={{ fontSize: '1.1rem', fontWeight: 700, letterSpacing: '0.15em', background: 'linear-gradient(135deg, #9B7FFF, #00CFFF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>KAIRO</span>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/login" style={{ padding: '8px 20px', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: 'white', textDecoration: 'none', fontSize: '0.88rem' }}>Log in</Link>
          <Link to="/register" style={{ padding: '8px 20px', background: 'white', borderRadius: '8px', color: 'black', textDecoration: 'none', fontSize: '0.88rem', fontWeight: 600 }}>Get started</Link>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ position: 'relative', width: '100%', height: '88vh', background: '#000', overflow: 'hidden' }}>
        {/* Spotlight */}
        <div style={{ position: 'absolute', top: '-10%', left: '35%', width: '700px', height: '700px', background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.07) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 1 }} />

        <div style={{ display: 'flex', height: '100%' }}>
          {/* LEFT */}
          <div style={{ flex: 1, padding: '0 3rem 0 4rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', zIndex: 10, minWidth: 0 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: '99px', padding: '5px 14px', fontSize: '0.72rem', letterSpacing: '0.1em', color: '#a78bfa', marginBottom: '1.5rem', width: 'fit-content', textTransform: 'uppercase' }}>
              ✦ AI-Powered Productivity
            </div>
            <h1 style={{ fontSize: '3rem', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-1.5px', marginBottom: '1.2rem', overflow: 'visible' }}>
              Beyond<br />
              <span style={{ background: 'linear-gradient(to bottom, #f5f5f5, #666)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Reminder.</span><br />
              Into Action.
            </h1>
            <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.8, marginBottom: '2rem', maxWidth: '400px' }}>
              Kairo doesn't just remind you of deadlines — it helps you plan, prioritize, and complete your work before it's too late.
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Link to="/register" style={{ padding: '12px 26px', background: 'white', borderRadius: '8px', color: 'black', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 700 }}>
                Get started free →
              </Link>
              <Link to="/login" style={{ padding: '12px 26px', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.9rem' }}>
                Log in
              </Link>
            </div>
            <div style={{ display: 'flex', gap: '2.5rem', marginTop: '2.5rem' }}>
              {[['AI', 'Powered plans'], ['Smart', 'Prioritization'], ['0', 'Missed deadlines']].map(([n, l]) => (
                <div key={l}>
                  <div style={{ fontSize: '1.3rem', fontWeight: 700, background: 'linear-gradient(135deg,#9B7FFF,#00CFFF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{n}</div>
                  <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', marginTop: '2px' }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — Spline 3D */}
          <div style={{ flex: 1, position: 'relative' }}>
            <Suspense fallback={
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'rgba(255,255,255,0.15)', fontSize: '0.85rem' }}>
                Loading 3D scene...
              </div>
            }>
              <Spline
                scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
                style={{ width: '100%', height: '100%' }}
              />
            </Suspense>
          </div>
        </div>
      </div>

      {/* FEATURES */}
      <div style={{ background: '#000', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '5rem 4rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.5px', color: 'white' }}>Everything you need to take action</h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', marginTop: '0.5rem', fontSize: '0.9rem' }}>Not just a to-do list. A productivity companion.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px,1fr))', gap: '1.2rem' }}>
            {[
              { icon: '🧠', title: 'AI Day Planning', desc: 'Tell Kairo your tasks and it builds a smart prioritized schedule for your day.' },
              { icon: '⚡', title: 'Proactive Alerts', desc: 'Get nudged before deadlines sneak up — with context on why it matters now.' },
              { icon: '🎯', title: 'Focus Mode', desc: 'Work on one thing at a time. Kairo keeps you on track and clears the noise.' },
              { icon: '📊', title: 'Task Breakdown', desc: 'Big tasks feel impossible. Kairo splits them into steps you can actually start.' },
            ].map(f => (
              <div key={f.title} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '1.5rem' }}>
                <div style={{ fontSize: '1.6rem', marginBottom: '0.8rem' }}>{f.icon}</div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.4rem', color: 'white' }}>{f.title}</h3>
                <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div style={{ background: '#000', textAlign: 'center', padding: '5rem 3rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem', color: 'white' }}>How Kairo works</h2>
        <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: '3rem', fontSize: '0.9rem' }}>Three steps from overwhelmed to organized</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '4rem', flexWrap: 'wrap' }}>
          {[
            { n: '01', title: 'Add your tasks', desc: "Enter what you need to do and when it's due." },
            { n: '02', title: 'Ask Kairo to plan', desc: 'AI builds your day with time blocks and priorities.' },
            { n: '03', title: 'Take action', desc: 'Follow the plan. Kairo watches for risks and adjusts.' },
          ].map(s => (
            <div key={s.n} style={{ maxWidth: '180px' }}>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, background: 'linear-gradient(135deg,#9B7FFF,#00CFFF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.6rem' }}>{s.n}</div>
              <h4 style={{ fontSize: '0.92rem', fontWeight: 600, marginBottom: '0.4rem', color: 'white' }}>{s.title}</h4>
              <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.7 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ background: '#000', textAlign: 'center', padding: '5rem 2rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <h2 style={{ fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '1rem', color: 'white' }}>Ready to stop just being reminded?</h2>
        <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: '2rem', fontSize: '0.95rem' }}>Join Kairo and start taking action on what matters.</p>
        <Link to="/register" style={{ padding: '14px 32px', background: 'white', borderRadius: '10px', color: 'black', textDecoration: 'none', fontSize: '1rem', fontWeight: 700 }}>
          Get started free →
        </Link>
      </div>

      {/* FOOTER */}
      <footer style={{ background: '#000', textAlign: 'center', padding: '2rem', borderTop: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.25)', fontSize: '0.8rem' }}>
        © 2026 Kairo · Beyond Reminder. Into Action.
      </footer>

    </div>
  );
}