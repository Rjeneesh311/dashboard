import { useState, useEffect } from 'react';
import { MOCK_DATA } from '../data/mockData';

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    const timer = setTimeout(() => {
      const generatedAlerts = [];
      const pct = (a, b) => b ? Math.round((a / b) * 100) : 0;

      // Check materials
      MOCK_DATA.materials.forEach(m => {
        const stk = m.procQty - Math.floor(m.procQty * 0.7); 
        const min = Math.floor(m.reqQty * 0.1);
        const nameShort = m.name.split(' ').slice(0, 3).join(' ');

        if (stk <= 0) {
          generatedAlerts.push({ t: '🔴 Out of Stock', m: `${nameShort} — ZERO stock`, s: 'red', p: 1 });
        } else if (stk < min) {
          generatedAlerts.push({ t: '🔴 Low Stock', m: `${nameShort} — Stock: ${stk.toLocaleString()}`, s: 'red', p: 1 });
        }

        const procPct = pct(m.procQty, m.reqQty);
        if (procPct < 30) {
          generatedAlerts.push({ t: '🔴 Critical Gap', m: `${nameShort} — Only ${procPct}% procured`, s: 'red', p: 1 });
        } else if (procPct < 50) {
          generatedAlerts.push({ t: '🟡 Procurement', m: `${nameShort} — ${procPct}% procured`, s: 'amber', p: 2 });
        }
      });

      // Check POs
      MOCK_DATA.pos.forEach(p => {
        if (p.status === 'Rejected') {
          generatedAlerts.push({ t: '🔴 PO Rejected', m: `${p.id} — Action Required`, s: 'red', p: 1 });
        }
        if (['Pending Approval', 'Pending Owner', 'Pending QA/QC'].includes(p.status)) {
          generatedAlerts.push({ t: '🟠 Pending PO', m: `${p.id} awaiting ${p.status}`, s: 'amber', p: 2 });
        }
      });

      // Check Vendors
      MOCK_DATA.vendors.forEach(v => {
        if (v.ontime < 75) {
          generatedAlerts.push({ t: '🔴 Vendor Delay', m: `${v.name} — ${v.ontime}% On-time`, s: 'red', p: 1 });
        } else if (v.ontime < 85) {
          generatedAlerts.push({ t: '🟡 Vendor Risk', m: `${v.name} — ${v.ontime}% On-time`, s: 'amber', p: 2 });
        }
      });

      // Add a couple of mock system alerts
      generatedAlerts.push({ t: 'ℹ️ Scheduled Maint', m: 'Database sync scheduled for Midnight', s: 'blue', p: 3 });
      
      generatedAlerts.sort((a, b) => a.p - b.p);

      setAlerts(generatedAlerts);
      setNotifications([...MOCK_DATA.notifications].reverse());
      setLoading(false);
    }, 400);

    return () => clearTimeout(timer);
  }, []);

  const handleAck = (index) => {
    const newAlerts = [...alerts];
    newAlerts.splice(index, 1);
    setAlerts(newAlerts);
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Alerts Center...</div>;

  const redAlerts = alerts.filter(a => a.s === 'red').length;
  const amberAlerts = alerts.filter(a => a.s === 'amber').length;
  
  const displayedAlerts = filter === 'All' ? alerts : alerts.filter(a => a.s === filter);

  return (
    <div>
      <div className="section-title" style={{ marginBottom: '16px' }}>🔔 Alerts & Action Center</div>
      
      <div className="kpi-row" style={{ marginBottom: '16px' }}>
        <div className="card kpi blue">
          <div className="lbl">Total Alerts</div>
          <div className="val">{alerts.length}</div>
        </div>
        <div className="card kpi red">
          <div className="lbl">Critical (P1)</div>
          <div className="val">{redAlerts}</div>
        </div>
        <div className="card kpi amber">
          <div className="lbl">Warning (P2)</div>
          <div className="val">{amberAlerts}</div>
        </div>
        <div className="card kpi green">
          <div className="lbl">Resolved Today</div>
          <div className="val">3</div>
        </div>
      </div>

      <div className="tabs" style={{ marginBottom: '16px', display: 'flex', gap: '8px' }}>
        <div className={`tab ${filter === 'All' ? 'active' : ''}`} onClick={() => setFilter('All')}>
          All <span className="count">{alerts.length}</span>
        </div>
        <div className={`tab ${filter === 'red' ? 'active' : ''}`} onClick={() => setFilter('red')}>
          Critical <span className="count">{redAlerts}</span>
        </div>
        <div className={`tab ${filter === 'amber' ? 'active' : ''}`} onClick={() => setFilter('amber')}>
          Warning <span className="count">{amberAlerts}</span>
        </div>
      </div>

      <div className="card" style={{ padding: '0', minHeight: '300px' }}>
        {alerts.length === 0 ? (
           <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text3)' }}>
              <div style={{ fontSize: '36px', marginBottom: '8px' }}>✅</div>
              <div style={{ fontWeight: 600, fontSize: '16px' }}>All Clear</div>
              <div style={{ fontSize: '12px' }}>No active alerts require your immediate attention.</div>
           </div>
        ) : displayedAlerts.map((a, i) => (
          <div key={i} style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px', 
            padding: '12px 16px', 
            borderBottom: '1px solid var(--border)', 
            fontSize: '13px',
            backgroundColor: a.s === 'red' ? '#fef2f2' : a.s === 'amber' ? '#fffbeb' : '#fff'
          }}>
            <span style={{ fontWeight: 700, minWidth: '24px', color: a.s === 'red' ? 'var(--red)' : a.s === 'amber' ? 'var(--amber)' : 'var(--blue)' }}>
              P{a.p}
            </span>
            <span className={`pill ${a.s}`} style={{ minWidth: '140px', textAlign: 'center' }}>
              {a.t}
            </span>
            <span style={{ flex: 1, fontWeight: 500 }}>
              {a.m}
            </span>
            <button 
              className="btn outline" 
              style={{ padding: '4px 10px', fontSize: '11px', background: '#fff' }} 
              onClick={() => handleAck(i)}
            >
               ✓ Ack
            </button>
          </div>
        ))}
      </div>

      {notifications.length > 0 && (
        <div className="card" style={{ marginTop: '16px' }}>
          <div className="section-title" style={{ fontSize: '14px', marginBottom: '12px' }}>📜 Recent Activity Log</div>
          <div style={{ maxHeight: '220px', overflowY: 'auto', paddingRight: '8px' }}>
            {notifications.map((n, i) => (
              <div key={i} style={{ display: 'flex', gap: '12px', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '12px' }}>
                <span style={{ color: 'var(--text3)', minWidth: '120px', fontWeight: 600 }}>{n.time}</span>
                <span style={{ fontWeight: 500, color: 'var(--text2)' }}>{n.msg}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
