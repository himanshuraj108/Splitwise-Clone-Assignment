import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CalculatorsTravel() {
  const navigate = useNavigate();
  const [nights, setNights] = useState(7);
  const [people, setPeople] = useState(4);
  const [price, setPrice] = useState('');
  const [method, setMethod] = useState('Equal nightly rate for everyone');
  const [presence, setPresence] = useState({});
  const [isDragging, setIsDragging] = useState(false);
  const [dragValue, setDragValue] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const handleCalculate = (e) => {
    e?.preventDefault();
    if (!price || parseFloat(price) <= 0) {
      alert('Please enter a valid price for the trip.');
      return;
    }
    setShowModal(true);
  };

  // Initialize presence grid to all true when nights or people changes
  useEffect(() => {
    const initial = {};
    for (let p = 0; p < people; p++) {
      for (let d = 0; d < nights; d++) {
        initial[`${p}-${d}`] = true;
      }
    }
    setPresence(initial);
  }, [people, nights]);

  // Handle window mouse-up to stop dragging globally
  useEffect(() => {
    const handleMouseUp = () => {
      setIsDragging(false);
    };
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const handleCellMouseDown = (pIdx, dIdx) => {
    const key = `${pIdx}-${dIdx}`;
    const newValue = !presence[key];
    setPresence(prev => ({
      ...prev,
      [key]: newValue
    }));
    setIsDragging(true);
    setDragValue(newValue);
  };

  const handleCellMouseEnter = (pIdx, dIdx) => {
    if (isDragging) {
      const key = `${pIdx}-${dIdx}`;
      setPresence(prev => ({
        ...prev,
        [key]: dragValue
      }));
    }
  };

  const toggleAllForPerson = (pIdx) => {
    const keys = Array.from({ length: nights }, (_, dIdx) => `${pIdx}-${dIdx}`);
    const allChecked = keys.every(key => presence[key]);
    const updated = { ...presence };
    keys.forEach(key => {
      updated[key] = !allChecked;
    });
    setPresence(updated);
  };

  const getCalculatedCosts = () => {
    const totalRent = parseFloat(price) || 0;
    if (totalRent <= 0) {
      return Array.from({ length: people }, () => 0);
    }

    if (method === 'Each person pays the same') {
      const share = totalRent / people;
      return Array.from({ length: people }, () => share);
    }

    if (method === 'Equal nightly rate for everyone') {
      let totalPersonNights = 0;
      for (let p = 0; p < people; p++) {
        for (let d = 0; d < nights; d++) {
          if (presence[`${p}-${d}`]) {
            totalPersonNights++;
          }
        }
      }
      if (totalPersonNights === 0) {
        return Array.from({ length: people }, () => 0);
      }
      const ratePerPersonNight = totalRent / totalPersonNights;
      const personTotals = Array.from({ length: people }, () => 0);
      for (let p = 0; p < people; p++) {
        let nightsStayed = 0;
        for (let d = 0; d < nights; d++) {
          if (presence[`${p}-${d}`]) {
            nightsStayed++;
          }
        }
        personTotals[p] = nightsStayed * ratePerPersonNight;
      }
      return personTotals;
    }

    // Method: 'Divvy up each night'
    const rentPerNight = totalRent / nights;
    const personTotals = Array.from({ length: people }, () => 0);

    for (let d = 0; d < nights; d++) {
      let presentCount = 0;
      for (let p = 0; p < people; p++) {
        if (presence[`${p}-${d}`]) {
          presentCount++;
        }
      }

      if (presentCount > 0) {
        const costPerPersonThisNight = rentPerNight / presentCount;
        for (let p = 0; p < people; p++) {
          if (presence[`${p}-${d}`]) {
            personTotals[p] += costPerPersonThisNight;
          }
        }
      }
    }

    return personTotals;
  };

  const calculatedCosts = getCalculatedCosts();

  return (
    <div className="calc-landing-container fade-in">
      <div className="calc-content-wrap" style={{ maxWidth: 1100 }}>
        
        {/* HEADER */}
        <div className="calc-subpage-header" style={{ marginBottom: 40 }}>
          <div className="calc-subpage-media" style={{ margin: '0 auto 10px' }}>
            <svg width="220" height="110" viewBox="0 0 220 110" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Propeller Hub & Blades */}
              <ellipse cx="65" cy="50" rx="3" ry="18" fill="#555" transform="rotate(-15, 65, 50)" />
              <circle cx="65" cy="50" r="5" fill="#333" />
              
              {/* Airplane Body / Fuselage */}
              <path d="M65 50 C95 40 185 30 195 40 C205 50 205 60 195 65 C185 70 95 65 65 50 Z" fill="#FFD54F" stroke="#3D3D3D" strokeWidth="3" strokeLinejoin="round" />
              
              {/* Canopy / Cabin Windows */}
              <path d="M90 44 C100 36 125 34 135 40 C140 43 140 48 135 50 C125 52 100 50 90 44 Z" fill="#E0F7FA" stroke="#3D3D3D" strokeWidth="2.5" />
              <line x1="110" y1="38" x2="114" y2="49" stroke="#3D3D3D" strokeWidth="2" />
              
              {/* Tail Wings / Fin */}
              <path d="M185 40 L205 15 L212 18 L195 45 Z" fill="#FFCA28" stroke="#3D3D3D" strokeWidth="2.5" strokeLinejoin="round" />
              <path d="M185 58 L202 75 L207 72 L192 55 Z" fill="#FFCA28" stroke="#3D3D3D" strokeWidth="2.5" strokeLinejoin="round" />
              
              {/* Main Wings */}
              <path d="M115 42 L60 18 L55 24 L120 45 Z" fill="#FFE082" stroke="#3D3D3D" strokeWidth="3" strokeLinejoin="round" />
              <line x1="85" y1="26" x2="115" y2="46" stroke="#3D3D3D" strokeWidth="2" />
              
              {/* Rear Wing */}
              <path d="M128 41 L165 72 L172 68 L133 39 Z" fill="#FFB300" stroke="#3D3D3D" strokeWidth="2.5" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="calc-subpage-title">The Splitwise Travel Calculator</h1>
          
          <p className="calc-subpage-intro-msg" style={{ maxWidth: 650 }}>
            How should you and your friends split the cost of a beach house or a road trip?<br />
            Use the Splitwise travel calculator to share expenses quickly and fairly.
          </p>
        </div>

        {/* TWO-COLUMN CONTENT */}
        <div className="calc-travel-container" style={{ display: 'flex', gap: 36, flexWrap: 'wrap' }}>
          
          {/* LEFT COLUMN: OPTIONS */}
          <div className="calc-travel-left" style={{ flex: '1 1 350px' }}>
            
            {/* Basic Info Box */}
            <div className="calc-travel-card-panel" style={{ background: '#f8f9fa', border: '1px solid #e4e7ea', borderRadius: 8, padding: 24, marginBottom: 24 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#333', borderBottom: '1px solid #e4e7ea', paddingBottom: 10, marginBottom: 16 }}>Basic info</h3>
              
              <div className="calc-form-row" style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#555' }}>How many nights?</label>
                <select 
                  value={nights} 
                  onChange={(e) => setNights(parseInt(e.target.value))} 
                  className="calc-bedrooms-select"
                  style={{ padding: 8, fontSize: 14 }}
                >
                  {Array.from({ length: 31 }, (_, idx) => idx + 1).map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>

              <div className="calc-form-row" style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#555' }}>How many people?</label>
                <select 
                  value={people} 
                  onChange={(e) => setPeople(parseInt(e.target.value))} 
                  className="calc-bedrooms-select"
                  style={{ padding: 8, fontSize: 14 }}
                >
                  {Array.from({ length: 19 }, (_, idx) => idx + 2).map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div className="calc-form-row">
                <label style={{ fontSize: 13, fontWeight: 600, color: '#555' }}>Total price of trip</label>
                <div className="calc-input-prefix-wrap" style={{ padding: '0 8px' }}>
                  <span className="calc-currency-symbol" style={{ fontSize: 14 }}>$</span>
                  <input 
                    type="number" 
                    placeholder="e.g. 700" 
                    value={price} 
                    onChange={(e) => setPrice(e.target.value)} 
                    className="calc-rent-input"
                    style={{ padding: '8px 0', fontSize: 14 }}
                  />
                </div>
              </div>
            </div>

            {/* Method of Calculation Box */}
            <div className="calc-travel-card-panel" style={{ background: '#f8f9fa', border: '1px solid #e4e7ea', borderRadius: 8, padding: 24, marginBottom: 24 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#333', borderBottom: '1px solid #e4e7ea', paddingBottom: 10, marginBottom: 16 }}>Method of calculation</h3>
              
              <div className="calc-radio-group-vertical" style={{ gap: 16 }}>
                
                <label className="calc-radio-label-desc" style={{ display: 'flex', flexDirection: 'column', cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 13.5, color: '#333' }}>
                    <input 
                      type="radio" 
                      name="calc-method" 
                      checked={method === 'Each person pays the same'}
                      onChange={() => setMethod('Each person pays the same')}
                      style={{ accentColor: '#7B6DCC' }}
                    />
                    <span>Each person pays the same</span>
                  </div>
                  <span style={{ fontSize: 11, color: '#777', paddingLeft: 22, marginTop: 2, lineHeight: 1.4 }}>
                    Good for: groceries, expenses, a trip everyone commits to in advance, a short weekend trip.
                  </span>
                </label>

                <label className="calc-radio-label-desc" style={{ display: 'flex', flexDirection: 'column', cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 13.5, color: '#333' }}>
                    <input 
                      type="radio" 
                      name="calc-method" 
                      checked={method === 'Equal nightly rate for everyone'}
                      onChange={() => setMethod('Equal nightly rate for everyone')}
                      style={{ accentColor: '#7B6DCC' }}
                    />
                    <span>Equal nightly rate for everyone</span>
                  </div>
                  <span style={{ fontSize: 11, color: '#777', paddingLeft: 22, marginTop: 2, lineHeight: 1.4 }}>
                    Good for: groceries, a shared house with a rotating cast of characters, rentals-by-the-week.
                  </span>
                </label>

                <label className="calc-radio-label-desc" style={{ display: 'flex', flexDirection: 'column', cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 13.5, color: '#333' }}>
                    <input 
                      type="radio" 
                      name="calc-method" 
                      checked={method === 'Divvy up each night'}
                      onChange={() => setMethod('Divvy up each night')}
                      style={{ accentColor: '#7B6DCC' }}
                    />
                    <span>Divvy up each night</span>
                  </div>
                  <span style={{ fontSize: 11, color: '#777', paddingLeft: 22, marginTop: 2, lineHeight: 1.4 }}>
                    Good for: a shared hotel room rented by the night, rental cars.
                  </span>
                </label>

              </div>
            </div>

            <div style={{ margin: '20px 0' }}>
              <button 
                type="button"
                onClick={handleCalculate} 
                className="calc-next-btn" 
                style={{ 
                  padding: '12px 48px', 
                  background: '#7B6DCC', 
                  color: 'white',
                  border: 'none',
                  borderRadius: 6, 
                  fontWeight: 700,
                  width: '100%',
                  cursor: 'pointer'
                }}
              >
                Calculate
              </button>
            </div>

            <div style={{ fontSize: 12, color: '#666', lineHeight: 1.5 }}>
              Curious how this works? Visit our <span className="calc-link" style={{ color: '#1cc29f', textDecoration: 'underline' }}>blog</span> to learn more about splitting group travel costs.
            </div>

          </div>

          {/* RIGHT COLUMN: PRESENCE GRID */}
          <div className="calc-travel-right" style={{ flex: '2 1 500px', display: 'flex', flexDirection: 'column', gap: 24 }}>
            
            <div className="calc-travel-card-panel" style={{ background: 'white', border: '1px solid #e4e7ea', borderRadius: 8, padding: 24, overflowX: 'auto' }}>
              <h4 style={{ fontSize: 13, color: '#555', fontWeight: 600, marginBottom: 20, textAlign: 'center' }}>
                Click and drag on the table below to select which days people were present.
              </h4>

              <table className="calc-travel-grid-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, userSelect: 'none' }}>
                <thead>
                  <tr>
                    <th align="left" style={{ borderBottom: '2px solid #ccc', padding: 8, fontWeight: 700, minWidth: 80 }}>Person</th>
                    <th style={{ borderBottom: '2px solid #ccc', padding: 8 }}></th>
                    {Array.from({ length: nights }, (_, dIdx) => (
                      <th key={dIdx} style={{ borderBottom: '2px solid #ccc', padding: 8, textAlign: 'center', fontWeight: 700 }}>
                        <div style={{ fontSize: 9, color: '#888', textTransform: 'uppercase' }}>Day</div>
                        <div>{dIdx + 1}</div>
                      </th>
                    ))}
                    <th align="right" style={{ borderBottom: '2px solid #ccc', padding: 8, fontWeight: 700, textAlign: 'right' }}>Suggested cost</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: people }, (_, pIdx) => {
                    const personKeys = Array.from({ length: nights }, (_, dIdx) => `${pIdx}-${dIdx}`);
                    const personAllChecked = personKeys.every(key => presence[key]);

                    return (
                      <tr key={pIdx}>
                        <td align="left" style={{ padding: 10, borderBottom: '1px solid #eceff1', fontWeight: 600 }}>
                          Person {pIdx + 1}
                        </td>
                        <td style={{ padding: 10, borderBottom: '1px solid #eceff1', textAlign: 'center' }}>
                          <input 
                            type="checkbox" 
                            checked={personAllChecked} 
                            onChange={() => toggleAllForPerson(pIdx)}
                            style={{ accentColor: '#7B6DCC', cursor: 'pointer' }}
                            title="Toggle all days"
                          />
                        </td>
                        {Array.from({ length: nights }, (_, dIdx) => {
                          const isPresent = !!presence[`${pIdx}-${dIdx}`];
                          return (
                            <td 
                              key={dIdx} 
                              className={`calc-travel-cell ${isPresent ? 'active' : ''}`}
                              onMouseDown={() => handleCellMouseDown(pIdx, dIdx)}
                              onMouseEnter={() => handleCellMouseEnter(pIdx, dIdx)}
                              style={{ 
                                padding: 0,
                                border: '1px solid #d4d7da',
                                background: isPresent ? '#5BC5A7' : '#ffffff',
                                cursor: 'pointer',
                                width: 36,
                                height: 36,
                                minWidth: 36,
                                textAlign: 'center',
                                verticalAlign: 'middle',
                                transition: 'background 0.15s ease'
                              }}
                            />
                          );
                        })}
                        <td align="right" style={{ padding: 10, borderBottom: '1px solid #eceff1', fontWeight: 700, color: '#1cc29f', textAlign: 'right' }}>
                          ${calculatedCosts[pIdx].toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Sign-up promo ad banner */}
            <div className="calc-travel-promo-card" style={{ background: '#f5f5ff', border: '1px solid #e2dbf5', borderRadius: 8, padding: 20, display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{ flexShrink: 0 }}>
                {/* Small Phone Outline SVG */}
                <svg width="40" height="70" viewBox="0 0 50 90" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="5" y="5" width="40" height="80" rx="8" fill="white" stroke="#3D3D3D" strokeWidth="3"/>
                  <rect x="8" y="12" width="34" height="60" rx="4" fill="#EAEAEA"/>
                  <circle cx="25" cy="80" r="3" fill="#3D3D3D"/>
                  <path d="M12 25 H38" stroke="#3D3D3D" strokeWidth="2"/>
                  <path d="M12 35 H30" stroke="#3D3D3D" strokeWidth="2"/>
                  <path d="M12 45 H35" stroke="#3D3D3D" strokeWidth="2"/>
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#333', marginBottom: 4 }}>
                  Keep track of all of your group travel expenses for free with Splitwise!
                </div>
                <button className="pro-trial-btn" style={{ width: 'auto', padding: '6px 16px', fontSize: 11.5, margin: 0, background: '#e15c32' }}>
                  Sign up »
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
      {/* RESULT MODAL */}
      {showModal && (
        <div className="calc-modal-backdrop fade-in" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="calc-modal-card" style={{ maxWidth: 480, padding: 28 }}>
            <button onClick={() => setShowModal(false)} className="calc-modal-close-corner">×</button>
            <div className="calc-modal-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left', gap: 0 }}>
              
              <h3 className="calc-modal-title" style={{ fontSize: 18, fontWeight: 700, color: '#333', marginBottom: 20 }}>
                Here's how you should split the travel costs:
              </h3>

              <table className="calc-result-table" style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24 }}>
                <thead>
                  <tr>
                    <th align="left" style={{ borderBottom: '2px solid #e4e7ea', paddingBottom: 8, fontSize: 12, color: '#888', fontWeight: 700 }}>Person</th>
                    <th align="right" style={{ borderBottom: '2px solid #e4e7ea', paddingBottom: 8, fontSize: 12, color: '#888', fontWeight: 700, textAlign: 'right' }}>Suggested cost</th>
                  </tr>
                </thead>
                <tbody>
                  {calculatedCosts.map((cost, idx) => (
                    <tr key={idx}>
                      <td align="left" style={{ padding: '10px 0', borderBottom: '1px solid #f0f2f5', fontSize: 14, color: '#333' }}>Person {idx + 1}</td>
                      <td align="right" style={{ padding: '10px 0', borderBottom: '1px solid #f0f2f5', fontSize: 14, fontWeight: 700, color: '#1cc29f', textAlign: 'right' }}>${cost.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <p className="calc-modal-blog-note" style={{ fontSize: 11.5, color: '#777', lineHeight: 1.5, marginBottom: 20 }}>
                This is a fair split based on your selected calculation method and presence matrix. You can record these expenses in the Splitwise app to keep track of them for free.
              </p>

              <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end' }}>
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
                    cursor: 'pointer' 
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
