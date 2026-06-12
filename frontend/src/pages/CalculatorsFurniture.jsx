import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CalculatorsFurniture() {
  const navigate = useNavigate();
  const [price, setPrice] = useState('');
  const [years, setYears] = useState('1');
  const [condBought, setCondBought] = useState('New');
  const [condNow, setCondNow] = useState('Like new');
  const [showModal, setShowModal] = useState(false);
  const [fairValue, setFairValue] = useState(0);

  const handleCalculate = (e) => {
    e.preventDefault();
    if (!price || parseFloat(price) <= 0) {
      alert('Please enter a valid purchase price.');
      return;
    }

    const cBought = { New: 1.0, 'Like new': 0.95, 'Very good': 0.85, Good: 0.75, Fair: 0.55 }[condBought] || 1.0;
    const cNow = { New: 1.0, 'Like new': 0.95, 'Very good': 0.85, Good: 0.75, Fair: 0.55 }[condNow] || 1.0;
    const depRate = 0.12; // 12% annual depreciation
    
    let calculated = parseFloat(price) * (cNow / cBought) * Math.pow(1 - depRate, parseFloat(years));
    if (calculated < 0) calculated = 0;
    if (calculated > parseFloat(price)) calculated = parseFloat(price);

    setFairValue(calculated);
    setShowModal(true);
  };

  return (
    <div className="calc-landing-container fade-in">
      <div className="calc-content-wrap">
        
        {/* HEADER */}
        <div className="calc-subpage-header">
          <h1 className="calc-subpage-title">The Splitwise Furniture Calculator</h1>
          
          <div className="calc-subpage-media">
            <svg width="240" height="150" viewBox="0 0 100 70" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="15" y="30" width="70" height="30" rx="4" fill="#E07745" fillOpacity="0.2" stroke="#3D3D3D" strokeWidth="3"/>
              <rect x="10" y="25" width="12" height="30" rx="4" fill="#E07745" fillOpacity="0.3" stroke="#3D3D3D" strokeWidth="3"/>
              <rect x="78" y="25" width="12" height="30" rx="4" fill="#E07745" fillOpacity="0.3" stroke="#3D3D3D" strokeWidth="3"/>
              <path d="M22 20 C22 15 78 15 78 20 V30 H22 Z" fill="#E07745" fillOpacity="0.1" stroke="#3D3D3D" strokeWidth="3"/>
              <rect x="22" y="38" width="26" height="16" rx="2" fill="#E07745" fillOpacity="0.4" stroke="#3D3D3D" strokeWidth="2"/>
              <rect x="52" y="38" width="26" height="16" rx="2" fill="#E07745" fillOpacity="0.4" stroke="#3D3D3D" strokeWidth="2"/>
              <line x1="18" y1="60" x2="18" y2="65" stroke="#3D3D3D" strokeWidth="4" strokeLinecap="round"/>
              <line x1="82" y1="60" x2="82" y2="65" stroke="#3D3D3D" strokeWidth="4" strokeLinecap="round"/>
            </svg>
          </div>

          <p className="calc-subpage-intro-msg">
            You know how much it was worth when you bought it. How much is it worth now?
          </p>
        </div>

        {/* FORM CARD */}
        <div className="calc-stepper-card" style={{ maxWidth: 500, margin: '0 auto' }}>
          <form onSubmit={handleCalculate} className="calc-simple-form">
            
            <div className="calc-form-row">
              <label>How much did you pay for this item?</label>
              <div className="calc-input-prefix-wrap">
                <span className="calc-currency-symbol">$</span>
                <input 
                  type="number" 
                  value={price} 
                  onChange={(e) => setPrice(e.target.value)} 
                  className="calc-rent-input"
                  required 
                />
              </div>
            </div>

            <div className="calc-form-row">
              <label>How long ago did you buy it?</label>
              <select 
                value={years} 
                onChange={(e) => setYears(e.target.value)} 
                className="calc-bedrooms-select"
              >
                <option value="0">Less than a year</option>
                <option value="1">1 year</option>
                <option value="2">2 years</option>
                <option value="3">3 years</option>
                <option value="4">4 years</option>
                <option value="5">5 years</option>
                <option value="6">6 years</option>
                <option value="7">7 years</option>
                <option value="8">8 years</option>
                <option value="9">9 years</option>
                <option value="10">10+ years</option>
              </select>
            </div>

            <div className="calc-form-row">
              <label>What condition was it when you bought it?</label>
              <select 
                value={condBought} 
                onChange={(e) => setCondBought(e.target.value)} 
                className="calc-bedrooms-select"
              >
                <option value="New">New</option>
                <option value="Like new">Like new</option>
                <option value="Very good">Very good</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
              </select>
            </div>

            <div className="calc-form-row">
              <label>What condition is it now?</label>
              <select 
                value={condNow} 
                onChange={(e) => setCondNow(e.target.value)} 
                className="calc-bedrooms-select"
              >
                <option value="New">New</option>
                <option value="Like new">Like new</option>
                <option value="Very good">Very good</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
              </select>
            </div>

            <div className="calc-button-row" style={{ marginTop: 24 }}>
              <button type="submit" className="calc-next-btn" style={{ padding: '12px 48px', background: '#7B6DCC' }}>
                Calculate
              </button>
            </div>

          </form>
        </div>

      </div>

      {/* RESULT MODAL */}
      {showModal && (
        <div className="calc-modal-backdrop fade-in">
          <div className="calc-modal-card">
            <button onClick={() => setShowModal(false)} className="calc-modal-close-corner">×</button>
            <div className="calc-modal-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              
              <h4 className="calc-modal-header-top" style={{ fontSize: 15, fontWeight: 700, color: '#333', marginBottom: 12 }}>
                The fair value of the furniture is now:
              </h4>

              <div className="calc-yes-big" style={{ color: '#7B6DCC', fontSize: '64px', margin: '16px 0' }}>
                ${fairValue.toFixed(2)}
              </div>

              <p className="calc-modal-fine-explanation" style={{ fontSize: 12, color: '#666', lineHeight: 1.5, marginBottom: 24, maxWidth: 440 }}>
                This number is not based on market prices, but on <strong>depreciation</strong>, which we believe is a better basis for
                fairness. This number is NOT a professional estimate, and is intended primarily for roommates buying and
                selling shared furniture. For further explanation, <span className="calc-link" style={{ color: '#7B6DCC', textDecoration: 'underline' }}>read our blog post</span>.
              </p>

              <button onClick={() => setShowModal(false)} className="calc-modal-close-btn" style={{ background: '#7B6DCC', color: 'white', border: 'none', padding: '10px 32px' }}>
                Close
              </button>

            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="calc-footer">
        <div className="calc-footer-content">
          <div className="calc-footer-left">
            <span className="calc-made-in">Made with ☻ in Providence, RI, USA</span>
            <span className="calc-copyright">Copyright © 2026 Splitwise, Inc. All rights reserved.</span>
          </div>
          <div className="calc-footer-right">
            <span className="calc-link" onClick={() => navigate('/about')}>About</span> |{' '}
            <span className="calc-link" onClick={() => navigate('/jobs')}>Jobs</span> |{' '}
            <span className="calc-link" onClick={() => navigate('/calculators')}>Calculators</span> |{' '}
            <span className="calc-link" onClick={() => navigate('/blog')}>Blog</span> |{' '}
            <span className="calc-link" onClick={() => navigate('/terms')}>Terms</span> |{' '}
            <span className="calc-link" onClick={() => navigate('/press')}>Press</span> |{' '}
            <span className="calc-link" onClick={() => navigate('/api')}>API</span> |{' '}
            <span className="calc-link" onClick={() => navigate('/contact')}>Contact us</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
