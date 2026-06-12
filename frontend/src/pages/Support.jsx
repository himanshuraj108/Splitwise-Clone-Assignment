import { useNavigate } from 'react-router-dom';

export default function Support() {
  const navigate = useNavigate();

  return (
    <div className="calc-landing-container fade-in" style={{ background: '#f8f9fa', minHeight: '100vh', display: 'flex', flexDirection: 'column', width: '100%' }}>
      
      {/* Content wrapper */}
      <div style={{ flex: 1, padding: '60px 24px', maxWidth: 1100, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        
        {/* Page Title */}
        <h1 style={{ 
          fontFamily: 'system-ui, -apple-system, sans-serif',
          fontSize: '36px',
          fontWeight: 'bold',
          color: '#333333',
          marginBottom: '48px',
          textAlign: 'left'
        }}>
          Contact support
        </h1>

        {/* Two-Column Details */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '48px', 
          marginBottom: '80px' 
        }}>
          
          {/* Left Column: Email */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
              {/* Purple Envelope SVG */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7B6DCC" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '10px' }}>
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#333333', margin: 0 }}>Email</h2>
            </div>
            
            <a 
              href="mailto:support@splitwise.com" 
              style={{ 
                fontSize: '18px', 
                color: '#1cc29f', 
                fontWeight: '600', 
                textDecoration: 'none', 
                marginBottom: '12px',
                display: 'inline-block'
              }}
              onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
              onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
            >
              support@splitwise.com
            </a>
            
            <p style={{ fontSize: '14px', color: '#666666', margin: 0, lineHeight: 1.5 }}>
              We aim to reply to most support requests within 1 business day.
            </p>
          </div>

          {/* Right Column: FAQ */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
              {/* Red Question Mark Icon */}
              <span style={{ 
                color: '#E05C40', 
                fontSize: '26px', 
                fontWeight: '900', 
                marginRight: '12px', 
                fontFamily: 'Georgia, serif',
                lineHeight: 1
              }}>
                ?
              </span>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#333333', margin: 0 }}>Frequently asked questions</h2>
            </div>
            
            <a 
              href="https://feedback.splitwise.com" 
              target="_blank" 
              rel="noreferrer"
              style={{ 
                fontSize: '18px', 
                color: '#1cc29f', 
                fontWeight: '600', 
                textDecoration: 'none', 
                marginBottom: '12px',
                display: 'inline-block'
              }}
              onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
              onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
            >
              https://feedback.splitwise.com
            </a>
            
            <p style={{ fontSize: '14px', color: '#666666', margin: 0, lineHeight: 1.5 }}>
              Find answers to common questions about Splitwise.
            </p>
          </div>

        </div>

      </div>

      {/* SITEMAP FOOTER */}
      <footer className="pro-footer-sitemap" style={{ background: '#f8f9fa', borderTop: '1px solid #e4e7ea' }}>
        <div className="pro-footer-sitemap-grid">
          <div className="pro-footer-sitemap-col">
            <h4>Splitwise</h4>
            <span className="sitemap-link" onClick={() => navigate('/about')}>About</span>
            <span className="sitemap-link" onClick={() => navigate('/press')}>Press</span>
            <span className="sitemap-link" onClick={() => navigate('/blog')}>Blog</span>
            <span className="sitemap-link" onClick={() => navigate('/jobs')}>Jobs</span>
            <span className="sitemap-link" onClick={() => navigate('/calculators')}>Calculators</span>
            <span className="sitemap-link" onClick={() => navigate('/api')}>API</span>
          </div>

          <div className="pro-footer-sitemap-col">
            <h4>Account</h4>
            <span className="sitemap-link" onClick={() => navigate('/login')}>Log in</span>
            <span className="sitemap-link" onClick={() => navigate('/register')}>Sign up</span>
            <span className="sitemap-link" onClick={() => navigate('/profile')}>Settings</span>
            <span className="sitemap-link" onClick={() => navigate('/subscriptions/new')}>Splitwise Pro</span>
          </div>

          <div className="pro-footer-sitemap-col">
            <h4>More</h4>
            <span className="sitemap-link" onClick={() => navigate('/support')}>Contact us</span>
            <span className="sitemap-link" onClick={() => navigate('/support')}>FAQ</span>
            <span className="sitemap-link">Site status</span>
            <span className="sitemap-link">Terms of Service</span>
            <span className="sitemap-link">Privacy Policy</span>
          </div>

          <div className="pro-footer-sitemap-badges">
            <div className="store-badge-buttons">
              {/* Google Play Store Badge SVG replica */}
              <div className="store-badge play-store">
                <svg width="135" height="40" viewBox="0 0 135 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="135" height="40" rx="6" fill="black"/>
                  <path d="M15 11L25 17L15 23V11Z" fill="#00E676"/>
                  <path d="M25 17L30 20L25 23V17Z" fill="#FFC107"/>
                  <path d="M25 17L15 11H25V17Z" fill="#00b0ff"/>
                  <path d="M25 17L15 23H25V17Z" fill="#ff3d00"/>
                  <text x="35" y="16" fill="white" fontSize="7" fontFamily="Arial" fontWeight="bold">GET IT ON</text>
                  <text x="35" y="27" fill="white" fontSize="11" fontFamily="Arial" fontWeight="900">Google Play</text>
                </svg>
              </div>
              {/* App Store Badge SVG replica */}
              <div className="store-badge app-store">
                <svg width="135" height="40" viewBox="0 0 135 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="135" height="40" rx="6" fill="black" stroke="#A6A6A6" strokeWidth="1"/>
                  <path d="M20 13.5C20 11.5 21.6 10.5 21.7 10.4C20.7 9 19.3 8.8 18.8 8.8C17.6 8.7 16.4 9.5 15.8 9.5C15.2 9.5 14.2 8.8 13.2 8.8C11.9 8.8 10.7 9.5 10.0 10.7C8.6 13.1 9.7 16.6 11.0 18.5C11.7 19.4 12.4 20.4 13.4 20.4C14.4 20.4 14.8 19.8 15.9 19.8C17.0 19.8 17.4 20.4 18.4 20.4C19.4 20.4 20.1 19.5 20.7 18.6C21.4 17.6 21.7 16.6 21.7 16.5C21.6 16.5 20 15.9 20 14.1C20 12.5 21.3 11.7 21.4 11.6C20.6 10.5 19.4 10.4 20 13.5ZM17.2 6.8C17.7 6.2 18.0 5.4 17.9 4.6C17.2 4.6 16.3 5.1 15.8 5.7C15.4 6.2 15.0 7.0 15.1 7.8C15.9 7.9 16.7 7.4 17.2 6.8Z" fill="white"/>
                  <text x="35" y="15" fill="white" fontSize="6.5" fontFamily="Arial">Download on the</text>
                  <text x="35" y="27" fill="white" fontSize="12" fontFamily="Arial" fontWeight="bold">App Store</text>
                </svg>
              </div>
            </div>
            <div className="sitemap-made-in">Made with :) in Providence, RI, USA</div>
          </div>
        </div>

        {/* Geometric Triangular Mountains Landscape */}
        <div className="geometric-footer-mountains-bottom">
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none" style={{ width: '100%', height: 120, display: 'block' }}>
            <polygon points="0,120 120,40 240,120" fill="#343a40" />
            <polygon points="180,120 300,50 420,120" fill="#1cc29f" />
            <polygon points="360,120 480,30 600,120" fill="#e07745" />
            <polygon points="540,120 660,60 780,120" fill="#ace4d6" />
            <polygon points="720,120 840,40 960,120" fill="#3d3d3d" />
            <polygon points="900,120 1020,50 1140,120" fill="#7b6dcc" />
            <polygon points="1080,120 1200,30 1320,120" fill="#e05c40" />
            <polygon points="1260,120 1380,60 1440,120" fill="#149377" />
          </svg>
        </div>
      </footer>

    </div>
  );
}
