import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const ROLE_CONFIG = {
    'Admin': { tabs: ['overview', 'planning', 'forecast', 'budget', 'vendors', 'approval', 'orders', 'tracking', 'delivery', 'inventory', 'quality', 'consumption', 'market', 'alerts', 'reports', 'risk'] },
    'Project Manager': { tabs: ['overview', 'planning', 'forecast', 'budget', 'vendors', 'approval', 'orders', 'tracking', 'inventory', 'quality', 'consumption', 'alerts', 'reports', 'risk'] },
    'Procurement Team': { tabs: ['overview', 'planning', 'vendors', 'approval', 'orders', 'tracking', 'delivery', 'market', 'alerts', 'reports'] },
    'QA/QC Engineer': { tabs: ['overview', 'delivery', 'inventory', 'quality', 'alerts', 'reports'] },
    'Site Engineer': { tabs: ['overview', 'planning', 'delivery', 'inventory', 'consumption', 'alerts'] },
    'Store Manager': { tabs: ['overview', 'delivery', 'inventory', 'quality', 'alerts'] }
};

const TAB_LABELS = {
    'overview': 'Dashboard Overview',
    'planning': 'P6 WBS Sync',
    'forecast': 'Demand Forecasting',
    'budget': 'Budget & Cash Flow',
    'vendors': 'Vendor Database',
    'approval': 'Pending Approvals',
    'orders': 'Purchase Orders',
    'tracking': 'Material Tracking',
    'delivery': 'Delivery & Receipt',
    'inventory': 'Inventory Status',
    'quality': 'QA / QC Checks',
    'consumption': 'Site Consumption',
    'market': 'Market Data',
    'alerts': 'Alerts & Actions',
    'reports': 'Reports',
    'risk': 'Risk Analysis'
};

export default function Layout() {
    const navigate = useNavigate();
    const location = useLocation();
    const [timeStr, setTimeStr] = useState('');
    
    // Retrieve mock/prototype credentials since Supabase auth doesn't have real users yet
    const userName = localStorage.getItem('demo_name') || 'Guest User';
    const userRole = localStorage.getItem('demo_role') || 'Admin';
    const initials = userName.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase();
    
    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            const date = now.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
            setTimeStr(`${date} \u2022 ${time}`);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const logout = () => {
        localStorage.clear();
        navigate('/');
    };

    const navTabs = ROLE_CONFIG[userRole]?.tabs || ['overview'];

    return (
        <div id="appContainer" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <div className="topbar">
                <img src="https://www.gujaratmetrorail.com/favicon.ico" alt="GMRCL" style={{ height: '36px', borderRadius: '4px', background: '#fff', padding: '2px' }} onError={(e) => e.target.style.display='none'} />
                <h1>MRP Dashboard - Material Requirement Planning & Procurement System</h1>
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div id="clock" style={{ fontSize: '12px', fontWeight: 500, color: '#cbd5e1', letterSpacing: '0.5px' }}>{timeStr}</div>
                    <div style={{ width: '1px', height: '16px', background: 'rgba(255,255,255,0.2)' }}></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <div id="userInitials" style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#3b82f6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700 }}>{initials}</div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span id="userNameLine" style={{ fontSize: '12px', fontWeight: 600, lineHeight: 1.2 }}>{userName}</span>
                            <span id="userRoleLine" style={{ fontSize: '10px', color: '#cbd5e1', lineHeight: 1.2 }}>{userRole}</span>
                        </div>
                    </div>
                    <button onClick={logout} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', fontSize: '11px', fontWeight: 600, cursor: 'pointer', marginLeft: '8px', padding: '6px 12px', borderRadius: '6px', transition: '0.2s' }} onMouseOver={(e) => e.target.style.background='rgba(239,68,68,0.2)'} onMouseOut={(e) => e.target.style.background='rgba(239,68,68,0.1)'}>Log Out</button>
                </div>
            </div>

            <div className="layout">
                <div className="sidebar" id="sidebar">
                    <div className="sec">Navigation</div>
                    {navTabs.map(tab => (
                        <div 
                            key={tab} 
                            className={`nav ${location.pathname.includes(tab) || (location.pathname === '/dashboard' && tab === 'overview') ? 'active' : ''}`}
                            onClick={() => navigate(`/dashboard/${tab === 'overview' ? '' : tab}`)}
                        >
                            {/* In a real scenario we use Lucide icons here mapped to tabs */}
                            {TAB_LABELS[tab] || tab}
                        </div>
                    ))}
                </div>
                
                <div className="content" id="mainContent">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}
