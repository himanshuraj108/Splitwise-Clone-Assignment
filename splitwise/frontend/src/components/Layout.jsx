import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { SplitwiseWordmark, SplitwiseLogoMark } from './SplitwiseLogo';
import { Home, Globe } from 'lucide-react';
import { groupsAPI } from '../api';

/* SVG Icons — no emoji */
const IconDashboard = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
  </svg>
);
const IconFriends = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const IconGroups = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
    <path d="M8 12h8M12 8v8"/>
  </svg>
);
const IconAccount = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);
const IconLogout = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [hasGroups, setHasGroups] = useState(false);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [skippedSetup, setSkippedSetup] = useState(localStorage.getItem('skippedSetup') === 'true');
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  const avatarColor = user?.avatar_color || '#1CC29F';
  const initials = user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?';

  const fetchGroups = async () => {
    try {
      const res = await groupsAPI.list();
      setHasGroups(res.data.length > 0);
    } catch (err) {
      console.error('Error fetching groups in Layout:', err);
    } finally {
      setLoadingGroups(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchGroups();
    } else {
      setLoadingGroups(false);
    }
  }, [user]);

  // Click outside listener for the onboarding dropdown
  useEffect(() => {
    if (!showDropdown) return;
    const closeDropdown = () => setShowDropdown(false);
    const timer = setTimeout(() => {
      window.addEventListener('click', closeDropdown);
    }, 0);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('click', closeDropdown);
    };
  }, [showDropdown]);

  const handleSkip = () => {
    localStorage.setItem('skippedSetup', 'true');
    setSkippedSetup(true);
  };

  const handleGroupCreated = () => {
    setActiveModal(null);
    fetchGroups();
  };

  const isFullWidthPage = location.pathname.startsWith('/groups/new') || location.pathname.startsWith('/profile') || location.pathname.startsWith('/subscriptions/new') || location.pathname.startsWith('/calculators') || location.pathname.startsWith('/support');

  if (loadingGroups) {
    return (
      <div className="loading-center" style={{ minHeight: '100vh', background: 'white' }}>
        <div className="spinner" />
      </div>
    );
  }

  // If new user with no groups and hasn't skipped setup, show onboarding (unless on full-width pages)
  if (!skippedSetup && !hasGroups && !isFullWidthPage) {
    return (
      <div className="onboarding-layout" style={{ minHeight: '100vh', background: 'white', display: 'flex', flexDirection: 'column' }}>
        {/* Onboarding Header */}
        <header className="onboarding-header">
          <div className="onboarding-header-left">
            <SplitwiseWordmark iconSize={24} variant="white" />
          </div>
          <div className="onboarding-header-right">
            <div style={{ position: 'relative' }}>
              <button 
                onClick={(e) => { e.stopPropagation(); setShowDropdown(!showDropdown); }} 
                className="onboarding-user-btn"
              >
                <div 
                  className="avatar avatar-sm" 
                  style={{ background: avatarColor, border: '2px solid white', flexShrink: 0 }}
                >
                  {initials}
                </div>
                <span>{user?.name || 'User'} ! ▾</span>
              </button>
              {showDropdown && (
                <div className="onboarding-dropdown">
                  <button
                    onClick={() => { setShowDropdown(false); navigate('/profile'); }}
                    className="onboarding-dropdown-item"
                  >
                    Your account
                  </button>
                  <button
                    onClick={() => { setShowDropdown(false); navigate('/groups/new'); }}
                    className="onboarding-dropdown-item"
                  >
                    Create a group
                  </button>
                  <button
                    onClick={() => { setShowDropdown(false); navigate('/calculators'); }}
                    className="onboarding-dropdown-item"
                  >
                    Fairness calculators
                  </button>
                  <button
                    onClick={() => { setShowDropdown(false); navigate('/support'); }}
                    className="onboarding-dropdown-item"
                  >
                    Contact support
                  </button>
                  <button
                    onClick={() => { setShowDropdown(false); handleLogout(); }}
                    className="onboarding-dropdown-item logout-item"
                  >
                    Log out
                  </button>
                </div>
              )}
            </div>
          </div>
         </header>

        {/* Onboarding Body */}
        <div className="onboarding-body">
          <div className="onboarding-card">
            <div className="onboarding-logo-wrap">
              <SplitwiseLogoMark size={110} />
            </div>
            <h1 className="onboarding-title">Welcome to Splitwise!</h1>
            <p className="onboarding-subtitle">What would you like to do first?</p>

            <div className="onboarding-btn-stack">
              <button onClick={() => navigate('/groups/new/apartment')} className="onboarding-btn orange-btn">
                <Home size={18} />
                <span>Add your apartment</span>
              </button>
              <button onClick={() => navigate('/groups/new/trip')} className="onboarding-btn orange-btn">
                <Globe size={18} />
                <span>Add a group trip</span>
              </button>
              <button onClick={handleSkip} className="onboarding-btn grey-btn">
                <span>Skip setup for now</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isFullWidthPage) {
    return (
      <div className="onboarding-layout" style={{ minHeight: '100vh', background: 'white', display: 'flex', flexDirection: 'column' }}>
        {/* Onboarding Header */}
        <header className="onboarding-header">
          <div className="onboarding-header-left">
            <SplitwiseWordmark iconSize={24} variant="white" onClick={() => navigate('/dashboard')} />
          </div>
          <div className="onboarding-header-right" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <span 
              onClick={() => navigate('/dashboard')} 
              style={{ color: 'rgba(255, 255, 255, 0.95)', cursor: 'pointer', fontSize: '13.5px', fontWeight: '600' }}
              className="onboarding-home-nav-link"
            >
              Home
            </span>
            <div style={{ position: 'relative' }}>
              <button 
                onClick={(e) => { e.stopPropagation(); setShowDropdown(!showDropdown); }} 
                className="onboarding-user-btn"
              >
                <div 
                  className="avatar avatar-sm" 
                  style={{ background: avatarColor, border: '2px solid white', flexShrink: 0 }}
                >
                  {initials}
                </div>
                <span>{user?.name || 'User'} ! ▾</span>
              </button>
              {showDropdown && (
                <div className="onboarding-dropdown">
                  <button
                    onClick={() => { setShowDropdown(false); navigate('/profile'); }}
                    className="onboarding-dropdown-item"
                  >
                    Your account
                  </button>
                  <button
                    onClick={() => { setShowDropdown(false); navigate('/groups/new'); }}
                    className="onboarding-dropdown-item"
                  >
                    Create a group
                  </button>
                  <button
                    onClick={() => { setShowDropdown(false); navigate('/calculators'); }}
                    className="onboarding-dropdown-item"
                  >
                    Fairness calculators
                  </button>
                  <button
                    onClick={() => { setShowDropdown(false); navigate('/support'); }}
                    className="onboarding-dropdown-item"
                  >
                    Contact support
                  </button>
                  <button
                    onClick={() => { setShowDropdown(false); handleLogout(); }}
                    className="onboarding-dropdown-item logout-item"
                  >
                    Log out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Full-width content wrapper */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', background: 'white' }}>
          <Outlet context={{ refreshGroups: fetchGroups }} />
        </div>
      </div>
    );
  }

  // Normal dashboard shell
  return (
    <div className="app-shell">
      {/* SIDEBAR */}
      <aside className="sidebar">
        {/* Logo */}
        <div className="sidebar-logo-wrap">
          <SplitwiseWordmark iconSize={28} />
        </div>

        <nav className="sidebar-nav">
          <NavLink
            to="/dashboard"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <IconDashboard />
            Dashboard
          </NavLink>

          <NavLink
            to="/friends"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <IconFriends />
            Friends
          </NavLink>

          <NavLink
            to="/groups"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <IconGroups />
            Groups
          </NavLink>

          <div className="nav-divider" />

          <NavLink
            to="/profile"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <IconAccount />
            Account
          </NavLink>
        </nav>

        {/* User footer */}
        <div className="sidebar-footer">
          <div className="user-pill">
            <div
              className="avatar avatar-sm"
              style={{ background: avatarColor, flexShrink: 0 }}
            >
              {initials}
            </div>
            <div className="user-pill-info">
              <div className="user-pill-name">{user?.name}</div>
              <div className="user-pill-email">{user?.email}</div>
            </div>
            <button
              onClick={handleLogout}
              title="Log out"
              style={{ color: '#bbb', cursor: 'pointer', padding: 4, background: 'none', border: 'none', display: 'flex', alignItems: 'center' }}
            >
              <IconLogout />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content fade-in">
        <Outlet context={{ refreshGroups: fetchGroups }} />
      </main>
    </div>
  );
}
