import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Layout from './components/Layout';
import Overview from './views/Overview';
import Delivery from './views/Delivery';
import Planning from './views/Planning';
import Forecasting from './views/Forecasting';
import Vendors from './views/Vendors';
import Orders from './views/Orders';
import Approval from './views/Approval';
import Tracking from './views/Tracking';
import Budget from './views/Budget';
import Inventory from './views/Inventory';
import Quality from './views/Quality';
import Consumption from './views/Consumption';
import Market from './views/Market';
import Alerts from './views/Alerts';
import Reports from './views/Reports';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        
        <Route path="/dashboard" element={<Layout />}>
          <Route index element={<Overview />} />
          <Route path="planning" element={<Planning />} />
          <Route path="delivery" element={<Delivery />} />
          <Route path="forecast" element={<Forecasting />} />
          <Route path="vendors" element={<Vendors />} />
          <Route path="orders" element={<Orders />} />
          <Route path="approval" element={<Approval />} />
          <Route path="tracking" element={<Tracking />} />
          <Route path="budget" element={<Budget />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="quality" element={<Quality />} />
          <Route path="consumption" element={<Consumption />} />
          <Route path="market" element={<Market />} />
          <Route path="alerts" element={<Alerts />} />
          <Route path="reports" element={<Reports />} />
          {/* Add more specific routes later as we migrate the views */}
          <Route path="*" element={<div className="card">Under Construction</div>} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
