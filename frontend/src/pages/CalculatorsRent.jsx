import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CalculatorsRent() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [rent, setRent] = useState('');
  const [numBedrooms, setNumBedrooms] = useState(2);
  const [rooms, setRooms] = useState([]);
  const [commonSpace, setCommonSpace] = useState('Average');
  const [showModal, setShowModal] = useState(false);
  const [calculations, setCalculations] = useState([]);

  const handleStep1Next = (e) => {
    e.preventDefault();
    if (!rent || parseFloat(rent) <= 0) {
      alert('Please enter a valid monthly rent.');
      return;
    }
    const newRooms = [];
    for (let i = 0; i < numBedrooms; i++) {
      if (rooms[i]) {
        newRooms.push(rooms[i]);
      } else {
        newRooms.push({
          name: `Room #${i + 1}`,
          size: 100, // Normal
          windows: 10, // Normal
          closet: 10, // Normal
          shared: false,
          fullBath: false,
          halfBath: false,
          badSound: false,
          awkwardLayout: false,
          noDoor: false,
        });
      }
    }
    setRooms(newRooms);
    setStep(2);
  };

  const handleRoomChange = (index, field, value) => {
    const updated = [...rooms];
    updated[index] = { ...updated[index], [field]: value };
    setRooms(updated);
  };

  const handleCalculate = () => {
    const scores = rooms.map(room => {
      let score = room.size + room.windows + room.closet;
      if (room.fullBath) score += 40;
      if (room.halfBath) score += 20;
      if (room.shared) score += 30;
      if (room.badSound) score -= 15;
      if (room.awkwardLayout) score -= 10;
      if (room.noDoor) score -= 25;
      return Math.max(10, score);
    });

    const totalScore = scores.reduce((a, b) => a + b, 0);
    const totalRent = parseFloat(rent);
    
    const calculatedRooms = rooms.map((room, idx) => {
      const share = scores[idx] / totalScore;
      const roomRent = (share * totalRent).toFixed(2);
      return {
        name: room.name,
        rent: parseFloat(roomRent),
      };
    });

    // Handle tiny rounding offsets
    const sum = calculatedRooms.reduce((a, b) => a + b.rent, 0);
    const diff = totalRent - sum;
    if (diff !== 0 && calculatedRooms.length > 0) {
      calculatedRooms[0].rent = parseFloat((calculatedRooms[0].rent + diff).toFixed(2));
    }

    setCalculations(calculatedRooms);
    setShowModal(true);
  };

  return (
    <div className="calc-landing-container fade-in">
      <div className="calc-content-wrap">
        
        {/* HEADER SECTION */}
        <div className="calc-rent-header">
          <div className="calc-rent-icon">
            <svg width="60" height="60" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M60 20 L100 50 L100 95 L20 95 L20 50 Z" fill="#F0F2F5" stroke="#3D3D3D" strokeWidth="4" strokeLinejoin="round"/>
              <path d="M15 50 L60 15 L105 50" stroke="#3D3D3D" strokeWidth="5" strokeLinecap="round"/>
              <rect x="48" y="65" width="24" height="30" fill="#7B6DCC" fillOpacity="0.2" stroke="#3D3D3D" strokeWidth="3"/>
              <circle cx="54" cy="80" r="2" fill="#3D3D3D"/>
              <rect x="30" y="55" width="16" height="16" fill="white" stroke="#3D3D3D" strokeWidth="3" rx="2"/>
              <rect x="74" y="55" width="16" height="16" fill="white" stroke="#3D3D3D" strokeWidth="3" rx="2"/>
            </svg>
          </div>
          <div className="calc-rent-title-block">
            <h1 className="calc-rent-title">The Splitwise rent-splitting calculator</h1>
            <p className="calc-rent-subtitle">
              Moving into a new place? We'll tell you how to split the rent fairly, based on room size, closets, bathrooms, and more.
            </p>
            <p className="calc-rent-blog-link">
              Curious about how our fairness calculator works? Check out our <span className="s-link">blog post</span>.
            </p>
          </div>
        </div>

        {/* STEPPER CONTAINER */}
        <div className="calc-stepper-card">
          
          {/* STEP 1: STEP ONE */}
          {step === 1 && (
            <div className="calc-step-one">
              <div className="calc-step-header">
                <h2>Step One</h2>
                <p className="calc-step-subtitle">(of three)</p>
              </div>

              <form onSubmit={handleStep1Next} className="calc-step1-form">
                <div className="calc-form-row">
                  <label>How much is the monthly rent?</label>
                  <div className="calc-input-prefix-wrap">
                    <span className="calc-currency-symbol">$</span>
                    <input 
                      type="number" 
                      placeholder="e.g. 1000" 
                      value={rent} 
                      onChange={(e) => setRent(e.target.value)} 
                      className="calc-rent-input"
                      required
                    />
                  </div>
                </div>

                <div className="calc-form-row">
                  <label>How many bedrooms are there?</label>
                  <select 
                    value={numBedrooms} 
                    onChange={(e) => setNumBedrooms(parseInt(e.target.value))} 
                    className="calc-bedrooms-select"
                  >
                    {[1, 2, 3, 4, 5, 6].map(num => (
                      <option key={num} value={num}>{num} {num === 1 ? 'bedroom' : 'bedrooms'}</option>
                    ))}
                  </select>
                </div>

                <div className="calc-button-row">
                  <button type="submit" className="calc-next-btn">Next step »</button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 2: STEP TWO */}
          {step === 2 && (
            <div className="calc-step-two">
              <div className="calc-step-header">
                <h2>Step Two</h2>
                <p className="calc-step-subtitle">(of three)</p>
              </div>

              <div className="calc-rooms-grid">
                {rooms.map((room, index) => (
                  <div key={index} className="calc-room-column">
                    <div className="calc-room-name-row">
                      <label>Room name:</label>
                      <input 
                        type="text" 
                        value={room.name} 
                        onChange={(e) => handleRoomChange(index, 'name', e.target.value)}
                        className="calc-room-name-input"
                      />
                    </div>

                    <div className="calc-room-options-block">
                      <div className="calc-option-group">
                        <h4>HOW BIG IS THIS ROOM?</h4>
                        {[
                          { label: 'Tiny', val: 50 },
                          { label: 'Small', val: 65 },
                          { label: 'A bit small', val: 80 },
                          { label: 'Normal', val: 100 },
                          { label: 'Generous', val: 125 },
                          { label: 'Large', val: 160 },
                          { label: 'Enormous', val: 200 }
                        ].map(sz => (
                          <label key={sz.val} className="calc-radio-label">
                            <input 
                              type="radio" 
                              name={`size-${index}`} 
                              checked={room.size === sz.val}
                              onChange={() => handleRoomChange(index, 'size', sz.val)}
                            />
                            <span>{sz.label}</span>
                            <span className="calc-score-badge">{sz.val}</span>
                          </label>
                        ))}
                      </div>

                      <div className="calc-option-group">
                        <h4>WINDOWS:</h4>
                        {[
                          { label: 'None', val: 0 },
                          { label: 'Normal', val: 10 },
                          { label: 'Awesome', val: 20 }
                        ].map(win => (
                          <label key={win.val} className="calc-radio-label">
                            <input 
                              type="radio" 
                              name={`windows-${index}`} 
                              checked={room.windows === win.val}
                              onChange={() => handleRoomChange(index, 'windows', win.val)}
                            />
                            <span>{win.label}</span>
                          </label>
                        ))}

                        <h4 style={{ marginTop: 16 }}>CLOSET:</h4>
                        {[
                          { label: 'None', val: 0 },
                          { label: 'Normal', val: 10 },
                          { label: 'Huge', val: 20 }
                        ].map(cls => (
                          <label key={cls.val} className="calc-radio-label">
                            <input 
                              type="radio" 
                              name={`closet-${index}`} 
                              checked={room.closet === cls.val}
                              onChange={() => handleRoomChange(index, 'closet', cls.val)}
                            />
                            <span>{cls.label}</span>
                          </label>
                        ))}
                      </div>

                      <div className="calc-option-group full-width-checkboxes">
                        <h4>OTHER FACTORS:</h4>
                        <label className="calc-checkbox-label">
                          <input 
                            type="checkbox" 
                            checked={room.shared}
                            onChange={(e) => handleRoomChange(index, 'shared', e.target.checked)}
                          />
                          <span>Room shared by two people</span>
                        </label>
                        <label className="calc-checkbox-label">
                          <input 
                            type="checkbox" 
                            checked={room.fullBath}
                            onChange={(e) => handleRoomChange(index, 'fullBath', e.target.checked)}
                          />
                          <span>Private full bath</span>
                        </label>
                        <label className="calc-checkbox-label">
                          <input 
                            type="checkbox" 
                            checked={room.halfBath}
                            onChange={(e) => handleRoomChange(index, 'halfBath', e.target.checked)}
                          />
                          <span>Private half-bath</span>
                        </label>
                        <label className="calc-checkbox-label">
                          <input 
                            type="checkbox" 
                            checked={room.badSound}
                            onChange={(e) => handleRoomChange(index, 'badSound', e.target.checked)}
                          />
                          <span>Bad sound insulation</span>
                        </label>
                        <label className="calc-checkbox-label">
                          <input 
                            type="checkbox" 
                            checked={room.awkwardLayout}
                            onChange={(e) => handleRoomChange(index, 'awkwardLayout', e.target.checked)}
                          />
                          <span>Awkward room layout</span>
                        </label>
                        <label className="calc-checkbox-label">
                          <input 
                            type="checkbox" 
                            checked={room.noDoor}
                            onChange={(e) => handleRoomChange(index, 'noDoor', e.target.checked)}
                          />
                          <span>No door</span>
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="calc-navigation-buttons">
                <button type="button" onClick={() => setStep(1)} className="calc-back-btn">« Back</button>
                <button type="button" onClick={() => setStep(3)} className="calc-next-btn">Next step »</button>
              </div>
            </div>
          )}

          {/* STEP 3: STEP THREE */}
          {step === 3 && (
            <div className="calc-step-three">
              <div className="calc-step-header">
                <h2>Step Three</h2>
                <p className="calc-step-subtitle">(of three)</p>
              </div>

              <div className="calc-common-spaces-prompt">
                <p>How big are the common spaces of the house or apartment?</p>
                <p className="calc-prompt-subtext">(living room, kitchen, bathrooms, etc.)</p>
              </div>

              <div className="calc-squares-row">
                {[
                  { label: 'Tiny', size: 14 },
                  { label: 'Small', size: 22 },
                  { label: 'Average', size: 30 },
                  { label: 'Large', size: 38 },
                  { label: 'Huge', size: 46 }
                ].map(sq => (
                  <label key={sq.label} className="calc-square-option">
                    <div 
                      className="calc-square-box" 
                      style={{ 
                        width: sq.size, 
                        height: sq.size, 
                        background: 'black', 
                        opacity: commonSpace === sq.label ? 1 : 0.4 
                      }} 
                    />
                    <input 
                      type="radio" 
                      name="common-space" 
                      checked={commonSpace === sq.label}
                      onChange={() => setCommonSpace(sq.label)}
                      style={{ marginTop: 8 }}
                    />
                    <span>{sq.label}</span>
                  </label>
                ))}
              </div>

              <div className="calc-navigation-buttons">
                <button type="button" onClick={() => setStep(2)} className="calc-back-btn">« Back</button>
                <button type="button" onClick={handleCalculate} className="calc-calculate-btn">Calculate!</button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* RESULT DIALOG MODAL */}
      {showModal && (
        <div className="calc-modal-backdrop fade-in">
          <div className="calc-modal-card">
            <button onClick={() => setShowModal(false)} className="calc-modal-close-corner">×</button>
            <div className="calc-modal-content">
              
              <div className="calc-modal-left">
                <svg width="100" height="100" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M60 20 L100 50 L100 95 L20 95 L20 50 Z" fill="#F0F2F5" stroke="#3D3D3D" strokeWidth="4" strokeLinejoin="round"/>
                  <path d="M15 50 L60 15 L105 50" stroke="#3D3D3D" strokeWidth="5" strokeLinecap="round"/>
                  <rect x="48" y="65" width="24" height="30" fill="#7B6DCC" fillOpacity="0.2" stroke="#3D3D3D" strokeWidth="3"/>
                </svg>
              </div>

              <div className="calc-modal-right">
                <h3 className="calc-modal-title">Here's how you should split the rent:</h3>
                
                <table className="calc-result-table">
                  <thead>
                    <tr>
                      <th align="left">Room</th>
                      <th align="right">Suggested rent</th>
                    </tr>
                  </thead>
                  <tbody>
                    {calculations.map((calc, idx) => (
                      <tr key={idx}>
                        <td align="left">{calc.name}</td>
                        <td align="right" className="calc-result-price">${calc.rent.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <p className="calc-modal-blog-note">
                  Curious about how our fairness calculator works?<br />
                  Read our <span className="s-link">blog post</span> for more info.
                </p>

                <button onClick={() => { setShowModal(false); setStep(1); }} className="calc-modal-close-btn">Close</button>
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
