import { useState } from 'react';

export default function Planning() {
  const [syncState, setSyncState] = useState('idle'); // idle, syncing, complete
  const [progress, setProgress] = useState(0);
  const [log, setLog] = useState('');
  
  const handleSync = () => {
      setSyncState('syncing');
      setProgress(0);
      
      const logs = [
          "Authenticating Planning Engineer tokens...",
          "Downloading WBS Model: GMRCL-CP04-Baseline...",
          "Mapping ERP Materials to Line Activities...",
          "Calculating Schedule Variances...",
          "Analyzing Critical Path Shortages...",
          "Finalizing WBS Linkages..."
      ];
      
      let step = 0;
      let currentProgress = 0;
      
      const interval = setInterval(() => {
          currentProgress += Math.floor(Math.random() * 8) + 3;
          
          if (currentProgress >= 100) {
              clearInterval(interval);
              setProgress(100);
              setTimeout(() => {
                  setSyncState('complete');
              }, 500);
              return;
          }
          
          setProgress(currentProgress);
          
          if (step < logs.length && currentProgress > (step * 16)) {
              setLog(logs[step]);
              step++;
          }
      }, 150);
  };

  return (
    <div>
        <div className="section-title">📅 Primavera P6 WBS Synchronization</div>
        <div className="card">
            <div style={{ padding: '24px', textAlign: 'center', background: '#f8fafc', borderRadius: '8px', border: '2px dashed var(--border)' }}>
                {syncState === 'idle' && (
                    <>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
                        <h3 style={{ color: 'var(--navy)', marginBottom: '8px' }}>Sync WBS with Oracle Primavera P6</h3>
                        <p style={{ color: 'var(--text3)', fontSize: '13px', marginBottom: '24px', maxWidth: '400px', margin: '0 auto 24px auto' }}>
                           Connects directly to the Oracle instance using REST API to extract the latest CP-04 Baseline Schedule WBS activities and map them against available material inventory.
                        </p>
                        <button className="btn primary" style={{ padding: '12px 24px', fontSize: '14px' }} onClick={handleSync}>
                            <span style={{ marginRight: '8px' }}>🔄</span> Start P6 Bi-Directional Sync
                        </button>
                    </>
                )}
                
                {syncState === 'syncing' && (
                    <div style={{ maxWidth: '400px', margin: '0 auto', textAlign: 'center' }}>
                        <div style={{ fontSize: '32px', marginBottom: '16px', animation: 'spin 2s linear infinite' }}>🔄</div>
                        <h3 style={{ color: 'var(--navy)', marginBottom: '8px' }}>Establishing Oracle Connection</h3>
                        <p style={{ color: 'var(--text3)', fontSize: '12px', minHeight: '20px', marginBottom: '16px' }}>{log || 'Initializing tunnel to remote server...'}</p>
                        
                        <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', marginBottom: '8px' }}>
                            <div style={{ height: '100%', width: `${progress}%`, background: 'var(--blue)', transition: 'width 0.2s linear' }}></div>
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--blue)' }}>{progress}%</div>
                    </div>
                )}
                
                {syncState === 'complete' && (
                    <>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
                        <h3 style={{ color: 'var(--green)', marginBottom: '8px' }}>Sync Completed Successfully!</h3>
                        <p style={{ color: 'var(--text3)', fontSize: '13px', marginBottom: '24px' }}>
                           The MRP system has been updated with the latest P6 schedule baseline.<br/>
                           14,233 Line items analyzed. 4 Critical path material alerts generated.
                        </p>
                        <button className="btn outline" onClick={() => setSyncState('idle')}>Acknowledge</button>
                    </>
                )}
            </div>
            
            {syncState === 'complete' && (
                <div style={{ marginTop: '24px' }}>
                     <div className="section-title" style={{ fontSize: '14px' }}>🔔 Post-Sync Critical Insights</div>
                     <table style={{ width: '100%', fontSize: '13px' }}>
                         <thead>
                             <tr>
                                 <th style={{ textAlign: 'left', padding: '12px', borderBottom: '1px solid var(--border)' }}>WBS Activity ID</th>
                                 <th style={{ textAlign: 'left', padding: '12px', borderBottom: '1px solid var(--border)' }}>Description</th>
                                 <th style={{ textAlign: 'left', padding: '12px', borderBottom: '1px solid var(--border)' }}>Constraining Material</th>
                                 <th style={{ textAlign: 'left', padding: '12px', borderBottom: '1px solid var(--border)' }}>Impact</th>
                             </tr>
                         </thead>
                         <tbody>
                             <tr>
                                 <td style={{ padding: '12px', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>C4-VD-054</td>
                                 <td style={{ padding: '12px', borderBottom: '1px solid var(--border)' }}>Pier Cap Concrete Pour (Pier 104)</td>
                                 <td style={{ padding: '12px', borderBottom: '1px solid var(--border)' }}>Ready-Mix Concrete M30</td>
                                 <td style={{ padding: '12px', borderBottom: '1px solid var(--border)' }}><span className="pill red">High - Delay Risk</span></td>
                             </tr>
                             <tr>
                                 <td style={{ padding: '12px', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>C4-UG-012</td>
                                 <td style={{ padding: '12px', borderBottom: '1px solid var(--border)' }}>Tunnel Ring Segment Installation</td>
                                 <td style={{ padding: '12px', borderBottom: '1px solid var(--border)' }}>TMT Steel Bars Fe500D</td>
                                 <td style={{ padding: '12px', borderBottom: '1px solid var(--border)' }}><span className="pill amber">Medium - Replenish Soon</span></td>
                             </tr>
                         </tbody>
                     </table>
                </div>
            )}
        </div>
    </div>
  );
}
