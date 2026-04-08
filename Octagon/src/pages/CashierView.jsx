import { useState } from 'react';
import LanguageToggle from '../components/LanguageToggle';
import TextSizeToggle from '../components/TextSizeToggle';
import { useA11y } from '../a11y/A11yProvider';
import { useI18n } from '../i18n/I18nProvider';

//  test mock data
const mockMenu = [
  { id: 1, name: 'Classic Milk Tea', price: 4.50 },
  { id: 2, name: 'Brown Sugar Boba', price: 5.50 },
  { id: 3, name: 'Taro Slush', price: 5.25 },
  { id: 4, name: 'Matcha Latte', price: 5.00 },
];

export default function CashierView() {
  const { t } = useI18n();
  const { textSize } = useA11y();
  const [orderTicket, setOrderTicket] = useState([]);

  const addItem = (item) => setOrderTicket([...orderTicket, item]);
  const removeItemAt = (index) => setOrderTicket((prev) => prev.filter((_, i) => i !== index));
  const clearTicket = () => setOrderTicket([]);
  const total = orderTicket.reduce((sum, item) => sum + item.price, 0);

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'sans-serif', backgroundColor: '#eef2f3', position: 'relative', fontSize: textSize === 'large' ? '1.125rem' : '1rem', lineHeight: 1.3 }}>
      <LanguageToggle />
      <TextSizeToggle />
      {/* Quick Add Menu */}
      <div style={{ flex: 3, padding: '20px' }}>
        <h2>{t('cashier.title')}</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {mockMenu.map((item) => (
            <button 
              key={item.id} 
              onClick={() => addItem(item)}
              style={{ padding: '20px', width: '150px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              {item.name}
            </button>
          ))}
        </div>
      </div>

      {/* Ticket Sidebar */}
      <div style={{ flex: 1, padding: '20px', backgroundColor: 'white', borderLeft: '1px solid #ccc', display: 'flex', flexDirection: 'column' }}>
        <h2>{t('cashier.ticketTitle')}</h2>
        <div style={{ flexGrow: 1, border: '1px solid #eee', padding: '10px', marginBottom: '10px', overflowY: 'auto' }}>
          {orderTicket.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', gap: '10px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</span>
                <button
                  type="button"
                  onClick={() => removeItemAt(idx)}
                  aria-label={`${t('cashier.removeItemAria')}: ${item.name}`}
                  style={{
                    alignSelf: 'flex-start',
                    marginTop: 4,
                    padding: '4px 8px',
                    backgroundColor: 'transparent',
                    color: '#b91c1c',
                    border: '1px solid rgba(185, 28, 28, 0.35)',
                    borderRadius: 8,
                    cursor: 'pointer',
                    fontWeight: 700,
                  }}
                >
                  {t('cashier.remove')}
                </button>
              </div>
              <span style={{ flexShrink: 0 }}>${item.price.toFixed(2)}</span>
            </div>
          ))}
        </div>
        <h3>{t('cashier.total')}: ${total.toFixed(2)}</h3>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={clearTicket} style={{ flex: 1, padding: '15px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            {t('cashier.void')}
          </button>
          <button onClick={clearTicket} style={{ flex: 2, padding: '15px', backgroundColor: '#22c55e', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            {t('cashier.submitOrder')}
          </button>
        </div>
      </div>
    </div>
  );
}