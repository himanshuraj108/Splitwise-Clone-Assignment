import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LayoutDashboard, LogOut, Share2 } from 'lucide-react';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="app-container">
      <div className="sidebar">
        <div className="logo-container" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
          <Share2 size={24} color="#10B981" />
          <span className="logo-text">FairShare</span>
        </div>

        <div className="nav-links">
          <div 
            className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
            onClick={() => navigate('/dashboard')}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </div>
        </div>

        {user && (
          <div className="sidebar-user">
            <div className="user-avatar" style={{ backgroundColor: user.avatar_color || '#10B981' }}>
              {user.username.substring(0, 2).toUpperCase()}
            </div>
            <div className="user-info">
              <span className="user-name">{user.username}</span>
              <span className="user-logout" onClick={handleLogout}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <LogOut size={12} /> Logout
                </span>
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="content-wrapper">
        {children}
      </div>
    </div>
  );
}
