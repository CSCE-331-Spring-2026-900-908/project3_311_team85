import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TextSizeToggle from '../components/TextSizeToggle';
import { useA11y } from '../a11y/A11yProvider';

// Premium toppings available for customization with pricing
const TOPPINGS = [
  { id: 't1', name: 'Tapioca Boba', price: 0.50 },
  { id: 't2', name: 'Lychee Jelly', price: 0.50 },
  { id: 't3', name: 'Crystal Boba', price: 0.75 },
  { id: 't4', name: 'Cheese Foam', price: 1.00 },
];

// Available ice and sugar levels for drink customization
const ICE_LEVELS = ['0%', '50%', '100%', '120%'];
const SUGAR_LEVELS = ['0%', '50%', '100%', '120%'];

/**
 * CashierView Component
 * 
 * A Point of Sale (POS) interface for cashiers to take customer orders.
 * Features menu item selection, customization options (ice, sugar, toppings),
 * ticket management, and checkout functionality. Integrates with backend
 * for menu data and order processing.
 */
export default function CashierView() {
  const navigate = useNavigate();
  const { textSize } = useA11y();
  const baseFontSize = `${textSize}em`;
  
  // Core POS state
  const [menuItems, setMenuItems] = useState([]); // Available menu items from API
  const [loading, setLoading] = useState(true); // Loading state for menu fetch
  const [currentTicket, setCurrentTicket] = useState([]); // Current order items

  // Customization modal state
  const [customizingItem, setCustomizingItem] = useState(null); // Item being customized
  const [currentIce, setCurrentIce] = useState('100%'); // Selected ice level
  const [currentSugar, setCurrentSugar] = useState('100%'); // Selected sugar level
  const [selectedToppings, setSelectedToppings] = useState([]); // Selected premium toppings

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

  // --- CUSTOMIZATION LOGIC ---
  
  // Open customization modal for selected item and reset customization options
  const handleItemTap = (item) => {
    setCustomizingItem(item);
    setCurrentIce('100%');
    setCurrentSugar('100%');
    setSelectedToppings([]);
  };

  // Toggle topping selection - add if not selected, remove if already selected
  const toggleTopping = (topping) => {
    if (selectedToppings.some(t => t.id === topping.id)) {
      setSelectedToppings(selectedToppings.filter(t => t.id !== topping.id));
    } else {
      setSelectedToppings([...selectedToppings, topping]);
    }
  };

  // Add customized item to current ticket with all modifications and calculated price
  const confirmCustomization = () => {
    const toppingTotal = selectedToppings.reduce((sum, t) => sum + t.price, 0);
    const finalPrice = Number(customizingItem.price) + toppingTotal;

    const ticketItem = {
      ...customizingItem,
      ticketId: Date.now() + Math.random(), // Unique identifier for ticket item
      ice: currentIce,
      sugar: currentSugar,
      toppings: selectedToppings,
      finalPrice: finalPrice
    };

    setCurrentTicket([...currentTicket, ticketItem]);
    setCustomizingItem(null);
  };

  // Remove specific item from ticket by ID
  const removeFromTicket = (ticketIdToRemove) => {
    setCurrentTicket(currentTicket.filter(item => item.ticketId !== ticketIdToRemove));
  };

  // Clear all items from current ticket
  const clearTicket = () => setCurrentTicket([]);

  // Calculate total price of all items in current ticket
  const calculateTotal = () => currentTicket.reduce((total, item) => total + item.finalPrice, 0).toFixed(2);

  // --- CHECKOUT ---
  
  // Process order by sending ticket data to backend for payment and inventory updates
  const handleCheckout = async () => {
    // Prevent checkout if ticket is empty
    if (currentTicket.length === 0) return alert("Cannot checkout an empty ticket!");

    try {
      // Send ticket data to backend for processing
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          total_price: calculateTotal(),
          items: currentTicket 
        }),
      });

      // Handle successful checkout response
      if (!response.ok) throw new Error('Checkout failed');
      const result = await response.json();
      alert(`Success! Order #${result.orderId} processed.`);
      clearTicket(); // Clear ticket after successful checkout

    } catch (error) {
      // Handle checkout errors
      console.error('Error during checkout:', error);
      alert("There was an error processing order.");
    }
  };

  // --- STYLES ---
  
  // Dynamic button style for customization options - highlights selected items
  const optionBtnStyle = (isSelected) => ({
    padding: '12px', borderRadius: '6px', border: isSelected ? '2px solid #2b6cb0' : '1px solid #ccc',
    backgroundColor: isSelected ? '#ebf8ff' : '#fff', cursor: 'pointer', fontWeight: isSelected ? 'bold' : 'normal',
    fontSize: '1rem', flex: 1
  });

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f4f7f6', fontSize: baseFontSize, position: 'relative' }}>
      
      <TextSizeToggle />
      
      {/* CUSTOMIZATION OVERLAY - Modal for customizing selected menu item */}
      {customizingItem && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '500px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #eee', paddingBottom: '15px', marginBottom: '20px' }}>
              <h2 style={{ margin: 0 }}>Add {customizingItem.item_name}</h2>
              <button onClick={() => setCustomizingItem(null)} style={{ background: 'none', border: 'none', fontSize: '2em', cursor: 'pointer', color: '#666' }}>×</button>
            </div>

            <h3 style={{ marginTop: 0 }}>Ice Level</h3>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              {ICE_LEVELS.map(level => (
                <button key={level} onClick={() => setCurrentIce(level)} style={optionBtnStyle(currentIce === level)}>{level}</button>
              ))}
            </div>

            <h3>Sugar Level</h3>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              {SUGAR_LEVELS.map(level => (
                <button key={level} onClick={() => setCurrentSugar(level)} style={optionBtnStyle(currentSugar === level)}>{level}</button>
              ))}
            </div>

            <h3>Premium Toppings</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '30px' }}>
              {TOPPINGS.map(topping => {
                const isSelected = selectedToppings.some(t => t.id === topping.id);
                return (
                  <button key={topping.id} onClick={() => toggleTopping(topping)} style={optionBtnStyle(isSelected)}>
                    {topping.name} <span style={{ color: '#666', fontSize: '0.85em' }}>(+${topping.price.toFixed(2)})</span>
                  </button>
                )
              })}
            </div>

            <button onClick={confirmCustomization} style={{ width: '100%', padding: '15px', backgroundColor: '#2b6cb0', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '1.2em', fontWeight: 'bold', cursor: 'pointer' }}>
              Add to Ticket - ${(Number(customizingItem.price) + selectedToppings.reduce((s, t) => s + t.price, 0)).toFixed(2)}
            </button>
          </div>
        </div>
      )}

      <button onClick={() => navigate('/')} style={{ width: 'fit-content', marginBottom: '20px', padding: '10px 15px', cursor: 'pointer', backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '5px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        ← Back to Portal
      </button>

      <div style={{ display: 'flex', gap: '20px', flex: '1', overflow: 'hidden' }}>
        
        <div style={{ flex: '3', overflowY: 'auto', paddingRight: '10px' }}>
          <h2 style={{ marginTop: 0 }}>Cashier POS</h2>
          {loading ? (
            <p>Loading POS data...</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '15px' }}>
              {menuItems.map((item) => (
                <button 
                  key={item.id} 
                  onClick={() => handleItemTap(item)}
                  style={{ padding: '20px 10px', fontSize: '1rem', backgroundColor: '#e0e7ff', border: '1px solid #c7d2fe', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.1s' }}
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

        {/* Current Ticket Panel - Shows all items in the order */}
        <div style={{ flex: '1', backgroundColor: '#fff', border: '2px solid #333', borderRadius: '8px', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <div style={{ backgroundColor: '#333', color: '#fff', padding: '15px', textAlign: 'center', fontSize: '1.2rem', fontWeight: 'bold' }}>
            Current Ticket
          </div>
          
          <div style={{ flex: '1', overflowY: 'auto', padding: '15px' }}>
            {currentTicket.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#888', marginTop: '50px' }}>Ticket is empty</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {currentTicket.map((item) => (
                  <li key={item.ticketId} style={{ marginBottom: '12px', borderBottom: '1px dashed #eee', paddingBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '5px' }}>
                      <strong style={{ fontSize: '1.1rem' }}>{item.item_name}</strong>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <strong style={{ fontSize: '1.1rem' }}>${item.finalPrice.toFixed(2)}</strong>
                        <button onClick={() => removeFromTicket(item.ticketId)} style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', padding: '2px 8px', cursor: 'pointer', fontWeight: 'bold' }}>×</button>
                      </div>
                    </div>
                    {/* Visual Receipt Metadata */}
                    <div style={{ fontSize: '0.85rem', color: '#666', paddingLeft: '8px', borderLeft: '2px solid #cbd5e0' }}>
                      Ice: {item.ice} | Sugar: {item.sugar}
                      {item.toppings.map(t => <div key={t.id}>+ {t.name}</div>)}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div style={{ borderTop: '2px solid #eee', padding: '20px', backgroundColor: '#f9f9f9', borderBottomLeftRadius: '6px', borderBottomRightRadius: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '20px' }}>
              <span>Total:</span>
              <span>${calculateTotal()}</span>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={clearTicket} style={{ flex: '1', padding: '15px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem' }}>Void</button>
              <button onClick={handleCheckout} style={{ flex: '2', padding: '15px', backgroundColor: '#22c55e', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem' }}>Pay & Submit</button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}