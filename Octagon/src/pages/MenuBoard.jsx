import { useState, useEffect } from 'react';
import { getCurrentWeather, getWeatherEmoji } from '../services/weatherService';

const featuredItems = [
  { name: 'Brown Sugar Boba', description: 'Our signature slow-cooked tapioca with organic milk.', price: '$5.50' },
  { name: 'Matcha Latte', description: 'Premium ceremonial grade matcha.', price: '$5.00' },
  { name: 'Taro Slush', description: 'Ice blended sweet taro root.', price: '$5.25' },
];

export default function MenuBoard() {
  const [weather, setWeather] = useState({
    temperature: 75,
    description: 'Clear',
    location: 'College Station',
    icon: '01d',
    loading: true
  });

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

    fetchWeather();
    // Refresh weather every 10 minutes
    const interval = setInterval(fetchWeather, 10 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', backgroundColor: '#111', color: '#fff', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '4px solid #aa3bff', paddingBottom: '20px' }}>
        <h1 style={{ fontSize: '48px', margin: 0 }}>Menu</h1>
        <div style={{ fontSize: '24px', color: '#aaa' }}>
          {weather.loading ? (
            'Loading weather...'
          ) : (
            `${getWeatherEmoji(weather.icon)} ${weather.temperature}°F ${weather.location}`
          )}
        </div>
      </header>
      
      <main style={{ marginTop: '40px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
        {featuredItems.map((item, idx) => (
          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#222', padding: '30px', borderRadius: '16px' }}>
            <div>
              <h2 style={{ fontSize: '36px', margin: '0 0 10px 0', color: '#aa3bff' }}>{item.name}</h2>
              <p style={{ fontSize: '20px', color: '#ccc', margin: 0 }}>{item.description}</p>
            </div>
            <span style={{ fontSize: '42px', fontWeight: 'bold' }}>{item.price}</span>
          </div>
        ))}
      </main>
    </div>
  );
}