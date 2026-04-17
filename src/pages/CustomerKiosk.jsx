import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import TextSizeToggle from '../components/TextSizeToggle';
import { useI18n } from '../i18n/I18nProvider';
import { useA11y } from '../a11y/A11yProvider';

const TOPPINGS = [
  { id: 't1', name: 'Tapioca Boba', price: 0.50 },
  { id: 't2', name: 'Lychee Jelly', price: 0.50 },
  { id: 't3', name: 'Crystal Boba', price: 0.75 },
  { id: 't4', name: 'Cheese Foam', price: 1.00 },
];
const ICE_LEVELS = ['0%', '50%', '100%', '120%'];
const SUGAR_LEVELS = ['0%', '50%', '100%', '120%'];

// Map the modal into a rigid 2D layout for Up/Down arrow navigation
const toppingsRows = [];
for (let i = 0; i < TOPPINGS.length; i += 2) {
  toppingsRows.push(TOPPINGS.slice(i, i + 2).map(t => ({ type: 'TOPPING', value: t })));
}
const modalLayout = [
  ICE_LEVELS.map(level => ({ type: 'ICE', value: level })),
  SUGAR_LEVELS.map(level => ({ type: 'SUGAR', value: level })),
  ...toppingsRows,
  [{ type: 'CONFIRM' }]
];

/**
 * CustomerKiosk Component
 * 
 * A customer-facing ordering interface for self-service ordering.
 * Features menu browsing, cart management, and AI chatbot assistance.
 * Integrates with accessibility features for text size scaling and
 * internationalization for multi-language support.
 */
export default function CustomerKiosk() {
  const navigate = useNavigate();
  const { t } = useI18n(); // Translation function
  const { textSize } = useA11y(); // Text size from accessibility context
  
  const baseFontSize = `${textSize}em`; // Dynamic font size based on user preference
  
  // Component state
  const [menuItems, setMenuItems] = useState([]); // Available menu items from API
  const [loading, setLoading] = useState(true); // Loading state for menu fetch
  const [cart, setCart] = useState([]); // Customer's shopping cart

  // Fetch menu items from API on component mount
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await fetch('/api/menu');
        const data = await response.json();
        setMenuItems(data);
      } catch (error) { console.error('Error fetching menu:', error); } 
      finally { setLoading(false); }
    };
    fetchMenu();
  }, []);

  // Add item to customer's cart
  const addToCart = (item) => {
    setCart([...cart, item]);
  };

  // Remove item from cart by index
  const removeFromCart = (indexToRemove) => {
    setCart(cart.filter((_, index) => index !== indexToRemove));
  };

  // Calculate total price of all items in cart
  const calculateTotal = () => {
    return cart.reduce((total, item) => total + Number(item.price), 0).toFixed(2);
  };

  const removeFromCart = (cartIdToRemove) => setCart(cart.filter(item => item.cartId !== cartIdToRemove));
  const calculateTotal = () => cart.reduce((total, item) => total + item.finalPrice, 0).toFixed(2);

  const handleCheckout = async () => {
    if (cart.length === 0) return alert("Your cart is empty!");
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ total_price: calculateTotal(), items: cart }),
      });
      if (!response.ok) throw new Error('Checkout failed');
      const result = await response.json();
      alert(`Success! Order #${result.orderId} is being prepared.`);
      setCart([]); setFocusArea('MENU'); // Return focus to menu
    } catch (error) { alert("Error submitting order."); }
  };

  const optionBtnStyle = (isSelected, isFocused) => ({
    padding: '15px', borderRadius: '8px', 
    border: isFocused ? '4px solid #aa3bff' : (isSelected ? '2px solid #5c9c5f' : '1px solid #ccc'),
    backgroundColor: isSelected ? '#e8f5e9' : '#fff', 
    cursor: 'pointer', fontWeight: isSelected ? 'bold' : 'normal', fontSize: '1.1em', flex: 1,
    transform: isFocused ? 'scale(1.05)' : 'scale(1)',
    boxShadow: isFocused ? '0 4px 12px rgba(170, 59, 255, 0.3)' : 'none',
    transition: 'all 0.1s'
  });

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto', fontSize: baseFontSize }}>
      {/* Accessibility and AI components */}
      <TextSizeToggle />
      <Chatbot />
      <button 
        onClick={() => navigate('/')} 
        style={{ marginBottom: '20px', padding: '10px 15px', cursor: 'pointer', backgroundColor: '#f0f0f0', border: '1px solid #ccc', borderRadius: '5px' }}
      >
        ← {t('common.backToPortal')}
      </button>

      <div style={{ display: 'flex', gap: '40px' }}>
        {/* Menu Display Section */}
        <div style={{ flex: '2' }}>
          <h1 id="menu-title">{t('customer.title')}</h1>
          <p style={{ color: '#666', marginBottom: '20px' }}>Use Arrow Keys to navigate. Arrow Right from the edge to Pay!</p>
          
          {loading ? <p>{t('common.loading')}</p> : (
            <div ref={gridRef} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
              {menuItems.map((item, index) => {
                const isFocused = focusArea === 'MENU' && index === focusedIndex;
                return (
                  <div 
                    key={item.id} 
                    onClick={() => handleItemTap(item)}
                    style={{ 
                      border: isFocused ? '4px solid #aa3bff' : '1px solid #ddd', 
                      transform: isFocused ? 'scale(1.05)' : 'scale(1)', 
                      padding: '30px 20px', borderRadius: '12px', cursor: 'pointer', textAlign: 'center', 
                      backgroundColor: isFocused ? '#f9f5ff' : '#fff', 
                      boxShadow: isFocused ? '0 8px 15px rgba(170, 59, 255, 0.2)' : '0 4px 6px rgba(0,0,0,0.05)'
                    }}
                  >
                    <h3 style={{ margin: '0 0 15px 0' }}>{item.item_name}</h3>
                    <strong style={{ color: '#2c3e50', fontSize: '1.2em' }}>${Number(item.price).toFixed(2)}</strong>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Shopping Cart Section */}
        <div style={{ flex: '1', backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px', border: '1px solid #eee', height: 'fit-content' }}>
          <h2>{t('customer.yourOrder')}</h2>
          {cart.length === 0 ? (
            <p style={{ color: '#888' }}>{t('customer.emptyCart')}</p>
          ) : (
            <>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px 0', maxHeight: '400px', overflowY: 'auto' }}>
                {cart.map((item) => (
                  <li key={item.cartId} style={{ marginBottom: '15px', borderBottom: '1px dashed #ddd', paddingBottom: '15px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '5px' }}>
                      <strong style={{ fontSize: '1.1em' }}>{item.item_name}</strong>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <strong>${item.finalPrice.toFixed(2)}</strong>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.4em', fontWeight: 'bold', marginBottom: '20px' }}>
                <span>{t('customer.total')}:</span><span>${calculateTotal()}</span>
              </div>
              
              <button 
                onClick={handleCheckout} 
                style={{ 
                  width: '100%', padding: '18px', backgroundColor: '#5c9c5f', color: 'white', 
                  border: focusArea === 'CHECKOUT' ? '4px solid #aa3bff' : 'none', 
                  borderRadius: '8px', fontSize: '1.3em', cursor: 'pointer', fontWeight: 'bold',
                  transform: focusArea === 'CHECKOUT' ? 'scale(1.03)' : 'scale(1)',
                  boxShadow: focusArea === 'CHECKOUT' ? '0 8px 15px rgba(170, 59, 255, 0.4)' : '0 4px 6px rgba(92, 156, 95, 0.3)'
                }}
              >
                {t('customer.payNow')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}