import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { Lock, User, Mail, Shield, Sparkles, Eye, EyeOff } from 'lucide-react';

const demoUsers = [
  { name: 'Aisha', role: 'CSV Uploader & Admin', timeline: 'Active Feb 1 onwards' },
  { name: 'Rohan', role: 'Audit Log & Ledger Viewer', timeline: 'Active Feb 1 onwards' },
  { name: 'Priya', role: 'Flatmate', timeline: 'Active Feb 1 onwards' },
  { name: 'Dev', role: 'Visiting Member', timeline: 'Active Feb 1 onwards' },
  { name: 'Meera', role: 'Flatmate (Timeline test)', timeline: 'Active Feb-March' },
  { name: 'Sam', role: 'Flatmate (Timeline test)', timeline: 'Active April 15 onwards' },
];

export default function Landing() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showDemoMenu, setShowDemoMenu] = useState(false);
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
    <div className="min-h-screen md:h-screen md:overflow-hidden bg-background flex flex-col md:flex-row relative">
      {/* Demo Credentials Dropdown */}
      <div className="absolute top-6 right-6 z-50">
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowDemoMenu(!showDemoMenu)}
            className="flex items-center gap-1.5 px-4 py-2 bg-surface hover:bg-accent-light border border-border hover:border-accent/30 text-textPrimary hover:text-accent rounded-xl text-xs font-semibold shadow-premium transition-all"
          >
            <Sparkles size={14} className="animate-pulse" />
            <span>Demo Accounts</span>
          </button>

          {showDemoMenu && (
            <div className="absolute right-0 mt-2 w-80 bg-surface border border-border rounded-2xl shadow-premium p-2 space-y-1 z-50">
              <div className="px-3 py-2 border-b border-border/60">
                <span className="block text-[11px] font-bold text-textMuted uppercase tracking-wider">Select Demo Account</span>
              </div>
              <div className="max-h-64 overflow-y-auto space-y-1 py-1">
                {demoUsers.map((user) => (
                  <button
                    key={user.name}
                    type="button"
                    onClick={() => {
                      setUsername(user.name);
                      setPassword('flatmate123');
                      setIsLogin(true);
                      setShowDemoMenu(false);
                      toast.success(`Filled credentials for ${user.name}`);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-accent-light/60 rounded-xl transition-colors flex flex-col gap-0.5 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-textPrimary group-hover:text-accent transition-colors">{user.name}</span>
                      <span className="text-[10px] text-accent/80 font-medium bg-accent-light px-2 py-0.5 rounded-full">{user.timeline}</span>
                    </div>
                    <span className="text-[11px] text-textMuted leading-none">{user.role}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Left Pane - Marketing Highlight */}
      <div className="w-full md:w-1/2 bg-accent-light border-r border-border flex flex-col justify-center p-8 md:p-12 lg:p-16 xl:p-20">
        <div className="max-w-md mx-auto w-full space-y-8 lg:space-y-10">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 bg-accent rounded-xl flex items-center justify-center text-white font-heading font-extrabold text-lg shadow-premium">
              F
            </div>
            <span className="font-heading font-bold text-lg text-textPrimary tracking-tight">FairShare</span>
          </div>

          {/* Heading & Intro */}
          <div className="space-y-4">
            <h1 className="font-heading text-3xl lg:text-4xl xl:text-5xl font-extrabold text-textPrimary leading-tight">
              Simplify shared expenses, <span className="text-accent">fairly.</span>
            </h1>
            <p className="text-textMuted text-xs md:text-sm lg:text-base leading-relaxed">
              Keep track of flatmate utilities, group travel, and shared events without the hassle. Time-aware splitting, multi-currency support, and debt simplification all built-in.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <div className="flex gap-4 items-start bg-surface p-4 rounded-xl border border-border/60 shadow-premium">
              <div className="p-2.5 bg-accent-light text-accent rounded-lg">
                <Shield size={18} />
              </div>
              <div>
                <h3 className="font-heading font-semibold text-textPrimary mb-0.5 text-xs lg:text-sm">Aisha's View</h3>
                <p className="text-textMuted text-[11px] lg:text-xs leading-normal">One net transaction list. Shows exactly who needs to pay whom to clear all balances.</p>
              </div>
            </div>

            <div className="flex gap-4 items-start bg-surface p-4 rounded-xl border border-border/60 shadow-premium">
              <div className="p-2.5 bg-accent-light text-accent rounded-lg">
                <Sparkles size={18} />
              </div>
              <div>
                <h3 className="font-heading font-semibold text-textPrimary mb-0.5 text-xs lg:text-sm">Rohan's View</h3>
                <p className="text-textMuted text-[11px] lg:text-xs leading-normal">Audit trail transparency. Expand any peer relationship to see the precise line-item ledger.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Pane - Auth Card */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-12 lg:p-16 xl:p-20">
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
              <div className="relative flex items-center">
                <span className="absolute left-4 text-textMuted/70">
                  <Lock size={16} />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="w-full pl-11 pr-12 py-3 bg-background border border-border rounded-xl text-textPrimary placeholder-textMuted/50 text-sm focus:outline-none focus:border-accent transition-colors"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 text-textMuted/70 hover:text-textPrimary transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
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
