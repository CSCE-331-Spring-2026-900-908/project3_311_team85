/**
 * Cashier View Component
 * Point-of-sale interface for cashiers to process customer orders
 * Features quick-add menu items and real-time order ticket management
 */

// Import React hook for state management
import { useState } from 'react';

// Mock menu data for demonstration purposes
// In a real application, this would come from an API or database
const mockMenu = [
  { id: 1, name: 'Classic Milk Tea', price: 4.50 },
  { id: 2, name: 'Brown Sugar Boba', price: 5.50 },
  { id: 3, name: 'Taro Slush', price: 5.25 },
  { id: 4, name: 'Matcha Latte', price: 5.00 },
];

/**
 * CashierView component - POS interface for order processing
 * Provides intuitive interface for cashiers to quickly add items and manage orders
 */
export default function CashierView() {
  // State to track items in the current order ticket
  const [orderTicket, setOrderTicket] = useState([]);

  // Function to add an item to the order ticket
  const addItem = (item) => setOrderTicket([...orderTicket, item]);
  
  // Function to clear the entire order ticket
  const clearTicket = () => setOrderTicket([]);
  
  // Calculate total price of all items in the ticket
  const total = orderTicket.reduce((sum, item) => sum + item.price, 0);

  return (
    // Main container with flexbox layout for side-by-side sections
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'sans-serif', backgroundColor: '#eef2f3' }}>
      {/* Quick Add Menu Section - takes 3/4 of the width */}
      <div style={{ flex: 3, padding: '20px' }}>
        <h2>Cashier Terminal</h2>
        {/* Grid of menu item buttons for quick selection */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {mockMenu.map((item) => (
            // Menu item button with click handler to add to ticket
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

      {/* Ticket Sidebar Section - takes 1/4 of the width */}
      <div style={{ flex: 1, padding: '20px', backgroundColor: 'white', borderLeft: '1px solid #ccc', display: 'flex', flexDirection: 'column' }}>
        <h2>Current Ticket</h2>
        {/* Scrollable area for order items */}
        <div style={{ flexGrow: 1, border: '1px solid #eee', padding: '10px', marginBottom: '10px', overflowY: 'auto' }}>
          {orderTicket.map((item, idx) => (
            // Individual order item with name and price
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}>
              <span>{item.name}</span>
              <span>${item.price.toFixed(2)}</span>
            </div>
          ))}
        </div>
        {/* Order total display */}
        <h3>Total: ${total.toFixed(2)}</h3>
        {/* Action buttons for voiding and submitting orders */}
        <div style={{ display: 'flex', gap: '10px' }}>
          {/* Void button - clears the ticket */}
          <button onClick={clearTicket} style={{ flex: 1, padding: '15px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            Void
          </button>
          {/* Submit Order button - processes the order */}
          <button onClick={clearTicket} style={{ flex: 2, padding: '15px', backgroundColor: '#22c55e', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            Submit Order
          </button>
        </div>
      </div>
    </div>
  );
}