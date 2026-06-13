import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { Lock, User, Mail, Shield, Sparkles } from 'lucide-react';

export default function Landing() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [avatarColor, setAvatarColor] = useState('#2563EB');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();

  const colors = [
    '#2563EB', // Accent Royal Blue
    '#16A34A', // Success Green
    '#D97706', // Warning Amber
    '#DC2626', // Danger Red
    '#7C3AED', // Violet
    '#DB2777'  // Pink
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await login(username, password);
        toast.success('Welcome back');
      } else {
        await register(username, email, password, avatarColor);
        toast.success('Account created successfully');
      }
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.detail || 
        err.response?.data?.non_field_errors?.[0] || 
        'Authentication failed. Please check your credentials'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Left Pane - Marketing Highlight */}
      <div className="w-full md:w-1/2 bg-accent-light border-r border-border flex flex-col justify-between p-8 md:p-16">
        <div>
          <div className="flex items-center gap-2 mb-12">
            <div className="h-10 w-10 bg-accent rounded-xl flex items-center justify-center text-white font-heading font-extrabold text-xl shadow-premium">
              F
            </div>
            <span className="font-heading font-bold text-xl text-textPrimary tracking-tight">FairShare</span>
          </div>

          <div className="max-w-md">
            <h1 className="font-heading text-4xl md:text-5xl font-extrabold text-textPrimary leading-tight mb-6">
              Simplify shared expenses, <span className="text-accent">fairly.</span>
            </h1>
            <p className="text-textMuted text-base mb-10 leading-relaxed">
              Keep track of flatmate utilities, group travel, and shared events without the hassle. Time-aware splitting, multi-currency support, and debt simplification all built-in.
            </p>
          </div>
        </div>

        <div className="space-y-6 max-w-md">
          <div className="flex gap-4 items-start bg-surface p-5 rounded-2xl border border-border/60 shadow-premium">
            <div className="p-3 bg-accent-light text-accent rounded-xl">
              <Shield size={20} />
            </div>
            <div>
              <h3 className="font-heading font-semibold text-textPrimary mb-1 text-sm">Aisha's View</h3>
              <p className="text-textMuted text-xs leading-relaxed">One net transaction list. Shows exactly who needs to pay whom to clear all balances.</p>
            </div>
          </div>

          <div className="flex gap-4 items-start bg-surface p-5 rounded-2xl border border-border/60 shadow-premium">
            <div className="p-3 bg-accent-light text-accent rounded-xl">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="font-heading font-semibold text-textPrimary mb-1 text-sm">Rohan's View</h3>
              <p className="text-textMuted text-xs leading-relaxed">Audit trail transparency. Expand any peer relationship to see the precise line-item ledger.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Pane - Auth Card */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-16">
        <div className="w-full max-w-md bg-surface border border-border rounded-3xl p-8 shadow-premium">
          <h2 className="font-heading text-2xl font-bold text-textPrimary mb-2">
            {isLogin ? 'Sign In' : 'Create Account'}
          </h2>
          <p className="text-textMuted text-sm mb-6">
            {isLogin ? 'Access your shared expenses dashboard' : 'Register to start sharing expenses'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-textMuted mb-2 uppercase tracking-wider">Username</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-textMuted/70">
                  <User size={16} />
                </span>
                <input
                  type="text"
                  className="w-full pl-11 pr-4 py-3 bg-background border border-border rounded-xl text-textPrimary placeholder-textMuted/50 text-sm focus:outline-none focus:border-accent transition-colors"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold text-textMuted mb-2 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-textMuted/70">
                    <Mail size={16} />
                  </span>
                  <input
                    type="email"
                    className="w-full pl-11 pr-4 py-3 bg-background border border-border rounded-xl text-textPrimary placeholder-textMuted/50 text-sm focus:outline-none focus:border-accent transition-colors"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-textMuted mb-2 uppercase tracking-wider">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-textMuted/70">
                  <Lock size={16} />
                </span>
                <input
                  type="password"
                  className="w-full pl-11 pr-4 py-3 bg-background border border-border rounded-xl text-textPrimary placeholder-textMuted/50 text-sm focus:outline-none focus:border-accent transition-colors"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold text-textMuted mb-2 uppercase tracking-wider">Avatar Accent Color</label>
                <div className="flex gap-3 mt-1">
                  {colors.map(color => (
                    <button
                      type="button"
                      key={color}
                      onClick={() => setAvatarColor(color)}
                      style={{ backgroundColor: color }}
                      className={`h-8 w-8 rounded-full border-2 transition-transform ${
                        avatarColor === color ? 'border-textPrimary scale-110' : 'border-transparent hover:scale-105'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 bg-accent hover:bg-accent-hover text-white py-3.5 px-4 rounded-xl font-heading font-semibold text-sm transition-colors shadow-premium disabled:opacity-50"
            >
              {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-textMuted">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-accent hover:text-accent-hover font-semibold focus:outline-none"
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
