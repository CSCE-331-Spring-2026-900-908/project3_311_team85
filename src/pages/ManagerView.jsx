import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * ManagerView Component
 * * A comprehensive management dashboard for restaurant operations.
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
  const [menuItems, setMenuItems] = useState([]); // Menu items from database
  const [employees, setEmployees] = useState([]); // Employee data from database
  
  // Sales Report State - Manages sales data filtering and results
  const [salesData, setSalesData] = useState([]); // Sales report results
  const [salesDates, setSalesDates] = useState({ start: '', end: '' }); // Date range filter

  // X/Z Report State - Daily and hourly reporting data
  const [xReport, setXReport] = useState(null); // Hourly breakdown report
  const [zReport, setZReport] = useState(null); // End-of-day summary report

  // Form States
  const [newItem, setNewItem] = useState({ name: '', price: '', ingredients: '' });
  const [newEmployee, setNewEmployee] = useState({ name: '', role: 'Cashier', payRate: '' });

  // Check authentication status on component mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Fetch data when user becomes authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchInventory();
      fetchMenu();
      fetchEmployees();
    }
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

  // --- FETCH HELPERS ---
  const fetchInventory = async () => {
    try {
      const res = await fetch('/api/inventory');
      const data = await res.json();
      setInventory(data);
    } catch (err) { console.error(err); }
  };

  const fetchMenu = async () => {
    try {
      const res = await fetch('/api/menu');
      const data = await res.json();
      setMenuItems(data);
    } catch (err) { console.error(err); }
  };

  const fetchEmployees = async () => {
    try {
      const res = await fetch('/api/employees');
      const data = await res.json();
      setEmployees(data);
    } catch (err) { console.error(err); }
  };

  // --- AUTH HANDLERS ---
  const handleGoogleLogin = () => {
    // Redirect to Google OAuth endpoint
    window.location.href = '/auth/google';
  };

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
    if(!window.confirm("WARNING: Generating a Z-Report closes out the day's financials. Continue?")) return;
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

  // --- FORM HANDLERS ---
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
        fetchMenu();
      }
    } catch (err) { console.error(err); }
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEmployee)
      });
      if (res.ok) {
        alert("Employee added successfully!");
        setNewEmployee({ name: '', role: 'Cashier', payRate: '' });
        fetchEmployees();
      } else { alert("Failed to add employee."); }
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
                        {(Number(row.quantity || row.stock) < 10) ? (
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
              <h2 style={{ fontSize: '22px', color: '#2d3748', margin: '0 0 20px 0' }}>Menu Management</h2>
              
              <div style={{ backgroundColor: '#f9fafb', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '30px' }}>
                <h3 style={{ marginTop: 0, fontSize: '18px' }}>Add Menu Item</h3>
                <form onSubmit={handleAddMenuItem}>
                  <label>Item Name:</label>
                  <input style={styles.input} type="text" required value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} placeholder="e.g., Mango Slush" />
                  
                  <label>Price ($):</label>
                  <input style={styles.input} type="number" step="0.01" required value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value})} placeholder="5.50" />
                  
                  <label>Ingredients (Format: Name, Quantity used per order):</label>
                  <textarea style={{...styles.input, height: '100px'}} required value={newItem.ingredients} onChange={e => setNewItem({...newItem, ingredients: e.target.value})} placeholder="Mango Syrup, 2.0&#10;Ice, 1.5"></textarea>
                  
                  <button type="submit" style={{ padding: '12px 24px', backgroundColor: '#2b6cb0', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Add Item to Database</button>
                </form>
              </div>

              <h3 style={{ fontSize: '18px', marginTop: '20px' }}>Current Menu</h3>
              <table style={styles.table}>
                <thead><tr><th style={styles.th}>ID</th><th style={styles.th}>Drink Name</th><th style={styles.th}>Price</th></tr></thead>
                <tbody>
                  {menuItems.map(item => (
                    <tr key={item.id}>
                      <td style={styles.td}>{item.id}</td><td style={styles.td}><strong>{item.item_name}</strong></td><td style={styles.td}>${Number(item.price).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
                      {xReport.map(r => `${r.hour}:00 - ${r.order_count} orders ($${Number(r.total_sales).toFixed(2)})\n`)}
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

          {/* EMPLOYEES TAB */}
          {activeTab === 'employees' && (
            <div>
              <h2 style={{ fontSize: '22px', color: '#2d3748', margin: '0 0 20px 0' }}>Team Management</h2>
              
              <div style={{ display: 'flex', gap: '25px', alignItems: 'flex-start' }}>
                
                {/* Left Side: Add Employee Card */}
                <div style={{ flex: '1', backgroundColor: '#f7fafc', padding: '25px', borderRadius: '8px', border: '1px solid #e2e8f0', minWidth: '280px' }}>
                  <h3 style={{ marginTop: 0, fontSize: '18px', color: '#2d3748', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', marginBottom: '20px' }}>
                    ➕ Add New Hire
                  </h3>
                  <form onSubmit={handleAddEmployee} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '600', color: '#4a5568' }}>Full Name:</label>
                      <input style={{...styles.input, marginBottom: 0}} type="text" required value={newEmployee.name} onChange={e => setNewEmployee({...newEmployee, name: e.target.value})} placeholder="e.g., John Doe" />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '600', color: '#4a5568' }}>Role:</label>
                      <select style={{...styles.input, marginBottom: 0}} value={newEmployee.role} onChange={e => setNewEmployee({...newEmployee, role: e.target.value})}>
                        <option value="Cashier">Cashier</option>
                        <option value="Manager">Manager</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '600', color: '#4a5568' }}>Hourly Rate ($):</label>
                      <input style={{...styles.input, marginBottom: 0}} type="number" step="0.50" required value={newEmployee.payRate} onChange={e => setNewEmployee({...newEmployee, payRate: e.target.value})} placeholder="15.00" />
                    </div>
                    <button type="submit" style={{ padding: '12px', marginTop: '10px', backgroundColor: '#3182ce', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px', transition: 'background 0.2s' }}>
                      Hire Employee
                    </button>
                  </form>
                </div>

                {/* Right Side: Employees Table */}
                <div style={{ flex: '2', backgroundColor: '#fff', borderRadius: '8px' }}>
                  <table style={{...styles.table, marginTop: 0}}>
                    <thead>
                      <tr>
                        <th style={{...styles.th, paddingTop: '10px'}}>ID</th>
                        <th style={{...styles.th, paddingTop: '10px'}}>Name</th>
                        <th style={{...styles.th, paddingTop: '10px'}}>Role</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employees.length === 0 ? (
                        <tr><td colSpan="4" style={{...styles.td, textAlign: 'center', color: '#718096'}}>No employees found.</td></tr>
                      ) : (
                        employees.map((emp) => (
                          <tr key={emp.id}>
                            <td style={styles.td}>{emp.id}</td>
                            <td style={styles.td}><strong>{emp.name}</strong></td>
                            <td style={styles.td}>
                              <span style={{ backgroundColor: emp.role === 'Manager' ? '#ebf4ff' : '#edf2f7', color: emp.role === 'Manager' ? '#3182ce' : '#4a5568', padding: '4px 8px', borderRadius: '4px', fontSize: '13px', fontWeight: '600' }}>
                                {emp.role}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

              </div>
            </div>
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