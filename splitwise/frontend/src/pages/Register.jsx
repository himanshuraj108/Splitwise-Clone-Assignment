import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

/* Google G Icon */
const GoogleG = () => (
  <svg width="16" height="16" viewBox="0 0 48 48">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg>
);

/*
  EXACT Splitwise logo SVG extracted from splitwise.com DOM.
  Colors: teal #1CC29F, dark #52595F, light-teal #ACE4D6, darker #373B3F, white S curve
  viewBox="0 0 43.55 48" scaled up for the signup page
*/
const SplitwiseLogo = ({ size = 180 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size * (48 / 43.55)}
    viewBox="0 0 43.55 48"
  >
    {/* Teal left S-curve paths */}
    <path
      fill="#1CC29F"
      d="M16.543 28.966l5.232-3.073L0 13.103v12.631c1.632-.895 3.688-1.36 6.042-1.36 5.125 0 8.37 2.214 10.5 4.592"
    />
    <path
      fill="#1CC29F"
      d="M6.935 46.595c2.181 0 3.826-.654 3.826-2.327 0-1.71-2.11-2.364-4.72-3.02-1.942-.505-4.172-1.013-6.04-1.971v3.245c1.572 2.582 4.182 4.073 6.934 4.073"
    />
    {/* Dark right body */}
    <path
      fill="#52595F"
      d="M43.55 38.683v-25.58l-21.775 12.79z"
    />
    {/* Light teal top face */}
    <path
      fill="#ACE4D6"
      d="M43.55 13.104L21.775.314 0 13.104l21.775 12.79z"
    />
    {/* Dark left body */}
    <path
      fill="#373B3F"
      d="M21.775 25.893l-5.233 3.073-5.608 3.295c-1.433-1.16-3.256-1.996-4.928-1.996-2.038 0-3.075.69-3.075 1.964 0 1.473 1.419 2.175 3.384 2.745.412.119.847.233 1.3.347 4.326 1.054 10.117 2.4 10.117 8.437 0 1.268-.262 2.53-.836 3.683H43.55v-8.759l-21.775-12.79z"
    />
    {/* White S-curve highlight */}
    <path
      fill="#FFF"
      d="M7.615 35.32a37.409 37.409 0 0 1-1.3-.346c-1.965-.57-3.384-1.272-3.384-2.745 0-1.273 1.037-1.964 3.075-1.964 1.672 0 3.495.837 4.928 1.996l5.608-3.295c-2.131-2.378-5.375-4.593-10.5-4.593-2.355 0-4.41.466-6.042 1.36V39.278c1.869.958 4.099 1.465 6.042 1.972 2.61.655 4.719 1.309 4.719 3.019 0 1.673-1.645 2.327-3.826 2.327-2.752 0-5.362-1.49-6.935-4.073v4.92h16.896c.574-1.153.836-2.416.836-3.684 0-6.037-5.791-7.383-10.117-8.437"
    />
  </svg>
);

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Enter your name'); return; }
    if (!form.email.trim()) { toast.error('Enter your email'); return; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Account created!');
      navigate('/dashboard');
    } catch (err) {
      const data = err.response?.data;
      const msg =
        data?.email?.[0] ||
        data?.name?.[0] ||
        data?.password?.[0] ||
        data?.detail ||
        'Registration failed';
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    /* Pure white bg — exact Splitwise signup page */
    <div style={{
      minHeight: '100vh',
      background: '#ffffff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Lato', 'Helvetica Neue', Arial, sans-serif",
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 80,
        padding: '40px 60px',
        maxWidth: 860,
        width: '100%',
      }}>
        {/* LEFT — exact Splitwise logo mark (no text, just the S icon) */}
        <div style={{ flexShrink: 0 }}>
          <SplitwiseLogo size={180} />
        </div>

        {/* RIGHT — Exact Splitwise signup form */}
        <div style={{ flex: 1, maxWidth: 340 }}>
          <form onSubmit={handleSubmit} noValidate>

            {/* INTRODUCE YOURSELF */}
            <div style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '2px',
              textTransform: 'uppercase',
              color: '#888',
              marginBottom: 6,
            }}>
              Introduce yourself
            </div>

            {/* Hi there! My name is */}
            <div style={{
              fontSize: 22,
              fontWeight: 300,
              color: '#333',
              marginBottom: 8,
            }}>
              Hi there! My name is
            </div>

            {/* Name input — blue border exactly like screenshot */}
            <input
              id="register-name"
              type="text"
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              autoFocus
              required
              style={{
                width: '100%',
                padding: '9px 11px',
                border: '2px solid #5bafd6',
                borderRadius: 3,
                fontSize: 15,
                color: '#333',
                background: 'white',
                outline: 'none',
                marginBottom: 20,
                boxSizing: 'border-box',
              }}
            />

            {/* Here's my email address */}
            <div style={{ fontSize: 14, color: '#555', marginBottom: 6 }}>
              Here's my <strong>email address:</strong>
            </div>
            <input
              id="register-email"
              type="email"
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              required
              style={{
                width: '100%',
                padding: '9px 11px',
                border: '1px solid #ccc',
                borderRadius: 3,
                fontSize: 14,
                color: '#333',
                background: 'white',
                outline: 'none',
                marginBottom: 18,
                boxSizing: 'border-box',
              }}
              onFocus={e => { e.target.style.borderColor = '#5bafd6'; e.target.style.borderWidth = '2px'; }}
              onBlur={e => { e.target.style.borderColor = '#ccc'; e.target.style.borderWidth = '1px'; }}
            />

            {/* And here's my password */}
            <div style={{ fontSize: 14, color: '#555', marginBottom: 6 }}>
              And here's my <strong>password:</strong>
            </div>
            <input
              id="register-password"
              type="password"
              value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              required
              style={{
                width: '100%',
                padding: '9px 11px',
                border: '1px solid #ccc',
                borderRadius: 3,
                fontSize: 14,
                color: '#333',
                background: 'white',
                outline: 'none',
                marginBottom: 20,
                boxSizing: 'border-box',
              }}
              onFocus={e => { e.target.style.borderColor = '#5bafd6'; e.target.style.borderWidth = '2px'; }}
              onBlur={e => { e.target.style.borderColor = '#ccc'; e.target.style.borderWidth = '1px'; }}
            />

            {/* Buttons row — exact Splitwise layout */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginBottom: 14,
              flexWrap: 'wrap',
            }}>
              {/* Orange "Sign me up!" — exact color from screenshot */}
              <button
                id="register-submit"
                type="submit"
                disabled={loading}
                style={{
                  padding: '11px 24px',
                  background: loading ? '#dba98a' : '#E07040',
                  color: 'white',
                  border: 'none',
                  borderRadius: 4,
                  fontSize: 18,
                  fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: "'Lato', sans-serif",
                  whiteSpace: 'nowrap',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#c55e30'; }}
                onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#E07040'; }}
              >
                {loading ? 'Please wait...' : 'Sign me up!'}
              </button>

              <span style={{ fontSize: 13, color: '#888' }}>or</span>

              {/* Sign up with Google — white outlined button */}
              <button
                type="button"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 14px',
                  border: '1px solid #ccc',
                  borderRadius: 4,
                  background: 'white',
                  fontSize: 14,
                  color: '#333',
                  cursor: 'pointer',
                  fontFamily: "'Lato', sans-serif",
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#f8f8f8'}
                onMouseLeave={e => e.currentTarget.style.background = 'white'}
              >
                <GoogleG />
                Sign up with Google
              </button>
            </div>

            {/* By signing up — teal clickable text */}
            <div style={{ marginBottom: 6 }}>
              <span style={{ fontSize: 13, color: '#1CC29F', cursor: 'pointer' }}>
                By signing up, you accept the Splitwise Terms of Service.
              </span>
            </div>

            {/* Don't use USD */}
            <div style={{ fontSize: 13, color: '#555' }}>
              Don't use USD for currency?{' '}
              <span style={{ color: '#1CC29F', textDecoration: 'underline', cursor: 'pointer' }}>
                Click here.
              </span>
            </div>

            {/* Login link */}
            <div style={{ marginTop: 20, fontSize: 13, color: '#555' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#1CC29F', fontWeight: 600, textDecoration: 'none' }}>
                Log in
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
