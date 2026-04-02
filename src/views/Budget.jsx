import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { MOCK_DATA } from '../data/mockData';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

export default function Budget() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const timeout = new Promise((_, reject) => setTimeout(() => reject('timeout'), 3000));
        const { data, error } = await Promise.race([supabase.from('materials').select('*'), timeout]);
        if (!data || data.length === 0 || error) {
          setMaterials(MOCK_DATA.materials);
        } else {
          setMaterials(data.map(m => ({
              ...m, 
              name: m.name,
              cat: m.category || 'General',
              reqQty: m.req_qty,
              procQty: m.proc_qty,
              rate: m.market_rate
          })));
        }
      } catch (err) {
        setMaterials(MOCK_DATA.materials);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Financial Data...</div>;

  const fmt = (v) => '₹' + Math.floor(v).toLocaleString('en-IN');
  const pct = (a, b) => b ? Math.round((a / b) * 100) : 0;

  // Calculate high level totals
  const totalBudget = materials.reduce((s, m) => s + (m.reqQty * m.rate), 0);
  const totalSpent = materials.reduce((s, m) => s + (m.procQty * m.rate), 0);
  const remaining = totalBudget - totalSpent;
  const forecast = totalSpent * 1.08; // Simple sim logic

  // Group by category
  const cats = [...new Set(materials.map(m => m.cat))];
  const catData = cats.map(c => {
      const b = materials.filter(m => m.cat === c).reduce((s, m) => s + (m.reqQty * m.rate), 0);
      const a = materials.filter(m => m.cat === c).reduce((s, m) => s + (m.procQty * m.rate), 0);
      return { 
          name: c, 
          budget: b, 
          actual: a,
          variancePct: pct(b - a, b),
          value: a // For Pie Chart
      };
  }).filter(c => c.budget > 0);

  const maxCatBudget = Math.max(...catData.map(c => c.budget), 1);
  const COLORS = ['#1e3a5f', '#2563eb', '#059669', '#d97706', '#dc2626', '#7c3aed', '#0891b2', '#ea580c', '#4f46e5', '#14b8a6', '#e11d48'];

  return (
    <div>
      <div className="section-title">💰 Budget & Cost Control Dashboard</div>

      <div className="kpi-row" style={{ marginBottom: '16px' }}>
          <div className="card kpi blue">
              <div className="lbl">BOQ Budget</div>
              <div className="val">{fmt(totalBudget)}</div>
          </div>
          <div className="card kpi green">
              <div className="lbl">Actual Cost</div>
              <div className="val">{fmt(totalSpent)}</div>
          </div>
          <div className="card kpi amber">
              <div className="lbl">Remaining</div>
              <div className="val">{fmt(remaining)}</div>
          </div>
          <div className={`card kpi ${forecast > totalBudget ? 'red' : 'purple'}`}>
              <div className="lbl">Forecast</div>
              <div className="val">{fmt(forecast)}</div>
              <div style={{ fontSize: '9px', color: forecast > totalBudget ? 'var(--red)' : 'var(--green)' }}>
                  {forecast > totalBudget ? 'Over Budget' : 'Under Budget'}
              </div>
          </div>
          <div className="card kpi blue">
              <div className="lbl">Savings</div>
              <div className="val">{pct(remaining, totalBudget)}%</div>
          </div>
      </div>

      <div className="grid2" style={{ marginTop: '12px' }}>
          <div className="card">
              <div className="section-title" style={{ fontSize: '14px' }}>🥧 Cost Distribution by Category</div>
              <div style={{ height: '220px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <ResponsiveContainer width="100%" height={160}>
                      <PieChart>
                          <Pie
                              data={catData}
                              cx="50%"
                              cy="50%"
                              innerRadius={50}
                              outerRadius={70}
                              paddingAngle={5}
                              dataKey="value"
                              stroke="none"
                          >
                              {catData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                          </Pie>
                          <Tooltip formatter={(val) => fmt(val)} />
                      </PieChart>
                  </ResponsiveContainer>
                  
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginTop: '10px' }}>
                      {catData.map((c, i) => (
                          <div key={c.name} style={{ fontSize: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: COLORS[i % COLORS.length] }}></span>
                              {c.name}
                          </div>
                      ))}
                  </div>
              </div>
          </div>

          <div className="card">
              <div className="section-title" style={{ fontSize: '14px' }}>📉 Budget vs Actual Utilization</div>
              <div style={{ maxHeight: '220px', overflowY: 'auto', paddingRight: '8px' }}>
                  {catData.map(c => (
                      <div key={c.name} style={{ marginBottom: '12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 600, marginBottom: '4px' }}>
                              <span>{c.name}</span>
                              <span style={{ color: c.variancePct >= 0 ? 'var(--green)' : 'var(--red)' }}>
                                  {c.variancePct}% remaining
                              </span>
                          </div>
                          <div style={{ position: 'relative', height: '14px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                              {/* Budget Base Bar */}
                              <div style={{ position: 'absolute', height: '100%', background: 'rgba(30, 58, 95, 0.2)', width: `${(c.budget / maxCatBudget) * 100}%` }}></div>
                              {/* Actual Overlay Bar */}
                              <div style={{ position: 'absolute', height: '100%', background: c.variancePct < 0 ? 'var(--red)' : 'var(--green)', width: `${(c.actual / maxCatBudget) * 100}%` }}></div>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      </div>

      <div className="card" style={{ marginTop: '12px', padding: 0, overflowX: 'auto' }}>
          <table style={{ width: '100%', fontSize: '12px' }}>
              <thead>
                  <tr>
                      <th style={{ padding: '12px', borderBottom: '1px solid var(--border)', textAlign: 'left' }}>Category</th>
                      <th style={{ padding: '12px', borderBottom: '1px solid var(--border)', textAlign: 'right' }}>Budget Allocated</th>
                      <th style={{ padding: '12px', borderBottom: '1px solid var(--border)', textAlign: 'right' }}>Spent (Actual)</th>
                      <th style={{ padding: '12px', borderBottom: '1px solid var(--border)', textAlign: 'right' }}>Variance</th>
                      <th style={{ padding: '12px', borderBottom: '1px solid var(--border)', textAlign: 'center' }}>Rem %</th>
                      <th style={{ padding: '12px', borderBottom: '1px solid var(--border)', textAlign: 'center' }}>Status</th>
                  </tr>
              </thead>
              <tbody>
                  {catData.map(c => (
                      <tr key={c.name}>
                          <td style={{ padding: '12px', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>{c.name}</td>
                          <td style={{ padding: '12px', borderBottom: '1px solid var(--border)', textAlign: 'right' }}>{fmt(c.budget)}</td>
                          <td style={{ padding: '12px', borderBottom: '1px solid var(--border)', textAlign: 'right' }}>{fmt(c.actual)}</td>
                          <td style={{ padding: '12px', borderBottom: '1px solid var(--border)', textAlign: 'right', color: c.variancePct >= 0 ? 'var(--green)' : 'var(--red)' }}>
                              {fmt(Math.abs(c.budget - c.actual))}
                          </td>
                          <td style={{ padding: '12px', borderBottom: '1px solid var(--border)', textAlign: 'center', fontWeight: 600 }}>
                              {c.variancePct}%
                          </td>
                          <td style={{ padding: '12px', borderBottom: '1px solid var(--border)', textAlign: 'center' }}>
                              <span className={`pill ${c.variancePct < 5 ? 'red' : c.variancePct < 15 ? 'amber' : 'green'}`}>
                                  {c.variancePct < 5 ? 'At Risk' : c.variancePct < 15 ? 'Watch' : 'On Track'}
                              </span>
                          </td>
                      </tr>
                  ))}
              </tbody>
          </table>
      </div>
    </div>
  );
}
