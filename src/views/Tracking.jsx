import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { MOCK_DATA } from '../data/mockData';
import { useNavigate } from 'react-router-dom';

export default function Tracking() {
  const [trackableOrders, setTrackableOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchActiveOrders();
  }, []);

  async function fetchActiveOrders() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('purchase_orders')
        .select(`
          id,
          po_number,
          status,
          materials ( name ),
          vendors ( name )
        `)
        .in('status', ['Sent to Vendor', 'Vendor Confirmed', 'In Transit', 'Delivered']);

      if (!data || data.length === 0 || error) {
         const mockData = MOCK_DATA.pos.filter(p => ['Sent to Vendor', 'Vendor Confirmed', 'In Transit', 'Delivered'].includes(p.status));
         setTrackableOrders(mockData);
      } else {
        const mapped = data.map(o => ({
            id: o.po_number || `PO-${o.id.substring(0,6)}`,
            vendor: o.vendors?.name || 'Unknown',
            material: o.materials?.name || 'Unknown',
            status: o.status
        }));
        setTrackableOrders(mapped);
      }
    } catch (err) {
      console.error("Failed to load Tracking", err);
      setTrackableOrders(MOCK_DATA.pos.filter(p => ['Sent to Vendor', 'Vendor Confirmed', 'In Transit', 'Delivered'].includes(p.status)));
    } finally {
      setLoading(false);
    }
  }

  const steps = ['Order Placed', 'Vendor Confirmed', 'Manufacturing', 'Dispatched', 'In Transit', 'At Site', 'Inspected', 'Accepted'];

  const getDoneIndex = (status) => {
      switch(status) {
          case 'Sent to Vendor': return 1;
          case 'Vendor Confirmed': return 2;
          case 'Manufacturing': return 3;
          case 'Dispatched': return 4;
          case 'In Transit': return 5;
          case 'At Site': return 6;
          case 'Inspected': return 7;
          case 'Delivered':
          case 'Accepted': return 8;
          default: return 1;
      }
  };

  const simulateProgress = (id, newStatus) => {
      setTrackableOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
      console.log(`Mock Sync: Order ${id} changed to ${newStatus}`);
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Shipment Tracking...</div>;

  return (
    <div>
      <div className="section-title">🚚 Live Order Tracking Tracker</div>

      {trackableOrders.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text3)' }}>
              <div style={{ fontSize: '40px', marginBottom: '8px' }}>📦</div>
              <p>No active shipments to track right now.</p>
              <button className="btn primary" style={{ marginTop: '12px', padding: '8px 16px' }} onClick={() => navigate('/dashboard/orders')}>View Purchase Orders</button>
          </div>
      ) : (
          trackableOrders.map(o => {
              const doneIndex = getDoneIndex(o.status);

              return (
                  <div key={o.id} className="card" style={{ marginBottom: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                          <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--navy)' }}>{o.id} &mdash; {o.material}</span>
                          <span style={{ fontSize: '13px', color: 'var(--text3)' }}>Vendor: <b>{o.vendor}</b></span>
                      </div>
                      
                      <div className="tracker" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          {steps.map((s, i) => (
                              <div key={i} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                                  <div className={`step ${i < doneIndex ? 'done' : i === doneIndex ? 'current' : ''}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', flex: 1 }}>
                                      <div className="dot" style={{ 
                                          width: '24px', height: '24px', borderRadius: '50%', 
                                          background: i < doneIndex ? 'var(--green)' : i === doneIndex ? 'var(--blue)' : '#e2e8f0',
                                          color: i < doneIndex ? '#fff' : i === doneIndex ? '#fff' : 'var(--text3)',
                                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600, zIndex: 2
                                      }}>
                                          {i < doneIndex ? '✓' : i === doneIndex ? '⟳' : i + 1}
                                      </div>
                                      <div className="lbl" style={{ fontSize: '10px', marginTop: '6px', textAlign: 'center', color: i <= doneIndex ? 'var(--navy)' : 'var(--text3)', fontWeight: i === doneIndex ? 700 : 500, width: '60px' }}>
                                          {s}
                                      </div>
                                  </div>
                                  {i < steps.length - 1 && (
                                      <div className={`line ${i < doneIndex ? 'done' : ''}`} style={{ 
                                          flex: 1, height: '4px', background: i < doneIndex ? 'var(--green)' : '#e2e8f0', 
                                          marginLeft: '-25px', marginRight: '-25px', zIndex: 1, borderRadius: '2px', position: 'relative', top: '-10px'
                                      }}></div>
                                  )}
                              </div>
                          ))}
                      </div>

                      <div style={{ marginTop: '20px', display: 'flex', gap: '8px', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                          {o.status === 'Vendor Confirmed' && (
                              <button className="btn outline" style={{ fontSize: '12px', padding: '6px 12px' }} onClick={() => simulateProgress(o.id, 'In Transit')}>⏩ Simulate Dispatch</button>
                          )}
                          {o.status === 'In Transit' && (
                              <button className="btn green" style={{ fontSize: '12px', padding: '6px 12px' }} onClick={() => simulateProgress(o.id, 'Delivered')}>📦 Mark Delivered</button>
                          )}
                          <button className="btn outline" style={{ fontSize: '12px', padding: '6px 12px' }} onClick={() => navigate('/dashboard/delivery')}>📋 View Receipt (MRN)</button>
                      </div>
                  </div>
              )
          })
      )}
    </div>
  );
}
