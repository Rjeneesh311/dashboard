import { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    // In demo mode without strict auth, let's allow "fake" login if supabase connection fails or users aren't seeded yet
    try {
      if (!email) {
         setError("Please select a demo account or enter your email");
         setLoading(false);
         return;
      }
      
      const { error: sbError } = await supabase.auth.signInWithPassword({
        email,
        password: password || 'password123',
      });
      
      if (sbError) throw sbError;
      
      navigate('/dashboard');
    } catch (err) {
      console.warn("Real auth failed, falling back to demo login for prototype...", err);
      // Fallback for prototype: just jump to dashboard and pretend it worked
      // The role info can be passed or stored in localStorage for the prototype
      localStorage.setItem('demo_email', email);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fillLogin = (demoName, demoEmail, demoRole) => {
    setEmail(demoEmail);
    setPassword('password123');
    localStorage.setItem('demo_name', demoName);
    localStorage.setItem('demo_role', demoRole);
  };

  return (
    <div className="login-wrapper">
      <div className="login-logo">
        <img src="https://www.gujaratmetrorail.com/favicon.ico" alt="GMRCL Logo" />
        <h1 style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.5px' }}>MRP Dashboard</h1>
        <div style={{ fontSize: '13px', opacity: 0.8, marginTop: '4px' }}>Material Requirement & Procurement</div>
      </div>
      
      <div className="login-card">
        <h2>Welcome back</h2>
        <p>Sign in to access the procurement dashboard</p>
        
        {error && <div style={{ color: '#ef4444', fontSize: '12px', marginBottom: '12px', padding: '8px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '6px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>{error}</div>}
        
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email Address</label>
            <input 
              type="email" 
              className="input" 
              placeholder="you@company.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="form-group" style={{ marginTop: '16px' }}>
            <label>Password</label>
            <input 
              type="password" 
              className="input" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="btn primary" style={{ width: '100%', marginTop: '24px', padding: '12px', fontSize: '14px', justifyContent: 'center' }} disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In \u2192'}
          </button>
        </form>

        <div className="demo-accounts">
          <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.5px' }}>Demo Accounts — Click to auto-fill</div>
          
          <div className="demo-acc" onClick={() => fillLogin('Rajesh Raiyani', 'admin.ahmmetro@mrp.com', 'Admin')}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '13px', color: '#f8fafc', marginBottom: '2px' }}>Rajesh Raiyani</div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>admin.ahmmetro@mrp.com</div>
            </div>
            <span style={{ background: 'rgba(234,179,8,0.2)', color: '#fde047', border: '1px solid rgba(234,179,8,0.3)', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 600 }}>Admin</span>
          </div>
          <div className="demo-acc" onClick={() => fillLogin('Raiyani Jeneesh', 'pm.ahmmetro@mrp.com', 'Project Manager')}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '13px', color: '#f8fafc', marginBottom: '2px' }}>Raiyani Jeneesh</div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>pm.ahmmetro@mrp.com</div>
            </div>
            <span style={{ background: 'rgba(34,197,94,0.2)', color: '#86efac', border: '1px solid rgba(34,197,94,0.3)', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 600 }}>Project Manager</span>
          </div>
          <div className="demo-acc" onClick={() => fillLogin('Suresh Verma', 'store.ahmmetro@mrp.com', 'Store Manager')}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '13px', color: '#f8fafc', marginBottom: '2px' }}>Suresh Verma</div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>store.ahmmetro@mrp.com</div>
            </div>
            <span style={{ background: 'rgba(20,184,166,0.2)', color: '#5eead4', border: '1px solid rgba(20,184,166,0.3)', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 600 }}>Store Mgr</span>
          </div>
        </div>
      </div>
    </div>
  );
}
