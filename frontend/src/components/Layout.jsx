import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LayoutDashboard, LogOut } from 'lucide-react';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row font-sans">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-surface border-b md:border-b-0 md:border-r border-border flex flex-row md:flex-col justify-between p-4 md:p-6 md:h-screen sticky top-0 z-30 shadow-premium md:shadow-none">
        <div className="flex md:flex-col items-center md:items-stretch justify-between md:justify-start w-full gap-0 md:gap-8">
          {/* Logo */}
          <div 
            className="flex items-center gap-2 cursor-pointer py-1"
            onClick={() => navigate('/dashboard')}
          >
            <div className="h-9 w-9 bg-accent rounded-xl flex items-center justify-center text-white font-heading font-extrabold text-lg shadow-premium animate-pulse-slow">
              F
            </div>
            <span className="font-heading font-bold text-lg text-textPrimary tracking-tight">FairShare</span>
          </div>

          {/* Navigation */}
          <nav className="hidden md:block space-y-1 w-full">
            <button 
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                location.pathname === '/dashboard' 
                  ? 'bg-accent-light text-accent' 
                  : 'text-textMuted hover:text-textPrimary hover:bg-background'
              }`}
              onClick={() => navigate('/dashboard')}
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </button>
          </nav>
        </div>

        {/* User profile section */}
        {user && (
          <div className="flex items-center gap-3 p-2 md:p-3 bg-background border border-border/80 rounded-2xl max-w-xs md:max-w-none">
            <div 
              className="h-9 w-9 rounded-xl flex items-center justify-center text-white font-heading font-bold text-sm shadow-sm flex-shrink-0" 
              style={{ backgroundColor: user.avatar_color || '#2563EB' }}
            >
              {user.username.substring(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <span className="block text-sm font-semibold text-textPrimary truncate leading-tight">{user.username}</span>
              <button 
                onClick={handleLogout}
                className="text-xs text-textMuted hover:text-danger font-medium flex items-center gap-1 mt-0.5 transition-colors"
              >
                <LogOut size={12} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-[calc(100vh-70px)] md:min-h-screen bg-background overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
