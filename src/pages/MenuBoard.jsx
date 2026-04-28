import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentWeather, getWeatherEmoji } from '../services/weatherService';
import TextSizeToggle from '../components/TextSizeToggle';
import { useI18n } from '../i18n/I18nProvider';
import { useA11y } from '../a11y/A11yProvider';

/**
 * MenuBoard Component
 * 
 * A digital menu display board for customers showing available menu items.
 * Features weather display, accessibility text sizing, and real-time menu data.
 * Designed for large screen displays in restaurant environments.
 */
export default function MenuBoard() {
  const navigate = useNavigate();
  const { t } = useI18n(); // Translation function
  const { textSize } = useA11y(); // Text size from accessibility context
  
  const baseFontSize = `${textSize}em`; // Dynamic font size based on user preference
  
  // Weather State - Displays current weather conditions
  const [weather, setWeather] = useState({
    temperature: 75,
    description: 'Clear',
    location: 'College Station',
    icon: '01d',
    loading: true,
    isRealData: false
  });

  // Database Menu State - Menu items from backend
  const [menuItems, setMenuItems] = useState([]); // Menu items from API
  const [menuLoading, setMenuLoading] = useState(true); // Loading state for menu fetch

  // 1. Fetch Weather Data on mount and set up periodic updates
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const weatherData = await getCurrentWeather();
        setWeather({ ...weatherData, loading: false });
      } catch (error) {
        console.error('Failed to fetch weather:', error);
        setWeather(prev => ({ ...prev, loading: false }));
      }
    };

    // Initial fetch of weather data
    fetchWeather();
    // Refresh weather every 10 minutes
    const interval = setInterval(fetchWeather, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // 2. Fetch Menu Data from backend
  useEffect(() => {
    // Function to fetch menu data from backend API
    const fetchMenu = async () => {
      try {
        const response = await fetch('/api/menu');
        if (!response.ok) throw new Error('Network response was not ok');
        
        const data = await response.json();
        setMenuItems(data);
      } catch (error) {
        console.error('Error fetching menu from database:', error);
      } finally {
        setMenuLoading(false);
      }
    };

    // Initial fetch of menu data
    fetchMenu();
  }, []);

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', backgroundColor: '#111', color: '#fff', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontSize: baseFontSize, position: 'relative' }}>
      <TextSizeToggle />
      
      <button 
        onClick={() => navigate('/')} 
        style={{ alignSelf: 'flex-start', marginBottom: '20px', padding: '10px 15px', cursor: 'pointer', backgroundColor: '#333', color: '#fff', border: '1px solid #555', borderRadius: '5px' }}
      >
        ← {t('common.backToPortal')}
      </button>

      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '4px solid #aa3bff', paddingBottom: '20px' }}>
        <h1 style={{ fontSize: '48px', margin: 0 }}>Menu</h1>
        <div style={{ fontSize: '24px', color: '#aaa' }}>
          {weather.loading ? (
            'Loading weather...'
          ) : (
            <span>
              {getWeatherEmoji(weather.icon)} {weather.temperature}°F {weather.location}
              {!weather.isRealData && <span style={{ color: '#ff6b6b', fontSize: '14px', marginLeft: '8px' }}>(API inactive)</span>}
            </span>
          )}
        </div>
      </header>
      
      <main style={{ marginTop: '40px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
        {menuLoading ? (
          <p style={{ fontSize: '24px', color: '#aaa', textAlign: 'center' }}>Loading fresh menu...</p>
        ) : (
          menuItems.map((item, idx) => (
            <div key={item.id || idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#222', padding: '30px', borderRadius: '16px' }}>
              <div>
                <h2 style={{ fontSize: '36px', margin: '0 0 10px 0', color: '#aa3bff' }}>{item.item_name}</h2>
                {item.description && <p style={{ fontSize: '20px', color: '#ccc', margin: 0 }}>{item.description}</p>}
              </div>
              
              <span style={{ fontSize: '42px', fontWeight: 'bold' }}>${Number(item.price).toFixed(2)}</span>
            </div>
          ))
        )}
      </main>
    </div>
  );
}