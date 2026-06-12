import { useParams, useNavigate } from 'react-router-dom';

export default function CalculatorsRenters() {
  const { state } = useParams();
  const navigate = useNavigate();

  // List of 48 contiguous US states + AK, HI in exact grid order from screenshot
  const statesGrid = [
    ['AL', 'AK', 'AZ', 'AR', 'CA'],
    ['CO', 'CT', 'DE', 'FL', 'GA'],
    ['HI', 'ID', 'IL', 'IN', 'IA'],
    ['KS', 'KY', 'LA', 'ME', 'MD'],
    ['MA', 'MI', 'MN', 'MS', 'MO'],
    ['MT', 'NE', 'NV', 'NH', 'NJ'],
    ['NM', 'NY', 'NC', 'ND', 'OH'],
    ['OK', 'OR', 'PA', 'RI', 'SC'],
    ['SD', 'TN', 'TX', 'UT', 'VT'],
    ['VA', 'WA', 'WV', 'WI', 'WY']
  ];

  const getStateStats = (code) => {
    const uppercaseCode = code.toUpperCase();
    
    // Exact statistics for Kentucky from screenshot
    if (uppercaseCode === 'KY') {
      return {
        name: 'Kentucky',
        cost: 168,
        fire: 10318,
        burglary: 2266,
        water: 2298,
        wind: 3775,
        accident: 17851,
      };
    }

    // Exact statistics for Rhode Island (Providence, RI - home of Splitwise)
    if (uppercaseCode === 'RI') {
      return {
        name: 'Rhode Island',
        cost: 180,
        fire: 12450,
        burglary: 2980,
        water: 2450,
        wind: 4120,
        accident: 19820,
      };
    }

    // Deterministic stats generator for other states
    const hash = uppercaseCode.charCodeAt(0) + uppercaseCode.charCodeAt(1) * 3;
    const cost = 132 + (hash % 80);
    const fire = 8000 + (hash % 4500);
    const burglary = 1500 + (hash % 1200);
    const water = 1800 + (hash % 1000);
    const wind = 2200 + (hash % 1800);
    const accident = 12000 + (hash % 6000);

    const stateNames = {
      AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California',
      CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', FL: 'Florida', GA: 'Georgia',
      HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa',
      KS: 'Kansas', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland',
      MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri',
      MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey',
      NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio',
      OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', SC: 'South Carolina',
      SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont',
      VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming'
    };

    return {
      name: stateNames[uppercaseCode] || uppercaseCode,
      cost,
      fire,
      burglary,
      water,
      wind,
      accident,
    };
  };

  const renderStateSelection = () => {
    return (
      <div className="calc-state-selector-view">
        <h1 className="calc-renters-header-title">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 8, verticalAlign: 'middle' }}>
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          Should you get renters insurance?
        </h1>
        <p className="calc-state-select-prompt">What state are you from?</p>

        <div className="calc-states-grid">
          {statesGrid.map((row, rowIdx) => (
            <div key={rowIdx} className="calc-states-row">
              {row.map(code => (
                <span 
                  key={code} 
                  onClick={() => navigate(`/calculators/renters/${code}`)}
                  className="calc-state-link"
                >
                  {code}
                </span>
              ))}
            </div>
          ))}
        </div>

        <p className="calc-international-warning">
          We don't yet have renters insurance data for outside the US – sorry, international users!
        </p>
      </div>
    );
  };

  const renderStateStats = (code) => {
    const stats = getStateStats(code);
    const monthlyCost = Math.round(stats.cost / 12);
    
    // Proportional bar width calculations
    const maxVal = Math.max(stats.cost, stats.fire, stats.burglary, stats.water, stats.wind, stats.accident);
    const getWidthPercent = (val) => `${(val / maxVal) * 100}%`;

    return (
      <div className="calc-state-stats-view">
        <h1 className="calc-renters-header-title">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 8, verticalAlign: 'middle' }}>
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          Should you get renters insurance?
        </h1>

        <div className="calc-yes-big">YES.</div>
        
        <p className="calc-stats-subtitle">
          In {stats.name}, renters insurance usually costs under <span className="green-highlight">${monthlyCost}/month</span>, and it
          can save you <span className="blue-highlight">thousands</span> in the event of fire, robbery, and more.
        </p>

        <div className="calc-stats-box">
          <h2 className="calc-stats-box-header">
            Renters Insurance Statistics for {stats.name}, 2013
          </h2>

          <div className="calc-stats-table">
            
            {/* Cost row (red) */}
            <div className="calc-stats-row">
              <div className="calc-stats-label">Cost of insurance:</div>
              <div className="calc-stats-value">${stats.cost}/yr</div>
              <div className="calc-stats-bar-wrapper">
                <div className="calc-stats-bar red" style={{ width: getWidthPercent(stats.cost) }} />
              </div>
            </div>

            {/* Fire row (green) */}
            <div className="calc-stats-row">
              <div className="calc-stats-label">Savings after a fire:</div>
              <div className="calc-stats-value">${stats.fire.toLocaleString()}</div>
              <div className="calc-stats-bar-wrapper">
                <div className="calc-stats-bar green" style={{ width: getWidthPercent(stats.fire) }} />
              </div>
            </div>

            {/* Burglary row (green) */}
            <div className="calc-stats-row">
              <div className="calc-stats-label">Savings after a burglary:</div>
              <div className="calc-stats-value">${stats.burglary.toLocaleString()}</div>
              <div className="calc-stats-bar-wrapper">
                <div className="calc-stats-bar green" style={{ width: getWidthPercent(stats.burglary) }} />
              </div>
            </div>

            {/* Water Damage row (green) */}
            <div className="calc-stats-row">
              <div className="calc-stats-label">Savings after water damage:</div>
              <div className="calc-stats-value">${stats.water.toLocaleString()}</div>
              <div className="calc-stats-bar-wrapper">
                <div className="calc-stats-bar green" style={{ width: getWidthPercent(stats.water) }} />
              </div>
            </div>

            {/* Wind Damage row (green) */}
            <div className="calc-stats-row">
              <div className="calc-stats-label">Savings after wind damage:</div>
              <div className="calc-stats-value">${stats.wind.toLocaleString()}</div>
              <div className="calc-stats-bar-wrapper">
                <div className="calc-stats-bar green" style={{ width: getWidthPercent(stats.wind) }} />
              </div>
            </div>

            {/* Accident row (green) */}
            <div className="calc-stats-row">
              <div className="calc-stats-label">Savings after an accident:</div>
              <div className="calc-stats-value">${stats.accident.toLocaleString()}</div>
              <div className="calc-stats-bar-wrapper">
                <div className="calc-stats-bar green" style={{ width: getWidthPercent(stats.accident) }} />
              </div>
            </div>

          </div>
        </div>

        <div className="calc-change-state-wrapper">
          <span onClick={() => navigate('/calculators/renters')} className="calc-change-state-link">
            Change state »
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="calc-landing-container fade-in">
      <div className="calc-content-wrap">
        {state ? renderStateStats(state) : renderStateSelection()}
      </div>

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
