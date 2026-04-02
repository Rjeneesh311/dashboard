import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { MOCK_DATA } from '../data/mockData';
import { useNavigate } from 'react-router-dom';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const navigate = useNavigate();

  const role = localStorage.getItem('demo_role') || 'Admin';
  const canCreatePO = ['Admin', 'Procurement Team'].includes(role);

  useEffect(() => {
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
            created_at,
            materials ( name, unit ),
            vendors ( name )
          `)
          .order('created_at', { ascending: false });

        if (!data || data.length === 0 || error) {
          // Fallback to MOCK_DATA
          setOrders(MOCK_DATA.pos);
        } else {
          // Map foreign tables to standard flat object used in UI
          const mapped = data.map(o => ({
              id: o.po_number || `PO-${o.id.substring(0,6)}`,
              vendor: o.vendors?.name || 'Unknown',
              material: o.materials?.name || 'Unknown',
              qty: o.ordered_qty,
              unit: o.materials?.unit || 'Units',
              rate: o.agreed_rate,
              total: o.ordered_qty * o.agreed_rate,
              status: o.status || 'Pending Approval',
              date: new Date(o.created_at).toLocaleDateString('en-GB'),
              by: 'System Admin' // Mocked user since we don't have profile yet
          }));
          setOrders(mapped);
        }
      } catch (err) {
        console.error("Failed to load POs", err);
        setOrders(MOCK_DATA.pos);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Purchase Orders...</div>;

  const statuses = ['All', 'Draft', 'Pending Approval', 'Pending Owner', 'Pending QA/QC', 'Approved', 'Sent to Vendor', 'Vendor Confirmed', 'Rejected'];
  const filtered = filter === 'All' ? orders : orders.filter(p => p.status === filter);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 className="section-title" style={{ margin: 0 }}>🛒 Purchase Orders Registry</h2>
          {canCreatePO && <button className="btn primary" onClick={() => alert("Create PO feature coming soon!")}>+ New PO</button>}
      </div>

      <div className="tabs" style={{ marginBottom: '16px' }}>
          {statuses.map(s => {
              const count = s === 'All' ? orders.length : orders.filter(p => p.status === s).length;
              if (count === 0 && s !== 'All') return null;
              
              return (
                  <div key={s} className={`tab ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>
                      {s} <span className="count">{count}</span>
                  </div>
              );
          })}
      </div>

      <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
          <table style={{ width: '100%', fontSize: '13px' }}>
              <thead>
                  <tr>
                      <th style={{ padding: '12px', borderBottom: '1px solid var(--border)', textAlign: 'left' }}>PO Number</th>
                      <th style={{ padding: '12px', borderBottom: '1px solid var(--border)', textAlign: 'left' }}>Vendor</th>
                      <th style={{ padding: '12px', borderBottom: '1px solid var(--border)', textAlign: 'left' }}>Material</th>
                      <th style={{ padding: '12px', borderBottom: '1px solid var(--border)', textAlign: 'left' }}>QTY</th>
                      <th style={{ padding: '12px', borderBottom: '1px solid var(--border)', textAlign: 'left' }}>Rate</th>
                      <th style={{ padding: '12px', borderBottom: '1px solid var(--border)', textAlign: 'left' }}>Total</th>
                      <th style={{ padding: '12px', borderBottom: '1px solid var(--border)', textAlign: 'left' }}>Status</th>
                      <th style={{ padding: '12px', borderBottom: '1px solid var(--border)', textAlign: 'left' }}>Date</th>
                      <th style={{ padding: '12px', borderBottom: '1px solid var(--border)', textAlign: 'left' }}>Actions</th>
                  </tr>
              </thead>
              <tbody>
                  {filtered.length === 0 ? (
                      <tr><td colSpan="9" style={{ padding: '24px', textAlign: 'center', color: 'var(--text3)' }}>No orders found for this status.</td></tr>
                  ) : filtered.map(p => {
                      const sC = ['Approved', 'Sent to Vendor', 'Vendor Confirmed'].includes(p.status) ? 'green' : p.status === 'Draft' ? 'blue' : p.status === 'Rejected' ? 'red' : 'amber';
                      
                      let act = null;
                      if (['Pending Approval', 'Pending Owner', 'Pending QA/QC'].includes(p.status)) {
                          act = <button className="btn outline" style={{ padding: '4px 10px', fontSize: '11px' }} onClick={() => navigate('/dashboard/approval')}>⏳ Approval</button>;
                      } else if (p.status === 'Approved') {
                          act = <button className="btn primary" style={{ padding: '4px 10px', fontSize: '11px' }} onClick={() => alert(`Sending ${p.id} to ${p.vendor}`)}>📨 Send</button>;
                      } else if (['Sent to Vendor', 'Vendor Confirmed', 'In Transit'].includes(p.status)) {
                          act = <button className="btn outline" style={{ padding: '4px 10px', fontSize: '11px' }} onClick={() => navigate('/dashboard/tracking')}>🚚 Track</button>;
                      } else {
                          act = <button className="btn outline" style={{ padding: '4px 10px', fontSize: '11px' }}>📄 View</button>;
                      }

                      return (
                          <tr key={p.id}>
                              <td style={{ padding: '12px', borderBottom: '1px solid var(--border)', fontWeight: 600, color: 'var(--blue)' }}>{p.id}</td>
                              <td style={{ padding: '12px', borderBottom: '1px solid var(--border)' }}>{p.vendor}</td>
                              <td style={{ padding: '12px', borderBottom: '1px solid var(--border)' }}>{p.material}</td>
                              <td style={{ padding: '12px', borderBottom: '1px solid var(--border)' }}>{p.qty} {p.unit}</td>
                              <td style={{ padding: '12px', borderBottom: '1px solid var(--border)' }}>₹{p.rate.toLocaleString()}</td>
                              <td style={{ padding: '12px', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>₹{p.total.toLocaleString()}</td>
                              <td style={{ padding: '12px', borderBottom: '1px solid var(--border)' }}>
                                  <span className={`pill ${sC}`}>{p.status}</span>
                              </td>
                              <td style={{ padding: '12px', borderBottom: '1px solid var(--border)' }}>{p.date}</td>
                              <td style={{ padding: '12px', borderBottom: '1px solid var(--border)' }}>{act}</td>
                          </tr>
                      );
                  })}
              </tbody>
          </table>
      </div>
    </div>
  );
}
