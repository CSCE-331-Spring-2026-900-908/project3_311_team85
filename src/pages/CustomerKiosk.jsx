import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import TextSizeToggle from '../components/TextSizeToggle';
import Chatbot from '../components/Chatbot';
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

export default function CustomerKiosk() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const { textSize } = useA11y();
  const baseFontSize = textSize === 'large' ? '1.2em' : '1em';
  
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [pendingFreeDrinks, setPendingFreeDrinks] = useState(0);
  const pendingFreeDrinksRef = useRef(0);
  const rewardLockedRef = useRef(false);

  // --- Accessibility Navigation State ---
  const gridRef = useRef(null);
  const [focusArea, setFocusArea] = useState('MENU'); // 'MENU' | 'CHECKOUT' | 'CART' | 'GAME' | 'BACK' | 'CART' | 'GAME' | 'BACK'
  const [focusedIndex, setFocusedIndex] = useState(0); // For the main grid
  const [focusedCartIndex, setFocusedCartIndex] = useState(0); // For cart items
  const [modalPos, setModalPos] = useState({ r: modalLayout.length - 1, c: 0 }); // Row & Col for Modal

  // --- Order State ---
  const [customizingItem, setCustomizingItem] = useState(null);
  const [currentIce, setCurrentIce] = useState('100%');
  const [currentSugar, setCurrentSugar] = useState('100%');
  const [selectedToppings, setSelectedToppings] = useState([]);

  const makeCartItemFree = (item) => {
    if (item.isFreeDrink) return item;

    return {
      ...item,
      finalPrice: 0,
      isFreeDrink: true,
      originalPrice: item.finalPrice,
    };
  };

  useEffect(() => {
    pendingFreeDrinksRef.current = pendingFreeDrinks;
    rewardLockedRef.current = pendingFreeDrinks > 0;
  }, [pendingFreeDrinks]);
  
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

  // --- GAME MESSAGE LISTENER ---
  useEffect(() => {
    const handleMessage = (event) => {
      // Handle free drink reward from game
      if (event.data && event.data.type === 'FREE_DRINK_EARNED') {
        if (rewardLockedRef.current) {
          return;
        }

        const { message } = event.data;
        rewardLockedRef.current = true;
        
        setCart(prevCart => {
          const alreadyHasReward =
            pendingFreeDrinksRef.current > 0 ||
            prevCart.some(item => item.isFreeDrink);

          if (alreadyHasReward) {
            return prevCart;
          }

          // Find the first non-free drink in the cart
          const paidDrinkIndex = prevCart.findIndex(item => !item.isFreeDrink);
          
          if (paidDrinkIndex !== -1) {
            // Create a new cart array with the selected drink made free
            const newCart = [...prevCart];
            const drinkToMakeFree = makeCartItemFree(newCart[paidDrinkIndex]);
            newCart[paidDrinkIndex] = drinkToMakeFree;
            
            // Show success message with the drink name
            alert(message + ` ${drinkToMakeFree.item_name} is now free! Original price: $${drinkToMakeFree.originalPrice.toFixed(2)}`);
            
            return newCart;
          } else {
            pendingFreeDrinksRef.current += 1;
            setPendingFreeDrinks(prev => prev + 1);
            alert(message + ' Your next drink added to the cart will be free!');
            return prevCart;
          }
        });
      }
    };

    // Add message listener
    window.addEventListener('message', handleMessage);
    
    // Cleanup
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  // --- TRUE 2D KEYBOARD NAVIGATION ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) e.preventDefault();

      // 1. Navigation inside the Customization Modal
      if (customizingItem) {
        if (e.key === 'ArrowUp') {
          setModalPos(prev => ({ r: Math.max(0, prev.r - 1), c: Math.min(prev.c, modalLayout[Math.max(0, prev.r - 1)].length - 1) }));
        } else if (e.key === 'ArrowDown') {
          setModalPos(prev => ({ r: Math.min(modalLayout.length - 1, prev.r + 1), c: Math.min(prev.c, modalLayout[Math.min(modalLayout.length - 1, prev.r + 1)].length - 1) }));
        } else if (e.key === 'ArrowLeft') {
          setModalPos(prev => ({ r: prev.r, c: Math.max(0, prev.c - 1) }));
        } else if (e.key === 'ArrowRight') {
          setModalPos(prev => ({ r: prev.r, c: Math.min(modalLayout[prev.r].length - 1, prev.c + 1) }));
        } else if (e.key === 'Enter') {
          const opt = modalLayout[modalPos.r][modalPos.c];
          if (opt.type === 'ICE') setCurrentIce(opt.value);
          if (opt.type === 'SUGAR') setCurrentSugar(opt.value);
          if (opt.type === 'TOPPING') toggleTopping(opt.value);
          if (opt.type === 'CONFIRM') confirmCustomization();
        } else if (e.key === 'Escape') {
          setCustomizingItem(null);
        }
        return; 
      }

      // 2. Navigation outside the Modal (Grid & Sidebar)
      if (focusArea === 'CHECKOUT') {
        if (e.key === 'ArrowLeft') {
          if (cart.length > 0) {
            setFocusArea('CART');
            setFocusedCartIndex(0);
          } else {
            setFocusArea('MENU');
          }
        } else if (e.key === 'ArrowDown') setFocusArea('GAME');
        else if (e.key === 'Enter') handleCheckout();
      } else if (focusArea === 'CART' && cart.length > 0) {
        if (e.key === 'ArrowDown') {
          setFocusedCartIndex(prev => Math.min(prev + 1, cart.length - 1));
        } else if (e.key === 'ArrowUp') {
          setFocusedCartIndex(prev => Math.max(prev - 1, 0));
        } else if (e.key === 'ArrowRight') {
          setFocusArea('CHECKOUT');
        } else if (e.key === 'ArrowLeft') {
          setFocusArea('MENU');
        } else if (e.key === 'Enter') {
          removeFromCart(cart[focusedCartIndex].cartId);
        }
      } else if (focusArea === 'GAME') {
        if (e.key === 'ArrowUp') setFocusArea('CHECKOUT');
        else if (e.key === 'ArrowLeft') setFocusArea('BACK');
        else if (e.key === 'Enter') {
          const gameWindow = window.open('/dino.html', 'dinoGame', 'width=800,height=400');
          if (gameWindow && !gameWindow.closed) {
            gameWindow.focus();
          }
        }
      } else if (focusArea === 'BACK') {
        if (e.key === 'ArrowRight') setFocusArea('GAME');
        else if (e.key === 'ArrowDown') setFocusArea('MENU');
        else if (e.key === 'Enter') navigate('/');
      } else if (focusArea === 'MENU' && menuItems.length > 0 && gridRef.current) {
        const children = gridRef.current.children;
        if (children.length === 0) return;

        let cols = 1;
        const firstTop = children[0].offsetTop;
        for (let i = 1; i < children.length; i++) {
          if (children[i].offsetTop > firstTop) break;
          cols++;
        }

        if (e.key === 'ArrowRight') {
          setFocusedIndex(prev => {
            // If on the right edge, jump to Checkout!
            if ((prev + 1) % cols === 0 || prev === menuItems.length - 1) {
              setFocusArea('CHECKOUT');
              return prev;
            }
            return prev + 1;
          });
        } else if (e.key === 'ArrowLeft') {
          setFocusedIndex(prev => Math.max(prev - 1, 0));
        } else if (e.key === 'ArrowDown') {
          setFocusedIndex(prev => Math.min(prev + cols, menuItems.length - 1));
        } else if (e.key === 'ArrowUp') {
          setFocusedIndex(prev => {
            const newIndex = Math.max(prev - cols, 0);
            if (newIndex === 0 && prev < cols) {
              setFocusArea('BACK');
              return 0;
            }
            return newIndex;
          });
        } else if (e.key === 'Enter') {
          handleItemTap(menuItems[focusedIndex]);
        }
        
        // Auto-scroll logic
        if (children[focusedIndex] && focusArea === 'MENU') {
          children[focusedIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [menuItems, focusedIndex, focusedCartIndex, cart, customizingItem, currentIce, currentSugar, selectedToppings, modalPos, focusArea, navigate]);


  const handleItemTap = (item) => {
    setCustomizingItem(item); setCurrentIce('100%'); setCurrentSugar('100%'); setSelectedToppings([]);
    setModalPos({ r: modalLayout.length - 1, c: 0 }); // Reset to Submit button
  };

  const toggleTopping = (topping) => {
    if (selectedToppings.some(t => t.id === topping.id)) setSelectedToppings(selectedToppings.filter(t => t.id !== topping.id));
    else setSelectedToppings([...selectedToppings, topping]);
  };

  const confirmCustomization = () => {
    const toppingTotal = selectedToppings.reduce((sum, t) => sum + t.price, 0);
    let cartItem = {
      ...customizingItem, cartId: Date.now() + Math.random(), 
      ice: currentIce, sugar: currentSugar, toppings: selectedToppings,
      finalPrice: Number(customizingItem.price) + toppingTotal
    };
    if (pendingFreeDrinksRef.current > 0) {
      cartItem = makeCartItemFree(cartItem);
      pendingFreeDrinksRef.current = Math.max(0, pendingFreeDrinksRef.current - 1);
      rewardLockedRef.current = false;
      setPendingFreeDrinks(pendingFreeDrinksRef.current);
      alert(`${cartItem.item_name} was added as your free reward drink!`);
    }
    setCart([...cart, cartItem]); setCustomizingItem(null); setFocusArea('CHECKOUT'); // Auto jump to checkout area
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
      rewardLockedRef.current = false;
      setCart([]); setPendingFreeDrinks(0); setFocusArea('MENU'); // Return focus to menu
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
      
      {/* CUSTOMIZATION OVERLAY */}
      {customizingItem && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#fff', padding: '40px', borderRadius: '16px', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #eee', paddingBottom: '20px', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontSize: '2em' }}>Customize: {customizingItem.item_name}</h2>
              <button onClick={() => setCustomizingItem(null)} style={{ background: 'none', border: 'none', fontSize: '2em', cursor: 'pointer' }}>×</button>
            </div>
            <p style={{ color: '#666', marginBottom: '20px', fontStyle: 'italic' }}>Keyboard Users: Use Arrow Keys to navigate, and Enter to toggle/confirm.</p>

            <h3>Ice Level</h3>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              {ICE_LEVELS.map((level, c) => (
                <button key={level} onClick={() => setCurrentIce(level)} style={optionBtnStyle(currentIce === level, modalPos.r === 0 && modalPos.c === c)}>{level}</button>
              ))}
            </div>
            
            <h3>Sugar Level</h3>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              {SUGAR_LEVELS.map((level, c) => (
                <button key={level} onClick={() => setCurrentSugar(level)} style={optionBtnStyle(currentSugar === level, modalPos.r === 1 && modalPos.c === c)}>{level}</button>
              ))}
            </div>
            
            <h3>Add Toppings</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '30px' }}>
              {TOPPINGS.map((topping, i) => {
                const r = 2 + Math.floor(i / 2); // Row 2 or 3
                const c = i % 2; // Col 0 or 1
                return (
                  <button key={topping.id} onClick={() => toggleTopping(topping)} style={optionBtnStyle(selectedToppings.some(t => t.id === topping.id), modalPos.r === r && modalPos.c === c)}>
                    {topping.name} <span style={{ color: '#666', fontSize: '0.9em' }}>(+${topping.price.toFixed(2)})</span>
                  </button>
                )
              })}
            </div>
            
            <button 
              onClick={confirmCustomization} 
              style={{ 
                width: '100%', padding: '20px', backgroundColor: '#5c9c5f', color: '#fff', 
                border: (modalPos.r === modalLayout.length - 1) ? '4px solid #aa3bff' : 'none', 
                borderRadius: '8px', fontSize: '1.3em', fontWeight: 'bold', cursor: 'pointer',
                transform: (modalPos.r === modalLayout.length - 1) ? 'scale(1.02)' : 'scale(1)',
                boxShadow: (modalPos.r === modalLayout.length - 1) ? '0 8px 20px rgba(170, 59, 255, 0.4)' : 'none'
              }}
            >
              Add to Order - ${(Number(customizingItem.price) + selectedToppings.reduce((s, t) => s + t.price, 0)).toFixed(2)}
            </button>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <button 
          onClick={() => navigate('/')} 
          style={{ 
            padding: '10px 15px', 
            cursor: 'pointer', 
            backgroundColor: focusArea === 'BACK' ? '#aa3bff' : '#f0f0f0', 
            color: focusArea === 'BACK' ? 'white' : 'black',
            border: focusArea === 'BACK' ? '4px solid #aa3bff' : '1px solid #ccc', 
            borderRadius: '5px',
            transform: focusArea === 'BACK' ? 'scale(1.05)' : 'scale(1)',
            boxShadow: focusArea === 'BACK' ? '0 4px 12px rgba(170, 59, 255, 0.3)' : 'none'
          }}
        >
          ← {t('common.backToPortal')}
        </button>
        <div><TextSizeToggle /></div>
      </div>

      <div style={{ display: 'flex', gap: '40px' }}>
        <div style={{ flex: '2' }}>
          <h1 id="menu-title">{t('customer.title')}</h1>
          <p style={{ color: '#666', marginBottom: '20px' }}>Arrow Keys can be used to navigate the menu.</p>
          
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

        <div style={{ flex: '1', backgroundColor: '#fff', padding: '25px', borderRadius: '12px', border: '1px solid #eee', height: 'fit-content', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
          <h2 style={{ marginTop: 0, borderBottom: '2px solid #f0f0f0', paddingBottom: '15px' }}>{t('customer.yourOrder')}</h2>
          {pendingFreeDrinks > 0 && (
            <div style={{ marginBottom: '16px', padding: '12px', borderRadius: '8px', backgroundColor: '#edf8ee', color: '#2e7d32', fontWeight: 'bold' }}>
              Free drink reward ready: the next drink you add will be free.
            </div>
          )}
          {cart.length === 0 ? <p style={{ color: '#888', textAlign: 'center', padding: '40px 0' }}>{t('customer.emptyCart')}</p> : (
            <>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px 0', maxHeight: '400px', overflowY: 'auto' }}>
                {cart.map((item, index) => (
                  <li key={item.cartId} style={{ marginBottom: '15px', borderBottom: '1px dashed #ddd', paddingBottom: '15px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '5px' }}>
                      <strong style={{ fontSize: '1.1em' }}>
                        {item.item_name}
                        {item.isFreeDrink ? ' (FREE!)' : ''}
                      </strong>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        {item.isFreeDrink ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ textDecoration: 'line-through', color: '#888', fontSize: '0.9em' }}>
                              ${item.originalPrice.toFixed(2)}
                            </span>
                            <span style={{ color: '#4CAF50', fontWeight: 'bold', fontSize: '1.1em' }}>
                              FREE!
                            </span>
                          </div>
                        ) : (
                          <strong>${item.finalPrice.toFixed(2)}</strong>
                        )}
                        <button 
                          onClick={() => removeFromCart(item.cartId)}
                          style={{ 
                            backgroundColor: focusArea === 'CART' && index === focusedCartIndex ? '#aa3bff' : '#ff4444', 
                            color: 'white', 
                            border: focusArea === 'CART' && index === focusedCartIndex ? '4px solid #aa3bff' : 'none', 
                            borderRadius: '4px', 
                            padding: '4px 8px', 
                            cursor: 'pointer', 
                            fontSize: '0.9em',
                            fontWeight: 'bold',
                            transform: focusArea === 'CART' && index === focusedCartIndex ? 'scale(1.1)' : 'scale(1)',
                            boxShadow: focusArea === 'CART' && index === focusedCartIndex ? '0 4px 12px rgba(170, 59, 255, 0.3)' : 'none'
                          }}
                          title="Remove this item"
                        >
                          ×
                        </button>
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
      
      {/* Dino Game Button - Under Cart */}
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <button 
          onClick={() => {
            const gameWindow = window.open('/dino.html', 'dinoGame', 'width=800,height=400');
            if (gameWindow && !gameWindow.closed) {
              // Focus on the game window
              gameWindow.focus();
            }
          }}
          style={{
            backgroundColor: focusArea === 'GAME' ? '#aa3bff' : '#4CAF50',
            color: 'white',
            padding: '12px 24px',
            border: focusArea === 'GAME' ? '4px solid #aa3bff' : 'none',
            borderRadius: '8px',
            fontSize: '16px',
            cursor: 'pointer',
            transform: focusArea === 'GAME' ? 'scale(1.05)' : 'scale(1)',
            boxShadow: focusArea === 'GAME' ? '0 8px 15px rgba(170, 59, 255, 0.2)' : '0 4px 6px rgba(0,0,0,0.05)',
            transition: 'all 0.1s'
          }}
        >
          Play Boba Tea Game (Win Free Drink!)
        </button>
        <p style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
          Score 100+ points and make a drink in your cart free!
        </p>
      </div>
      
      {/* Chatbot Component */}
      <Chatbot />
    </div>
  );
}
