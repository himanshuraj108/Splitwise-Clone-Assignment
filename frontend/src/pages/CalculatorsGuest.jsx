import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CalculatorsGuest() {
  const navigate = useNavigate();
  const [rent, setRent] = useState('');
  const [freq, setFreq] = useState('Monthly');
  const [roommates, setRoommates] = useState('');
  const [nights, setNights] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [stayValue, setStayValue] = useState(0);

  const handleCalculate = (e) => {
    e.preventDefault();
    if (!rent || parseFloat(rent) <= 0) {
      alert('Please enter a valid apartment rent.');
      return;
    }
    if (!roommates || parseInt(roommates) <= 0) {
      alert('Please enter the number of roommates.');
      return;
    }
    if (!nights || parseInt(nights) <= 0) {
      alert('Please enter guest nights.');
      return;
    }

    const periodDays = freq === 'Weekly' ? 7 : freq === 'Fortnightly' ? 14 : 30;
    const dailyRent = parseFloat(rent) / periodDays;
    const perPersonDaily = dailyRent / parseFloat(roommates);
    const calculated = perPersonDaily * parseFloat(nights);

    setStayValue(calculated);
    setShowModal(true);
  };

  return (
    <div className="calc-landing-container fade-in">
      <div className="calc-content-wrap">
        
        {/* HEADER */}
        <div className="calc-subpage-header">
          <h1 className="calc-subpage-title">The Splitwise Guest Calculator</h1>
          
          <div className="calc-subpage-media">
            <svg width="200" height="150" viewBox="0 0 100 70" fill="none" xmlns="http://www.w3.org/2000/svg">
              <ellipse cx="50" cy="45" rx="35" ry="18" fill="#5BC5A7" fillOpacity="0.1" stroke="#3D3D3D" strokeWidth="2" strokeDasharray="4 2"/>
              <rect x="32" y="22" width="14" height="30" rx="7" fill="#E05C40" fillOpacity="0.2" stroke="#3D3D3D" strokeWidth="2.5" transform="rotate(-10 32 22)"/>
              <path d="M30 25 C30 18 42 18 42 25 Z" fill="#E05C40" stroke="#3D3D3D" strokeWidth="2" transform="rotate(-10 32 22)"/>
              <rect x="54" y="20" width="14" height="30" rx="7" fill="#E05C40" fillOpacity="0.2" stroke="#3D3D3D" strokeWidth="2.5" transform="rotate(10 54 20)"/>
              <path d="M52 23 C52 16 64 16 64 23 Z" fill="#E05C40" stroke="#3D3D3D" strokeWidth="2" transform="rotate(10 54 20)"/>
            </svg>
          </div>

          <p className="calc-subpage-intro-msg">
            Crashing on a friend's couch and want to give a little something to show your appreciation? Let us tell you how much your stay was worth.
          </p>
        </div>

        {/* FORM CARD */}
        <div className="calc-stepper-card" style={{ maxWidth: 500, margin: '0 auto' }}>
          <form onSubmit={handleCalculate} className="calc-simple-form">
            
            <div className="calc-form-row">
              <label>What is the rent for your apartment?</label>
              <div className="calc-input-prefix-wrap">
                <span className="calc-currency-symbol">$</span>
                <input 
                  type="number" 
                  value={rent} 
                  onChange={(e) => setRent(e.target.value)} 
                  className="calc-rent-input"
                  required 
                />
              </div>
            </div>

            <div className="calc-form-row">
              <label>How often do you pay rent?</label>
              <div className="calc-radio-group-vertical" style={{ display: 'flex', flexDirection: 'column', gap: 6, margin: '4px 0' }}>
                {['Weekly', 'Fortnightly', 'Monthly'].map(f => (
                  <label key={f} className="calc-radio-label" style={{ fontSize: '13.5px' }}>
                    <input 
                      type="radio" 
                      name="rent-frequency" 
                      checked={freq === f}
                      onChange={() => setFreq(f)}
                    />
                    <span>{f}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="calc-form-row">
              <label>How many people normally live in the apartment?</label>
              <input 
                type="number" 
                value={roommates} 
                onChange={(e) => setRoommates(e.target.value)} 
                className="calc-room-name-input"
                style={{ height: 42, fontSize: 15 }}
                required 
              />
            </div>

            <div className="calc-form-row">
              <label>How many nights is the guest staying?</label>
              <input 
                type="number" 
                value={nights} 
                onChange={(e) => setNights(e.target.value)} 
                className="calc-room-name-input"
                style={{ height: 42, fontSize: 15 }}
                required 
              />
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
                Fair value of this stay:
              </h4>

              <div className="calc-yes-big" style={{ color: '#E05C40', fontSize: '64px', margin: '16px 0' }}>
                ${stayValue.toFixed(2)}
              </div>

              <p className="calc-modal-fine-explanation" style={{ fontSize: 12, color: '#666', lineHeight: 1.5, marginBottom: 20, maxWidth: 440 }}>
                Most people would not charge for this short a stay. However, consider a thank-you card or a small gift.
              </p>

              <div className="calc-gift-idea-box" style={{ background: '#f8f9fa', border: '1px solid #e4e7ea', borderRadius: 8, padding: 16, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16, maxWidth: 400, width: '100%' }}>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#333', marginBottom: 4 }}>Need an idea for a gift?</div>
                  <div style={{ fontSize: 12, color: '#666' }}>
                    Why not get an Amazon gift card?<br />
                    <span className="calc-link" style={{ color: '#1cc29f', fontWeight: 700, textDecoration: 'underline' }}>Click here »</span>
                  </div>
                </div>
                <div className="amazon-logo-box" style={{ flexShrink: 0 }}>
                  {/* Small Amazon Logo Badge */}
                  <svg width="80" height="24" viewBox="0 0 100 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="100" height="30" rx="4" fill="white" stroke="#ccc" strokeWidth="1"/>
                    <path d="M12 18 C15 18 16 15 16 13 C16 9.5 13 9 10 9 C7 9 5 10 5 12 C5 13.5 6 14 7.5 14 C8.5 14 9.5 13.5 10 13 C10.5 12.5 10.5 12 10.5 12.5 C10.5 14.5 9.5 16.5 7 16.5 C5 16.5 4 15 4 13 C4 10 6.5 8.5 10.5 8.5 C14 8.5 17 10 17 13.5 C17 17 14 18.5 12 18.5 Z" fill="#000"/>
                    <path d="M22 10 V18 H20 V10 Z" fill="#000"/>
                    {/* Orange Smile Arrow */}
                    <path d="M10 21 C25 25 45 25 55 21 C57 20 59 21 57 23 C45 28 25 28 10 23 C8 21 9 20 10 21 Z" fill="#FF9900"/>
                    {/* Gift text */}
                    <text x="32" y="18" fill="black" fontSize="9" fontFamily="Arial" fontWeight="bold">amazon.com</text>
                  </svg>
                </div>
              </div>

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
