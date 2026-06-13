import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { ArrowLeft, ExternalLink, Activity, Layers } from 'lucide-react';

export default function Landing() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [avatarColor, setAvatarColor] = useState('#10B981');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();

  const colors = ['#10B981', '#F97316', '#8B5CF6', '#EC4899', '#3B82F6', '#EF4444'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await login(username, password);
        toast.success('Welcome back!');
      } else {
        await register(username, email, password, avatarColor);
        toast.success('Account created successfully!');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || err.response?.data?.non_field_errors?.[0] || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-hero">
        <h1 className="auth-hero-title">
          Simplify shared<br />
          expenses, <span style={{ color: '#10B981' }}>fairly.</span>
        </h1>
        <p className="auth-hero-desc">
          Keep track of flatmate utilities, group travel, and shared events without the hassle. Time-aware splitting, multi-currency support, and debt simplification all built-in.
        </p>
        <div style={{ display: 'flex', gap: '20px' }}>
          <div style={{ padding: '16px', background: '#121620', border: '1px solid #242E42', borderRadius: '12px', flex: 1 }}>
            <h3 style={{ fontFamily: 'Outfit', fontWeight: 600, marginBottom: '4px', color: '#10B981' }}>Aisha's View</h3>
            <p style={{ fontSize: '13px', color: '#9CA3AF' }}>One net transaction list. Who pays whom, done.</p>
          </div>
          <div style={{ padding: '16px', background: '#121620', border: '1px solid #242E42', borderRadius: '12px', flex: 1 }}>
            <h3 style={{ fontFamily: 'Outfit', fontWeight: 600, marginBottom: '4px', color: '#F97316' }}>Rohan's View</h3>
            <p style={{ fontSize: '13px', color: '#9CA3AF' }}>Audit trail. Expand to see exact line-item breakdowns.</p>
          </div>
        </div>
      </div>

      <div className="auth-form-side">
        <div className="auth-card">
          <h2 className="auth-card-title">{isLogin ? 'Sign In' : 'Sign Up'}</h2>
          <p className="auth-card-sub">
            {isLogin ? 'Access your shared expenses' : 'Create an account to start sharing expenses'}
          </p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. aisha"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            {!isLogin && (
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="e.g. aisha@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {!isLogin && (
              <div className="form-group">
                <label className="form-label">Avatar Color</label>
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  {colors.map(c => (
                    <div
                      key={c}
                      onClick={() => setAvatarColor(c)}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: c,
                        border: avatarColor === c ? '3px solid #F3F4F6' : '1px solid transparent',
                        cursor: 'pointer',
                        transition: 'transform 0.1s'
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '14px', marginTop: '12px' }}
              disabled={loading}
            >
              {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="auth-toggle">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <span className="auth-toggle-link" onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? 'Sign Up' : 'Sign In'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
