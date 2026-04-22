import { Link } from 'react-router-dom';
import TextSizeToggle from '../components/TextSizeToggle';
import { useI18n } from '../i18n/I18nProvider';
import { useA11y } from '../a11y/A11yProvider';

export default function Portal() {
  const { t } = useI18n();
  const { textSize } = useA11y();
  
  const baseFontSize = textSize === 'large' ? '1.2em' : '1em';
  
  const styles = {
    container: { textAlign: 'center', padding: '50px', fontFamily: 'sans-serif', fontSize: baseFontSize },
    grid: { display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap', marginTop: '30px' },
    card: { 
      padding: '30px', 
      border: '1px solid #ccc', 
      borderRadius: '8px', 
      textDecoration: 'none', 
      color: '#333',
      width: '200px',
      transition: 'transform 0.2s',
      fontSize: baseFontSize
    }}>
      {/* Header Section */}
      <header style={{ 
        backgroundColor: '#fff', 
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)', 
        padding: '20px 0',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          padding: '0 20px'
        }}>
          {/* Logo and Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <img 
              src="/logo.png" 
              alt="Reveille Bubble Tea Logo" 
              style={{ 
                height: '50px', 
                width: '50px',
                objectFit: 'contain'
              }}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div style={{ display: 'none', alignItems: 'center', justifyContent: 'center', width: '50px', height: '50px', backgroundColor: '#ff6b6b', borderRadius: '10px', color: '#fff', fontWeight: 'bold', fontSize: '20px' }}>
              RB
            </div>
            <div>
              <h1 style={{ 
                margin: 0, 
                fontSize: '1.8em', 
                color: '#2c3e50',
                fontWeight: '700'
              }}>
                Reveille Bubble Tea
              </h1>
              <p style={{ 
                margin: '2px 0 0 0', 
                fontSize: '0.9em', 
                color: '#7f8c8d',
                fontWeight: '400'
              }}>
                Premium Bubble Tea Experience
              </p>
            </div>
          </div>
          
          {/* Accessibility Control */}
          <TextSizeToggle />
        </div>
      </header>

  return (
    <div style={styles.container}>
      <TextSizeToggle />
      <h1>{t('portal.title')}</h1>
      <p>{t('portal.selectInterface')}</p>
      
      <div style={styles.grid}>
        <Link to="/manager" style={styles.card}>
          <h2>{t('portal.manager')}</h2>
          <p>{t('portal.managerDesc')}</p>
        </Link>
        
        <Link to="/cashier" style={styles.card}>
          <h2>{t('portal.cashier')}</h2>
          <p>{t('portal.cashierDesc')}</p>
        </Link>
        
        <Link to="/customer" style={styles.card}>
          <h2>{t('portal.customerKiosk')}</h2>
          <p>{t('portal.customerKioskDesc')}</p>
        </Link>

        <Link to="/menu-board" style={styles.card}>
          <h2>{t('portal.menuBoard')}</h2>
          <p>{t('portal.menuBoardDesc')}</p>
        </Link>
      </div>
    </div>
  );
}