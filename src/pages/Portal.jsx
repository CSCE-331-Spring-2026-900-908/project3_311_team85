import { Link } from 'react-router-dom';
import TextSizeToggle from '../components/TextSizeToggle';
import { useI18n } from '../i18n/I18nProvider';
import { useA11y } from '../a11y/A11yProvider';

/**
 * Portal Component
 * 
 * The main landing page and navigation hub for the restaurant application.
 * Provides access to all major interfaces: Manager Dashboard, Cashier POS,
 * Customer Kiosk, and Menu Board. Features accessibility controls
 * and internationalization support.
 */
export default function Portal() {
  const { t } = useI18n(); // Translation function
  const { textSize } = useA11y(); // Text size from accessibility context
  
  const baseFontSize = `${textSize}em`; // Dynamic font size based on user preference
  
  // Component styles with responsive design and accessibility support
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
      transition: 'transform 0.2s', // Smooth hover animation
      fontSize: baseFontSize
    }
  };

  return (
    <div style={styles.container}>
      {/* Accessibility control for text size adjustment */}
      <TextSizeToggle />
      <h1>{t('portal.title')}</h1>
      <p>{t('portal.selectInterface')}</p>
      
      {/* Navigation Grid - Interface selection cards */}
      <div style={styles.grid}>
        {/* Manager Dashboard Card - Administrative interface */}
        <Link to="/manager" style={styles.card}>
          <h2>{t('portal.manager')}</h2>
          <p>{t('portal.managerDesc')}</p>
        </Link>
        
        {/* Cashier POS Card - Point of sale interface */}
        <Link to="/cashier" style={styles.card}>
          <h2>{t('portal.cashier')}</h2>
          <p>{t('portal.cashierDesc')}</p>
        </Link>
        
        {/* Customer Kiosk Card - Self-service ordering */}
        <Link to="/customer" style={styles.card}>
          <h2>{t('portal.customerKiosk')}</h2>
          <p>{t('portal.customerKioskDesc')}</p>
        </Link>

        {/* Menu Board Card - Digital menu display */}
        <Link to="/menu-board" style={styles.card}>
          <h2>{t('portal.menuBoard')}</h2>
          <p>{t('portal.menuBoardDesc')}</p>
        </Link>
      </div>
    </div>
  );
}