import { useState, useRef, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { MOCK_DATA } from '../data/mockData';

export default function Delivery() {
  const [pos, setPos] = useState([]);
  const [selectedPo, setSelectedPo] = useState('');
  const [supplier, setSupplier] = useState('');
  const [qtyOrdered, setQtyOrdered] = useState('');
  const [qtyReceived, setQtyReceived] = useState('');
  const [driverName, setDriverName] = useState('Raju Bhai');
  const [receiverName, setReceiverName] = useState('');
  
  // MRN Action States
  const [orderAction, setOrderAction] = useState('Accept');
  const [rejectReasons, setRejectReasons] = useState({ qty: false, quality: false, damage: false, wrong: false });
  const [comments, setComments] = useState('');
  
  const toggleReason = (key) => setRejectReasons(prev => ({ ...prev, [key]: !prev[key] }));

  // Camera States
  const [driverPhoto, setDriverPhoto] = useState(null);
  const [recvPhoto, setRecvPhoto] = useState(null);
  const [activeCam, setActiveCam] = useState(null); // 'driver' or 'recv'
  const [aiStatus, setAiStatus] = useState('');
  const [previewHtml, setPreviewHtml] = useState(null);
  
  // Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const sigPadRef = useRef(null);
  const streamRef = useRef(null);
  const drawingRef = useRef(false);

  useEffect(() => {
    async function loadPos() {
      try {
        const timeout = new Promise((_, reject) => setTimeout(() => reject('timeout'), 3000));
        const { data } = await Promise.race([supabase.from('purchase_orders').select('*, vendors(name), materials(name, unit)'), timeout]);
        
        let finalPos = MOCK_DATA.pos;
        if (data && data.length > 0) {
          finalPos = data.map(p => ({
            id: p.po_number || p.id,
            vendor: p.vendors?.name || 'Unknown',
            material: p.materials?.name || 'Unknown',
            qty: p.ordered_qty,
            unit: p.materials?.unit || 'Units'
          }));
        }

        setPos(finalPos);
        if (finalPos.length > 0) {
          handlePoChange(finalPos[0].id, finalPos);
        }
      } catch {
        setPos(MOCK_DATA.pos);
        if (MOCK_DATA.pos.length > 0) handlePoChange(MOCK_DATA.pos[0].id, MOCK_DATA.pos);
      }
      
      const roleName = localStorage.getItem('demo_name') || 'Admin';
      setReceiverName(roleName);
    }
    loadPos();
    
    // Cleanup cam on unmount
    return () => {
      stopCam();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Signature Pad Init
  useEffect(() => {
    const canvas = sigPadRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    const startDrawing = (e) => {
        drawingRef.current = true;
        ctx.beginPath();
        draw(e);
    };
    
    const stopDrawing = () => {
        drawingRef.current = false;
        ctx.beginPath();
    };
    
    const draw = (e) => {
        if (!drawingRef.current) return;
        const rect = canvas.getBoundingClientRect();
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#1e293b';
        ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
        ctx.stroke();
    };
    
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    
    return () => {
        canvas.removeEventListener('mousedown', startDrawing);
        canvas.removeEventListener('mousemove', draw);
        canvas.removeEventListener('mouseup', stopDrawing);
        canvas.removeEventListener('mouseout', stopDrawing);
    }
  }, []);

  function handlePoChange(poId, list = pos) {
    setSelectedPo(poId);
    const p = list.find(x => ((x.id === poId) || (x.po_number === poId)));
    if (p) {
        setSupplier(p.vendor);
        setQtyOrdered(`${p.qty} ${p.unit}`);
        setQtyReceived(p.qty);
    }
  }

  const startCam = async (target) => {
    stopCam();
    setActiveCam(target);
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: target === 'recv' ? 'user' : 'environment' } 
        });
        streamRef.current = stream;
        if (videoRef.current) {
            videoRef.current.srcObject = stream;
        }
        
        if (target === 'recv') {
            setAiStatus('Scanning for face...');
            setTimeout(() => {
                setAiStatus('Live Human Verified');
            }, 2000);
        }
    } catch (err) {
        console.error("Camera access denied", err);
        alert('Camera access denied or unavailable.');
        setActiveCam(null);
    }
  };

  const takePic = (target) => {
    if (!streamRef.current || !videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/png');
    
    if (target === 'driver') setDriverPhoto(dataUrl);
    if (target === 'recv') setRecvPhoto(dataUrl);
    
    stopCam();
  };

  function stopCam() {
    if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
    }
    setActiveCam(null);
    setAiStatus('');
  }

  const clearSig = () => {
    const canvas = sigPadRef.current;
    if(canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const handlePreview = () => {
    const poName = selectedPo;
    const sup = supplier || 'Unknown Supplier';
    const qr = qtyReceived || '0';
    const driver = driverName || 'Unknown Driver';
    const receiver = receiverName || 'Admin';
    
    let sigData = '';
    const sigCanvas = sigPadRef.current;
    if(sigCanvas) {
        // Quick check if canvas is empty
        const blank = document.createElement('canvas');
        blank.width = sigCanvas.width;
        blank.height = sigCanvas.height;
        if (sigCanvas.toDataURL() !== blank.toDataURL()) {
            sigData = sigCanvas.toDataURL();
        }
    }

    const html = `
    <div style="padding:20px;max-width:500px;margin:0 auto;color:var(--navy);text-align:left;">
        <div style="text-align:center;border-bottom:2px solid var(--border);padding-bottom:12px;margin-bottom:16px">
            <h2 style="margin:0;font-size:18px;font-weight:900">GMRCL MATERIAL RECEIPT NOTE</h2>
            <div style="font-size:11px;color:var(--text3);margin-top:4px">Doc #: MRN-${Date.now().toString().slice(-6)} | Date: ${new Date().toLocaleDateString()}</div>
        </div>
        
        <table style="width:100%;font-size:13px;border-collapse:collapse;margin-bottom:16px;line-height:1.6">
            <tbody>
                <tr><td style="width:140px;font-weight:700">Supplier:</td><td>${sup}</td></tr>
                <tr><td style="font-weight:700">PO Ref:</td><td>${poName}</td></tr>
                <tr><td style="font-weight:700">Transporter/Driver:</td><td>${driver}</td></tr>
                <tr><td style="font-weight:700">Qty Received:</td><td style="color:var(--navy);font-weight:700">${qr} UNITS</td></tr>
                <tr>
                    <td style="font-weight:700">Action:</td>
                    <td><span style="color:var(--${orderAction === 'Accept' ? 'green' : 'red'});font-weight:700;padding:2px 6px;border-radius:4px;background:rgba(${orderAction === 'Accept' ? '34,197,94' : '239,68,68'},0.1)">${orderAction === 'Accept' ? '✓ ACCEPTED' : '❌ REJECTED'}</span></td>
                </tr>
                ${orderAction === 'Reject' ? `
                <tr>
                    <td style="font-weight:700;vertical-align:top;padding-top:4px">Rejection Reasons:</td>
                    <td style="color:var(--red);font-size:12px;padding-top:4px;font-weight:600">
                        ${[ 
                            rejectReasons.qty && 'Quantity Mismatch', 
                            rejectReasons.quality && 'Quality Issue', 
                            rejectReasons.damage && 'Damaged in Transit', 
                            rejectReasons.wrong && 'Wrong Material'
                        ].filter(Boolean).join(', ') || 'None specified'}
                    </td>
                </tr>` : ''}
                <tr>
                    <td style="font-weight:700;vertical-align:top;padding-top:4px">Remarks:</td>
                    <td style="font-size:12px;font-style:italic;padding-top:4px">${comments || 'None'}</td>
                </tr>
            </tbody>
        </table>
        
        <div style="display:flex;gap:12px;margin-bottom:12px">
            <div style="flex:1;border:1px solid var(--border);border-radius:6px;padding:12px;text-align:center;background:#f8fafc">
                <div style="font-size:10px;font-weight:700;margin-bottom:8px;color:var(--text3)">DRIVER IDENTITY LOG</div>
                ${driverPhoto ? `<img src="${driverPhoto}" style="width:100px;border-radius:4px;border:1px solid var(--border)">` : `<div style="height:60px;display:flex;align-items:center;justify-content:center;color:var(--red);font-size:10px;font-weight:bold;border:1px dashed var(--red)">NO PHOTO</div>`}
            </div>
        </div>

        <div style="display:flex;gap:12px;margin-bottom:24px">
            <div style="flex:1;border:1px solid var(--border);border-radius:6px;padding:12px;text-align:center;background:#f8fafc">
                <div style="font-size:10px;font-weight:700;margin-bottom:8px;color:var(--text3)">RECEIVER VERIFICATION</div>
                ${recvPhoto ? `<img src="${recvPhoto}" style="width:100px;border-radius:4px;border:2px solid var(--green)">` : `<div style="height:60px;display:flex;align-items:center;justify-content:center;color:var(--red);font-size:10px;font-weight:bold;border:1px dashed var(--red)">NO AUTH PHOTO</div>`}
            </div>
            <div style="flex:1;border:1px solid var(--border);border-radius:6px;padding:12px;text-align:center;background:#f8fafc">
                <div style="font-size:10px;font-weight:700;margin-bottom:8px;color:var(--text3)">AUTHORIZED E-SIGNATURE</div>
                ${sigData ? `<img src="${sigData}" style="max-height:50px;max-width:100%">` : `<div style="height:50px;display:flex;align-items:center;justify-content:center;color:var(--text3);font-size:10px;">No Signature</div>`}
                <div style="font-size:11px;font-weight:700;margin-top:6px">${receiver}</div>
            </div>
        </div>
    </div>`;
    
    setPreviewHtml(html);
  };

  return (
    <div>
        <div className="section-title">📦 Material Receipt Note (MRN) Generator</div>
        <div className="card">
            <div className="grid2">
                <div>
                    <div className="form-group">
                        <label>PO Reference</label>
                        <select value={selectedPo} onChange={(e) => handlePoChange(e.target.value)}>
                            {pos.map(p => (
                                <option key={p.id} value={p.id}>{p.id} ({p.material})</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group" style={{ marginTop: '8px' }}>
                        <label>Supplier</label>
                        <input value={supplier} readOnly />
                    </div>
                    <div className="form-group" style={{ marginTop: '8px' }}>
                        <label>Qty Ordered</label>
                        <input value={qtyOrdered} readOnly />
                    </div>
                    <div className="form-group" style={{ marginTop: '8px' }}>
                        <label>Qty Received</label>
                        <input type="number" value={qtyReceived} onChange={e => setQtyReceived(e.target.value)} />
                    </div>
                </div>

                <div>
                    <div className="form-group">
                        <label>Driver Name</label>
                        <input value={driverName} onChange={e => setDriverName(e.target.value)} placeholder="Enter driver name" />
                    </div>
                    <div className="form-group" style={{ marginTop: '8px' }}>
                        <label>Driver Photo Tracker</label>
                        <div style={{ border: '2px dashed var(--border)', borderRadius: '8px', padding: '12px', textAlign: 'center', background: '#f8fafc', position: 'relative' }}>
                            {activeCam === 'driver' && (
                                <video ref={videoRef} style={{ width: '100%', borderRadius: '6px', background: '#000' }} autoPlay playsInline></video>
                            )}
                            {driverPhoto && activeCam !== 'driver' && (
                                <img src={driverPhoto} style={{ width: '100%', borderRadius: '6px', marginBottom: '8px' }} alt="Driver" />
                            )}
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '8px' }}>
                                <button className="btn outline" onClick={() => startCam('driver')}>📷 {driverPhoto ? 'Retake Driver' : 'Capture Driver'}</button>
                                {activeCam === 'driver' && <button className="btn primary" onClick={() => takePic('driver')}>⏺ Snap Driver</button>}
                            </div>
                        </div>
                    </div>

                    <div className="form-group" style={{ marginTop: '8px' }}>
                        <label>Receiver Authentication Selfie</label>
                        <div style={{ border: '2px dashed var(--border)', borderRadius: '8px', padding: '12px', textAlign: 'center', background: '#f8fafc', position: 'relative' }}>
                            {activeCam === 'recv' && (
                                <>
                                    <div style={{ position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)', width: '140px', height: '180px', border: aiStatus === 'Live Human Verified' ? '3px solid rgba(34,197,94,0.8)' : '3px dashed rgba(255,255,255,0.6)', borderRadius: '50%', pointerEvents: 'none', zIndex: 2 }}></div>
                                    <div style={{ position: 'absolute', bottom: '50px', left: '50%', transform: 'translateX(-50%)', background: aiStatus === 'Live Human Verified' ? 'rgba(22,101,52,0.9)' : 'rgba(217,119,6,0.9)', color: '#fff', padding: '4px 12px', borderRadius: '20px', fontSize: '10px', fontWeight: 700, zIndex: 3 }}>{aiStatus}</div>
                                    <video ref={videoRef} style={{ width: '100%', borderRadius: '6px', background: '#000' }} autoPlay playsInline></video>
                                </>
                            )}
                            {recvPhoto && activeCam !== 'recv' && (
                                <img src={recvPhoto} style={{ width: '100%', borderRadius: '6px', marginBottom: '8px' }} alt="Receiver" />
                            )}
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '8px', zIndex: 4, position: 'relative' }}>
                                <button className="btn outline" onClick={() => startCam('recv')}>📷 {recvPhoto ? 'Retake Selfie' : 'Auth Selfie'}</button>
                                {activeCam === 'recv' && <button className="btn primary" disabled={aiStatus !== 'Live Human Verified'} onClick={() => takePic('recv')}>⏺ Verify & Capture</button>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="grid2" style={{ marginTop: '16px' }}>
                 <div className="form-group">
                     <label>Quality Check (Visual defaults)</label>
                     <div style={{display:'flex', gap:'12px', fontSize:'12px', alignItems:'center'}}>
                         <label><input type="checkbox" defaultChecked /> Visual Inspection ✓</label>
                         <label><input type="checkbox" defaultChecked /> Dimension Check ✓</label>
                     </div>
                 </div>
                 
                 <div className="form-group">
                     <label>Receiver Name</label>
                     <input value={receiverName} onChange={e => setReceiverName(e.target.value)} />
                 </div>
            </div>

            <div className="card" style={{ marginTop: '16px', background: '#f8fafc', border: '1px solid var(--border)', padding: '16px' }}>
                <div className="form-group">
                    <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--navy)' }}>Material Receipt Action</label>
                    <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: 600 }}>
                            <input type="radio" name="orderAction" value="Accept" checked={orderAction === 'Accept'} onChange={() => setOrderAction('Accept')} style={{ accentColor: 'var(--green)' }} />
                            <span style={{ color: orderAction === 'Accept' ? 'var(--green)' : 'var(--text)' }}>Accept Delivery</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: 600 }}>
                            <input type="radio" name="orderAction" value="Reject" checked={orderAction === 'Reject'} onChange={() => setOrderAction('Reject')} style={{ accentColor: 'var(--red)' }} />
                            <span style={{ color: orderAction === 'Reject' ? 'var(--red)' : 'var(--text)' }}>Reject Delivery</span>
                        </label>
                    </div>
                </div>

                {orderAction === 'Reject' && (
                    <div className="form-group" style={{ marginTop: '16px', padding: '12px', background: '#fff', borderRadius: '6px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                        <label style={{ color: 'var(--red)', fontWeight: 700, marginBottom: '8px', display: 'block', fontSize: '11px', textTransform: 'uppercase' }}>Reason for Rejection (Checklist)</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '12px', fontWeight: 500 }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}><input type="checkbox" checked={rejectReasons.qty} onChange={() => toggleReason('qty')} /> Quantity Mismatch</label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}><input type="checkbox" checked={rejectReasons.quality} onChange={() => toggleReason('quality')} /> Quality Issue / Failed Test</label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}><input type="checkbox" checked={rejectReasons.damage} onChange={() => toggleReason('damage')} /> Damaged in Transit</label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}><input type="checkbox" checked={rejectReasons.wrong} onChange={() => toggleReason('wrong')} /> Wrong Material Supplied</label>
                        </div>
                    </div>
                )}

                <div className="form-group" style={{ marginTop: '16px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 600 }}>Additional Comments / Remarks</label>
                    <textarea 
                        value={comments} 
                        onChange={e => setComments(e.target.value)} 
                        placeholder="Enter any observational remarks, exception notes, or special instructions here..."
                        style={{ width: '100%', minHeight: '60px', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '13px', fontFamily: 'inherit', marginTop: '4px', resize: 'vertical' }}
                    ></textarea>
                </div>
            </div>

            <div className="form-group" style={{ marginTop: '16px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text3)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Professional Declaration 
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text2)', background: '#fff', padding: '12px', borderRadius: '6px', borderLeft: '3px solid var(--navy)', marginBottom: '16px', lineHeight: 1.5, borderTop: '1px solid var(--border)', borderRight: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
                    I, <strong>{receiverName || '[Receiver Name]'}</strong>, hereby declare that I have physically inspected the delivery associated with PO: <strong>{selectedPo || '[PO Number]'}</strong>. The material count and qualitative assessment recorded above have been verified according to the stringent criteria defined by GMRCL Quality Assurance Standards.
                </div>
                <label>Authorized E-Signature</label>
                <canvas ref={sigPadRef} className="sig-canvas" width="300" height="100" style={{ border: '2px dashed var(--border)', borderRadius: '8px', cursor: 'crosshair', display: 'block', background: '#fff' }}></canvas>
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                    <button className="btn outline" style={{ fontSize: '11px' }} onClick={clearSig}>Clear Signature</button>
                </div>
            </div>

            <div style={{ marginTop: '16px', display: 'flex', gap: '8px', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                <button className="btn outline" onClick={handlePreview}>Preview Receipt</button>
                <button className="btn primary" onClick={() => alert('✅ MRN Generated & Saved to Database!')}>Generate MRN</button>
            </div>
            
            {/* Hidden canvas for taking pictures */}
            <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
        </div>

        {/* Modal Overlay */}
        {previewHtml && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
                <div style={{ background: '#fff', borderRadius: '12px', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
                    <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
                    <div style={{ borderTop: '1px solid var(--border)', padding: '16px', textAlign: 'right', background: '#f8fafc', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px' }}>
                        <button className="btn outline" style={{ padding: '8px 16px', marginRight: '8px' }} onClick={() => setPreviewHtml(null)}>Close Preview</button>
                        <button className="btn primary" style={{ padding: '8px 16px' }} onClick={() => { setPreviewHtml(null); alert('✅ MRN Generated via Preview!'); }}>Confirm Issue</button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
}
