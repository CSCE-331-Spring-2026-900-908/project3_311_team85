import axios from 'axios';

const API_KEY = 'YOUR_API_KEY_HERE'; // Replace with your OpenWeatherMap API key
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// College Station, TX coordinates
const COLLEGE_STATION_COORDS = {
  lat: 30.6280,
  lon: -96.3344
};

export const getCurrentWeather = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/weather`, {
      params: {
        lat: COLLEGE_STATION_COORDS.lat,
        lon: COLLEGE_STATION_COORDS.lon,
        appid: API_KEY,
        units: 'imperial' // For Fahrenheit
      }
    });
    
    return {
      temperature: Math.round(response.data.main.temp),
      description: response.data.weather[0].main,
      icon: response.data.weather[0].icon,
      location: 'College Station'
    };
  } catch (error) {
    console.error('Error fetching weather:', error);
    // Fallback to hardcoded data if API fails
    return {
      temperature: 75,
      description: 'Clear',
      icon: '01d',
      location: 'College Station'
    };
  }
};

// Weather icon mapping to emojis
export const getWeatherEmoji = (iconCode) => {
  const iconMap = {
    '01d': '☀️', // clear sky day
    '01n': '🌙', // clear sky night
    '02d': '⛅', // few clouds day
    '02n': '☁️', // few clouds night
    '03d': '☁️', // scattered clouds
    '03n': '☁️',
    '04d': '☁️', // broken clouds
    '04n': '☁️',
    '09d': '🌧️', // shower rain
    '09n': '🌧️',
    '10d': '🌦️', // rain day
    '10n': '🌧️', // rain night
    '11d': '⛈️', // thunderstorm
    '11n': '⛈️',
    '13d': '❄️', // snow
    '13n': '❄️',
    '50d': '🌫️', // mist
    '50n': '🌫️'
  };
  
  return iconMap[iconCode] || '🌤️';
};
