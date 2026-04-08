import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LanguageToggle from '../components/LanguageToggle';
import TextSizeToggle from '../components/TextSizeToggle';
import { useI18n } from '../i18n/I18nProvider';
import { useA11y } from '../a11y/A11yProvider';

export default function CashierView() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const { textSize } = useA11y();
  
  const baseFontSize = textSize === 'large' ? '1.2em' : '1em';
  
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTicket, setCurrentTicket] = useState([]);

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

  const addToTicket = (item) => {
    setCurrentTicket([...currentTicket, item]);
  };

  const clearTicket = () => {
    setCurrentTicket([]);
  };

  const calculateTotal = () => {
    return currentTicket.reduce((total, item) => total + Number(item.price), 0).toFixed(2);
  };

  const handleCheckout = async () => {
    if (currentTicket.length === 0) {
      alert("Cannot checkout an empty ticket!");
      return;
    }

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          total_price: calculateTotal(),
          items: currentTicket 
        }),
      });

      if (!response.ok) throw new Error('Checkout failed');

      const result = await response.json();
      alert(`Success! Order #${result.orderId} processed.`);
      
      clearTicket(); 

    } catch (error) {
      console.error('Error during checkout:', error);
      alert("There was an error processing the order.");
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f4f7f6', fontSize: baseFontSize }}>
      <LanguageToggle />
      <TextSizeToggle />
      
      <button 
        onClick={() => navigate('/')} 
        style={{ width: 'fit-content', marginBottom: '20px', padding: '10px 15px', cursor: 'pointer', backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '5px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
      >
        ← {t('common.backToPortal')}
      </button>

      <div style={{ display: 'flex', gap: '20px', flex: '1', overflow: 'hidden' }}>
        
        <div style={{ flex: '3', overflowY: 'auto', paddingRight: '10px' }}>
          <h2 style={{ marginTop: 0 }}>{t('cashier.title')}</h2>
          {loading ? (
            <p>{t('common.loading')}</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '15px' }}>
              {menuItems.map((item) => (
                <button 
                  key={item.id} 
                  onClick={() => addToTicket(item)}
                  style={{ padding: '20px 10px', fontSize: '1rem', backgroundColor: '#e0e7ff', border: '1px solid #c7d2fe', borderRadius: '8px', cursor: 'pointer', transition: 'background-color 0.2s' }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#c7d2fe'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#e0e7ff'}
                >
                  {item.item_name} <br/>
                  <span style={{ fontSize: '0.9em', color: '#555', marginTop: '5px', display: 'inline-block' }}>
                    ${Number(item.price).toFixed(2)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={{ flex: '1', backgroundColor: '#fff', border: '2px solid #333', borderRadius: '8px', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <div style={{ backgroundColor: '#333', color: '#fff', padding: '15px', textAlign: 'center', fontSize: '1.2rem', fontWeight: 'bold' }}>
            {t('cashier.ticketTitle')}
          </div>
          
          <div style={{ flex: '1', overflowY: 'auto', padding: '15px' }}>
            {currentTicket.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#888', marginTop: '50px' }}>{t('cashier.ticketEmpty')}</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {currentTicket.map((item, index) => (
                  <li key={index} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '1.1rem', borderBottom: '1px dashed #eee', paddingBottom: '8px' }}>
                    <span>{item.item_name}</span>
                    <span>${Number(item.price).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div style={{ borderTop: '2px solid #eee', padding: '20px', backgroundColor: '#f9f9f9', borderBottomLeftRadius: '6px', borderBottomRightRadius: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '20px' }}>
              <span>{t('cashier.total')}:</span>
              <span>${calculateTotal()}</span>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={clearTicket} 
                style={{ flex: '1', padding: '15px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem' }}
              >
                {t('cashier.void')}
              </button>
              <button 
                onClick={handleCheckout} 
                style={{ flex: '2', padding: '15px', backgroundColor: '#22c55e', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem' }}
              >
                {t('cashier.submitOrder')}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}