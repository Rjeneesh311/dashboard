import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { MOCK_DATA } from '../data/mockData';

export default function Overview() {
  const [data, setData] = useState({ materials: [], pos: [], vendors: [] });
  const [loading, setLoading] = useState(true);

  const role = localStorage.getItem('demo_role') || 'Admin';

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        // First try to fetch from Supabase
        const { data: dbMats, error: matErr } = await supabase.from('materials').select('*');
        const { data: dbPos, error: poErr } = await supabase.from('purchase_orders').select('*');
        const { data: dbVens, error: venErr } = await supabase.from('vendors').select('*');
        
        // If the tables are completely empty or error out (due to missing schema populating), fallback to mock
        if ((!dbMats || dbMats.length === 0) || (matErr || poErr || venErr)) {
          console.warn('Falling back to mock data until Supabase is fully seeded', matErr);
          setData(MOCK_DATA);
        } else {
          // Map DB to matching structure
          setData({
            materials: dbMats || [],
            pos: dbPos || [],
            vendors: dbVens || []
          });
        }
      } catch (e) {
        console.error("Supabase load error:", e);
        setData(MOCK_DATA);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Dashboard Data...</div>;

  const totalBudget = data.materials.reduce((s, m) => s + (m.req_qty || m.reqQty) * (m.market_rate || m.rate || 0), 0);
  const spent = data.materials.reduce((s, m) => s + (m.proc_qty || m.procQty) * (m.market_rate || m.rate || 0), 0);
  const costVar = totalBudget > 0 ? Math.round(((totalBudget - spent) / totalBudget) * 100) : 0;
  
  const fmt = (n) => n >= 10000000 ? '\u20b9' + (n / 10000000).toFixed(1) + 'Cr' : n >= 100000 ? '\u20b9' + (n / 100000).toFixed(1) + 'L' : '\u20b9' + n.toLocaleString('en-IN');
  const pct = (a, b) => b ? Math.round(a / b * 100) : 0;

  let kpiHtml = null;
  if (role === 'Admin' || role === 'Project Manager') {
      kpiHtml = (
          <>
            <div className="card kpi blue">
                <div className="lbl">System Budget</div>
                <div className="val">{fmt(totalBudget)}</div>
                <div style={{ fontSize: '9px', color: 'var(--text3)' }}>Total ERP Scope &rarr;</div>
            </div>
            <div className="card kpi green">
                <div className="lbl">System Spent</div>
                <div className="val">{fmt(spent)}</div>
                <div style={{ fontSize: '10px', color: 'var(--text3)' }}>{pct(spent, Math.max(totalBudget, 1))}% utilized</div>
            </div>
            <div className="card kpi purple">
                <div className="lbl">Material Availability</div>
                <div className="val">85%</div>
                <div style={{ fontSize: '9px', color: 'var(--text3)' }}>Global Stock &rarr;</div>
            </div>
            <div className="card kpi amber">
                <div className="lbl">Cost Variance</div>
                <div className="val">{costVar}%</div>
                <div style={{ fontSize: '10px', color: 'var(--green)' }}>Under Budget</div>
            </div>
            <div className="card kpi red">
                <div className="lbl">Active POs</div>
                <div className="val">{data.pos.length}</div>
                <div style={{ fontSize: '9px', color: 'var(--text3)' }}>Action Required &rarr;</div>
            </div>
            <div className="card kpi blue">
                <div className="lbl">System Health</div>
                <div className="val">98%</div>
                <div style={{ fontSize: '10px', color: 'var(--green)' }}>Optimal status</div>
            </div>
          </>
      );
  } else {
       kpiHtml = (
           <>
              <div className="card kpi blue"><div className="lbl">Allocated Modules</div><div className="val">Active</div></div>
              <div className="card kpi green"><div className="lbl">Pending Tasks</div><div className="val">12</div></div>
           </>
       );
  }

  return (
    <div>
        <div className="card" style={{ padding: '12px 16px', marginBottom: '16px', background: 'var(--navy)', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <img src="https://www.gujaratmetrorail.com/favicon.ico" alt="GMRCL" style={{ height: '44px', borderRadius: '6px', background: '#fff', padding: '3px' }} onError={(e) => e.target.style.display='none'} />
                <div>
                    <div style={{ fontSize: '16px', fontWeight: 700 }}>Ahmedabad Metro Rail Phase-II</div>
                    <div style={{ fontSize: '11px', opacity: 0.7 }}>Package: CP-04 | Location: SG Highway Corridor | Contractor: L&T Metro Rail (Ahmedabad) Ltd</div>
                </div>
            </div>
            <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '11px', opacity: 0.7 }}>Duration: Jan 2025 - Dec 2028</div>
                <div style={{ fontSize: '11px', opacity: 0.7 }}>System Role: {role}</div>
            </div>
        </div>

        <div className="kpi-row" style={{ marginBottom: '16px' }}>
            {kpiHtml}
        </div>

        <div className="grid2">
            <div className="card">
                <div className="section-title">📊 Material Highlights</div>
                <table style={{width: '100%', fontSize: '12px'}}>
                    <thead><tr><th style={{padding: '8px'}}>Material</th><th style={{padding: '8px'}}>Required</th><th style={{padding: '8px'}}>Procured</th></tr></thead>
                    <tbody>
                        {data.materials.slice(0, 5).map(m => (
                            <tr key={m.id || m.code}>
                                <td style={{padding: '8px', borderBottom: '1px solid var(--border)'}}>{m.name}</td>
                                <td style={{padding: '8px', borderBottom: '1px solid var(--border)'}}>{m.req_qty || m.reqQty}</td>
                                <td style={{padding: '8px', borderBottom: '1px solid var(--border)'}}>{m.proc_qty || m.procQty}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="card">
                <div className="section-title">🏭 Top Vendors</div>
                <table style={{width: '100%', fontSize: '12px'}}>
                    <thead><tr><th style={{padding: '8px'}}>Name</th><th style={{padding: '8px'}}>Category</th><th style={{padding: '8px'}}>Score</th></tr></thead>
                    <tbody>
                        {data.vendors.slice(0, 5).map(v => (
                            <tr key={v.id}>
                                <td style={{padding: '8px', borderBottom: '1px solid var(--border)'}}>{v.name}</td>
                                <td style={{padding: '8px', borderBottom: '1px solid var(--border)'}}>{v.cat || v.category}</td>
                                <td style={{padding: '8px', borderBottom: '1px solid var(--border)', fontWeight: 'bold'}}>{v.score || v.quality_score}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
}
