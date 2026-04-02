import { useState, useEffect } from 'react';

// Hardcoded QA data mirroring prototype
const QA_DATA = [
  { id: 'QC-001', mat: 'TMT Steel Fe500D', po: 'PO-2026-002', v: 'Tata Tiscon', batch: 'B-145', st: 'Approved', test: 'Tensile & Bend', dt: '22 Mar', sc: 96 },
  { id: 'QC-002', mat: 'OPC Cement 53', po: 'PO-2026-001', v: 'UltraTech', batch: 'B-290', st: 'Approved', test: 'Setting Time', dt: '25 Mar', sc: 94 },
  { id: 'QC-003', mat: 'Fly Ash Bricks', po: 'PO-2026-006', v: 'HIL Ltd', batch: 'B-412', st: 'Pending', test: 'Compressive', dt: '28 Mar', sc: 0 },
  { id: 'QC-004', mat: 'RMC M30', po: 'PO-2026-007', v: 'UltraTech RMC', batch: 'B-501', st: 'Rejected', test: 'Cube Test 7d', dt: '20 Mar', sc: 42 },
  { id: 'QC-005', mat: 'UPVC Pipes', po: 'PO-2026-003', v: 'Astral', batch: 'B-330', st: 'Approved', test: 'Pressure Test', dt: '26 Mar', sc: 91 },
  { id: 'QC-006', mat: 'Copper Wiring', po: 'PO-2026-005', v: 'Havells', batch: 'B-600', st: 'Approved', test: 'Conductivity', dt: '27 Mar', sc: 98 }
];

export default function Quality() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulating API loading
    const timer = setTimeout(() => {
      setData(QA_DATA);
      setLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading QA/QC Data...</div>;

  const total = data.length;
  const approved = data.filter(q => q.st === 'Approved').length;
  const pending = data.filter(q => q.st === 'Pending').length;
  const rejected = data.filter(q => q.st === 'Rejected').length;
  const passRate = total > 0 ? Math.round((approved / total) * 100) : 0;

  const rejT = [2, 1, 3, 1, rejected]; // Monthly trend mock
  const months = ['Nov', 'Dec', 'Jan', 'Feb', 'Mar'];

  // Calculate vendor quality score averages
  const vs = {};
  data.filter(q => q.sc > 0).forEach(q => {
    if (!vs[q.v]) vs[q.v] = { t: 0, c: 0 };
    vs[q.v].t += q.sc;
    vs[q.v].c += 1;
  });

  return (
    <div>
      <div className="section-title" style={{ marginBottom: '16px' }}>🔬 Quality Control & Inspection</div>
      
      <div className="grid5" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginBottom: '16px' }}>
        <div className="card kpi blue">
          <div className="lbl">Total Inspections</div>
          <div className="val">{total}</div>
        </div>
        <div className="card kpi green">
          <div className="lbl">Approved</div>
          <div className="val">{approved}</div>
        </div>
        <div className="card kpi amber">
          <div className="lbl">Pending</div>
          <div className="val">{pending}</div>
        </div>
        <div className="card kpi red">
          <div className="lbl">Rejected (NCR)</div>
          <div className="val">{rejected}</div>
        </div>
        <div className="card kpi purple">
          <div className="lbl">Pass Rate</div>
          <div className="val">{passRate}%</div>
        </div>
      </div>

      <div className="grid2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        <div className="card">
          <div className="section-title" style={{ fontSize: '14px', marginBottom: '16px' }}>🥧 Pass / Fail Distribution</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', justifyContent: 'center' }}>
            <svg viewBox="0 0 120 120" style={{ width: '120px', transform: 'rotate(-90deg)' }}>
              <circle cx="60" cy="60" r="45" fill="none" stroke="#059669" strokeWidth="18" strokeDasharray={`${(approved/total)*283} 283`} />
              <circle cx="60" cy="60" r="45" fill="none" stroke="#d97706" strokeWidth="18" strokeDasharray={`${(pending/total)*283} 283`} strokeDashoffset={`${-(approved/total)*283}`} />
              <circle cx="60" cy="60" r="45" fill="none" stroke="#dc2626" strokeWidth="18" strokeDasharray={`${(rejected/total)*283} 283`} strokeDashoffset={`${-((approved+pending)/total)*283}`} />
              <text x="-60" y="60" textAnchor="middle" style={{ fontSize: '14px', fontWeight: 700, fill: '#1e3a5f', transform: 'rotate(90deg)', dominantBaseline: 'middle' }}>{passRate}%</text>
            </svg>
            <div style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#059669', display: 'inline-block' }}></span>
                <strong>Approved:</strong> {approved}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#d97706', display: 'inline-block' }}></span>
                <strong>Pending:</strong> {pending}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#dc2626', display: 'inline-block' }}></span>
                <strong>Rejected:</strong> {rejected}
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="section-title" style={{ fontSize: '14px' }}>📈 Rejection Trend</div>
          <div className="bar-chart" style={{ height: '110px', alignItems: 'flex-end', display: 'flex', gap: '10px', padding: '10px 0' }}>
            {months.map((m, i) => {
               const maxRej = Math.max(...rejT, 1);
               const isCurrent = i === 4;
               return (
                <div key={i} className="col" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <div className="bar" style={{ height: `${(rejT[i] / maxRej) * 100}%`, background: isCurrent ? 'var(--red)' : '#fca5a5', width: '100%', borderRadius: '4px 4px 0 0' }}></div>
                  <div style={{ fontSize: '10px', fontWeight: 600 }}>{rejT[i]}</div>
                  <div className="bar-lbl" style={{ fontSize: '10px', color: 'var(--text3)' }}>{m}</div>
                </div>
               );
            })}
          </div>

          <div className="section-title" style={{ fontSize: '12px', marginTop: '16px', marginBottom: '8px' }}>🏭 Quality Score by Vendor</div>
          {Object.entries(vs).map(([v, d]) => {
            const avg = Math.round(d.t / d.c);
            const clr = avg >= 90 ? 'green' : avg >= 70 ? 'blue' : 'red';
            return (
              <div key={v} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', marginBottom: '6px' }}>
                <span style={{ minWidth: '80px', fontWeight: 600, color: 'var(--text2)' }}>{v}</span>
                <div className="progress" style={{ flex: 1, background: '#e2e8f0', borderRadius: '4px', height: '6px' }}>
                  <div className={`fill ${clr}`} style={{ width: `${avg}%`, background: `var(--${clr})`, height: '100%', borderRadius: '4px' }}></div>
                </div>
                <span style={{ fontWeight: 700, minWidth: '35px', textAlign: 'right' }}>{avg}%</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr>
              <th style={{ padding: '12px 16px', textAlign: 'left', background: '#f8fafc', borderBottom: '1px solid var(--border)' }}>QC ID</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', background: '#f8fafc', borderBottom: '1px solid var(--border)' }}>Material</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', background: '#f8fafc', borderBottom: '1px solid var(--border)' }}>PO Ref</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', background: '#f8fafc', borderBottom: '1px solid var(--border)' }}>Vendor</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', background: '#f8fafc', borderBottom: '1px solid var(--border)' }}>Batch</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', background: '#f8fafc', borderBottom: '1px solid var(--border)' }}>Test Mode</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', background: '#f8fafc', borderBottom: '1px solid var(--border)' }}>Date</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', background: '#f8fafc', borderBottom: '1px solid var(--border)' }}>Score</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', background: '#f8fafc', borderBottom: '1px solid var(--border)' }}>Status</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', background: '#f8fafc', borderBottom: '1px solid var(--border)' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {data.map((q, i) => {
              const stClr = q.st === 'Approved' ? 'green' : q.st === 'Pending' ? 'amber' : 'red';
              const scClr = q.sc >= 80 ? 'var(--green)' : q.sc > 0 ? 'var(--red)' : 'var(--text3)';
              
              const act = q.st === 'Pending' ? (
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button className="btn green" style={{ padding: '3px 8px', fontSize: '11px' }} onClick={() => alert(`✓ Approved ${q.id}`)}>✓ Pass</button>
                  <button className="btn red" style={{ padding: '3px 8px', fontSize: '11px' }} onClick={() => alert(`NCR Raised for ${q.id}`)}>NCR</button>
                </div>
              ) : (
                <button className="btn outline" style={{ padding: '3px 8px', fontSize: '11px', color: 'var(--text3)' }}>📄 Report</button>
              );

              return (
                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 600 }}>{q.id}</td>
                  <td style={{ padding: '12px 16px' }}>{q.mat}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--blue)', fontWeight: 500, cursor: 'pointer' }}>{q.po}</td>
                  <td style={{ padding: '12px 16px' }}>{q.v}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--text2)' }}>{q.batch}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--text2)' }}>{q.test}</td>
                  <td style={{ padding: '12px 16px' }}>{q.dt}</td>
                  <td style={{ padding: '12px 16px', fontWeight: 700, color: scClr }}>{q.sc ? `${q.sc}/100` : '-'}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span className={`pill ${stClr}`}>{q.st}</span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>{act}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
