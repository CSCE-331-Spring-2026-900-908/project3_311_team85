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
  
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#fafafa', 
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontSize: baseFontSize,
      position: 'relative'
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
                color: '#000000',
                fontWeight: '700'
              }}>
                Reveille Bubble Tea
              </h1>
              <p style={{ 
                margin: '2px 0 0 0', 
                fontSize: '0.9em', 
                color: '#000000',
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

      {/* Hero Section */}
      <section style={{ 
        padding: '60px 20px', 
        textAlign: 'center',
        backgroundColor: '#fff',
        borderBottom: '1px solid #ecf0f1'
      }}>
        <h2 style={{ 
          fontSize: '2.5em', 
          color: '#000000', 
          margin: '0 0 15px 0',
          fontWeight: '700'
        }}>
          Welcome to Our System Portal
        </h2>
        <p style={{ 
          fontSize: '1.2em', 
          color: '#000000', 
          margin: '0 0 30px 0',
          maxWidth: '600px',
          marginLeft: 'auto',
          marginRight: 'auto',
          lineHeight: '1.6'
        }}>
          Select your interface to get started. Whether you're managing inventory, taking orders, 
          or browsing our menu, we have the perfect tool for you.
        </p>
      </section>

      {/* Main Navigation Grid */}
      <main style={{ 
        padding: '60px 20px', 
        maxWidth: '1200px', 
        margin: '0 auto' 
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center',
          gap: '25px',
          flexWrap: 'wrap'
        }}>
          {/* Manager Dashboard Card */}
          <Link 
            to="/manager" 
            style={{ 
              textDecoration: 'none',
              color: 'inherit'
            }}
          >
            <div style={{
              backgroundColor: '#fff',
              borderRadius: '12px',
              padding: '25px 20px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              border: '1px solid #ecf0f1',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              width: '220px',
              height: '280px',
              display: 'flex',
              flexDirection: 'column'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.12)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
            }}
          >
            <div style={{
              width: '50px',
              height: '50px',
              backgroundColor: '#3498db',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '15px'
            }}>
              <span style={{ color: '#fff', fontSize: '20px', fontWeight: 'bold' }}>M</span>
            </div>
            <h3 style={{ 
              margin: '0 0 10px 0', 
              fontSize: '1.2em', 
              color: '#000000',
              fontWeight: '600'
            }}>
              {t('portal.manager')}
            </h3>
            <p style={{ 
              margin: '0 0 15px 0', 
              color: '#000000', 
              lineHeight: '1.4',
              fontSize: '0.9em',
              flex: 1
            }}>
              {t('portal.managerDesc')}
            </p>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              color: '#000000',
              fontWeight: '600',
              fontSize: '0.85em'
            }}>
              Access Dashboard
              <span style={{ marginLeft: '5px' }}>»</span>
            </div>
          </div>
          </Link>

          {/* Cashier POS Card */}
          <Link 
            to="/cashier" 
            style={{ 
              textDecoration: 'none',
              color: 'inherit'
            }}
          >
            <div style={{
              backgroundColor: '#fff',
              borderRadius: '12px',
              padding: '25px 20px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              border: '1px solid #ecf0f1',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              width: '220px',
              height: '280px',
              display: 'flex',
              flexDirection: 'column'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.12)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
            }}
          >
            <div style={{
              width: '50px',
              height: '50px',
              backgroundColor: '#27ae60',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '15px'
            }}>
              <span style={{ color: '#fff', fontSize: '20px', fontWeight: 'bold' }}>C</span>
            </div>
            <h3 style={{ 
              margin: '0 0 10px 0', 
              fontSize: '1.2em', 
              color: '#000000',
              fontWeight: '600'
            }}>
              {t('portal.cashier')}
            </h3>
            <p style={{ 
              margin: '0 0 15px 0', 
              color: '#000000', 
              lineHeight: '1.4',
              fontSize: '0.9em',
              flex: 1
            }}>
              {t('portal.cashierDesc')}
            </p>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              color: '#000000',
              fontWeight: '600',
              fontSize: '0.85em'
            }}>
              Start POS
              <span style={{ marginLeft: '5px' }}>»</span>
            </div>
          </div>
          </Link>

          {/* Customer Kiosk Card */}
          <Link 
            to="/customer" 
            style={{ 
              textDecoration: 'none',
              color: 'inherit'
            }}
          >
            <div style={{
              backgroundColor: '#fff',
              borderRadius: '12px',
              padding: '25px 20px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              border: '1px solid #ecf0f1',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              width: '220px',
              height: '280px',
              display: 'flex',
              flexDirection: 'column'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.12)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
            }}
          >
            <div style={{
              width: '50px',
              height: '50px',
              backgroundColor: '#e74c3c',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '15px'
            }}>
              <span style={{ color: '#fff', fontSize: '20px', fontWeight: 'bold' }}>K</span>
            </div>
            <h3 style={{ 
              margin: '0 0 10px 0', 
              fontSize: '1.2em', 
              color: '#000000',
              fontWeight: '600'
            }}>
              {t('portal.customerKiosk')}
            </h3>
            <p style={{ 
              margin: '0 0 15px 0', 
              color: '#000000', 
              lineHeight: '1.4',
              fontSize: '0.9em',
              flex: 1
            }}>
              {t('portal.customerKioskDesc')}
            </p>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              color: '#000000',
              fontWeight: '600',
              fontSize: '0.85em'
            }}>
              Order Now
              <span style={{ marginLeft: '5px' }}>»</span>
            </div>
          </div>
          </Link>

          {/* Menu Board Card */}
          <Link 
            to="/menu-board" 
            style={{ 
              textDecoration: 'none',
              color: 'inherit'
            }}
          >
            <div style={{
              backgroundColor: '#fff',
              borderRadius: '12px',
              padding: '25px 20px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              border: '1px solid #ecf0f1',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              width: '220px',
              height: '280px',
              display: 'flex',
              flexDirection: 'column'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.12)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
            }}
          >
            <div style={{
              width: '50px',
              height: '50px',
              backgroundColor: '#f39c12',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '15px'
            }}>
              <span style={{ color: '#fff', fontSize: '20px', fontWeight: 'bold' }}>M</span>
            </div>
            <h3 style={{ 
              margin: '0 0 10px 0', 
              fontSize: '1.2em', 
              color: '#000000',
              fontWeight: '600'
            }}>
              {t('portal.menuBoard')}
            </h3>
            <p style={{ 
              margin: '0 0 15px 0', 
              color: '#000000', 
              lineHeight: '1.4',
              fontSize: '0.9em',
              flex: 1
            }}>
              {t('portal.menuBoardDesc')}
            </p>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              color: '#000000',
              fontWeight: '600',
              fontSize: '0.85em'
            }}>
              View Menu
              <span style={{ marginLeft: '5px' }}>»</span>
            </div>
          </div>
          </Link>
        </div>
      </main>

    </div>
  );
}