import { useState } from 'react';

const mockMenu = [
  { id: 1, name: 'Classic Milk Tea', price: 4.50 },
  { id: 2, name: 'Brown Sugar Boba', price: 5.50 },
  { id: 3, name: 'Taro Slush', price: 5.25 },
  { id: 4, name: 'Matcha Latte', price: 5.00 },
  { id: 5, name: 'Passionfruit Green Tea', price: 4.75 },
  { id: 6, name: 'Thai Tea', price: 4.75 },
];

export default function CustomerKiosk() {
  const [cart, setCart] = useState([]);

  const addToCart = (item) => setCart([...cart, item]);
  const total = cart.reduce((sum, item) => sum + item.price, 0);

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'sans-serif' }}>
      {/* Menu Grid */}
      <div style={{ flex: 2, padding: '20px', backgroundColor: '#f9f9f9' }}>
        <h2>Touch to Order</h2>
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
        <h2>Your Order</h2>
        <div style={{ flexGrow: 1, overflowY: 'auto' }}>
          {cart.length === 0 ? <p>Tap an item to add it.</p> : null}
          {cart.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', margin: '10px 0', fontSize: '18px' }}>
              <span>{item.name}</span>
              <span>${item.price.toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div style={{ borderTop: '2px solid #333', padding: '20px 0' }}>
          <h3>Total: ${total.toFixed(2)}</h3>
          <button style={{ width: '100%', padding: '15px', fontSize: '20px', backgroundColor: '#aa3bff', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
            Pay Now
          </button>
        </div>
      </div>
    </div>
  );
}