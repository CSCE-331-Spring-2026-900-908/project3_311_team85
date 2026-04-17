import { useState } from 'react';

//  test mock data
const mockMenu = [
  { id: 1, name: 'Classic Milk Tea', price: 4.50 },
  { id: 2, name: 'Brown Sugar Boba', price: 5.50 },
  { id: 3, name: 'Taro Slush', price: 5.25 },
  { id: 4, name: 'Matcha Latte', price: 5.00 },
];

export default function CashierView() {
  const [orderTicket, setOrderTicket] = useState([]);

  const addItem = (item) => setOrderTicket([...orderTicket, item]);
  const clearTicket = () => setOrderTicket([]);
  const total = orderTicket.reduce((sum, item) => sum + item.price, 0);

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'sans-serif', backgroundColor: '#eef2f3' }}>
      {/* Quick Add Menu */}
      <div style={{ flex: 3, padding: '20px' }}>
        <h2>Cashier Terminal</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {mockMenu.map((item) => (
            <button 
              key={item.id} 
              onClick={() => addItem(item)}
              style={{ padding: '20px', width: '150px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold'}}
            >
              {item.name}
            </button>
          ))}
        </div>
      </div>

      {/* Ticket Sidebar */}
      <div style={{ flex: 1, padding: '20px', backgroundColor: 'white', borderLeft: '1px solid #ccc', display: 'flex', flexDirection: 'column' }}>
        <h2>Current Ticket</h2>
        <div style={{ flexGrow: 1, border: '1px solid #eee', padding: '10px', marginBottom: '10px', overflowY: 'auto' }}>
          {orderTicket.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}>
              <span>{item.name}</span>
              <span>${item.price.toFixed(2)}</span>
            </div>
          ))}
        </div>
        <h3>Total: ${total.toFixed(2)}</h3>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={clearTicket} style={{ flex: 1, padding: '15px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            Void
          </button>
          <button onClick={clearTicket} style={{ flex: 2, padding: '15px', backgroundColor: '#22c55e', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            Submit Order
          </button>
        </div>
      </div>
    </div>
  );
}