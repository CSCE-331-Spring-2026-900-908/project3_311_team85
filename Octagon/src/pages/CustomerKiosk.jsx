import { useState } from 'react';
import LanguageToggle from '../components/LanguageToggle';
import { useI18n } from '../i18n/I18nProvider';

const mockMenu = [
  { id: 1, name: 'Classic Milk Tea', price: 4.50 },
  { id: 2, name: 'Brown Sugar Boba', price: 5.50 },
  { id: 3, name: 'Taro Slush', price: 5.25 },
  { id: 4, name: 'Matcha Latte', price: 5.00 },
  { id: 5, name: 'Passionfruit Green Tea', price: 4.75 },
  { id: 6, name: 'Thai Tea', price: 4.75 },
];

export default function CustomerKiosk() {
  const { t } = useI18n();
  const [cart, setCart] = useState([]);

  const addToCart = (item) => setCart([...cart, item]);
  const removeItemAt = (index) => setCart((prev) => prev.filter((_, i) => i !== index));
  const total = cart.reduce((sum, item) => sum + item.price, 0);

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'sans-serif', position: 'relative' }}>
      <LanguageToggle />
      {/* Menu Grid */}
      <div style={{ flex: 2, padding: '20px', backgroundColor: '#f9f9f9' }}>
        <h2>{t('customer.title')}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
          {mockMenu.map((item) => (
            <button 
              key={item.id} 
              onClick={() => addToCart(item)}
              style={{ padding: '30px', fontSize: '18px', borderRadius: '12px', border: '1px solid #ddd', cursor: 'pointer', backgroundColor: 'white' }}
            >
              <strong>{item.name}</strong><br/>
              ${item.price.toFixed(2)}
            </button>
          ))}
        </div>
      </div>

      {/* Cart Sidebar */}
      <div style={{ flex: 1, padding: '20px', backgroundColor: '#fff', borderLeft: '2px solid #eee', display: 'flex', flexDirection: 'column' }}>
        <h2>{t('customer.yourOrder')}</h2>
        <div style={{ flexGrow: 1, overflowY: 'auto' }}>
          {cart.length === 0 ? <p>{t('customer.emptyCart')}</p> : null}
          {cart.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '10px 0', fontSize: '18px', gap: '10px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</span>
                <button
                  type="button"
                  onClick={() => removeItemAt(idx)}
                  aria-label={`${t('customer.removeItemAria')}: ${item.name}`}
                  style={{
                    alignSelf: 'flex-start',
                    marginTop: 6,
                    padding: '6px 10px',
                    backgroundColor: 'transparent',
                    color: '#b91c1c',
                    border: '1px solid rgba(185, 28, 28, 0.35)',
                    borderRadius: 10,
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontSize: 14,
                  }}
                >
                  {t('customer.remove')}
                </button>
              </div>
              <span style={{ flexShrink: 0 }}>${item.price.toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div style={{ borderTop: '2px solid #333', padding: '20px 0' }}>
          <h3>{t('customer.total')}: ${total.toFixed(2)}</h3>
          <button style={{ width: '100%', padding: '15px', fontSize: '20px', backgroundColor: '#aa3bff', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
            {t('customer.payNow')}
          </button>
        </div>
      </div>
    </div>
  );
}