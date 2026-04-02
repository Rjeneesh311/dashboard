import { useState, useEffect } from 'react';
import { MOCK_DATA } from '../data/mockData';
import { supabase } from '../services/supabaseClient';
import { jsPDF } from 'jspdf';

export default function Reports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulating API fetch
    const timer = setTimeout(() => {
      const tb = MOCK_DATA.materials.reduce((s, m) => s + m.reqQty * m.rate, 0); 
      const ts = MOCK_DATA.materials.reduce((s, m) => s + m.procQty * m.rate, 0);
      const activePOs = MOCK_DATA.pos.length;
      
      const approvedCount = MOCK_DATA.pos.filter(p => ['Approved', 'Sent to Vendor', 'Vendor Confirmed', 'Delivered'].includes(p.status)).length;
      const pe = activePOs > 0 ? Math.round((approvedCount / activePOs) * 100) : 0;
      
      const issues = MOCK_DATA.pos.filter(p => p.status === 'Rejected').length;
      
      setData({
        tb,
        ts,
        pe,
        activePOs,
        vendorsCount: MOCK_DATA.vendors.length,
        issues,
      });
      setLoading(false);
    }, 450);

    return () => clearTimeout(timer);
  }, []);

  const handleExport = async (type) => {
    if (type === 'Printable PDF') {
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text("GMRCL Procurement Analytics Report", 20, 20);
        doc.setFontSize(12);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 30);
        doc.text(`Total Budget: ${data.tb}`, 20, 40);
        doc.text(`Total Spent: ${data.ts}`, 20, 50);
        doc.text(`Active POs: ${data.activePOs}`, 20, 60);
        doc.text(`Efficiency: ${data.pe}%`, 20, 70);
        
        const blob = doc.output('blob');
        const fileName = `weekly-report-${Date.now()}.pdf`;
        
        try {
            const { data: uploadData, error } = await supabase
                .storage
                .from('reports')
                .upload(fileName, blob, {
                    contentType: 'application/pdf',
                    upsert: true
                });
                
            if (error) {
                console.error("Storage Error:", error);
                alert("Supabase Error: Please create a public bucket named 'reports' in your Supabase dashboard first!");
            } else {
                const { data: { publicUrl } } = supabase.storage.from('reports').getPublicUrl(fileName);
                alert(`PDF Generated & Uploaded to Supabase Successfully!\nURL: ${publicUrl}`);
                window.open(publicUrl, '_blank');
            }
        } catch (e) {
            console.error(e);
            alert("Upload failed.");
        }
    } else {
        alert(`${type} Report Exported for further analysis.`);
    }
  };

  if (loading || !data) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Reports Engine...</div>;

  const mos = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar']; 
  const currentMonthSpend = Math.round(data.ts / 100000); // Scaled for mock display
  const tr = [12, 18, 25, 22, 30, currentMonthSpend]; 
  const maxT = Math.max(...tr, 1);

  return (
    <div>
      <div className="section-title" style={{ marginBottom: '16px' }}>📑 Reports & Analytics Dashboard</div>
      
      <div className="kpi-row" style={{ marginBottom: '16px' }}>
        <div className="card kpi green">
          <div className="lbl">Procurement Efficiency</div>
          <div className="val">{data.pe}%</div>
        </div>
        <div className="card kpi blue">
          <div className="lbl">Budget Utilization</div>
          <div className="val">{Math.round((data.ts / data.tb) * 100)}%</div>
        </div>
        <div className="card kpi purple">
          <div className="lbl">Active POs</div>
          <div className="val">{data.activePOs}</div>
        </div>
        <div className="card kpi amber">
          <div className="lbl">Total Vendors</div>
          <div className="val">{data.vendorsCount}</div>
        </div>
        <div className="card kpi red">
          <div className="lbl">Issues</div>
          <div className="val">{data.issues}</div>
        </div>
      </div>

      <div className="grid2" style={{ marginBottom: '16px' }}>
        <div className="card">
          <div className="section-title" style={{ fontSize: '14px', marginBottom: '12px' }}>📈 Procurement Trend (₹ Lakhs/Month)</div>
          <div className="bar-chart" style={{ height: '160px', alignItems: 'flex-end', display: 'flex', gap: '12px', padding: '12px 0' }}>
            {mos.map((m, i) => (
              <div key={i} className="col" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <div 
                  className="bar" 
                  style={{ 
                    height: `${(tr[i] / maxT) * 100}%`, 
                    background: i === 5 ? 'var(--navy)' : '#93c5fd', 
                    width: '100%', 
                    borderRadius: '4px 4px 0 0' 
                  }}
                ></div>
                <div style={{ fontSize: '11px', fontWeight: 600 }}>{tr[i]}L</div>
                <div className="bar-lbl" style={{ fontSize: '11px', color: 'var(--text3)' }}>{m}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="section-title" style={{ fontSize: '14px', marginBottom: '12px' }}>📋 Material Pipeline</div>
          <div style={{ padding: '16px 0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {['Completed', 'On Track', 'In Progress'].map((st, idx) => {
               const cn = MOCK_DATA.materials.filter(m => m.status === st).length; 
               const p = Math.round((cn / MOCK_DATA.materials.length) * 100); 
               const clr = st === 'Completed' ? 'green' : st === 'On Track' ? 'blue' : 'amber';
               return (
                 <div key={idx}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                     <span><span className={`pill ${clr}`}>{st}</span></span>
                     <span>{cn} SKUs ({p}%)</span>
                   </div>
                   <div className="progress" style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px' }}>
                     <div className={`fill ${clr}`} style={{ width: `${p}%`, background: `var(--${clr})`, height: '100%', borderRadius: '4px' }}></div>
                   </div>
                 </div>
               );
            })}
          </div>
        </div>
      </div>

      <div className="grid2" style={{ marginBottom: '16px' }}>
        <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
          <div className="section-title" style={{ fontSize: '14px', padding: '16px', borderBottom: '1px solid var(--border)', margin: 0 }}>
            🏭 Vendor Ranking Leadboard
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr>
                <th style={{ padding: '12px 16px', textAlign: 'left', background: '#f8fafc', borderBottom: '1px solid var(--border)' }}>#</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', background: '#f8fafc', borderBottom: '1px solid var(--border)' }}>Vendor</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', background: '#f8fafc', borderBottom: '1px solid var(--border)' }}>On-Time</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', background: '#f8fafc', borderBottom: '1px solid var(--border)' }}>Quality</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', background: '#f8fafc', borderBottom: '1px solid var(--border)' }}>Score</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_DATA.vendors.sort((a, b) => b.score - a.score).map((v, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 700 }}>{i + 1}</td>
                  <td style={{ padding: '12px 16px', fontWeight: 600 }}>{v.name.split(' ').slice(0, 2).join(' ')}</td>
                  <td style={{ padding: '12px 16px' }}>{v.ontime}%</td>
                  <td style={{ padding: '12px 16px' }}><span className={`pill ${v.quality === 'A' ? 'green' : 'blue'}`}>{v.quality}</span></td>
                  <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--blue)' }}>{v.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="section-title" style={{ fontSize: '14px', marginBottom: '16px' }}>📤 Analytics Export Center</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '8px 0' }}>
            <button className="btn primary" style={{ width: '100%', padding: '10px', justifyContent: 'center' }} onClick={() => handleExport('Daily Flash')}>
               📄 Daily Flash Report
            </button>
            <button className="btn outline" style={{ width: '100%', padding: '10px', justifyContent: 'center', background: '#f8fafc' }} onClick={() => handleExport('Weekly SCM')}>
               📋 Weekly SCM Review
            </button>
            <button className="btn outline" style={{ width: '100%', padding: '10px', justifyContent: 'center', background: '#f8fafc' }} onClick={() => handleExport('Monthly Director')}>
               📑 Monthly Director's Report
            </button>
            
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', display: 'flex', gap: '12px' }}>
              <button className="btn outline" style={{ flex: 1, justifyContent: 'center', background: '#f8fafc' }} onClick={() => handleExport('Raw Excel Data')}>📤 Excel</button>
              <button className="btn outline" style={{ flex: 1, justifyContent: 'center', background: '#f8fafc' }} onClick={() => handleExport('Printable PDF')}>📄 PDF</button>
              <button className="btn outline" style={{ flex: 1, justifyContent: 'center', background: '#f8fafc' }} onClick={() => {window.print()}}>🖨️ Print View</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
