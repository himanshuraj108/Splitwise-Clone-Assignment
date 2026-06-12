import { Link } from 'react-router-dom';
import { SplitwiseWordmark } from '../components/SplitwiseLogo';

/* Exact category icons — SVG, no emoji */
const IconPlane = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" style={{ color: '#1CC29F' }}>
    <path d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0 0 11.5 2A1.5 1.5 0 0 0 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1l3.5 1v-1.5L13 19v-5.5z"/>
  </svg>
);
const IconHome = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" style={{ color: '#9B8EC4' }}>
    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
  </svg>
);
const IconHeart = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" style={{ color: '#E0888A' }}>
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54z"/>
  </svg>
);
const IconAsterisk = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" style={{ color: '#aaa' }}>
    <path d="M11 3h2v7.267l6.294-3.633 1 1.732L14 12l6.294 3.634-1 1.732L13 13.732V21h-2v-7.268l-6.294 3.634-1-1.732L10 12 3.706 8.366l1-1.732L11 10.267z"/>
  </svg>
);
const IconApple = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 14, height: 14, color: '#555' }}>
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
  </svg>
);
const IconAndroid = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 14, height: 14, color: '#555' }}>
    <path d="M6 18c0 .55.45 1 1 1h1v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h2v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h1c.55 0 1-.45 1-1V8H6v10zM3.5 8C2.67 8 2 8.67 2 9.5v7c0 .83.67 1.5 1.5 1.5S5 17.33 5 16.5v-7C5 8.67 4.33 8 3.5 8zm17 0c-.83 0-1.5.67-1.5 1.5v7c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-7c0-.83-.67-1.5-1.5-1.5zm-4.97-5.84l1.3-1.3c.2-.2.2-.51 0-.71-.2-.2-.51-.2-.71 0l-1.48 1.48C13.85 1.23 12.95 1 12 1c-.96 0-1.86.23-2.66.63L7.85.15c-.2-.2-.51-.2-.71 0-.2.2-.2.51 0 .71l1.31 1.31C6.97 3.26 6 5.01 6 7h12c0-1.99-.97-3.75-2.47-4.84zM10 5H9V4h1v1zm5 0h-1V4h1v1z"/>
  </svg>
);

/* Mini phone mockup component */
function PhoneMockup({ children, screenBg = '#fff' }) {
  return (
    <div style={{
      width: 220, background: '#f0f0f0', borderRadius: 28,
      padding: '10px 6px', boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
      border: '4px solid #d0d0d0', position: 'relative'
    }}>
      {/* Notch */}
      <div style={{ width: 60, height: 16, background: '#d0d0d0', borderRadius: 8, margin: '0 auto 6px', position: 'relative', zIndex: 2 }} />
      <div style={{ background: screenBg, borderRadius: 18, overflow: 'hidden', minHeight: 340 }}>
        {children}
      </div>
    </div>
  );
}

/* Mini friends list (phone mockup content) */
function FriendsPhone() {
  const friends = [
    { name: 'Earl E. Phant', status: 'you owe', amount: '₹92.21', color: '#E07745', initials: 'EE', bg: '#7B6DCC' },
    { name: 'Gajah', status: 'owes you', amount: '₹20.00', color: '#1CC29F', initials: 'GA', bg: '#e8a47a' },
    { name: 'Jorge Jirafa', status: 'settled up', amount: '', color: '#bbb', initials: 'JJ', bg: '#5d9e8e' },
    { name: 'Oli Fant', status: 'you owe', amount: '₹17.51', color: '#E07745', initials: 'OF', bg: '#8c7a6b' },
  ];
  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      {/* Phone header */}
      <div style={{ padding: '8px 12px 4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="#999"><circle cx="11" cy="11" r="8" stroke="#999" strokeWidth="2" fill="none"/><path d="M21 21l-4.35-4.35" stroke="#999" strokeWidth="2"/></svg>
        <span style={{ fontSize: 10, color: '#999' }}>Add friends</span>
      </div>
      <div style={{ padding: '4px 12px', fontSize: 16, fontWeight: 700, color: '#333' }}>Friends</div>
      {/* Balance card */}
      <div style={{ margin: '6px 10px', background: '#f2f3f5', borderRadius: 8, padding: '8px 10px' }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#333', marginBottom: 2 }}>Total balance</div>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#E07745' }}>You owe ₹92.21</div>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#1CC29F' }}>You are owed ₹69.77</div>
      </div>
      {friends.map(f => (
        <div key={f.name} style={{ display: 'flex', alignItems: 'center', padding: '7px 10px', borderBottom: '1px solid #f4f4f4', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: f.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: 'white', flexShrink: 0 }}>{f.initials}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#333' }}>{f.name}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            {f.amount ? (
              <>
                <div style={{ fontSize: 9, color: f.color }}>{f.status}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: f.color }}>{f.amount}</div>
              </>
            ) : <div style={{ fontSize: 10, color: '#bbb' }}>settled up</div>}
          </div>
          <span style={{ fontSize: 10, color: '#ddd', marginLeft: 2 }}>›</span>
        </div>
      ))}
    </div>
  );
}

/* Mini friend detail (phone mockup content) */
function FriendDetailPhone() {
  const items = [
    { date: 'Mar 18', name: "Ellie's bakery", sub: 'Earl E. paid ₹102.72', status: 'you borrowed', amt: '₹51.36', color: '#E07745' },
    { date: 'Mar 10', name: 'Fuel up', sub: 'You paid ₹48.06', status: 'you lent', amt: '₹24.03', color: '#1CC29F' },
    { date: 'Mar 06', name: 'Movie night', sub: 'You paid ₹5.00', status: 'you lent', amt: '₹2.50', color: '#1CC29F' },
    { date: 'Mar 05', name: 'Date night in', sub: 'You paid ₹62.80', status: 'you lent', amt: '₹31.40', color: '#1CC29F' },
  ];
  return (
    <div style={{ fontFamily: 'sans-serif', background: 'white' }}>
      {/* Red header */}
      <div style={{ background: '#B03030', padding: '10px 12px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ color: 'white', fontSize: 14 }}>‹</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
        </div>
        {/* Heart icon */}
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#C03030', border: '2px solid rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54z"/></svg>
        </div>
        <div style={{ color: 'white', fontSize: 14, fontWeight: 700, textAlign: 'center' }}>Elle &amp; Earl</div>
        <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 10, textAlign: 'center' }}>Earl E. owes you ₹67.70</div>
      </div>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, padding: '8px 8px 0', borderBottom: '1px solid #eee' }}>
        <button style={{ padding: '4px 10px', background: '#E07745', color: 'white', border: 'none', borderRadius: 20, fontSize: 10, fontWeight: 700 }}>Settle up</button>
        <button style={{ padding: '4px 10px', background: 'white', color: '#555', border: '1px solid #ccc', borderRadius: 20, fontSize: 10 }}>Balances</button>
        <button style={{ padding: '4px 10px', background: 'white', color: '#555', border: '1px solid #ccc', borderRadius: 20, fontSize: 10 }}>Totals</button>
      </div>
      {/* Month header */}
      <div style={{ padding: '4px 10px', background: '#f8f8f8', fontSize: 9, fontWeight: 700, color: '#999', textTransform: 'uppercase', borderBottom: '1px solid #efefef' }}>March 2021</div>
      {items.map((item, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 10px', borderBottom: '1px solid #f5f5f5' }}>
          <div style={{ width: 28, textAlign: 'center', flexShrink: 0 }}>
            <div style={{ fontSize: 7, color: '#bbb', fontWeight: 700 }}>MAR</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#aaa', lineHeight: 1 }}>{item.date.split(' ')[1]}</div>
          </div>
          <div style={{ width: 24, height: 24, background: '#f2f3f5', borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2"><path d="M3 3h2l.4 2M7 13h10l4-8H5.4m1.6 8l-1.1-5H19"/><circle cx="9" cy="19" r="1"/><circle cx="20" cy="19" r="1"/></svg>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#333', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
            <div style={{ fontSize: 9, color: '#bbb' }}>{item.sub}</div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: 9, color: item.color }}>{item.status}</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: item.color }}>{item.amt}</div>
          </div>
          <span style={{ fontSize: 10, color: '#ddd' }}>›</span>
        </div>
      ))}
    </div>
  );
}

export default function Landing() {
  return (
    <div style={{ minHeight: '100vh', fontFamily: "'Lato', sans-serif" }}>
      {/* NAV */}
      <nav className="sw-nav">
        <SplitwiseWordmark iconSize={36} />
        <div className="sw-nav-right">
          <Link to="/login" className="sw-nav-login">Log in</Link>
          <Link to="/register" className="sw-nav-signup">Sign up</Link>
        </div>
      </nav>

      {/* HERO — exact Splitwise 2-col layout */}
      <div className="sw-hero">
        <div className="sw-hero-left">
          <h1>
            Less stress when<br />
            sharing expenses<br />
            <span className="hero-accent">on trips.</span>
          </h1>

          {/* Category icons row — SVG icons, no emoji */}
          <div className="sw-hero-icons">
            <div style={{ width: 36, height: 36 }}><IconPlane /></div>
            <div style={{ width: 36, height: 36 }}><IconHome /></div>
            <div style={{ width: 36, height: 36 }}><IconHeart /></div>
            <div style={{ width: 36, height: 36 }}><IconAsterisk /></div>
          </div>

          <p>
            Keep track of your shared expenses and balances with housemates, trips, groups, friends, and family.
          </p>

          <Link to="/register" className="sw-hero-cta">Sign up</Link>

          <div className="sw-hero-free">
            <span>Free for</span>
            <IconApple />
            <span>iPhone,</span>
            <IconAndroid />
            <span>Android, and web.</span>
          </div>
        </div>

        <div className="sw-hero-right">
          {/* Animated geometric house SVG — transparent bg, no image */}
          <style>{`
            @keyframes floatHouse {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-18px); }
            }
            @keyframes shimmerTri {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.6; }
            }
            @keyframes shimmerTri2 {
              0%, 100% { opacity: 0.8; }
              50% { opacity: 1; }
            }
            @keyframes rotateSlow {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
            @keyframes glowPulse {
              0%, 100% { filter: drop-shadow(0 0 8px rgba(28,194,159,0.4)); }
              50% { filter: drop-shadow(0 0 24px rgba(28,194,159,0.8)); }
            }
            .hero-house-svg {
              animation: floatHouse 4s ease-in-out infinite, glowPulse 3s ease-in-out infinite;
            }
            .tri-a { animation: shimmerTri 3s ease-in-out infinite; }
            .tri-b { animation: shimmerTri2 2.5s ease-in-out infinite 0.4s; }
            .tri-c { animation: shimmerTri 3.5s ease-in-out infinite 0.8s; }
            .tri-d { animation: shimmerTri2 2.8s ease-in-out infinite 0.2s; }
            .tri-e { animation: shimmerTri 3.2s ease-in-out infinite 1s; }
            .tri-f { animation: shimmerTri2 2.6s ease-in-out infinite 0.6s; }
          `}</style>

          <svg
            className="hero-house-svg"
            width="520"
            height="480"
            viewBox="0 0 520 480"
            xmlns="http://www.w3.org/2000/svg"
            style={{ maxWidth: '100%' }}
          >
            {/* === ROOF — low-poly triangulated === */}
            {/* Main roof left */}
            <polygon className="tri-a" points="260,40 80,220 180,220" fill="#1CC29F" />
            {/* Main roof right */}
            <polygon className="tri-b" points="260,40 340,220 440,220" fill="#149377" />
            {/* Roof mid-left */}
            <polygon className="tri-c" points="260,40 180,220 260,160" fill="#ACE4D6" />
            {/* Roof mid-right */}
            <polygon className="tri-d" points="260,40 260,160 340,220" fill="#1aaa88" />
            {/* Roof far left small */}
            <polygon className="tri-e" points="80,220 130,130 180,220" fill="#0e8a6e" />
            {/* Roof far right small */}
            <polygon className="tri-f" points="340,220 390,130 440,220" fill="#17b090" />
            {/* Top peak triangles */}
            <polygon className="tri-a" points="260,40 220,100 260,90" fill="#b8ede0" />
            <polygon className="tri-b" points="260,40 260,90 300,100" fill="#ACE4D6" />

            {/* === BODY — house walls === */}
            {/* Left wall */}
            <polygon className="tri-c" points="80,220 80,420 180,420 180,220" fill="#373B3F" />
            {/* Center wall left */}
            <polygon className="tri-d" points="180,220 180,420 260,420 260,220" fill="#3d4248" />
            {/* Center wall right */}
            <polygon className="tri-e" points="260,220 260,420 340,420 340,220" fill="#444b52" />
            {/* Right wall */}
            <polygon className="tri-f" points="340,220 340,420 440,420 440,220" fill="#373B3F" />

            {/* Wall triangle details (low-poly effect) */}
            <polygon className="tri-a" points="80,220 130,300 80,350" fill="#2e3338" />
            <polygon className="tri-b" points="80,350 130,300 80,420" fill="#252a2e" />
            <polygon className="tri-c" points="130,300 180,220 180,380" fill="#3a4046" />
            <polygon className="tri-d" points="130,300 180,380 80,420" fill="#31373d" />
            <polygon className="tri-e" points="440,220 390,300 440,350" fill="#2e3338" />
            <polygon className="tri-f" points="440,350 390,300 440,420" fill="#252a2e" />
            <polygon className="tri-a" points="390,300 340,220 340,380" fill="#3a4046" />
            <polygon className="tri-b" points="390,300 340,380 440,420" fill="#31373d" />

            {/* === DOOR === */}
            <rect x="220" y="310" width="80" height="110" rx="4" fill="#1CC29F" className="tri-c" />
            <rect x="228" y="318" width="30" height="50" rx="3" fill="#149377" />
            <rect x="262" y="318" width="30" height="50" rx="3" fill="#149377" />
            <rect x="228" y="372" width="64" height="48" rx="2" fill="#0e8a6e" />
            {/* Door knob */}
            <circle cx="268" cy="366" r="4" fill="#ACE4D6" />

            {/* === WINDOWS — teal glowing === */}
            {/* Left window */}
            <rect x="96" y="248" width="64" height="52" rx="4" fill="#1CC29F" className="tri-d" />
            <line x1="128" y1="248" x2="128" y2="300" stroke="#0e8a6e" strokeWidth="2"/>
            <line x1="96" y1="274" x2="160" y2="274" stroke="#0e8a6e" strokeWidth="2"/>
            <rect x="100" y="252" width="26" height="20" rx="2" fill="#ACE4D6" opacity="0.4"/>
            <rect x="130" y="252" width="26" height="20" rx="2" fill="#ACE4D6" opacity="0.4"/>

            {/* Right window */}
            <rect x="360" y="248" width="64" height="52" rx="4" fill="#1CC29F" className="tri-e" />
            <line x1="392" y1="248" x2="392" y2="300" stroke="#0e8a6e" strokeWidth="2"/>
            <line x1="360" y1="274" x2="424" y2="274" stroke="#0e8a6e" strokeWidth="2"/>
            <rect x="364" y="252" width="26" height="20" rx="2" fill="#ACE4D6" opacity="0.4"/>
            <rect x="394" y="252" width="26" height="20" rx="2" fill="#ACE4D6" opacity="0.4"/>

            {/* === GROUND / BASE === */}
            <polygon points="60,420 460,420 480,440 40,440" fill="#ACE4D6" opacity="0.25" />
            <polygon points="40,440 480,440 500,455 20,455" fill="#1CC29F" opacity="0.15" />

            {/* === FLOATING SMALL TRIANGLES (decorative) === */}
            <polygon className="tri-f" points="470,80 490,120 450,120" fill="#1CC29F" opacity="0.5" />
            <polygon className="tri-a" points="490,150 510,190 470,190" fill="#ACE4D6" opacity="0.4" />
            <polygon className="tri-b" points="20,100 40,140 0,140" fill="#1CC29F" opacity="0.4" />
            <polygon className="tri-c" points="30,180 50,220 10,220" fill="#ACE4D6" opacity="0.3" />
            <polygon className="tri-d" points="480,320 500,360 460,360" fill="#1CC29F" opacity="0.35" />
            <polygon className="tri-e" points="10,320 30,360 -10,360" fill="#ACE4D6" opacity="0.3" />
          </svg>
        </div>
      </div>

      {/* FEATURE SECTION 1 — Dark left / Teal right */}
      <div className="feature-section">
        <div className="feature-half dark">
          <h2>Track balances</h2>
          <p>Keep track of shared expenses, balances, and who owes who.</p>
          <PhoneMockup>
            <FriendsPhone />
          </PhoneMockup>
        </div>
        <div className="feature-half teal-bg">
          <h2>Organize expenses</h2>
          <p>Split expenses with any group: trips, housemates, friends, and family.</p>
          <PhoneMockup screenBg="#B03030">
            <FriendDetailPhone />
          </PhoneMockup>
        </div>
      </div>

      {/* FEATURE SECTION 2 */}
      <div className="feature-section">
        <div className="feature-half" style={{ background: '#E07745', backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Cpolygon points='0,80 40,0 80,80' fill='none' stroke='%23c96232' stroke-width='1'/%3E%3C/svg%3E\")", backgroundSize: '60px 60px', color: 'white' }}>
          <h2>Add expenses easily</h2>
          <p>Quickly add expenses on the go before you forget who paid.</p>
          <PhoneMockup>
            {/* Add expense mockup */}
            <div style={{ fontFamily: 'sans-serif' }}>
              <div style={{ background: '#1CC29F', padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'white', fontSize: 14, fontWeight: 700 }}>✕</span>
                <span style={{ color: 'white', fontSize: 13, fontWeight: 700 }}>Add an expense</span>
                <span style={{ color: 'white', fontSize: 13, fontWeight: 700 }}>Save</span>
              </div>
              <div style={{ padding: '8px 12px', fontSize: 10, color: '#888', borderBottom: '1px solid #eee' }}>With <b>you</b> and: All of Tuscany trip</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderBottom: '1px solid #eee' }}>
                <div style={{ width: 36, height: 36, background: '#fde8d8', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E07745" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 3H8a2 2 0 0 0-2 2v2h12V5a2 2 0 0 0-2-2z"/></svg>
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#333', borderBottom: '1px solid #ccc', flex: 1, paddingBottom: 4 }}>Taxi</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 12px', borderBottom: '1px solid #eee' }}>
                <div style={{ border: '1px solid #ccc', borderRadius: 4, padding: '3px 8px', fontSize: 13, fontWeight: 700, color: '#555' }}>₹</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#333', borderBottom: '2px solid #1CC29F', paddingBottom: 3 }}>18.73</div>
              </div>
              <div style={{ padding: '8px 12px', fontSize: 11, color: '#888', background: '#f8f8f8', textAlign: 'center' }}>Paid by you and split equally</div>
              <div style={{ padding: '5px 12px', fontSize: 10, color: '#bbb', textAlign: 'center' }}>(₹9.37/person)</div>
            </div>
          </PhoneMockup>
        </div>

        <div className="feature-half dark" style={{ background: '#3a3b3c' }}>
          <h2>Pay friends back</h2>
          <p>Settle up with a friend and record any cash or online payment.</p>
          <PhoneMockup>
            {/* Settle up mockup */}
            <div style={{ fontFamily: 'sans-serif' }}>
              <div style={{ background: '#1CC29F', padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'white', fontSize: 14 }}>‹</span>
                <span style={{ color: 'white', fontSize: 13, fontWeight: 700 }}>Settle up</span>
                <span style={{ color: 'white', fontSize: 13, fontWeight: 700 }}>Save</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, padding: '20px 12px 8px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#2c3e50', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 4px' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#7abeaa"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                  </div>
                  <div style={{ fontSize: 9, color: '#888' }}>You</div>
                </div>
                <div style={{ fontSize: 20, color: '#ccc' }}>→</div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#e8c4b0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 4px' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#b07050"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                  </div>
                  <div style={{ fontSize: 9, color: '#888' }}>Earl E.</div>
                </div>
              </div>
              <div style={{ fontSize: 12, textAlign: 'center', color: '#888', marginBottom: 12 }}>You paid Earl E.</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <div style={{ border: '1px solid #ccc', borderRadius: 4, padding: '4px 10px', fontSize: 13, fontWeight: 700, color: '#555' }}>₹</div>
                <div style={{ fontSize: 26, fontWeight: 700, borderBottom: '2px solid #1CC29F', paddingBottom: 4 }}>92.21</div>
              </div>
            </div>
          </PhoneMockup>
        </div>
      </div>

      {/* FOOTER */}
      <div className="sw-footer">
        <div className="sw-footer-grid">
          <div className="sw-footer-col">
            <h4>Splitwise</h4>
            <a href="#">About</a><a href="#">Press</a><a href="#">Blog</a><a href="#">Jobs</a><a href="#">Calculators</a><a href="#">API</a>
          </div>
          <div className="sw-footer-col">
            <h4 style={{ color: '#E07745' }}>Account</h4>
            <a href="#">Log in</a><a href="#">Sign up</a><a href="#">Reset password</a><a href="#">Settings</a>
          </div>
          <div className="sw-footer-col">
            <h4 style={{ color: '#555' }}>More</h4>
            <a href="#">Contact us</a><a href="#">FAQ</a><a href="#">Site status</a>
            <a href="#" style={{ color: '#E07745' }}>Terms of Service</a>
            <a href="#">Privacy Policy</a>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ background: '#000', borderRadius: 6, padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M3 20.5v-17c0-.83.94-1.3 1.6-.8l14 8.5c.6.36.6 1.24 0 1.6l-14 8.5c-.66.5-1.6.03-1.6-.8z"/></svg>
              <div><div style={{ color: '#aaa', fontSize: 9 }}>GET IT ON</div><div style={{ color: 'white', fontSize: 13, fontWeight: 700 }}>Google Play</div></div>
            </div>
            <div style={{ background: '#000', borderRadius: 6, padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
              <div><div style={{ color: '#aaa', fontSize: 9 }}>Download on the</div><div style={{ color: 'white', fontSize: 13, fontWeight: 700 }}>App Store</div></div>
            </div>
          </div>
        </div>
        <div className="sw-footer-bottom">
          <span>Made with :) in Providence, RI, USA</span>
        </div>
      </div>

      {/* Colorful triangles footer band */}
      <div style={{ display: 'flex', height: 80, overflow: 'hidden' }}>
        {[
          ['#3d3d3d','#2a2a2a'], ['#1CC29F','#149377'], ['#E07745','#c96232'],
          ['#1CC29F','#0e7a63'], ['#3d3d3d','#555'], ['#7B6DCC','#6258b0'],
          ['#1CC29F','#149377'], ['#E07745','#c96232']
        ].map(([top, bot], i) => (
          <div key={i} style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
            <svg viewBox="0 0 100 80" width="100%" height="80" preserveAspectRatio="none">
              <polygon points="0,0 100,0 50,80" fill={top} />
              <polygon points="0,0 50,80 0,80" fill={bot} opacity="0.7" />
            </svg>
          </div>
        ))}
      </div>
    </div>
  );
}
