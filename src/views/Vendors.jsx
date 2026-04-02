import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { MOCK_DATA } from '../data/mockData';

export default function Vendors() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [showModal, setShowModal] = useState(false);
  const [viewVendor, setViewVendor] = useState(null); // The vendor to view details for
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editVendorId, setEditVendorId] = useState(null); // Which vendor is being edited
  const [deleteVendorId, setDeleteVendorId] = useState(null); // Which vendor is queued for deletion
  
  // New Vendor Form State
  const [nvName, setNvName] = useState('');
  const [nvLoc, setNvLoc] = useState('');
  const [nvCat, setNvCat] = useState('');
  const [nvContact, setNvContact] = useState('');
  const [nvPhone, setNvPhone] = useState('');
  const [nvEmail, setNvEmail] = useState('');
  const [nvGst, setNvGst] = useState('');
  const [nvFin, setNvFin] = useState('Moderate');

  const role = localStorage.getItem('demo_role') || 'Admin';
  // Admin, Procurement, PM can create/edit vendors
  const canEdit = ['Admin', 'Procurement Team', 'Project Manager'].includes(role);

  useEffect(() => {
    async function fetchVendors() {
      setLoading(true);
      try {
        const { data, error } = await supabase.from('vendors').select('*').order('quality_score', { ascending: false });
        if (!data || data.length === 0 || error) {
          const mapped = MOCK_DATA.vendors.map(v => ({
             id: v.id,
             name: v.name,
             location: v.loc,
             category: v.cat,
             contact_person: v.contact,
             phone: v.phone,
             quality_score: v.score,
             ontime: v.ontime,
             quality: v.quality,
             stars: v.stars,
             financial: v.financial
          }));
          setVendors(mapped.sort((a,b) => b.quality_score - a.quality_score));
        } else {
          const dynamic = data.map(v => ({
             ...v,
             category: v.category || 'General',
             ontime: Math.floor(Math.random() * 20 + 80),
             quality: v.quality_score > 90 ? 'A' : v.quality_score > 80 ? 'A-' : 'B+',
             stars: v.quality_score >= 90 ? 5 : v.quality_score >= 80 ? 4 : 3,
             financial: v.quality_score >= 85 ? 'Strong' : 'Moderate'
          }));
          setVendors(dynamic);
        }
      } catch (err) {
        console.error("Failed to load vendors", err);
      } finally {
        setLoading(false);
      }
    }
    fetchVendors();
  }, []);

  const openAddModal = () => {
      setEditVendorId(null);
      setNvName(''); setNvLoc(''); setNvCat(''); setNvContact('');
      setNvPhone(''); setNvEmail(''); setNvGst(''); setNvFin('Moderate');
      setShowModal(true);
  };

  const openEditModal = (v) => {
      setEditVendorId(v.id);
      setNvName(v.name);
      setNvLoc(v.location || '');
      setNvCat(v.category || '');
      setNvContact(v.contact_person || '');
      setNvPhone(v.phone || '');
      setNvEmail(v.email || '');
      setNvGst(v.gst_number || '');
      setNvFin(v.financial || 'Moderate');
      setShowModal(true);
  };

  const confirmDelete = async () => {
      if (!deleteVendorId) return;
      
      const idToDelete = deleteVendorId;
      setDeleteVendorId(null);
      
      // Optimistic updateto instantly remove it from the visual table
      setVendors(prev => prev.filter(v => v.id !== idToDelete));
      
      try {
          await supabase.from('vendors').delete().eq('id', idToDelete);
      } catch (err) {
          console.error("Failed to delete vendor from DB (RLS/Foreign key error likely)", err);
      }
  };

  const handleSaveVendor = async () => {
      if (isSubmitting) return;
      setIsSubmitting(true);
      
      const vendorPayload = {
          name: nvName || 'Unnamed Vendor',
          gst_number: nvGst || `GST${Date.now()}`,
          location: nvLoc,
          contact_person: nvContact,
          phone: nvPhone,
          email: nvEmail,
          // Only pass quality_score if it's new
      };

      try {
          if (editVendorId) {
              // UPDATE EXISTING
              const { error } = await supabase.from('vendors').update(vendorPayload).eq('id', editVendorId);
              if (error) console.warn("Supabase update failed (RLS likely). Handled locally.");
              
              setVendors(prev => prev.map(v => v.id === editVendorId ? {
                  ...v,
                  ...vendorPayload,
                  category: nvCat || 'General',
                  financial: nvFin
              } : v));

          } else {
              // INSERT NEW
              vendorPayload.quality_score = 90; // Default score
              const { data, error } = await supabase.from('vendors').insert([vendorPayload]).select();
              
              let vendorToAdd = null;
              if (error) {
                  console.warn("Supabase insertion failed (RLS likely). Falling back to local state.", error);
                  vendorToAdd = {
                      ...vendorPayload,
                      id: `V${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                      category: nvCat || 'General',
                      ontime: 100,
                      quality: 'A',
                      stars: 5,
                      financial: nvFin
                  };
              } else if (data && data.length > 0) {
                  vendorToAdd = {
                      ...data[0],
                      category: nvCat || 'General',
                      ontime: 100,
                      quality: 'A',
                      stars: 5,
                      financial: nvFin
                  };
              }

              if (vendorToAdd) {
                  setVendors(prev => [vendorToAdd, ...prev]);
              }
          }
          
          setShowModal(false);
          
      } catch (err) {
          console.error(err);
      } finally {
          setIsSubmitting(false);
      }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Vendor Directory...</div>;

  return (
    <div>
      {/* VENDOR DETAILS MODAL */}
      {viewVendor && (
          <div className="overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.6)', zIndex: 999 }}>
              <div className="card modal" style={{ maxWidth: '400px', width: '90%', position: 'relative' }}>
                  <h3 style={{ marginBottom: '16px', color: 'var(--navy)' }}>{viewVendor.name} Details</h3>
                  <div style={{ fontSize: '13px', lineHeight: '1.8' }}>
                      <p><b>Category:</b> {viewVendor.category}</p>
                      <p><b>Location:</b> {viewVendor.location || 'N/A'}</p>
                      <p><b>Contact:</b> {viewVendor.contact_person || 'N/A'} ({viewVendor.phone || 'No Phone'})</p>
                      <p><b>Email:</b> {viewVendor.email || 'N/A'}</p>
                      <p><b>GST No:</b> {viewVendor.gst_number || 'N/A'}</p>
                      <hr style={{ margin: '12px 0', border: 'none', borderTop: '1px solid var(--border)' }} />
                      <p><b>On-Time Delivery:</b> {viewVendor.ontime}%</p>
                      <p><b>Quality Grade:</b> <span className={`pill ${viewVendor.quality === 'A' ? 'green' : viewVendor.quality === 'A-' ? 'blue' : 'amber'}`}>{viewVendor.quality}</span></p>
                      <p><b>Financial Health:</b> {viewVendor.financial}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '16px' }}>
                      <button className="btn outline" onClick={() => setViewVendor(null)}>Close</button>
                  </div>
              </div>
          </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {deleteVendorId && (
          <div className="overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.6)', zIndex: 1000 }}>
              <div className="card modal" style={{ maxWidth: '350px', width: '90%', position: 'relative', textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', marginBottom: '12px' }}>⚠️</div>
                  <h3 style={{ marginBottom: '8px', color: 'var(--red)' }}>Delete Vendor?</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text3)', marginBottom: '20px' }}>
                      Are you sure you want to completely remove this vendor? This specific action cannot be undone.
                  </p>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button className="btn outline" onClick={() => setDeleteVendorId(null)}>Cancel</button>
                      <button className="btn red" onClick={confirmDelete}>Yes, Delete</button>
                  </div>
              </div>
          </div>
      )}

      {/* ADD/EDIT VENDOR MODAL */}
      {showModal && (
          <div className="overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.6)', zIndex: 999 }}>
              <div className="card modal" style={{ maxWidth: '600px', width: '90%', position: 'relative' }}>
                  <h3 style={{ marginBottom: '16px', color: 'var(--blue)' }}>{editVendorId ? '✏️ Edit Vendor Profile' : '+ Add New Vendor'}</h3>
                  
                  <div className="form-row">
                      <div className="form-group full">
                          <label>Company Name</label>
                          <input placeholder="Vendor company name" value={nvName} onChange={e => setNvName(e.target.value)} />
                      </div>
                  </div>
                  <div className="form-row">
                      <div className="form-group">
                          <label>Location</label>
                          <input placeholder="City, State" value={nvLoc} onChange={e => setNvLoc(e.target.value)} />
                      </div>
                      <div className="form-group">
                          <label>Category</label>
                          <input placeholder="Steel / Cement / etc" value={nvCat} onChange={e => setNvCat(e.target.value)} />
                      </div>
                  </div>
                  <div className="form-row">
                      <div className="form-group">
                          <label>Contact Person</label>
                          <input value={nvContact} onChange={e => setNvContact(e.target.value)} />
                      </div>
                      <div className="form-group">
                          <label>Phone</label>
                          <input placeholder="+91 XXXXX XXXXX" value={nvPhone} onChange={e => setNvPhone(e.target.value)} />
                      </div>
                  </div>
                  <div className="form-row">
                      <div className="form-group">
                          <label>Email</label>
                          <input value={nvEmail} onChange={e => setNvEmail(e.target.value)} />
                      </div>
                      <div className="form-group">
                          <label>GST No.</label>
                          <input value={nvGst} onChange={e => setNvGst(e.target.value)} />
                      </div>
                  </div>
                  <div className="form-row">
                      <div className="form-group">
                          <label>Financial Health</label>
                          <select value={nvFin} onChange={e => setNvFin(e.target.value)}>
                              <option>Strong</option>
                              <option>Moderate</option>
                              <option>Weak</option>
                          </select>
                      </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '16px' }}>
                      <button className="btn outline" onClick={() => setShowModal(false)} disabled={isSubmitting}>Cancel</button>
                      <button className="btn primary" onClick={handleSaveVendor} disabled={isSubmitting}>
                          {isSubmitting ? 'Saving...' : (editVendorId ? 'Save Changes' : 'Add Vendor')}
                      </button>
                  </div>
              </div>
          </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h2 className="section-title" style={{ margin: 0 }}>🏭 Vendor Directory & Scoring</h2>
          {canEdit && <button className="btn primary" onClick={openAddModal}>+ Add Vendor</button>}
      </div>

      <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
          <table style={{ width: '100%', fontSize: '12px' }}>
              <thead>
                  <tr>
                      <th style={{ padding: '12px', borderBottom: '1px solid var(--border)', textAlign: 'left' }}>Vendor</th>
                      <th style={{ padding: '12px', borderBottom: '1px solid var(--border)', textAlign: 'left' }}>Location</th>
                      <th style={{ padding: '12px', borderBottom: '1px solid var(--border)', textAlign: 'left' }}>Category</th>
                      <th style={{ padding: '12px', borderBottom: '1px solid var(--border)', textAlign: 'left' }}>Contact</th>
                      <th style={{ padding: '12px', borderBottom: '1px solid var(--border)', textAlign: 'left' }}>Phone</th>
                      <th style={{ padding: '12px', borderBottom: '1px solid var(--border)', textAlign: 'left' }}>On-Time %</th>
                      <th style={{ padding: '12px', borderBottom: '1px solid var(--border)', textAlign: 'left' }}>Quality</th>
                      <th style={{ padding: '12px', borderBottom: '1px solid var(--border)', textAlign: 'left' }}>Rating</th>
                      <th style={{ padding: '12px', borderBottom: '1px solid var(--border)', textAlign: 'left' }}>Financial</th>
                      <th style={{ padding: '12px', borderBottom: '1px solid var(--border)', textAlign: 'left' }}>Score</th>
                      <th style={{ padding: '12px', borderBottom: '1px solid var(--border)', textAlign: 'center' }}>Actions</th>
                  </tr>
              </thead>
              <tbody>
                  {vendors.map(v => (
                      <tr key={v.id}>
                          <td style={{ padding: '12px', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>{v.name}</td>
                          <td style={{ padding: '12px', borderBottom: '1px solid var(--border)' }}>{v.location}</td>
                          <td style={{ padding: '12px', borderBottom: '1px solid var(--border)' }}>{v.category}</td>
                          <td style={{ padding: '12px', borderBottom: '1px solid var(--border)' }}>{v.contact_person || 'N/A'}</td>
                          <td style={{ padding: '12px', borderBottom: '1px solid var(--border)' }}>{v.phone || 'N/A'}</td>
                          <td style={{ padding: '12px', borderBottom: '1px solid var(--border)' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <div className="progress" style={{ width: '50px' }}>
                                      <div className={`fill ${v.ontime >= 90 ? 'green' : v.ontime >= 80 ? 'blue' : 'amber'}`} style={{ width: `${v.ontime}%` }}></div>
                                  </div>
                                  {v.ontime}%
                              </div>
                          </td>
                          <td style={{ padding: '12px', borderBottom: '1px solid var(--border)' }}>
                              <span className={`pill ${v.quality === 'A' ? 'green' : v.quality === 'A-' ? 'blue' : 'amber'}`}>{v.quality}</span>
                          </td>
                          <td className="stars" style={{ padding: '12px', borderBottom: '1px solid var(--border)', color: '#f59e0b', fontSize: '13px' }}>
                              {'★'.repeat(v.stars) + '☆'.repeat(5 - v.stars)}
                          </td>
                          <td style={{ padding: '12px', borderBottom: '1px solid var(--border)' }}>
                              <span className={`pill ${v.financial === 'Strong' ? 'green' : 'amber'}`}>{v.financial}</span>
                          </td>
                          <td style={{ padding: '12px', borderBottom: '1px solid var(--border)', fontWeight: 700, color: 'var(--blue)' }}>
                              {v.quality_score}/100
                          </td>
                          <td style={{ padding: '12px', borderBottom: '1px solid var(--border)', textAlign: 'center' }}>
                              <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                                  <button className="btn outline" style={{ padding: '3px 6px', fontSize: '10px' }} onClick={() => setViewVendor(v)}>View</button>
                                  {canEdit && (
                                      <>
                                          <button className="btn outline" style={{ padding: '3px 6px', fontSize: '10px', borderColor: 'var(--blue)', color: 'var(--blue)' }} onClick={() => openEditModal(v)}>Edit</button>
                                          <button className="btn outline" style={{ padding: '3px 6px', fontSize: '10px', borderColor: 'var(--red)', color: 'var(--red)' }} onClick={() => setDeleteVendorId(v.id)}>Del</button>
                                      </>
                                  )}
                              </div>
                          </td>
                      </tr>
                  ))}
              </tbody>
          </table>
      </div>

      <div className="card" style={{ marginTop: '16px' }}>
          <h3 className="section-title" style={{ fontSize: '14px', marginBottom: '12px' }}>⚖️ Vendor Scoring Criteria</h3>
          <div className="grid3">
              <div style={{ padding: '12px', background: '#eff6ff', borderRadius: '8px' }}>
                  <div style={{ fontWeight: 600, color: 'var(--blue)', marginBottom: '4px' }}>Price (30%)</div>
                  <div style={{ fontSize: '12px', color: 'var(--text2)' }}>Competitiveness vs market rate</div>
              </div>
              <div style={{ padding: '12px', background: '#f0fdf4', borderRadius: '8px' }}>
                  <div style={{ fontWeight: 600, color: 'var(--green)', marginBottom: '4px' }}>Quality (25%)</div>
                  <div style={{ fontSize: '12px', color: 'var(--text2)' }}>Material testing & grade approvals</div>
              </div>
              <div style={{ padding: '12px', background: '#fefce8', borderRadius: '8px' }}>
                  <div style={{ fontWeight: 600, color: 'var(--amber)', marginBottom: '4px' }}>Delivery (20%)</div>
                  <div style={{ fontSize: '12px', color: 'var(--text2)' }}>On-time delivery track record</div>
              </div>
              <div style={{ padding: '12px', background: '#faf5ff', borderRadius: '8px' }}>
                  <div style={{ fontWeight: 600, color: 'var(--purple)', marginBottom: '4px' }}>Financial (15%)</div>
                  <div style={{ fontSize: '12px', color: 'var(--text2)' }}>Corporate stability & turnover</div>
              </div>
              <div style={{ padding: '12px', background: '#fff1f2', borderRadius: '8px' }}>
                  <div style={{ fontWeight: 600, color: 'var(--red)', marginBottom: '4px' }}>Proximity (10%)</div>
                  <div style={{ fontSize: '12px', color: 'var(--text2)' }}>Logistics variance to WBS sites</div>
              </div>
          </div>
      </div>
    </div>
  );
}
