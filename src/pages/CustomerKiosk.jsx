import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TextSizeToggle from '../components/TextSizeToggle';
import { useI18n } from '../i18n/I18nProvider';
import { useA11y } from '../a11y/A11yProvider';

export default function CustomerKiosk() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const { textSize } = useA11y();
  
  const baseFontSize = textSize === 'large' ? '1.2em' : '1em';
  
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await fetch('/api/menu');
        if (!response.ok) throw new Error('Network response was not ok');
        
        const data = await response.json();
        setMenuItems(data);
      } catch (error) {
        console.error('Error fetching menu:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, []);

  const addToCart = (item) => {
    setCart([...cart, item]);
  };

  const removeFromCart = (indexToRemove) => {
    setCart(cart.filter((_, index) => index !== indexToRemove));
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + Number(item.price), 0).toFixed(2);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto', fontSize: baseFontSize }}>
      <TextSizeToggle />
      <button 
        onClick={() => navigate('/')} 
        style={{ marginBottom: '20px', padding: '10px 15px', cursor: 'pointer', backgroundColor: '#f0f0f0', border: '1px solid #ccc', borderRadius: '5px' }}
      >
        ← {t('common.backToPortal')}
      </button>

      <div style={{ display: 'flex', gap: '40px' }}>
        <div style={{ flex: '2' }}>
          <h1>{t('customer.title')}</h1>
          {loading ? (
            <p>{t('common.loading')}</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
              {menuItems.map((item) => (
                <div 
                  key={item.id} 
                  onClick={() => addToCart(item)}
                  style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px', cursor: 'pointer', textAlign: 'center', backgroundColor: '#fafafa', transition: '0.2s' }}
                >
                  <h3 style={{ margin: '0 0 10px 0' }}>{item.item_name}</h3>
                  <strong style={{ color: '#2c3e50' }}>${Number(item.price).toFixed(2)}</strong>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ flex: '1', backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px', border: '1px solid #eee', height: 'fit-content' }}>
          <h2>{t('customer.yourOrder')}</h2>
          {cart.length === 0 ? (
            <p style={{ color: '#888' }}>{t('customer.emptyCart')}</p>
          ) : (
            <>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px 0' }}>
                {cart.map((item, index) => (
                  <li key={index} style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 80px 30px', 
                    alignItems: 'center', 
                    marginBottom: '10px', 
                    borderBottom: '1px solid #ddd', 
                    paddingBottom: '10px',
                    gap: '10px'
                  }}>
                    <span style={{ textAlign: 'left' }}>{item.item_name}</span>
                    <span style={{ textAlign: 'right' }}>${Number(item.price).toFixed(2)}</span>
                    <button 
                      onClick={() => removeFromCart(index)} 
                      style={{ 
                        background: '#e65a5a', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '50%', 
                        width: '24px', 
                        height: '24px', 
                        cursor: 'pointer', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        fontWeight: 'bold',
                        padding: 0,
                        marginLeft: 'auto'
                      }}
                      aria-label={`Remove ${item.item_name} from cart`}
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.4em', fontWeight: 'bold', marginBottom: '20px' }}>
                <span>{t('customer.total')}:</span>
                <span>${calculateTotal()}</span>
              </div>
              <button style={{ width: '100%', padding: '15px', backgroundColor: '#5c9c5f', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1.2em', cursor: 'pointer', fontWeight: 'bold' }}>
                {t('customer.payNow')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}