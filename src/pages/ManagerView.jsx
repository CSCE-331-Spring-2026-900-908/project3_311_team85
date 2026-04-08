import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LanguageToggle from '../components/LanguageToggle';
import TextSizeToggle from '../components/TextSizeToggle';
import { useI18n } from '../i18n/I18nProvider';
import { useA11y } from '../a11y/A11yProvider';

export default function ManagerView() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const { textSize } = useA11y();
  
  const baseFontSize = textSize === 'large' ? '1.2em' : '1em';
  
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  // Data State
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('inventory');

  // Fetch Inventory from PostgreSQL
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchInventory = async () => {
      try {
        const response = await fetch('/api/inventory');
        if (!response.ok) throw new Error('Failed to fetch inventory');
        const data = await response.json();
        setInventory(data);
      } catch (error) {
        console.error('Error fetching inventory:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, [isAuthenticated]);

  const handleGoogleLogin = (e) => {
    e.preventDefault();
    setUserEmail('reveille.bubbletea@gmail.com');
    setIsAuthenticated(true);
  };

  // --- STYLES (Matching the provided UI aesthetic) ---
  const styles = {
    page: { backgroundColor: '#fcfcfc', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#333', fontSize: baseFontSize },
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
    table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
    th: { padding: '15px', borderBottom: '2px solid #eaeaea', color: '#4a5568', fontWeight: '600', fontSize: '15px' },
    td: { padding: '15px', borderBottom: '1px solid #f0f0f0', color: '#2d3748', fontSize: '15px' }
  };

  // --- LOGIN SCREEN ---
  if (!isAuthenticated) {
    return (
      <div style={{ ...styles.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ ...styles.card, maxWidth: '400px', width: '100%', textAlign: 'center' }}>
          <h1 style={{ ...styles.mainHeading, fontSize: '32px', marginBottom: '10px' }}>Manager Portal</h1>
          <p style={{ color: '#718096', marginBottom: '30px', lineHeight: '1.6' }}>Please authenticate to access the dashboard securely.</p>
          
          <button onClick={handleGoogleLogin} style={{ width: '100%', padding: '14px', backgroundColor: '#fff', color: '#4a5568', border: '1px solid #cbd5e0', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontWeight: '500', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', transition: 'box-shadow 0.2s' }}>
            <img src="https://www.google.com/favicon.ico" alt="Google Logo" style={{ width: '18px' }} />
            Sign in with Google
          </button>
          <button onClick={() => navigate('/')} style={{ marginTop: '20px', background: 'none', border: 'none', color: '#a0aec0', cursor: 'pointer', fontSize: '14px' }}>
            ← Return to Public Portal
          </button>
        </div>
      </div>
    );
  }

  // --- DASHBOARD SCREEN ---
  return (
    <div style={{ ...styles.page, padding: '60px 20px 120px' }}>
      <LanguageToggle />
      <TextSizeToggle />
      
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={styles.mainHeading}>{t('manager.title')}</h1>

        <div style={styles.card}>
          {activeTab === 'inventory' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '22px', color: '#2d3748', margin: 0 }}>{t('manager.inventoryLevels')}</h2>
                <button style={{ padding: '8px 16px', backgroundColor: '#2b6cb0', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>{t('manager.addItem')}</button>
              </div>
              
              {loading ? (
                <p style={{ textAlign: 'center', color: '#a0aec0', padding: '40px' }}>Loading records...</p>
              ) : (
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>ID</th>
                      <th style={styles.th}>Ingredient Name</th>
                      <th style={styles.th}>Stock Level</th>
                      <th style={styles.th}>Unit</th>
                      <th style={styles.th}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventory.length === 0 ? (
                      <tr><td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: '#a0aec0' }}>No inventory items found.</td></tr>
                    ) : (
                      inventory.map((row) => (
                        <tr key={row.id}>
                          <td style={styles.td}>{row.id}</td>
                          <td style={{ ...styles.td, fontWeight: '500' }}>{row.ingredient_name || row.item_name || row.name || 'Unknown'}</td>
                          <td style={styles.td}>{row.quantity || row.stock || 0}</td>
                          <td style={styles.td}>{row.unit || 'units'}</td>
                          <td style={styles.td}>
                            {(Number(row.quantity) < 10) ? (
                               <span style={{ backgroundColor: '#fed7d7', color: '#c53030', padding: '4px 8px', borderRadius: '4px', fontSize: '13px', fontWeight: '600' }}>Low Stock</span>
                            ) : (
                               <span style={{ backgroundColor: '#c6f6d5', color: '#276749', padding: '4px 8px', borderRadius: '4px', fontSize: '13px', fontWeight: '600' }}>Optimal</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {activeTab === 'menu' && <h2 style={{ textAlign: 'center', color: '#718096', padding: '40px' }}>Menu Management <br/><span style={{fontSize: '16px', fontWeight: 'normal'}}>Coming in Sprint 2</span></h2>}
          {activeTab === 'sales' && <h2 style={{ textAlign: 'center', color: '#718096', padding: '40px' }}>Sales Reports <br/><span style={{fontSize: '16px', fontWeight: 'normal'}}>Coming in Sprint 2</span></h2>}
        </div>
      </div>

      <div style={styles.floatingNav}>
        <button onClick={() => navigate('/')} style={styles.navBtn(false)}>🏠</button>
        <div style={{ width: '1px', height: '20px', backgroundColor: '#e2e8f0' }} />
        <button onClick={() => setActiveTab('inventory')} style={styles.navBtn(activeTab === 'inventory')}>📦 Inventory</button>
        <button onClick={() => setActiveTab('menu')} style={styles.navBtn(activeTab === 'menu')}>📋 Menu</button>
        <button onClick={() => setActiveTab('sales')} style={styles.navBtn(activeTab === 'sales')}>📈 Sales</button>
        <div style={{ width: '1px', height: '20px', backgroundColor: '#e2e8f0' }} />
        <button onClick={() => setIsAuthenticated(false)} style={{ ...styles.navBtn(false), color: '#e53e3e' }}>Sign Out</button>
      </div>

    </div>
  );
}