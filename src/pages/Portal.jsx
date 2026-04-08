import { Link } from 'react-router-dom';
import LanguageToggle from '../components/LanguageToggle';
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
    }
  };

  return (
    <div style={styles.container}>
      <LanguageToggle />
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