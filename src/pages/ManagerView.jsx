import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * ManagerView Component
 * 
 * A comprehensive management dashboard for restaurant operations.
 * Features inventory management, sales reporting, menu item management,
 * and daily/hourly reports. Requires authentication for access.
 * Integrates with backend APIs for data management and reporting.
 */
export default function ManagerView() {
  const navigate = useNavigate();
  
  // Authentication State - Manages user login status and user information
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Tab Navigation & Data State - Controls which section is active and stores data
  const [activeTab, setActiveTab] = useState('inventory'); // Current active tab
  const [inventory, setInventory] = useState([]); // Inventory items from database
  
  // Sales Report State - Manages sales data filtering and results
  const [salesData, setSalesData] = useState([]); // Sales report results
  const [salesDates, setSalesDates] = useState({ start: '', end: '' }); // Date range filter

  // X/Z Report State - Daily and hourly reporting data
  const [xReport, setXReport] = useState(null); // Hourly breakdown report
  const [zReport, setZReport] = useState(null); // End-of-day summary report

  // New Menu Item State - Form data for adding new menu items
  const [newItem, setNewItem] = useState({ name: '', price: '', ingredients: '' });

  // Check authentication status on component mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Fetch inventory data when user becomes authenticated
  useEffect(() => {
    if (isAuthenticated) fetchInventory();
  }, [isAuthenticated]);

  // Check if user is authenticated with backend
  const checkAuthStatus = async () => {
    try {
      const res = await fetch('/api/auth/status');
      const data = await res.json();
      if (data.authenticated) {
        setIsAuthenticated(true);
        setUser(data.user);
      } else {
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.error('Error checking auth status:', err);
      setIsAuthenticated(false);
    } finally {
      setAuthLoading(false);
    }
  };

  // Fetch current inventory levels from database
  const fetchInventory = async () => {
    try {
      const res = await fetch('/api/inventory');
      const data = await res.json();
      setInventory(data);
    } catch (err) { console.error(err); }
  };

  // Initiate Google OAuth login flow
  const handleGoogleLogin = () => {
    // Redirect to Google OAuth endpoint
    window.location.href = '/auth/google';
  };

  // Handle user logout and redirect to portal
  const handleLogout = async () => {
    try {
      await fetch('/auth/logout');
      setIsAuthenticated(false);
      setUser(null);
      navigate('/');
    } catch (err) {
      console.error('Error logging out:', err);
    }
  };

  // --- REPORTING FUNCTIONS ---
  
  // Generate sales report for selected date range
  const generateSalesReport = async () => {
    if (!salesDates.start || !salesDates.end) {
      alert('Please select both start and end dates');
      return;
    }
    try {
      const res = await fetch(`/api/reports/sales?start=${salesDates.start}&end=${salesDates.end}`);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Sales report error');
      }
      const data = await res.json();
      setSalesData(data);
    } catch (err) {
      console.error('Error fetching sales report:', err);
      alert('Failed to generate sales report: ' + err.message);
    }
  };

  const generateXReport = async () => {
    try {
      const res = await fetch('/api/reports/xreport');
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'X-report error');
      }
      const data = await res.json();
      setXReport(data);
    } catch (err) {
      console.error('Error fetching X-report:', err);
      alert('Failed to generate X-report: ' + err.message);
    }
  };

  const generateZReport = async () => {
    try {
      const res = await fetch('/api/reports/zreport', { method: 'POST' });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Z-report error');
      }
      const data = await res.json();
      setZReport(data.data);
      alert(data.message);
    } catch (err) {
      console.error('Error generating Z-report:', err);
      alert('Failed to generate Z-report: ' + err.message);
    }
  };

  const handleAddMenuItem = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemName: newItem.name,
          price: parseFloat(newItem.price),
          ingredientsText: newItem.ingredients
        })
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        setNewItem({ name: '', price: '', ingredients: '' });
      }
    } catch (err) { console.error(err); }
  };

  // --- STYLES ---
  const styles = {
    page: { backgroundColor: '#fcfcfc', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#333' },
    mainHeading: { fontFamily: 'Georgia, "Times New Roman", serif', fontSize: '36px', textAlign: 'center', marginBottom: '40px', color: '#1a1a1a' },
    card: { backgroundColor: '#fff', borderRadius: '12px', padding: '30px', boxShadow: '0 8px 30px rgba(0,0,0,0.04)', border: '1px solid #f0f0f0' },
    floatingNav: { 
      position: 'fixed', bottom: '30px', left: '50%', transform: 'translateX(-50%)', 
      backgroundColor: '#fff', padding: '10px 20px', borderRadius: '50px', 
      boxShadow: '0 10px 40px rgba(0,0,0,0.1)', border: '1px solid #eaeaea',
      display: 'flex', gap: '15px', alignItems: 'center', zIndex: 1000
    },
    navBtn: (isActive) => ({
      background: isActive ? '#f0f4f8' : 'transparent', color: isActive ? '#2b6cb0' : '#666',
      border: 'none', padding: '10px 15px', borderRadius: '25px', cursor: 'pointer', fontSize: '15px',
      fontWeight: isActive ? '600' : '400', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px'
    }),
    table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left', marginTop: '20px' },
    th: { padding: '15px', borderBottom: '2px solid #eaeaea', color: '#4a5568', fontWeight: '600', fontSize: '15px' },
    td: { padding: '15px', borderBottom: '1px solid #f0f0f0', color: '#2d3748', fontSize: '15px' },
    input: { padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e0', width: '100%', marginBottom: '15px', boxSizing: 'border-box' }
  };

  if (authLoading) {
    return (
      <div style={{ ...styles.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ ...styles.card, maxWidth: '400px', width: '100%', textAlign: 'center' }}>
          <h1 style={{ ...styles.mainHeading, fontSize: '32px', marginBottom: '10px' }}>Manager Portal</h1>
          <p style={{ color: '#718096', marginBottom: '30px', lineHeight: '1.6' }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div style={{ ...styles.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ ...styles.card, maxWidth: '400px', width: '100%', textAlign: 'center' }}>
          <h1 style={{ ...styles.mainHeading, fontSize: '32px', marginBottom: '10px' }}>Manager Portal</h1>
          <p style={{ color: '#718096', marginBottom: '30px', lineHeight: '1.6' }}>Please authenticate to access the dashboard securely.</p>
          <button onClick={handleGoogleLogin} style={{ width: '100%', padding: '14px', backgroundColor: '#fff', color: '#4a5568', border: '1px solid #cbd5e0', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontWeight: '500', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
            <img src="https://www.google.com/favicon.ico" alt="Google Logo" style={{ width: '18px' }} />
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ ...styles.page, padding: '60px 20px 120px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={styles.mainHeading}>Dashboard & Operations</h1>

        <div style={styles.card}>
          
          {/* INVENTORY TAB */}
          {activeTab === 'inventory' && (
            <div>
              <h2 style={{ fontSize: '22px', color: '#2d3748', margin: '0 0 20px 0' }}>Inventory Levels</h2>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Ingredient Name</th>
                    <th style={styles.th}>Stock Level</th>
                    <th style={styles.th}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map((row) => (
                    <tr key={row.id}>
                      <td style={styles.td}>{row.ingredient_name || row.item_name}</td>
                      <td style={styles.td}>{row.quantity || row.stock || 0}</td>
                      <td style={styles.td}>
                        {(Number(row.quantity) < 10) ? (
                           <span style={{ backgroundColor: '#fed7d7', color: '#c53030', padding: '4px 8px', borderRadius: '4px', fontSize: '13px', fontWeight: '600' }}>Low Stock</span>
                        ) : (
                           <span style={{ backgroundColor: '#c6f6d5', color: '#276749', padding: '4px 8px', borderRadius: '4px', fontSize: '13px', fontWeight: '600' }}>Optimal</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* MENU MANAGEMENT TAB */}
          {activeTab === 'menu' && (
            <div>
              <h2 style={{ fontSize: '22px', color: '#2d3748', margin: '0 0 20px 0' }}>Add Menu Item</h2>
              <form onSubmit={handleAddMenuItem}>
                <label>Item Name:</label>
                <input style={styles.input} type="text" required value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} placeholder="e.g., Mango Slush" />
                
                <label>Price ($):</label>
                <input style={styles.input} type="number" step="0.01" required value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value})} placeholder="5.50" />
                
                <label>Ingredients (Format: Name, Quantity used per order):</label>
                <textarea style={{...styles.input, height: '100px'}} value={newItem.ingredients} onChange={e => setNewItem({...newItem, ingredients: e.target.value})} placeholder="Mango Syrup, 2.0&#10;Ice, 1.5"></textarea>
                
                <button type="submit" style={{ padding: '12px 24px', backgroundColor: '#2b6cb0', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Add Item to Database</button>
              </form>
            </div>
          )}

          {/* SALES REPORT TAB */}
          {activeTab === 'sales' && (
            <div>
              <h2 style={{ fontSize: '22px', color: '#2d3748', margin: '0 0 20px 0' }}>Sales Report</h2>
              <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                <input style={styles.input} type="date" value={salesDates.start} onChange={e => setSalesDates({...salesDates, start: e.target.value})} />
                <input style={styles.input} type="date" value={salesDates.end} onChange={e => setSalesDates({...salesDates, end: e.target.value})} />
                <button onClick={generateSalesReport} style={{ padding: '10px 20px', backgroundColor: '#38a169', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', whiteSpace: 'nowrap' }}>Run Report</button>
              </div>
              
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Item Name</th>
                    <th style={styles.th}>Quantity Sold</th>
                    <th style={styles.th}>Total Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {salesData.map((row, idx) => (
                    <tr key={idx}>
                      <td style={styles.td}>{row.item_name}</td>
                      <td style={styles.td}>{row.quantity_sold}</td>
                      <td style={styles.td}>${Number(row.total_revenue).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* X & Z REPORTS TAB */}
          {activeTab === 'reports' && (
            <div>
              <h2 style={{ fontSize: '22px', color: '#2d3748', margin: '0 0 20px 0' }}>End of Day Reports</h2>
              <div style={{ display: 'flex', gap: '20px' }}>
                
                <div style={{ flex: 1, backgroundColor: '#f7fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <button onClick={generateXReport} style={{ width: '100%', padding: '12px', backgroundColor: '#4299e1', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', marginBottom: '15px' }}>Generate X-Report (Hourly)</button>
                  {xReport && (
                    <pre style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '4px', border: '1px solid #cbd5e0', fontSize: '14px' }}>
                      {xReport.map(r => `${r.hour}:00 - ${r.order_count} orders ($${r.total_sales})\n`)}
                    </pre>
                  )}
                </div>

                <div style={{ flex: 1, backgroundColor: '#f7fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <button onClick={generateZReport} style={{ width: '100%', padding: '12px', backgroundColor: '#e53e3e', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', marginBottom: '15px' }}>Generate Z-Report (Close Out)</button>
                  {zReport && (
                    <pre style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '4px', border: '1px solid #cbd5e0', fontSize: '14px' }}>
                      Total Orders: {zReport.total_orders}{'\n'}
                      Gross Revenue: ${Number(zReport.total_revenue).toFixed(2)}{'\n'}
                      Tax (8.25%): ${Number(zReport.taxAmount).toFixed(2)}{'\n'}
                      Net Sales: ${Number(zReport.total_revenue - zReport.taxAmount).toFixed(2)}
                    </pre>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* EMPLOYEES TAB (Placeholder for future Sprint) */}
          {activeTab === 'employees' && (
            <h2 style={{ textAlign: 'center', color: '#718096', padding: '40px' }}>Employee Management<br/><span style={{fontSize: '16px', fontWeight: 'normal'}}>Coming soon</span></h2>
          )}
        </div>
      </div>

      {/* FLOATING BOTTOM NAV */}
      <div style={styles.floatingNav}>
        <button onClick={() => navigate('/')} style={styles.navBtn(false)}>🏠</button>
        <div style={{ width: '1px', height: '20px', backgroundColor: '#e2e8f0' }} />
        <button onClick={() => setActiveTab('inventory')} style={styles.navBtn(activeTab === 'inventory')}>📦 Inventory</button>
        <button onClick={() => setActiveTab('menu')} style={styles.navBtn(activeTab === 'menu')}>📋 Menu</button>
        <button onClick={() => setActiveTab('sales')} style={styles.navBtn(activeTab === 'sales')}>📈 Sales</button>
        <button onClick={() => setActiveTab('reports')} style={styles.navBtn(activeTab === 'reports')}>📊 X/Z Reports</button>
        <button onClick={() => setActiveTab('employees')} style={styles.navBtn(activeTab === 'employees')}>👥 Employees</button>
        <div style={{ width: '1px', height: '20px', backgroundColor: '#e2e8f0' }} />
        {user && <span style={{ fontSize: '14px', color: '#718096' }}>{user.email}</span>}
        <button onClick={handleLogout} style={{ ...styles.navBtn(false), color: '#e53e3e' }}>Sign Out</button>
      </div>
    </div>
  );
}