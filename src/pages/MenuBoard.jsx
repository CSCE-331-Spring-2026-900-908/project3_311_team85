import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentWeather, getWeatherEmoji } from '../services/weatherService';
import { useI18n } from '../i18n/I18nProvider';
import { useA11y } from '../a11y/A11yProvider';
import '../components/MenuBoard.css';

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

  // Auto-cycling state for menu pages
  const [currentPage, setCurrentPage] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const intervalRef = useRef(null);
  
  // Menu categorization with pagination
  const categorizeMenuItems = (items) => {
    const itemsPerPage = 11; // Show 11 items per page for equal distribution of 22 drinks
    const pages = [];
    
    for (let i = 0; i < items.length; i += itemsPerPage) {
      const pageItems = items.slice(i, i + itemsPerPage);
      pages.push({
        name: `Beverages`,
        items: pageItems
      });
    }
    
    return pages;
  };
  
  // Database Menu State - Menu items from backend
  const [menuItems, setMenuItems] = useState([]); // Menu items from API
  const [menuLoading, setMenuLoading] = useState(true); // Loading state for menu fetch
  const [menuCategories, setMenuCategories] = useState([]);
  
  // Auto-cycling effect
  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    if (menuCategories.length <= 1) return;
    
    const startCycling = () => {
      intervalRef.current = setInterval(() => {
        setIsTransitioning(true);
        setTimeout(() => {
          setCurrentPage((prev) => (prev + 1) % menuCategories.length);
          setIsTransitioning(false);
        }, 300);
      }, 8000); // 8 seconds per page for better visibility
    };
    
    startCycling();
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [menuCategories]); // Depend on the full array, not just length
  
  // Update menu categories when menu items change
  useEffect(() => {
    if (menuItems.length > 0) {
      setMenuCategories(categorizeMenuItems(menuItems));
    }
  }, [menuItems]);
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

  // Get fallback image for menu items
  const getMenuItemImage = (itemName) => {
    // High-quality generic boba/drink fallback images
    const fallbackImages = [
      'https://images.unsplash.com/photo-1558855567-dbd7f12e2c2f?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1564890369478-c89ca6d9cda9?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1570197783114-1e00b869dc5f?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1568901343725-e2395034ae48?auto=format&fit=crop&w=400&q=80'
    ];
    
    // Use item name to determine image (consistent selection)
    const index = itemName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % fallbackImages.length;
    return fallbackImages[index];
  };

  return (
    <div className="menu-board-container" style={{ fontSize: baseFontSize }}>
      
      {/* Header with Branding and Weather */}
      <header className="menu-header">
        
        {/* Branding Section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div 
            onClick={() => navigate('/')} 
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '15px' }}
          >
            <img 
              src="/logo.png" 
              alt="Reveille Bubble Tea Logo" 
              style={{ 
                height: '50px', 
                width: '50px',
                objectFit: 'contain',
                transition: 'transform 0.2s ease'
              }}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
              }}
            />
            <div style={{ display: 'none', alignItems: 'center', justifyContent: 'center', width: '50px', height: '50px', backgroundColor: '#ff6b6b', borderRadius: '10px', color: '#fff', fontWeight: 'bold', fontSize: '20px' }}>
              OB
            </div>
            <div>
              <h1 style={{ 
                margin: 0, 
                fontSize: '32px', 
                color: '#000000',
                fontWeight: '700'
              }}>
                OCTAGON Bubble Tea
              </h1>
              <p style={{ 
                margin: '2px 0 0 0', 
                fontSize: '14px', 
                color: '#666666',
                fontWeight: '400'
              }}>
                Premium Bubble Tea & Refreshments
              </p>
            </div>
          </div>
        </div>

        {/* Persistent Weather Widget */}
        <div className="weather-widget">
          <span className="weather-icon">
            {weather.loading ? '🌡️' : getWeatherEmoji(weather.icon)}
          </span>
          <div className="weather-info">
            <div className="weather-temp">
              {weather.loading ? '--°F' : `${weather.temperature}°F`}
            </div>
            <div className="weather-location">
              {weather.location}
            </div>
          </div>
        </div>
      </header>

      {/* Main Menu Content */}
      <main className="menu-main">
        
        {menuLoading ? (
          <div className="loading-container">
            <div style={{ textAlign: 'center' }}>
              <div className="loading-spinner" />
              <p className="loading-text">Loading Fresh Menu...</p>
            </div>
          </div>
        ) : menuCategories.length > 0 ? (
          <>
            {/* Category Title */}
            <div className={`category-title ${isTransitioning ? '' : 'active'}`}>
              <h2>{menuCategories[currentPage]?.name}</h2>
            </div>

            {/* Menu Grid */}
            <div className={`menu-grid ${isTransitioning ? '' : 'active'}`}>
              {menuCategories[currentPage]?.items.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className={`menu-item-card ${isTransitioning ? '' : 'visible'}`}
                  style={{
                    animationDelay: `${idx * 0.1}s`
                  }}
                >
                  {/* Hero Image */}
                  <div 
                    className="menu-item-image"
                    style={{
                      backgroundImage: `url(${item.image_url || getMenuItemImage(item.item_name)})`
                    }}
                  />

                  {/* Item Details */}
                  <div className="menu-item-details">
                    <div className="menu-item-content">
                      <div className="menu-item-name-container">
                        <h3 className="menu-item-name">
                          {item.item_name}
                        </h3>
                      </div>
                      
                      {item.description && (
                        <p className="menu-item-description">
                          {item.description}
                        </p>
                      )}
                    </div>
                    
                    <div className="menu-item-price">
                      ${Number(item.price).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Page Indicators */}
            {menuCategories.length > 1 && (
              <div className="page-indicators">
                {menuCategories.map((_, index) => (
                  <div
                    key={index}
                    className={`page-indicator ${index === currentPage ? 'active' : ''}`}
                    onClick={() => {
                      setIsTransitioning(true);
                      setTimeout(() => {
                        setCurrentPage(index);
                        setIsTransitioning(false);
                      }, 300);
                    }}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="loading-container">
            <p style={{ fontSize: '32px', color: '#888' }}>No menu items available</p>
          </div>
        )}
      </main>
    </div>
  );
}