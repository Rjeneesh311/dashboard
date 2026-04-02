import { useState, useEffect } from 'react';
import { MOCK_DATA } from '../data/mockData';

export default function Inventory() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API fetch
    const timer = setTimeout(() => {
      setMaterials(MOCK_DATA.materials);
      setLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  const handleAction = (msg) => {
    alert(msg);
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Inventory Data...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 className="section-title" style={{ margin: 0 }}>🏪 Inventory & Storekeeping</h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn outline" onClick={() => handleAction('Requirement added to queue')}>📝 Add Requisition</button>
          <button className="btn primary" onClick={() => handleAction('Inventory Report Exported (CSV)')}>📤 Export</button>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
        <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ padding: '12px', borderBottom: '1px solid var(--border)', textAlign: 'left', background: '#f8fafc' }}>Material Name</th>
              <th style={{ padding: '12px', borderBottom: '1px solid var(--border)', textAlign: 'left', background: '#f8fafc' }}>Current Stock</th>
              <th style={{ padding: '12px', borderBottom: '1px solid var(--border)', textAlign: 'left', background: '#f8fafc' }}>Unit</th>
              <th style={{ padding: '12px', borderBottom: '1px solid var(--border)', textAlign: 'left', background: '#f8fafc' }}>Min Level</th>
              <th style={{ padding: '12px', borderBottom: '1px solid var(--border)', textAlign: 'left', background: '#f8fafc' }}>Max Level</th>
              <th style={{ padding: '12px', borderBottom: '1px solid var(--border)', textAlign: 'left', background: '#f8fafc' }}>Current Status</th>
              <th style={{ padding: '12px', borderBottom: '1px solid var(--border)', textAlign: 'left', background: '#f8fafc' }}>Last Updated</th>
              <th style={{ padding: '12px', borderBottom: '1px solid var(--border)', textAlign: 'left', background: '#f8fafc' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {materials.map(m => {
              // Simulating current stock logic from original prototype
              const currentStock = m.procQty - Math.floor(m.procQty * 0.7); 
              const minLevel = Math.floor(m.reqQty * 0.1);
              const maxLevel = Math.floor(m.reqQty * 0.3);
              
              const status = currentStock <= 0 ? 'Out of Stock' : currentStock < minLevel ? 'Critical' : currentStock < minLevel * 1.5 ? 'Low' : 'Adequate';
              const clr = status === 'Adequate' ? 'green' : status === 'Low' ? 'amber' : 'red';

              return (
                <tr key={m.id}>
                  <td style={{ padding: '12px', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>{m.name}</td>
                  <td style={{ padding: '12px', borderBottom: '1px solid var(--border)' }}>{currentStock.toLocaleString()}</td>
                  <td style={{ padding: '12px', borderBottom: '1px solid var(--border)' }}>{m.unit}</td>
                  <td style={{ padding: '12px', borderBottom: '1px solid var(--border)' }}>{minLevel.toLocaleString()}</td>
                  <td style={{ padding: '12px', borderBottom: '1px solid var(--border)' }}>{maxLevel.toLocaleString()}</td>
                  <td style={{ padding: '12px', borderBottom: '1px solid var(--border)' }}>
                    <span className={`pill ${clr}`}>{status}</span>
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid var(--border)', color: 'var(--text3)' }}>Today</td>
                  <td style={{ padding: '12px', borderBottom: '1px solid var(--border)' }}>
                    <button className="btn outline" style={{ padding: '4px 10px', fontSize: '11px' }} onClick={() => handleAction(`Reorder request raised for ${m.name}`)}>
                      🔄 Reorder
                    </button>
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
