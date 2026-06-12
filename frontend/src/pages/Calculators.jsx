import { useNavigate } from 'react-router-dom';

export default function Calculators() {
  const navigate = useNavigate();

  return (
    <div className="calc-landing-container fade-in">
      <div className="calc-content-wrap">
        <h1 className="calc-main-title">Fairness calculators</h1>
        <p className="calc-main-subtitle">Wondering what's fair? Let us help:</p>

        {/* LARGE CARDS GRID */}
        <div className="calc-large-grid">
          {/* Card 1: Rent Splitting */}
          <div className="calc-large-card" onClick={() => navigate('/calculators/rent')}>
            <div className="calc-large-media">
              <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* 3D House Shape */}
                <path d="M60 20 L100 50 L100 95 L20 95 L20 50 Z" fill="#F0F2F5" stroke="#3D3D3D" strokeWidth="4" strokeLinejoin="round"/>
                <path d="M15 50 L60 15 L105 50" stroke="#3D3D3D" strokeWidth="5" strokeLinecap="round"/>
                <rect x="48" y="65" width="24" height="30" fill="#7B6DCC" fillOpacity="0.2" stroke="#3D3D3D" strokeWidth="3"/>
                <circle cx="54" cy="80" r="2" fill="#3D3D3D"/>
                <rect x="30" y="55" width="16" height="16" fill="white" stroke="#3D3D3D" strokeWidth="3" rx="2"/>
                <rect x="74" y="55" width="16" height="16" fill="white" stroke="#3D3D3D" strokeWidth="3" rx="2"/>
                {/* Roof tiles lines */}
                <path d="M40 30 L45 35 M80 30 L75 35" stroke="#3D3D3D" strokeWidth="2"/>
              </svg>
            </div>
            <div className="calc-large-info">
              <h2 className="calc-large-card-title">
                How should you <br />
                <span className="accent-text">split the rent</span> <br />
                in a new apartment?
              </h2>
            </div>
          </div>

          {/* Card 2: Renters Insurance */}
          <div className="calc-large-card" onClick={() => navigate('/calculators/renters')}>
            <div className="calc-large-media">
              <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* House with Fire Flame */}
                <path d="M60 30 L95 55 L95 95 L25 95 L25 55 Z" fill="#212529" stroke="#212529" strokeWidth="4" strokeLinejoin="round"/>
                <path d="M20 55 L60 25 L100 55" stroke="#212529" strokeWidth="5" strokeLinecap="round"/>
                {/* Windows/Door blacked out */}
                <rect x="35" y="60" width="14" height="14" fill="#3D3D3D" rx="2"/>
                <rect x="71" y="60" width="14" height="14" fill="#3D3D3D" rx="2"/>
                <rect x="52" y="75" width="16" height="20" fill="#3D3D3D"/>
                {/* Fire Flame on Roof */}
                <path d="M75 15 C85 22 80 40 70 42 C85 45 92 32 90 22 C95 30 95 45 80 50 C70 48 70 30 75 15 Z" fill="#E15C32"/>
              </svg>
            </div>
            <div className="calc-large-info">
              <h2 className="calc-large-card-title">
                Should you get <br />
                <span className="bold-text">renters insurance?</span>
              </h2>
            </div>
          </div>
        </div>

        {/* SUB CARDS GRID */}
        <div className="calc-sub-grid">
          {/* Sub Card 1: Used Furniture */}
          <div className="calc-sub-card" onClick={() => navigate('/calculators/furniture')} style={{ cursor: 'pointer' }}>
            <div className="calc-sub-media">
              <svg width="70" height="50" viewBox="0 0 100 70" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Sofa */}
                <rect x="15" y="30" width="70" height="30" rx="4" fill="#E07745" fillOpacity="0.2" stroke="#3D3D3D" strokeWidth="3"/>
                <rect x="10" y="25" width="12" height="30" rx="4" fill="#E07745" fillOpacity="0.3" stroke="#3D3D3D" strokeWidth="3"/>
                <rect x="78" y="25" width="12" height="30" rx="4" fill="#E07745" fillOpacity="0.3" stroke="#3D3D3D" strokeWidth="3"/>
                <path d="M22 20 C22 15 78 15 78 20 V30 H22 Z" fill="#E07745" fillOpacity="0.1" stroke="#3D3D3D" strokeWidth="3"/>
                <rect x="22" y="38" width="26" height="16" rx="2" fill="#E07745" fillOpacity="0.4" stroke="#3D3D3D" strokeWidth="2"/>
                <rect x="52" y="38" width="26" height="16" rx="2" fill="#E07745" fillOpacity="0.4" stroke="#3D3D3D" strokeWidth="2"/>
                {/* Sofa Legs */}
                <line x1="18" y1="60" x2="18" y2="65" stroke="#3D3D3D" strokeWidth="4" strokeLinecap="round"/>
                <line x1="82" y1="60" x2="82" y2="65" stroke="#3D3D3D" strokeWidth="4" strokeLinecap="round"/>
              </svg>
            </div>
            <p className="calc-sub-text">Buying or selling used furniture?</p>
            <div className="calc-sub-link">Set a price with our <strong>Furniture Calculator »</strong></div>
          </div>

          {/* Sub Card 2: Guest Calculator */}
          <div className="calc-sub-card" onClick={() => navigate('/calculators/guest')} style={{ cursor: 'pointer' }}>
            <div className="calc-sub-media">
              <svg width="70" height="50" viewBox="0 0 100 70" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Slippers on a circular rug */}
                <ellipse cx="50" cy="45" rx="35" ry="18" fill="#5BC5A7" fillOpacity="0.1" stroke="#3D3D3D" strokeWidth="2" strokeDasharray="4 2"/>
                {/* Slipper 1 */}
                <rect x="32" y="22" width="14" height="30" rx="7" fill="#E05C40" fillOpacity="0.2" stroke="#3D3D3D" strokeWidth="2.5" transform="rotate(-10 32 22)"/>
                <path d="M30 25 C30 18 42 18 42 25 Z" fill="#E05C40" stroke="#3D3D3D" strokeWidth="2" transform="rotate(-10 32 22)"/>
                {/* Slipper 2 */}
                <rect x="54" y="20" width="14" height="30" rx="7" fill="#E05C40" fillOpacity="0.2" stroke="#3D3D3D" strokeWidth="2.5" transform="rotate(10 54 20)"/>
                <path d="M52 23 C52 16 64 16 64 23 Z" fill="#E05C40" stroke="#3D3D3D" strokeWidth="2" transform="rotate(10 54 20)"/>
              </svg>
            </div>
            <p className="calc-sub-text">Staying over at a friend's place?</p>
            <div className="calc-sub-link">Couch-surf fairly with our <strong>Guest Calculator »</strong></div>
          </div>

          {/* Sub Card 3: Noise Calculator */}
          <div className="calc-sub-card" onClick={() => navigate('/calculators/noise')} style={{ cursor: 'pointer' }}>
            <div className="calc-sub-media">
              <svg width="70" height="50" viewBox="0 0 100 70" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Speakers */}
                {/* Speaker Left */}
                <rect x="22" y="15" width="22" height="42" rx="3" fill="#DCE0E4" stroke="#3D3D3D" strokeWidth="2.5"/>
                <circle cx="33" cy="27" r="5" fill="white" stroke="#3D3D3D" strokeWidth="2"/>
                <circle cx="33" cy="45" r="8" fill="white" stroke="#3D3D3D" strokeWidth="2"/>
                {/* Speaker Right */}
                <rect x="56" y="15" width="22" height="42" rx="3" fill="#DCE0E4" stroke="#3D3D3D" strokeWidth="2.5"/>
                <circle cx="67" cy="27" r="5" fill="white" stroke="#3D3D3D" strokeWidth="2"/>
                <circle cx="67" cy="45" r="8" fill="white" stroke="#3D3D3D" strokeWidth="2"/>
              </svg>
            </div>
            <p className="calc-sub-text">Loud neighbors? Can't sleep?</p>
            <div className="calc-sub-link">Find out the cost with our <strong>Noise Calculator »</strong></div>
          </div>

          {/* Sub Card 4: Travel Calculator */}
          <div className="calc-sub-card" onClick={() => navigate('/calculators/travel')} style={{ cursor: 'pointer' }}>
            <div className="calc-sub-media">
              <svg width="70" height="50" viewBox="0 0 100 70" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Airplane */}
                <path d="M20 40 L80 30 L85 22 L75 24 L80 30 L90 31 L85 45 L80 43 L80 33 L20 40 Z" fill="#149377" fillOpacity="0.2" stroke="#3D3D3D" strokeWidth="2.5" strokeLinejoin="round"/>
                <path d="M50 35 L62 10 L68 11 L55 34 Z" fill="#149377" fillOpacity="0.4" stroke="#3D3D3D" strokeWidth="2"/>
                <path d="M52 35 L40 55 L46 56 L50 35 Z" fill="#149377" fillOpacity="0.4" stroke="#3D3D3D" strokeWidth="2"/>
              </svg>
            </div>
            <p className="calc-sub-text">Going on a trip with friends?</p>
            <div className="calc-sub-link">Share travel costs with our <strong>Travel Calculator »</strong></div>
          </div>
        </div>

        {/* BOTTOM ASK LINK */}
        <div className="calc-ask-splitwise">
          Have a different sharing problem that needs solving? <span className="ask-link">Ask Splitwise!</span>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="calc-footer">
        <div className="calc-footer-content">
          <div className="calc-footer-left">
            <span className="calc-made-in">Made with ☻ in Providence, RI, USA</span>
            <span className="calc-copyright">Copyright © 2026 Splitwise, Inc. All rights reserved.</span>
          </div>
          <div className="calc-footer-right">
            <span className="calc-link">About</span> | <span className="calc-link">Jobs</span> | <span className="calc-link">Calculators</span> | <span className="calc-link">Blog</span> | <span className="calc-link">Terms</span> | <span className="calc-link">Press</span> | <span className="calc-link">API</span> | <span className="calc-link">Contact us</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
