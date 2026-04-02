import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { MOCK_DATA } from '../data/mockData';
import { useNavigate } from 'react-router-dom';

export default function Approval() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const role = localStorage.getItem('demo_role') || 'Admin';
  // Admin, PM, Owner, QA/QC can approve in certain stages
  const canApprove = ['Admin', 'Project Manager', 'QA/QC Engineer'].includes(role); // Simplified

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('purchase_orders')
        .select(`
          id,
          po_number,
          ordered_qty,
          agreed_rate,
          status,
          materials ( name ),
          vendors ( name )
        `)
        // In real app we might only fetch 'Pending Approval', 'Pending Owner', 'Pending QA/QC'. For UI completeness we fetch all.
        .order('id', { ascending: false });

      if (!data || data.length === 0 || error) {
        setOrders(MOCK_DATA.pos);
      } else {
        const mapped = data.map(o => ({
            id: o.po_number || `PO-${o.id.substring(0,6)}`,
            vendor: o.vendors?.name || 'Unknown',
            material: o.materials?.name || 'Unknown',
            total: o.ordered_qty * o.agreed_rate,
            status: o.status || 'Pending Approval'
        }));
        setOrders(mapped);
      }
    } catch (err) {
      console.error("Failed to load Approvals", err);
      setOrders(MOCK_DATA.pos); // Mock fallback
    } finally {
      setLoading(false);
    }
  }

  // Handle local state update for demo. Real app uses Supabase update.
  const updateStatus = async (id, newStatus) => {
      // Optimistic update
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
      // In a real app we would await a supabase update here
      
      // Show notification (mock)
      const actionStr = newStatus === 'Rejected' ? 'REJECTED' : 'APPROVED';
      console.log(`PO ${id} ${actionStr} -> ${newStatus}`);
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Approval Queue...</div>;

  return (
    <div>
      <div className="section-title">✅ Multi-Level Approval Workflow</div>
      
      <div className="card" style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '20px', background: '#f8fafc', borderRadius: '8px' }}>
              <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px' }}>📝</div>
                  <div style={{ fontSize: '12px', fontWeight: 600 }}>PO Created</div>
              </div>
              <div style={{ fontSize: '20px', color: 'var(--text3)' }}>→</div>
              <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px' }}>👷</div>
                  <div style={{ fontSize: '12px', fontWeight: 600 }}>PM Review</div>
              </div>
              <div style={{ fontSize: '20px', color: 'var(--text3)' }}>→</div>
              <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px' }}>🏢</div>
                  <div style={{ fontSize: '12px', fontWeight: 600 }}>Owner Approval</div>
              </div>
              <div style={{ fontSize: '20px', color: 'var(--text3)' }}>→</div>
              <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px' }}>🔬</div>
                  <div style={{ fontSize: '12px', fontWeight: 600 }}>QA/QC Sign-Off</div>
              </div>
              <div style={{ fontSize: '20px', color: 'var(--text3)' }}>→</div>
              <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px' }}>✅</div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--green)' }}>Sent to Vendor</div>
              </div>
          </div>
      </div>

      <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
          <table style={{ width: '100%', fontSize: '12px' }}>
              <thead>
                  <tr>
                      <th style={{ padding: '12px', borderBottom: '1px solid var(--border)', textAlign: 'left' }}>PO</th>
                      <th style={{ padding: '12px', borderBottom: '1px solid var(--border)', textAlign: 'left' }}>Material</th>
                      <th style={{ padding: '12px', borderBottom: '1px solid var(--border)', textAlign: 'left' }}>Vendor</th>
                      <th style={{ padding: '12px', borderBottom: '1px solid var(--border)', textAlign: 'left' }}>Amount</th>
                      <th style={{ padding: '12px', borderBottom: '1px solid var(--border)', textAlign: 'left' }}>Current Stage</th>
                      <th style={{ padding: '12px', borderBottom: '1px solid var(--border)', textAlign: 'left' }}>Actions</th>
                  </tr>
              </thead>
              <tbody>
                  {orders.map(p => {
                      const s = p.status;
                      const isPM = s === 'Pending Approval';
                      const isOwn = s === 'Pending Owner';
                      const isQA = s === 'Pending QA/QC';
                      const lbl = isPM ? '⏳ PM Review' : isOwn ? '⏳ Owner' : isQA ? '⏳ QA/QC' : `✅ ${s}`;
                      
                      const cl = (isPM || isOwn || isQA) ? 'amber' : s === 'Rejected' ? 'red' : 'green';

                      let actionComponent = null;

                      if (!canApprove && (isPM || isOwn || isQA)) {
                          actionComponent = <span style={{ color: 'var(--text3)', fontSize: '11px' }}>Awaiting Auth</span>;
                      } else if (isPM) {
                          actionComponent = (
                              <div style={{ display: 'flex', gap: '4px' }}>
                                  <button className="btn green" style={{ padding: '4px 8px', fontSize: '11px' }} onClick={() => updateStatus(p.id, 'Pending Owner')}>✓ PM Approve</button>
                                  <button className="btn red" style={{ padding: '4px 8px', fontSize: '11px' }} onClick={() => updateStatus(p.id, 'Rejected')}>✗</button>
                              </div>
                          );
                      } else if (isOwn) {
                          actionComponent = (
                              <div style={{ display: 'flex', gap: '4px' }}>
                                  <button className="btn green" style={{ padding: '4px 8px', fontSize: '11px' }} onClick={() => updateStatus(p.id, 'Pending QA/QC')}>✓ Owner</button>
                                  <button className="btn red" style={{ padding: '4px 8px', fontSize: '11px' }} onClick={() => updateStatus(p.id, 'Rejected')}>✗</button>
                              </div>
                          );
                      } else if (isQA) {
                          actionComponent = (
                              <div style={{ display: 'flex', gap: '4px' }}>
                                  <button className="btn green" style={{ padding: '4px 8px', fontSize: '11px' }} onClick={() => updateStatus(p.id, 'Approved')}>✓ QA/QC</button>
                                  <button className="btn red" style={{ padding: '4px 8px', fontSize: '11px' }} onClick={() => updateStatus(p.id, 'Rejected')}>✗</button>
                              </div>
                          );
                      } else if (s === 'Approved') {
                          actionComponent = <button className="btn primary" style={{ padding: '4px 12px', fontSize: '11px' }} onClick={() => updateStatus(p.id, 'Sent to Vendor')}>📨 Send</button>;
                      } else if (['Sent to Vendor', 'Vendor Confirmed', 'In Transit', 'Delivered'].includes(s)) {
                          actionComponent = (
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                  <span style={{ color: 'var(--green)', fontSize: '11px', fontWeight: 600 }}>✓ Done</span>
                                  <button className="btn outline" style={{ padding: '4px 8px', fontSize: '11px' }} onClick={() => navigate('/dashboard/tracking')}>🚚</button>
                              </div>
                          );
                      } else {
                          actionComponent = <span style={{ color: 'var(--red)', fontSize: '11px', fontWeight: 600 }}>❌ Rejected</span>;
                      }

                      return (
                          <tr key={p.id}>
                              <td style={{ padding: '12px', borderBottom: '1px solid var(--border)', fontWeight: 600, color: 'var(--blue)', cursor: 'pointer' }} onClick={() => navigate('/dashboard/orders')}>
                                  {p.id}
                              </td>
                              <td style={{ padding: '12px', borderBottom: '1px solid var(--border)' }}>{p.material}</td>
                              <td style={{ padding: '12px', borderBottom: '1px solid var(--border)' }}>{p.vendor}</td>
                              <td style={{ padding: '12px', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>₹{p.total.toLocaleString()}</td>
                              <td style={{ padding: '12px', borderBottom: '1px solid var(--border)' }}>
                                  <span className={`pill ${cl}`}>{lbl}</span>
                              </td>
                              <td style={{ padding: '12px', borderBottom: '1px solid var(--border)' }}>{actionComponent}</td>
                          </tr>
                      );
                  })}
              </tbody>
          </table>
      </div>
    </div>
  );
}
