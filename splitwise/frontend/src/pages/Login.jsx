import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { SplitwiseWordmark } from '../components/SplitwiseLogo';

/* Google G SVG */
const GoogleG = () => (
  <svg width="18" height="18" viewBox="0 0 48 48">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg>
);

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Invalid email or password');
    } finally { setLoading(false); }
  };

  return (
    <div className="login-page">
      {/* Nav */}
      <nav className="sw-nav" style={{ position: 'static' }}>
        <SplitwiseWordmark iconSize={32} />
        <div className="sw-nav-right">
          <Link to="/login" className="sw-nav-login">Log in</Link>
          <Link to="/register" className="sw-nav-signup">Sign up</Link>
        </div>
      </nav>

      {/* WHITE CARD — centered on triangular bg, exact Splitwise */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div className="login-card slide-up">
          <h1>Log in</h1>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, color: '#555', marginBottom: 4 }}>Email address</label>
              <input
                id="login-email"
                type="email"
                className="login-input-sw"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                required autoFocus
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, color: '#555', marginBottom: 4 }}>Password</label>
              <input
                id="login-password"
                type="password"
                className="login-input-sw"
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                required
              />
            </div>

            <button id="login-submit" type="submit" className="login-btn-sw" disabled={loading}>
              {loading ? 'Logging in...' : 'Log in'}
            </button>

            <div className="login-forgot">Forgot your password?</div>

            <div className="login-divider">
              <div className="login-divider-line" />
              <span>or</span>
              <div className="login-divider-line" />
            </div>

            <button type="button" className="google-btn-sw">
              <GoogleG />
              Sign in with Google
            </button>
          </form>
        </div>
      </div>

      {/* Footer triangle band */}
      <div style={{ display: 'flex', height: 80, overflow: 'hidden', flexShrink: 0 }}>
        {[
          ['#3d3d3d','#2a2a2a'], ['#1CC29F','#149377'], ['#E07745','#c96232'],
          ['#1CC29F','#0e7a63'], ['#3d3d3d','#555'], ['#7B6DCC','#6258b0'],
          ['#1CC29F','#149377'], ['#E07745','#c96232']
        ].map(([top, bot], i) => (
          <div key={i} style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
            <svg viewBox="0 0 100 80" width="100%" height="80" preserveAspectRatio="none">
              <polygon points="0,0 100,0 50,80" fill={top} />
              <polygon points="0,0 50,80 0,80" fill={bot} opacity="0.6" />
            </svg>
          </div>
        ))}
      </div>

      {/* Footer links */}
      <div style={{ background: 'white', padding: '28px 60px', display: 'flex', gap: 60, flexWrap: 'wrap', borderTop: '1px solid #eee' }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#1CC29F', marginBottom: 8 }}>Splitwise</div>
          {['About', 'Press', 'Blog', 'Jobs', 'Calculators', 'API'].map(l => (
            <div key={l} style={{ fontSize: 13, color: '#555', marginBottom: 4 }}>{l}</div>
          ))}
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#E07745', marginBottom: 8 }}>Account</div>
          {['Log in', 'Sign up', 'Reset password', 'Settings', 'Splitwise Pro', 'Splitwise Pay', 'Splitwise Card'].map(l => (
            <div key={l} style={{ fontSize: 13, color: '#555', marginBottom: 4 }}>{l}</div>
          ))}
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#555', marginBottom: 8 }}>More</div>
          {['Contact us', 'FAQ', 'Site status'].map(l => (
            <div key={l} style={{ fontSize: 13, color: '#555', marginBottom: 4 }}>{l}</div>
          ))}
          <div style={{ fontSize: 13, color: '#E07745', marginBottom: 4 }}>Terms of Service</div>
          <div style={{ fontSize: 13, color: '#555', marginBottom: 4 }}>Privacy Policy</div>
          <div style={{ fontSize: 13, color: '#555' }}>Coastal Community Bank Privacy Policy</div>
        </div>
        <div style={{ marginLeft: 'auto', textAlign: 'right', fontSize: 12, color: '#999' }}>
          Made with :) in Providence, RI, USA
        </div>
      </div>
    </div>
  );
}
