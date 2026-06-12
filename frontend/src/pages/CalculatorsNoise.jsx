import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CalculatorsNoise() {
  const navigate = useNavigate();
  const [rent, setRent] = useState('');
  const [freq, setFreq] = useState('Monthly');
  const [noiseType, setNoiseType] = useState('A party in the building');
  const [showModal, setShowModal] = useState(false);
  const [apologyGiftValue, setApologyGiftValue] = useState(0);

  const noiseTypes = [
    { label: 'A party in the building', weight: 0.05 },
    { label: 'Construction work', weight: 0.08 },
    { label: 'Loud sex', weight: 0.06 },
    { label: 'Thumping on the wall', weight: 0.04 },
    { label: 'Nearby talking', weight: 0.02 },
    { label: 'Snoring', weight: 0.02 },
    { label: 'Dancing', weight: 0.04 },
    { label: 'Footsteps', weight: 0.03 },
    { label: 'TV/Movie', weight: 0.02 },
    { label: 'Music', weight: 0.04 },
    { label: 'Street noise', weight: 0.01 },
    { label: 'Machinery (e.g. refrigerator hum)', weight: 0.01 }
  ];

  const handleCalculate = (e) => {
    e.preventDefault();
    if (!rent || parseFloat(rent) <= 0) {
      alert('Please enter a valid rent share.');
      return;
    }

    const selected = noiseTypes.find(nt => nt.label === noiseType);
    const weight = selected ? selected.weight : 0.03;
    const periodDays = freq === 'Weekly' ? 7 : freq === 'Fortnightly' ? 14 : 30;
    const dailyRent = parseFloat(rent) / periodDays;
    
    // Noise cost per day = dailyRent * weight
    const calculated = dailyRent * weight;

    setApologyGiftValue(calculated);
    setShowModal(true);
  };

  return (
    <div className="calc-landing-container fade-in">
      <div className="calc-content-wrap">
        
        {/* HEADER */}
        <div className="calc-subpage-header">
          <h1 className="calc-subpage-title">
            The Loud Sex <br />
            <span className="calc-subpage-title-sub">(and other night-time noises)</span> <br />
            Calculator
          </h1>
          
          <div className="calc-subpage-media">
            <svg width="200" height="150" viewBox="0 0 100 70" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="22" y="15" width="22" height="42" rx="3" fill="#DCE0E4" stroke="#3D3D3D" strokeWidth="2.5"/>
              <circle cx="33" cy="27" r="5" fill="white" stroke="#3D3D3D" strokeWidth="2"/>
              <circle cx="33" cy="45" r="8" fill="white" stroke="#3D3D3D" strokeWidth="2"/>
              
              <rect x="56" y="15" width="22" height="42" rx="3" fill="#DCE0E4" stroke="#3D3D3D" strokeWidth="2.5"/>
              <circle cx="67" cy="27" r="5" fill="white" stroke="#3D3D3D" strokeWidth="2"/>
              <circle cx="67" cy="45" r="8" fill="white" stroke="#3D3D3D" strokeWidth="2"/>
            </svg>
          </div>

          <p className="calc-subpage-intro-msg">
            If your night-time activities are disturbing your neighbors, how much extra should you pay in rent (or how much should you spend on a gift to apologize)?
          </p>
        </div>

        {/* FORM CARD */}
        <div className="calc-stepper-card" style={{ maxWidth: 500, margin: '0 auto' }}>
          <form onSubmit={handleCalculate} className="calc-simple-form">
            
            <div className="calc-form-row">
              <label>What is your share of the rent?</label>
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
              <label>What kind of noise is it?</label>
              <div className="calc-radio-group-vertical" style={{ display: 'flex', flexDirection: 'column', gap: 6, margin: '4px 0', maxHeight: 250, overflowY: 'auto', paddingRight: 8, border: '1px solid #e4e7ea', borderRadius: 6, padding: 12 }}>
                {noiseTypes.map(nt => (
                  <label key={nt.label} className="calc-radio-label" style={{ fontSize: '13.5px' }}>
                    <input 
                      type="radio" 
                      name="noise-type" 
                      checked={noiseType === nt.label}
                      onChange={() => setNoiseType(nt.label)}
                    />
                    <span>{nt.label}</span>
                  </label>
                ))}
              </div>
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
        <div className="calc-modal-backdrop fade-in" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="calc-modal-card" style={{ maxWidth: 460, padding: 24 }}>
            <button onClick={() => setShowModal(false)} className="calc-modal-close-corner">×</button>
            <div className="calc-modal-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left', gap: 0 }}>
              
              <h4 className="calc-modal-header-top" style={{ fontSize: 16, fontWeight: 700, color: '#333', marginBottom: 8 }}>
                The total cost is:
              </h4>

              <div className="calc-yes-big" style={{ color: '#333333', fontSize: '56px', fontWeight: 'bold', margin: '8px 0 16px', fontFamily: 'system-ui, sans-serif', letterSpacing: '-1px' }}>
                ${apologyGiftValue.toFixed(2)}/day
              </div>

              <p className="calc-modal-fine-explanation" style={{ fontSize: 11.5, color: '#666', lineHeight: 1.5, marginBottom: 16, maxWidth: '100%' }}>
                Questions? Comments? Read our <a href="https://blog.splitwise.com" target="_blank" rel="noreferrer" className="calc-link" style={{ color: '#1cc29f', textDecoration: 'underline' }}>blog post</a> to learn more, or email us directly at <a href="mailto:contact@splitwise.com" className="calc-link" style={{ color: '#1cc29f', textDecoration: 'underline' }}>contact@splitwise.com</a>
              </p>

              <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
                <button 
                  onClick={() => setShowModal(false)} 
                  className="calc-modal-close-btn" 
                  style={{ 
                    background: '#ffffff', 
                    color: '#333333', 
                    border: '1px solid #cccccc', 
                    borderRadius: 4, 
                    padding: '6px 16px', 
                    fontSize: 13, 
                    fontWeight: 'normal',
                    cursor: 'pointer',
                    boxShadow: 'none'
                  }}
                >
                  Close
                </button>
              </div>

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
