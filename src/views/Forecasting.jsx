import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { MOCK_DATA } from '../data/mockData';

export default function Forecasting() {
  const [data, setData] = useState({ materials: [], pos: [], vendors: [] });
  const [loading, setLoading] = useState(true);
  const [forecastDays, setForecastDays] = useState(30);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const { data: dbMats } = await supabase.from('materials').select('*');
        if (!dbMats || dbMats.length === 0) {
          setData(MOCK_DATA);
        } else {
          setData({ materials: dbMats, pos: [], vendors: [] });
        }
      } catch (err) {
        console.error("Forecast load error", err);
        setData(MOCK_DATA);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Forecast Data...</div>;

  const rolePer = { createPO: true }; // Simplified for now
  const durLabel = forecastDays === 15 ? '15 Days' : forecastDays === 30 ? '1 Month' : '2 Months';
  
  const forecast = data.materials.map(m => {
      const dailyRate = Math.floor((m.req_qty || m.reqQty) / 365 * (Math.random() * 0.4 + 0.8));
      const needForPeriod = dailyRate * forecastDays;
      const currentStock = (m.proc_qty || m.procQty) - Math.floor((m.proc_qty || m.procQty) * 0.7); // Mocked consumption
      const totalRemaining = (m.req_qty || m.reqQty) - (m.proc_qty || m.procQty);
      let shortfall = needForPeriod - currentStock;
      if (shortfall < 0) shortfall = 0;
      if (shortfall > totalRemaining) shortfall = totalRemaining;
      
      let urgency = 'Sufficient';
      if (shortfall > 0) {
          urgency = shortfall > (needForPeriod * 0.5) ? 'Critical' : 'Order Now';
      }
      return { 
          name: m.name, 
          cat: m.cat || m.category, 
          unit: m.unit, 
          dailyRate, 
          needForPeriod, 
          currentStock, 
          shortfall, 
          urgency,
          id: m.id || m.code
      };
  }).sort((a, b) => b.shortfall - a.shortfall);

  const maxNeed = Math.max(...forecast.map(f => f.needForPeriod), 1);
  const criticalCount = forecast.filter(f => f.urgency === 'Critical').length;
  const orderNowCount = forecast.filter(f => f.urgency === 'Order Now').length;
  const sufficientCount = forecast.filter(f => f.urgency === 'Sufficient').length;

  return (
    <div>
        <div className="section-title">🔮 Future Material Requirement Forecasting</div>
        <div className="tabs">
            <div className={`tab ${forecastDays === 15 ? 'active' : ''}`} onClick={() => setForecastDays(15)}>15 Days</div>
            <div className={`tab ${forecastDays === 30 ? 'active' : ''}`} onClick={() => setForecastDays(30)}>1 Month</div>
            <div className={`tab ${forecastDays === 60 ? 'active' : ''}`} onClick={() => setForecastDays(60)}>2 Months</div>
        </div>

        <div className="kpi-row" style={{ marginBottom: '16px' }}>
            <div className="card kpi blue"><div className="lbl">Forecast Period</div><div className="val">{durLabel}</div></div>
            <div className="card kpi red"><div className="lbl">Critical Shortage</div><div className="val">{criticalCount}</div></div>
            <div className="card kpi amber"><div className="lbl">Order Required</div><div className="val">{orderNowCount}</div></div>
            <div className="card kpi green"><div className="lbl">Stock Sufficient</div><div className="val">{sufficientCount}</div></div>
        </div>

        <div className="card" style={{ marginTop: '12px' }}>
            <div className="section-title" style={{ fontSize: '14px' }}>📊 {durLabel} Requirement vs Available Stock</div>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 600 }}>
                    <span style={{ width: '12px', height: '12px', borderRadius: '2px', background: 'var(--navy)', display: 'inline-block' }}></span> Required ({durLabel})
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 600 }}>
                    <span style={{ width: '12px', height: '12px', borderRadius: '2px', background: 'var(--green)', display: 'inline-block' }}></span> Available Stock
                </div>
            </div>
            
            <div className="bar-chart" style={{ height: '160px' }}>
                {forecast.map(f => (
                    <div className="col" key={f.id}>
                        <div style={{ display: 'flex', gap: '2px', alignItems: 'flex-end', height: '140px', width: '100%' }}>
                            <div className="bar" style={{ width: '45%', height: `${Math.max(f.needForPeriod / maxNeed * 100, 3)}%`, background: 'var(--navy)' }}></div>
                            <div className="bar" style={{ width: '45%', height: `${Math.max(Math.min(f.currentStock / maxNeed * 100, 100), 2)}%`, background: 'var(--green)' }}></div>
                        </div>
                        <div className="bar-lbl">{f.name.split(' ')[0].substring(0, 6)}</div>
                    </div>
                ))}
            </div>
        </div>

        <div className="card" style={{ marginTop: '12px', padding: 0, overflow: 'auto' }}>
            <div style={{ padding: '12px 16px', fontWeight: 700, fontSize: '14px' }}>📋 Material Requirement for Next {durLabel}</div>
            <table style={{ width: '100%', fontSize: '12px' }}>
                <thead>
                    <tr>
                        <th style={{ padding: '8px' }}>Material</th>
                        <th style={{ padding: '8px' }}>Category</th>
                        <th style={{ padding: '8px' }}>Daily Rate</th>
                        <th style={{ padding: '8px' }}>Need ({durLabel})</th>
                        <th style={{ padding: '8px' }}>Available Stock</th>
                        <th style={{ padding: '8px' }}>Shortfall</th>
                        <th style={{ padding: '8px' }}>Unit</th>
                        <th style={{ padding: '8px' }}>Status</th>
                        <th style={{ padding: '8px' }}>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {forecast.map(f => {
                        const cl = f.urgency === 'Critical' ? 'red' : f.urgency === 'Order Now' ? 'amber' : 'green';
                        return (
                            <tr key={f.id}>
                                <td style={{ padding: '8px', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>{f.name.split(' ').slice(0, 3).join(' ')}</td>
                                <td style={{ padding: '8px', borderBottom: '1px solid var(--border)' }}>{f.cat}</td>
                                <td style={{ padding: '8px', borderBottom: '1px solid var(--border)' }}>{f.dailyRate.toLocaleString()} / day</td>
                                <td style={{ padding: '8px', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>{f.needForPeriod.toLocaleString()}</td>
                                <td style={{ padding: '8px', borderBottom: '1px solid var(--border)' }}>{f.currentStock.toLocaleString()}</td>
                                <td style={{ padding: '8px', borderBottom: '1px solid var(--border)', fontWeight: 700, color: f.shortfall > 0 ? 'var(--red)' : 'var(--green)' }}>
                                    {f.shortfall > 0 ? `-${f.shortfall.toLocaleString()}` : '✓ OK'}
                                </td>
                                <td style={{ padding: '8px', borderBottom: '1px solid var(--border)' }}>{f.unit}</td>
                                <td style={{ padding: '8px', borderBottom: '1px solid var(--border)' }}><span className={`pill ${cl}`}>{f.urgency}</span></td>
                                <td style={{ padding: '8px', borderBottom: '1px solid var(--border)' }}>
                                    {f.shortfall > 0 ? (
                                        rolePer.createPO ? 
                                        <button className="btn primary" style={{ padding: '3px 8px', fontSize: '10px' }} onClick={() => alert(`Creating PO for ${f.name}`)}>🛒 Raise PO</button> : 
                                        <span style={{ color: 'var(--text3)', fontSize: '11px' }}>Auth Req</span>
                                    ) : (
                                        <span style={{ color: 'var(--green)', fontSize: '11px' }}>✓</span>
                                    )}
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
