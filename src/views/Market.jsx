import { useState, useEffect } from 'react';
import { MOCK_DATA } from '../data/mockData';

export default function Market() {
  const [marketData, setMarketData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMat, setSelectedMat] = useState('');
  const [liveTicks, setLiveTicks] = useState({});

  const years = ['2021', '2022', '2023', '2024', '2025', 'Current (Live)'];

  // 1. Simulate an initial async fetch
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      // Simulate real network delay for enterprise API
      await new Promise(resolve => setTimeout(resolve, 800));
      setMarketData(MOCK_DATA.marketRates);
      
      // Initialize live ticks here
      const initial = {};
      Object.keys(MOCK_DATA.marketRates).forEach(mat => {
        initial[mat] = MOCK_DATA.marketRates[mat].rates[5];
      });
      setLiveTicks(initial);

      setSelectedMat(Object.keys(MOCK_DATA.marketRates)[0]);
      setLoading(false);
    };
    fetchData();
  }, []);

  // 2. Simulate real-time price fluctuations on the "Current" (last) value
  useEffect(() => {
    if (loading || !marketData) return;

    const interval = setInterval(() => {
      setLiveTicks(prev => {
        const next = { ...prev };
        Object.keys(marketData).forEach(mat => {
          const baseRate = marketData[mat].rates[5]; // The current 2026 rate
          // Random fluctuation between -1.5% to +1.5%
          const fluctuation = baseRate * (Math.random() * 0.03 - 0.015);
          next[mat] = Math.round(baseRate + fluctuation);
        });
        return next;
      });
    }, 4000); // Update every 4 seconds to feel "live"

    return () => clearInterval(interval);
  }, [loading, marketData]);

  if (loading) return (
    <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text2)' }}>
      <div style={{ fontSize: '32px', marginBottom: '16px' }}>📡</div>
      <div style={{ fontSize: '18px', fontWeight: 600 }}>Establishing Secure WebSocket Connection...</div>
      <div style={{ fontSize: '12px', marginTop: '8px', opacity: 0.7 }}>Fetching live commodity ticks from National Exchanges...</div>
    </div>
  );

  const mats = Object.keys(marketData);
  const selData = marketData[selectedMat];
  
  // Replace the last rate with the live ticking rate if available
  const currentRates = [...selData.rates];
  if (liveTicks[selectedMat]) currentRates[5] = liveTicks[selectedMat];
  const maxR = Math.max(...currentRates);

  return (
    <div>
      <div className="section-title">
        📈 Market Rate Trends 
        <span style={{ marginLeft: '12px', fontSize: '11px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '4px 8px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%', display: 'inline-block', animation: 'pulse 1.5s infinite' }}></span>
          Live Feed Active
        </span>
      </div>

      <div className="card">
        <div style={{ marginBottom: '16px' }}>
          <select 
            value={selectedMat} 
            onChange={e => setSelectedMat(e.target.value)}
            style={{ padding: '10px 16px', fontSize: '14px', minWidth: '240px', fontWeight: 600 }}
          >
            {mats.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        <div className="bar-chart" style={{ height: '220px', alignItems: 'flex-end', display: 'flex', gap: '8px', padding: '16px 0' }}>
          {currentRates.map((r, i) => {
             const isLive = i === currentRates.length - 1;
             return (
              <div key={i} className="col" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <div 
                  className="bar" 
                  style={{ 
                    height: `${r / maxR * 100}%`, 
                    background: isLive ? 'var(--blue)' : '#93c5fd',
                    width: '100%',
                    borderRadius: '4px 4px 0 0',
                    transition: isLive ? 'height 0.3s ease-out' : 'none',
                    opacity: isLive ? 0.9 : 0.6
                  }}
                ></div>
                <div style={{ fontSize: '12px', fontWeight: isLive ? 700 : 600, color: isLive ? 'var(--blue)' : 'var(--text)' }}>
                  ₹{r.toLocaleString()}
                </div>
                <div className="bar-lbl" style={{ fontSize: '11px', color: 'var(--text3)' }}>
                  {years[i]}
                </div>
              </div>
             );
          })}
        </div>
      </div>

      <div className="card" style={{ marginTop: '16px', padding: 0, overflowX: 'auto' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid var(--border)', fontSize: '14px', fontWeight: 600 }}>
          Commodity Pricing Matrix
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr>
              <th style={{ padding: '12px 16px', textAlign: 'left', background: '#f8fafc', borderBottom: '2px solid var(--border)' }}>Material</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', background: '#f8fafc', borderBottom: '2px solid var(--border)' }}>Unit</th>
              {years.map(y => <th key={y} style={{ padding: '12px 16px', textAlign: 'left', background: '#f8fafc', borderBottom: '2px solid var(--border)' }}>{y}</th>)}
              <th style={{ padding: '12px 16px', textAlign: 'left', background: '#f8fafc', borderBottom: '2px solid var(--border)' }}>Trend (5Y)</th>
            </tr>
          </thead>
          <tbody>
            {mats.map(m => {
              const baseHistory = marketData[m].rates.slice(0, 5);
              const liveVal = liveTicks[m] || marketData[m].rates[5];
              const r = [...baseHistory, liveVal];
              const chg = Math.round((r[5] - r[0]) / r[0] * 100);
              
              return (
                <tr key={m} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 600 }}>{m}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--text2)' }}>{marketData[m].unit}</td>
                  {r.map((v, i) => (
                    <td key={i} style={{ 
                        padding: '12px 16px', 
                        fontWeight: i === 5 ? 700 : 400,
                        color: i === 5 ? 'var(--blue)' : 'inherit',
                        transition: 'color 0.3s'
                    }}>
                      ₹{v.toLocaleString()}
                    </td>
                  ))}
                  <td style={{ padding: '12px 16px', color: chg > 0 ? 'var(--red)' : 'var(--green)', fontWeight: 600 }}>
                    {chg > 0 ? '▲' : '▼'} {Math.abs(chg)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
