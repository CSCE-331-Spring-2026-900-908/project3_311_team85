import { Link } from 'react-router-dom';

export default function Portal() {
  const styles = {
    container: { textAlign: 'center', padding: '50px', fontFamily: 'sans-serif' },
    grid: { display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap', marginTop: '30px' },
    card: { 
      padding: '30px', 
      border: '1px solid #ccc', 
      borderRadius: '8px', 
      textDecoration: 'none', 
      color: '#333',
      width: '200px',
      transition: 'transform 0.2s'
    }
  };

  return (
    <div style={styles.container}>
      <h1> OCTAGON - System Portal</h1>
      <p>Select your interface to begin.</p>
      
      <div style={styles.grid}>
        <Link to="/manager" style={styles.card}>
          <h2>Manager</h2>
          <p>Desktop / Keyboard & Mouse</p>
        </Link>
        
        <Link to="/cashier" style={styles.card}>
          <h2>Cashier</h2>
          <p>Touchscreen POS</p>
        </Link>
        
        <Link to="/customer" style={styles.card}>
          <h2>Customer Kiosk</h2>
          <p>Self-Service Touchscreen</p>
        </Link>

        <Link to="/menu-board" style={styles.card}>
          <h2>Menu Board</h2>
          <p>Non-Interactive Display</p>
        </Link>
      </div>
    </div>
  );
}