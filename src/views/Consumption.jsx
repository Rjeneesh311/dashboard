import { useState, useEffect } from 'react';
import { MOCK_DATA } from '../data/mockData';

// Hardcoded construction activities for the chart
const ACT_DATA = [
  { n: 'Tunneling', p: 850, a: 900 },
  { n: 'Station Box', p: 600, a: 520 },
  { n: 'Viaduct', p: 950, a: 880 },
  { n: 'Depot', p: 400, a: 450 },
  { n: 'Track Work', p: 750, a: 710 },
  { n: 'MEP', p: 800, a: 950 },
  { n: 'Finishing', p: 500, a: 420 },
];

export default function Consumption() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulating API fetch
    const timer = setTimeout(() => {
      // Data transformer mimicking prototype logic
      const transformed = MOCK_DATA.materials.map(m => {
        const used = Math.floor(m.procQty * 0.7); 
        const plan = Math.floor(m.reqQty * 0.65); 
        const w = Math.max(0, used - plan); 
        const wp = plan ? Math.round((w / plan) * 100) : 0; 
        const prod = plan ? Math.round((used / plan) * 100) : 0;
        
        return { 
          n: m.name.split(' ').slice(0, 3).join(' '), 
          cat: m.cat, 
          proc: m.procQty,
          plan, 
          used, 
          w, 
          wp, 
          prod 
        };
      });
      setData(transformed);
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Site Consumption Data...</div>;

  const avgUtil = data.length > 0 ? Math.round(data.reduce((s, c) => s + (c.plan ? c.used / c.plan * 100 : 0), 0) / data.length) : 0;
  const avgWaste = data.length > 0 ? Math.round(data.reduce((s, c) => s + c.wp, 0) / data.length) : 0;
  const highWasteCount = data.filter(c => c.wp > 10).length;
  const avgProd = data.length > 0 ? Math.round(data.reduce((s, c) => s + c.prod, 0) / data.length) : 0;
  const maxAct = Math.max(...ACT_DATA.map(a => Math.max(a.p, a.a)), 1);

  return (
    <div>
      <div className="section-title" style={{ marginBottom: '16px' }}>⛏️ Consumption & Site Usage Analysis</div>

      <div className="kpi-row" style={{ marginBottom: '16px' }}>
        <div className="card kpi blue">
          <div className="lbl">Materials Tracked</div>
          <div className="val">{data.length}</div>
        </div>
        <div className="card kpi green">
          <div className="lbl">Avg Utilization</div>
          <div className="val">{avgUtil}%</div>
        </div>
        <div className="card kpi amber">
          <div className="lbl">Avg Wastage</div>
          <div className="val">{avgWaste}%</div>
        </div>
        <div className="card kpi red">
          <div className="lbl">High Waste</div>
          <div className="val">{highWasteCount}</div>
        </div>
        <div className="card kpi purple">
          <div className="lbl">Avg Productivity</div>
          <div className="val">{avgProd}%</div>
        </div>
      </div>

      <div className="grid2" style={{ marginBottom: '16px' }}>
        <div className="card">
          <div className="section-title" style={{ fontSize: '14px', marginBottom: '12px' }}>📊 Planned vs Actual Variance</div>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', fontSize: '11px', fontWeight: 600 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'var(--navy)', display: 'inline-block' }}></span> Planned
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'var(--green)', display: 'inline-block' }}></span> Actual
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'var(--red)', display: 'inline-block' }}></span> Waste
            </span>
          </div>

          {data.slice(0, 8).map((c, i) => {
            const mx = Math.max(c.plan, c.used, 1);
            return (
              <div key={i} style={{ marginBottom: '8px' }}>
                <div style={{ fontSize: '11px', fontWeight: 600, marginBottom: '2px' }}>{c.n}</div>
                <div style={{ display: 'flex', gap: '2px', height: '8px', marginBottom: '2px' }}>
                  <div style={{ width: `${(c.plan / mx) * 90}%`, background: 'var(--navy)', borderRadius: '2px' }}></div>
                </div>
                <div style={{ display: 'flex', gap: '2px', height: '8px' }}>
                  <div style={{ width: `${(c.used / mx) * 90}%`, background: 'var(--green)', borderRadius: '2px' }}></div>
                  {c.w > 0 && <div style={{ width: `${(c.w / mx) * 90}%`, background: 'var(--red)', borderRadius: '2px' }}></div>}
                </div>
              </div>
            );
          })}
        </div>

        <div className="card">
          <div className="section-title" style={{ fontSize: '14px', marginBottom: '12px' }}>🏗️ Activity-wise Consumption</div>
          <div className="bar-chart" style={{ height: '180px', display: 'flex', gap: '12px', alignItems: 'flex-end', paddingTop: '16px' }}>
            {ACT_DATA.map((a, i) => (
              <div key={i} className="col" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <div style={{ display: 'flex', gap: '2px', alignItems: 'flex-end', height: '150px', width: '100%', justifyContent: 'center' }}>
                  <div className="bar" style={{ width: '40%', height: `${(a.p / maxAct) * 100}%`, background: 'var(--navy)', borderRadius: '4px 4px 0 0' }}></div>
                  <div className="bar" style={{ width: '40%', height: `${(a.a / maxAct) * 100}%`, background: a.a > a.p ? 'var(--red)' : 'var(--green)', borderRadius: '4px 4px 0 0' }}></div>
                </div>
                <div className="bar-lbl" style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text2)' }}>
                  {a.n.substring(0, 7)}
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '12px', fontSize: '11px', fontWeight: 600 }}>
             <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'var(--navy)', display: 'inline-block' }}></span> Planned Baseline
             </span>
             <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'var(--green)', display: 'inline-block' }}></span> Good Usage
             </span>
             <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'var(--red)', display: 'inline-block' }}></span> Over Limit
             </span>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr>
              <th style={{ padding: '12px 16px', textAlign: 'left', background: '#f8fafc', borderBottom: '1px solid var(--border)' }}>Material</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', background: '#f8fafc', borderBottom: '1px solid var(--border)' }}>Category</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', background: '#f8fafc', borderBottom: '1px solid var(--border)' }}>Procured</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', background: '#f8fafc', borderBottom: '1px solid var(--border)' }}>Planned Use</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', background: '#f8fafc', borderBottom: '1px solid var(--border)' }}>Actual Used</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', background: '#f8fafc', borderBottom: '1px solid var(--border)' }}>Wastage Vol</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', background: '#f8fafc', borderBottom: '1px solid var(--border)' }}>Waste %</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', background: '#f8fafc', borderBottom: '1px solid var(--border)' }}>Productivity</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', background: '#f8fafc', borderBottom: '1px solid var(--border)' }}>Health</th>
            </tr>
          </thead>
          <tbody>
            {data.map((c, i) => {
              const hlth = c.wp > 10 ? 'red' : c.wp > 5 ? 'amber' : 'green';
              const hlthLbl = c.wp > 10 ? 'High' : c.wp > 5 ? 'Med' : 'OK';
              const prodClr = c.prod >= 100 ? 'green' : c.prod >= 80 ? 'blue' : 'red';
              
              return (
                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 600 }}>{c.n}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--text2)' }}>{c.cat}</td>
                  <td style={{ padding: '12px 16px' }}>{c.proc.toLocaleString()}</td>
                  <td style={{ padding: '12px 16px' }}>{c.plan.toLocaleString()}</td>
                  <td style={{ padding: '12px 16px', fontWeight: 600 }}>{c.used.toLocaleString()}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--red)', fontWeight: 600 }}>{c.w.toLocaleString()}</td>
                  <td style={{ padding: '12px 16px', fontWeight: 600 }}>{c.wp}%</td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div className="progress" style={{ width: '60px', height: '6px', background: '#e2e8f0', borderRadius: '4px' }}>
                        <div className={`fill ${prodClr}`} style={{ width: `${Math.min(c.prod, 100)}%`, background: `var(--${prodClr})`, height: '100%', borderRadius: '4px' }}></div>
                      </div>
                      <span style={{ fontSize: '11px', fontWeight: 600 }}>{c.prod}%</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span className={`pill ${hlth}`}>{hlthLbl}</span>
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
