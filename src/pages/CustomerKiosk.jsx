import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import TextSizeToggle from '../components/TextSizeToggle';
import Chatbot from '../components/Chatbot';
import SpinningWheel from '../components/SpinningWheel';
import { useI18n } from '../i18n/I18nProvider';
import { useA11y } from '../a11y/A11yProvider';

// --- MENU CUSTOMIZATION OPTIONS ---
const SIZES = [
  { name: 'Small', priceModifier: -0.50 },
  { name: 'Regular', priceModifier: 0.00 },
  { name: 'Large', priceModifier: 0.75 }
];
const TOPPINGS = [
  { id: 't1', name: 'Tapioca Boba', price: 0.50 },
  { id: 't2', name: 'Lychee Jelly', price: 0.50 },
  { id: 't3', name: 'Crystal Boba', price: 0.75 },
  { id: 't4', name: 'Cheese Foam', price: 1.00 },
];
const TEMP_LEVELS = ['Cold', 'Hot'];
const ICE_LEVELS = ['0%', '50%', '100%', '120%'];
const SUGAR_LEVELS = ['0%', '50%', '100%', '120%'];

// Available coupons
const AVAILABLE_COUPONS = [
  { code: 'BOBA10', discount: 0.10, description: '10% off your order', type: 'percentage' },
  { code: 'SWEET15', discount: 0.15, description: '15% off your order', type: 'percentage' },
  { code: 'FREESHIP', discount: 2.00, description: '$2.00 off your order', type: 'fixed' },
  { code: 'HAPPY20', discount: 0.20, description: '20% off orders over $10', type: 'percentage', minOrder: 10 },
  { code: 'STUDENT5', discount: 1.50, description: '$1.50 off (student special)', type: 'fixed' }
];

// Map the modal into a rigid 2D layout for Up/Down arrow navigation
const toppingsRows = [];
for (let i = 0; i < TOPPINGS.length; i += 2) {
  toppingsRows.push(TOPPINGS.slice(i, i + 2).map(t => ({ type: 'TOPPING', value: t })));
}
const modalLayout = [
  SIZES.map(size => ({ type: 'SIZE', value: size })),
  TEMP_LEVELS.map(temp => ({ type: 'TEMP', value: temp })),
  ICE_LEVELS.map(level => ({ type: 'ICE', value: level })),
  SUGAR_LEVELS.map(level => ({ type: 'SUGAR', value: level })),
  ...toppingsRows,
  [{ type: 'CONFIRM' }]
];

export default function CustomerKiosk() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const { textSize } = useA11y();
  const baseFontSize = `${textSize}em`;
  
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [showWheel, setShowWheel] = useState(false);
  const [hasSpunToday, setHasSpunToday] = useState(false);
  const [wheelPrize, setWheelPrize] = useState(null);
  const [hasFreeDrinkCredit, setHasFreeDrinkCredit] = useState(false);
  const [activeWheelPrizes, setActiveWheelPrizes] = useState({
    freeTopping: false,
    freeUpgrade: false,
    bobaBonus: false
  });

  // --- Accessibility Navigation State ---
  const gridRef = useRef(null);
  const [focusArea, setFocusArea] = useState('MENU'); 
  const [focusedIndex, setFocusedIndex] = useState(0); 
  const [focusedCartIndex, setFocusedCartIndex] = useState(0); 
  const [modalPos, setModalPos] = useState({ r: modalLayout.length - 1, c: 0 }); 

  // --- Order State ---
  const [customizingItem, setCustomizingItem] = useState(null);
  const [currentSize, setCurrentSize] = useState(SIZES[1]); // Default to Regular
  const [currentTemp, setCurrentTemp] = useState('Cold');
  const [currentIce, setCurrentIce] = useState('100%');
  const [currentSugar, setCurrentSugar] = useState('100%');
  const [selectedToppings, setSelectedToppings] = useState([]);
  
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

  // Hot Drink Auto-Zero Ice Logic
  useEffect(() => {
    if (currentTemp === 'Hot') {
      setCurrentIce('0%');
    }
  }, [currentTemp]);

  // --- GAME MESSAGE LISTENER ---
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data && event.data.type === 'FREE_DRINK_EARNED') {
        const { score, message } = event.data;
        setCart(prevCart => {
          const paidDrinkIndex = prevCart.findIndex(item => !item.isFreeDrink);
          if (paidDrinkIndex !== -1) {
            const newCart = [...prevCart];
            const drinkToMakeFree = { ...newCart[paidDrinkIndex] };
            const originalPrice = drinkToMakeFree.finalPrice;
            
            drinkToMakeFree.finalPrice = 0.00;
            drinkToMakeFree.isFreeDrink = true;
            drinkToMakeFree.originalPrice = originalPrice;
            drinkToMakeFree.item_name = drinkToMakeFree.item_name + ' (FREE!)';
            
            newCart[paidDrinkIndex] = drinkToMakeFree;
            alert(message + ` ${drinkToMakeFree.item_name.replace(' (FREE!)', '')} is now free! Original price: $${originalPrice.toFixed(2)}`);
            
            return newCart;
          } else {
            // No drinks in cart to make free - store the credit for next drink
            setHasFreeDrinkCredit(true);
            alert(message + ' You have a free drink credit! Your next drink will be free.');
            return prevCart;
          }
        });
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // --- TRUE 2D KEYBOARD NAVIGATION ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) e.preventDefault();

      if (customizingItem) {
        if (e.key === 'ArrowUp') setModalPos(prev => ({ r: Math.max(0, prev.r - 1), c: Math.min(prev.c, modalLayout[Math.max(0, prev.r - 1)].length - 1) }));
        else if (e.key === 'ArrowDown') setModalPos(prev => ({ r: Math.min(modalLayout.length - 1, prev.r + 1), c: Math.min(prev.c, modalLayout[Math.min(modalLayout.length - 1, prev.r + 1)].length - 1) }));
        else if (e.key === 'ArrowLeft') setModalPos(prev => ({ r: prev.r, c: Math.max(0, prev.c - 1) }));
        else if (e.key === 'ArrowRight') setModalPos(prev => ({ r: prev.r, c: Math.min(modalLayout[prev.r].length - 1, prev.c + 1) }));
        else if (e.key === 'Enter') {
          const opt = modalLayout[modalPos.r][modalPos.c];
          if (opt.type === 'SIZE') setCurrentSize(opt.value);
          else if (opt.type === 'TEMP') setCurrentTemp(opt.value);
          else if (opt.type === 'ICE') setCurrentIce(opt.value);
          else if (opt.type === 'SUGAR') setCurrentSugar(opt.value);
          else if (opt.type === 'TOPPING') toggleTopping(opt.value);
          else if (opt.type === 'CONFIRM') confirmCustomization();
        } else if (e.key === 'Escape') setCustomizingItem(null);
        return; 
      }

      if (focusArea === 'CHECKOUT') {
        if (e.key === 'ArrowLeft') {
          if (cart.length > 0) { setFocusArea('CART'); setFocusedCartIndex(0); } 
          else setFocusArea('MENU');
        } else if (e.key === 'ArrowDown') setFocusArea('GAME');
        else if (e.key === 'Enter') handleCheckout();
      } else if (focusArea === 'CART' && cart.length > 0) {
        if (e.key === 'ArrowDown') setFocusedCartIndex(prev => Math.min(prev + 1, cart.length - 1));
        else if (e.key === 'ArrowUp') setFocusedCartIndex(prev => Math.max(prev - 1, 0));
        else if (e.key === 'ArrowRight') setFocusArea('CHECKOUT');
        else if (e.key === 'ArrowLeft') setFocusArea('MENU');
        else if (e.key === 'Enter') removeFromCart(cart[focusedCartIndex].cartId);
      } else if (focusArea === 'GAME') {
        if (e.key === 'ArrowUp') setFocusArea('CHECKOUT');
        else if (e.key === 'ArrowLeft') setFocusArea('BACK');
        else if (e.key === 'Enter') {
          const gameWindow = window.open('/dino.html', 'dinoGame', 'width=800,height=400');
          if (gameWindow && !gameWindow.closed) gameWindow.focus();
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
            if ((prev + 1) % cols === 0 || prev === menuItems.length - 1) { setFocusArea('CHECKOUT'); return prev; }
            return prev + 1;
          });
        } else if (e.key === 'ArrowLeft') setFocusedIndex(prev => Math.max(prev - 1, 0));
        else if (e.key === 'ArrowDown') setFocusedIndex(prev => Math.min(prev + cols, menuItems.length - 1));
        else if (e.key === 'ArrowUp') {
          setFocusedIndex(prev => {
            const newIndex = Math.max(prev - cols, 0);
            if (newIndex === 0 && prev < cols) { setFocusArea('BACK'); return 0; }
            return newIndex;
          });
        } else if (e.key === 'Enter') handleItemTap(menuItems[focusedIndex]);
        
        if (children[focusedIndex] && focusArea === 'MENU') children[focusedIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [menuItems, focusedIndex, focusedCartIndex, cart, customizingItem, currentSize, currentTemp, currentIce, currentSugar, selectedToppings, modalPos, focusArea, navigate]);

  const handleItemTap = (item) => {
    setCustomizingItem(item); 
    setCurrentSize(SIZES[1]); // Reset to Regular default
    setCurrentTemp('Cold'); 
    setCurrentIce('100%'); 
    setCurrentSugar('100%'); 
    setSelectedToppings([]);
    setModalPos({ r: modalLayout.length - 1, c: 0 }); 
  };

  const toggleTopping = (topping) => {
    if (selectedToppings.some(t => t.id === topping.id)) setSelectedToppings(selectedToppings.filter(t => t.id !== topping.id));
    else setSelectedToppings([...selectedToppings, topping]);
  };

  const confirmCustomization = () => {
    let processedToppings = [...selectedToppings];
    let processedSize = currentSize;
    let toppingTotal = selectedToppings.reduce((sum, t) => sum + t.price, 0);
    let finalPrice = Number(customizingItem.price) + toppingTotal;
    let item_name = customizingItem.item_name;
    let isFreeDrink = false;
    let originalPrice = null;
    let prizeApplied = false;
    
    // Apply free drink credit if available
    if (hasFreeDrinkCredit) {
      originalPrice = finalPrice;
      finalPrice = 0.00;
      isFreeDrink = true;
      item_name = item_name + ' (FREE!)';
      setHasFreeDrinkCredit(false); // Consume the credit
      
      // Show notification that free drink was applied
      setTimeout(() => {
        alert('Free drink applied! Your ' + customizingItem.item_name + ' is now free! Original price: $' + originalPrice.toFixed(2));
      }, 100);
    }
    
    // Apply wheel prizes
    if (activeWheelPrizes.freeTopping && processedToppings.length > 0) {
      // Make the most expensive topping free
      const mostExpensiveTopping = processedToppings.reduce((max, t) => t.price > max.price ? t : max);
      toppingTotal -= mostExpensiveTopping.price;
      finalPrice -= mostExpensiveTopping.price;
      item_name += ' (Free ' + mostExpensiveTopping.name + '!)';
      prizeApplied = true;
      setActiveWheelPrizes(prev => ({ ...prev, freeTopping: false }));
      
      setTimeout(() => {
        alert('Free topping applied! Your ' + mostExpensiveTopping.name + ' is now free!');
      }, 100);
    }
    
    if (activeWheelPrizes.freeUpgrade) {
      // Upgrade to the next size if possible
      const sizeIndex = SIZES.findIndex(s => s.name === processedSize);
      if (sizeIndex >= 0 && sizeIndex < SIZES.length - 1) {
        const currentSizeObj = SIZES[sizeIndex];
        const nextSizeObj = SIZES[sizeIndex + 1];
        
        // Ensure both size objects exist and have priceModifier
        if (currentSizeObj && nextSizeObj && 
            typeof currentSizeObj.priceModifier !== 'undefined' && 
            typeof nextSizeObj.priceModifier !== 'undefined') {
          finalPrice += (nextSizeObj.priceModifier - currentSizeObj.priceModifier);
          processedSize = nextSizeObj.name;
          item_name += ' (Free Upgrade to ' + nextSizeObj.name + '!)';
          prizeApplied = true;
          setActiveWheelPrizes(prev => ({ ...prev, freeUpgrade: false }));
          
          setTimeout(() => {
            alert('Free upgrade applied! Your drink is now ' + nextSizeObj.name + '!');
          }, 100);
        }
      }
    }
    
    if (activeWheelPrizes.bobaBonus) {
      // Add extra boba if boba is already selected, otherwise add it for free
      const bobaTopping = TOPPINGS.find(t => t.name.includes('Boba'));
      if (bobaTopping) {
        const existingBoba = processedToppings.find(t => t.name.includes('Boba'));
        if (existingBoba) {
          item_name += ' (Extra Boba!)';
          prizeApplied = true;
        } else {
          // Add free boba
          processedToppings.push(bobaTopping);
          item_name += ' (Free Boba!)';
          prizeApplied = true;
        }
        setActiveWheelPrizes(prev => ({ ...prev, bobaBonus: false }));
        
        setTimeout(() => {
          alert('Boba bonus applied! Extra boba added to your drink!');
        }, 100);
      }
    }
    
    const cartItem = {
      ...customizingItem, cartId: Date.now() + Math.random(), 
      temperature: currentTemp, ice: currentIce, sugar: currentSugar, 
      toppings: processedToppings, 
      finalPrice, item_name, isFreeDrink, originalPrice,
      // Ensure size is a string, not an object
      size: processedSize
    };
    setCart([...cart, cartItem]); 
    setCustomizingItem(null); 
    setFocusArea('CHECKOUT');
  };

  const removeFromCart = (cartIdToRemove) => setCart(cart.filter(item => item.cartId !== cartIdToRemove));
  
  const validateCoupon = (code) => {
    const coupon = AVAILABLE_COUPONS.find(c => c.code.toUpperCase() === code.toUpperCase());
    if (!coupon) return { valid: false, error: 'Invalid coupon code' };
    
    const subtotal = cart.reduce((total, item) => total + item.finalPrice, 0);
    if (coupon.minOrder && subtotal < coupon.minOrder) return { valid: false, error: `Minimum order of $${coupon.minOrder} required` };
    
    return { valid: true, coupon };
  };
  
  const applyCoupon = () => {
    if (!couponCode.trim()) return alert('Please enter a coupon code');
    const validation = validateCoupon(couponCode);
    if (!validation.valid) return alert(validation.error);
    setAppliedCoupon(validation.coupon); setCouponCode('');
  };
  
  const removeCoupon = () => setAppliedCoupon(null);
  
  const calculateTotal = () => {
    const subtotal = cart.reduce((total, item) => total + item.finalPrice, 0);
    if (!appliedCoupon) return subtotal.toFixed(2);
    let discount = appliedCoupon.type === 'percentage' ? subtotal * appliedCoupon.discount : appliedCoupon.discount;
    return Math.max(0, subtotal - discount).toFixed(2);
  };
  
  const calculateDiscount = () => {
    if (!appliedCoupon) return 0;
    const subtotal = cart.reduce((total, item) => total + item.finalPrice, 0);
    return appliedCoupon.type === 'percentage' ? (subtotal * appliedCoupon.discount).toFixed(2) : appliedCoupon.discount.toFixed(2);
  };
  
  const handleWheelComplete = (prize) => {
    setWheelPrize(prize); setHasSpunToday(true);
    switch (prize.type) {
      case 'percentage': 
        setAppliedCoupon({ code: 'WHEEL_BONUS', description: `${prize.text} from Wheel of Fortune!`, type: 'percentage', discount: prize.value }); 
        break;
      case 'fixed': 
        setAppliedCoupon({ code: 'WHEEL_BONUS', description: `${prize.text} from Wheel of Fortune!`, type: 'fixed', discount: prize.value }); 
        break;
      case 'free_topping': 
        setActiveWheelPrizes(prev => ({ ...prev, freeTopping: true }));
        alert(`Congratulations! You won a ${prize.text}! Add a drink to your cart and we'll add a free topping.`);
        break;
      case 'free_upgrade': 
        setActiveWheelPrizes(prev => ({ ...prev, freeUpgrade: true }));
        alert(`Congratulations! You won a ${prize.text}! Your next drink will be upgraded for free.`);
        break;
      case 'boba_bonus': 
        setActiveWheelPrizes(prev => ({ ...prev, bobaBonus: true }));
        alert(`Congratulations! You won ${prize.text}! You get extra boba on your next drink!`);
        break;
      case 'nothing': 
        alert('Better luck next time! Try again tomorrow.'); 
        break;
      default: 
        break;
    }
  };

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
      setCart([]); setFocusArea('MENU'); 
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

            <h3>Size</h3>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              {SIZES.map((size, c) => (
                <button key={size.name} onClick={() => setCurrentSize(size)} style={optionBtnStyle(currentSize.name === size.name, modalPos.r === 0 && modalPos.c === c)}>
                  {size.name} {size.priceModifier !== 0 ? `(${size.priceModifier > 0 ? '+' : '-'}$${Math.abs(size.priceModifier).toFixed(2)})` : ''}
                </button>
              ))}
            </div>

            <h3>Temperature</h3>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              {TEMP_LEVELS.map((temp, c) => (
                <button key={temp} onClick={() => setCurrentTemp(temp)} style={optionBtnStyle(currentTemp === temp, modalPos.r === 1 && modalPos.c === c)}>{temp}</button>
              ))}
            </div>

            <h3 style={{ opacity: currentTemp === 'Hot' ? 0.5 : 1 }}>Ice Level {currentTemp === 'Hot' ? '(No Ice for Hot Drinks)' : ''}</h3>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', opacity: currentTemp === 'Hot' ? 0.5 : 1, pointerEvents: currentTemp === 'Hot' ? 'none' : 'auto' }}>
              {ICE_LEVELS.map((level, c) => (
                <button key={level} onClick={() => setCurrentIce(level)} style={optionBtnStyle(currentIce === level, modalPos.r === 2 && modalPos.c === c)}>{level}</button>
              ))}
            </div>
            
            <h3>Sugar Level</h3>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              {SUGAR_LEVELS.map((level, c) => (
                <button key={level} onClick={() => setCurrentSugar(level)} style={optionBtnStyle(currentSugar === level, modalPos.r === 3 && modalPos.c === c)}>{level}</button>
              ))}
            </div>
            
            <h3>Add Toppings</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '30px' }}>
              {TOPPINGS.map((topping, i) => {
                const r = 4 + Math.floor(i / 2); // Shifted down for Size row
                const c = i % 2; 
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
              Add to Order - ${(Math.max(0, Number(customizingItem.price) + currentSize.priceModifier + selectedToppings.reduce((s, t) => s + t.price, 0))).toFixed(2)}
            </button>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <button 
          onClick={() => navigate('/')} 
          style={{ 
            padding: '10px 15px', cursor: 'pointer', backgroundColor: focusArea === 'BACK' ? '#aa3bff' : '#f0f0f0', 
            color: focusArea === 'BACK' ? 'white' : 'black', border: focusArea === 'BACK' ? '4px solid #aa3bff' : '1px solid #ccc', 
            borderRadius: '5px', transform: focusArea === 'BACK' ? 'scale(1.05)' : 'scale(1)',
            boxShadow: focusArea === 'BACK' ? '0 4px 12px rgba(170, 59, 255, 0.3)' : 'none'
          }}
        >
          ← {t('common.backToPortal')}
        </button>
        <div><TextSizeToggle /></div>
      </div>

      <div style={{ display: 'flex', gap: '30px' }}>
        
        {/* LEFT COLUMN: Menu Grid */}
        <div style={{ flex: '2' }}>
          <h1 id="menu-title">{t('customer.title')}</h1>
          <p style={{ color: '#666', marginBottom: '20px' }}>Arrow Keys can be used to navigate the menu.</p>
          
          {loading ? <p>{t('common.loading')}</p> : (
            <div ref={gridRef} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
              {menuItems.map((item, index) => {
                const isFocused = focusArea === 'MENU' && index === focusedIndex;
                // High-quality generic boba fallback image
                const fallbackImg = 'https://images.unsplash.com/photo-1558855567-dbd7f12e2c2f?auto=format&fit=crop&w=400&q=80';
                
                return (
                  <div 
                    key={item.id} 
                    onClick={() => handleItemTap(item)}
                    style={{ 
                      border: isFocused ? '4px solid #aa3bff' : '1px solid #ddd', 
                      transform: isFocused ? 'scale(1.05)' : 'scale(1)', 
                      padding: '20px', borderRadius: '12px', cursor: 'pointer', textAlign: 'center', 
                      backgroundColor: isFocused ? '#f9f5ff' : '#fff', 
                      boxShadow: isFocused ? '0 8px 15px rgba(170, 59, 255, 0.2)' : '0 4px 6px rgba(0,0,0,0.05)',
                      display: 'flex', flexDirection: 'column', alignItems: 'center'
                    }}
                  >
                    {/* Picture Container */}
                    <div style={{ width: '100%', height: '150px', backgroundColor: '#f0f0f0', borderRadius: '8px', marginBottom: '15px', overflow: 'hidden' }}>
                      <img 
                        src={item.image_url || fallbackImg} 
                        alt={item.item_name} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }}
                        onError={(e) => { e.target.src = fallbackImg }}
                      />
                    </div>
                    
                    <h3 style={{ margin: '0 0 10px 0', fontSize: '1.1em' }}>{item.item_name}</h3>
                    <strong style={{ color: '#2c3e50', fontSize: '1.2em' }}>${Number(item.price).toFixed(2)}</strong>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Cart and Special Offers */}
        <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* CART CARD */}
          <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '12px', border: '1px solid #eee', height: 'fit-content', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
            <h2 style={{ marginTop: 0, borderBottom: '2px solid #f0f0f0', paddingBottom: '15px' }}>{t('customer.yourOrder')}</h2>
            {hasFreeDrinkCredit && (
              <div style={{ 
                backgroundColor: '#e8f5e9', 
                padding: '12px', 
                borderRadius: '8px', 
                marginBottom: '15px', 
                border: '1px solid #4CAF50',
                textAlign: 'center'
              }}>
                <span style={{ 
                  color: '#2e7d32', 
                  fontWeight: 'bold', 
                  fontSize: '1.1em' 
                }}>
                  🎉 Free Drink Credit Available! Your next drink will be free!
                </span>
              </div>
            )}
            {cart.length === 0 ? <p style={{ color: '#888', textAlign: 'center', padding: '40px 0' }}>{t('customer.emptyCart')}</p> : (
              <>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px 0', maxHeight: '400px', overflowY: 'auto' }}>
                  {cart.map((item, index) => (
                    <li key={item.cartId} style={{ marginBottom: '15px', borderBottom: '1px dashed #ddd', paddingBottom: '15px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '5px' }}>
                        <strong style={{ fontSize: '1.1em' }}>{item.item_name}</strong>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                          {item.isFreeDrink ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ textDecoration: 'line-through', color: '#888', fontSize: '0.9em' }}>${item.originalPrice.toFixed(2)}</span>
                              <span style={{ color: '#4CAF50', fontWeight: 'bold', fontSize: '1.1em' }}>FREE!</span>
                            </div>
                          ) : (
                            <strong>${item.finalPrice.toFixed(2)}</strong>
                          )}
                          <button 
                            onClick={() => removeFromCart(item.cartId)}
                            style={{ 
                              backgroundColor: focusArea === 'CART' && index === focusedCartIndex ? '#aa3bff' : '#ff4444', 
                              color: 'white', border: focusArea === 'CART' && index === focusedCartIndex ? '4px solid #aa3bff' : 'none', 
                              borderRadius: '4px', padding: '4px 8px', cursor: 'pointer', fontSize: '0.9em', fontWeight: 'bold',
                              transform: focusArea === 'CART' && index === focusedCartIndex ? 'scale(1.1)' : 'scale(1)',
                              boxShadow: focusArea === 'CART' && index === focusedCartIndex ? '0 4px 12px rgba(170, 59, 255, 0.3)' : 'none'
                            }}
                            title="Remove this item"
                          >×</button>
                        </div>
                      </div>
                      <div style={{ fontSize: '0.9em', color: '#666', paddingLeft: '10px', borderLeft: '2px solid #ccc' }}>
                        Size: {typeof item.size === 'object' ? item.size.name : item.size} | Temp: {item.temperature} | Ice: {item.ice} | Sugar: {item.sugar}
                        {item.toppings.map(t => <div key={t.id}>+ {t.name}</div>)}
                      </div>
                    </li>
                  ))}
                </ul>
                
                {appliedCoupon && (
                  <div style={{ backgroundColor: '#e8f5e9', padding: '12px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #4CAF50' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                      <span style={{ fontWeight: 'bold', color: '#2e7d32' }}>Coupon Applied:</span>
                      <button onClick={removeCoupon} style={{ background: 'none', border: 'none', color: '#d32f2f', cursor: 'pointer', fontSize: '18px', fontWeight: 'bold', padding: '0', lineHeight: '1' }}>×</button>
                    </div>
                    <div style={{ fontSize: '0.9em', color: '#555' }}>{appliedCoupon.description}</div>
                    <div style={{ fontSize: '0.85em', color: '#4CAF50', fontWeight: 'bold', marginTop: '3px' }}>-${calculateDiscount()}</div>
                  </div>
                )}
                
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.4em', fontWeight: 'bold', marginBottom: '20px' }}>
                  <span>{t('customer.total')}:</span><span>${calculateTotal()}</span>
                </div>
                
                <button 
                  onClick={handleCheckout} 
                  style={{ 
                    width: '100%', padding: '18px', backgroundColor: '#5c9c5f', color: 'white', 
                    border: focusArea === 'CHECKOUT' ? '4px solid #aa3bff' : 'none', borderRadius: '8px', fontSize: '1.3em', cursor: 'pointer', fontWeight: 'bold',
                    transform: focusArea === 'CHECKOUT' ? 'scale(1.03)' : 'scale(1)',
                    boxShadow: focusArea === 'CHECKOUT' ? '0 8px 15px rgba(170, 59, 255, 0.4)' : '0 4px 6px rgba(92, 156, 95, 0.3)'
                  }}
                >{t('customer.payNow')}</button>
              </>
            )}
          </div>

          {/* SPECIAL OFFERS CARD */}
          <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '12px', border: '1px solid #eee', height: 'fit-content', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
            <h3 style={{ marginTop: 0, borderBottom: '2px solid #f0f0f0', paddingBottom: '15px', color: '#5c9c5f' }}>Special Offers</h3>
            
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Enter coupon code"
                  style={{ flex: 1, padding: '12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '1em', textTransform: 'uppercase' }}
                  onKeyPress={(e) => e.key === 'Enter' && applyCoupon()}
                />
                <button onClick={applyCoupon} style={{ padding: '12px 20px', backgroundColor: '#ff9800', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1em' }}>Apply</button>
              </div>
            </div>

            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              <h4 style={{ margin: '0 0 15px 0', fontSize: '1.1em', color: '#333' }}>Available Coupons:</h4>
              {AVAILABLE_COUPONS.map((coupon, index) => (
                <div 
                  key={coupon.code}
                  style={{ 
                    padding: '12px', marginBottom: '10px', backgroundColor: '#f9f9f9', borderRadius: '6px', border: '1px solid #e0e0e0',
                    cursor: appliedCoupon?.code === coupon.code ? 'not-allowed' : 'pointer', opacity: appliedCoupon?.code === coupon.code ? 0.6 : 1
                  }}
                  onClick={() => !appliedCoupon && setCouponCode(coupon.code)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                    <span style={{ fontWeight: 'bold', color: '#ff9800' }}>{coupon.code}</span>
                    <span style={{ fontSize: '0.85em', color: '#666' }}>{appliedCoupon?.code === coupon.code ? 'Applied' : 'Click to copy'}</span>
                  </div>
                  <div style={{ fontSize: '0.9em', color: '#555' }}>{coupon.description}</div>
                  {coupon.minOrder && <div style={{ fontSize: '0.8em', color: '#888', marginTop: '3px' }}>Min order: ${coupon.minOrder}</div>}
                </div>
              ))}
            </div>
          </div>
          
        </div>
      </div>
      
      {/* Game Buttons - Under Cart */}
      <div style={{ marginTop: '20px', display: 'flex', gap: '20px', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <button 
            onClick={() => {
              const gameWindow = window.open('/dino.html', 'dinoGame', 'width=800,height=400');
              if (gameWindow && !gameWindow.closed) gameWindow.focus();
            }}
            style={{
              backgroundColor: focusArea === 'GAME' ? '#aa3bff' : '#4CAF50',
              color: 'white', padding: '12px 24px', border: focusArea === 'GAME' ? '4px solid #aa3bff' : 'none',
              borderRadius: '8px', fontSize: '16px', cursor: 'pointer', transform: focusArea === 'GAME' ? 'scale(1.05)' : 'scale(1)',
              boxShadow: focusArea === 'GAME' ? '0 8px 15px rgba(170, 59, 255, 0.2)' : '0 4px 6px rgba(0,0,0,0.05)', transition: 'all 0.1s'
            }}
          >
            Play T-Rex Game (Win Free Drink!)
          </button>
          <p style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>Score 100+ points to make a drink free!</p>
        </div>

        <div style={{ textAlign: 'center' }}>
          <button 
            onClick={() => setShowWheel(true)}
            style={{ backgroundColor: '#ff9800', color: 'white', padding: '12px 24px', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', transition: 'all 0.1s' }}
          >
            Spin the Wheel!
          </button>
          <p style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>Win daily prizes and discounts!</p>
        </div>
      </div>
      
      {/* Spinning Wheel Modal */}
      {showWheel && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '16px', width: '90%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontSize: '1.8em', color: '#2c3e50' }}>Wheel of Fortune!</h2>
              <button onClick={() => setShowWheel(false)} style={{ background: 'none', border: 'none', fontSize: '2em', cursor: 'pointer', color: '#666', padding: '0' }}>×</button>
            </div>
            
            <p style={{ color: '#666', marginBottom: '20px', textAlign: 'center' }}>
              Spin the wheel to win amazing prizes! {hasSpunToday ? 'You can spin once per day.' : ''}
            </p>
            
            <SpinningWheel onSpinComplete={handleWheelComplete} hasSpunToday={hasSpunToday} />
            
            {wheelPrize && (
              <div style={{ marginTop: '20px', textAlign: 'center' }}>
                <button onClick={() => setShowWheel(false)} style={{ padding: '12px 24px', backgroundColor: '#5c9c5f', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}>Continue Shopping</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Chatbot Component */}
      <Chatbot />
    </div>
  );
}
