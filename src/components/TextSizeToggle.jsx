import { useState } from 'react';
import { useA11y } from '../a11y/A11yProvider';
import { useI18n } from '../i18n/I18nProvider';

/**
 * TextSizeToggle Component
 * 
 * An accessibility component that allows users to adjust text size across the application.
 * Features a compact "Aa" button that reveals a slider when clicked, enabling users
 * to scale text from 100% to 200%. The slider only appears when needed to keep the UI clean.
 */
export default function TextSizeToggle({ style }) {
  // Access accessibility context for text size state and setter
  const { textSize, setTextSize } = useA11y();
  const { t } = useI18n();
  
  // State to control slider visibility - hidden by default
  const [showSlider, setShowSlider] = useState(false);

  // Handle slider value changes and update global text size
  const handleSliderChange = (e) => {
    setTextSize(e.target.value);
  };

  // Toggle slider visibility when button is clicked
  const toggleSlider = () => {
    setShowSlider(!showSlider);
  };

  return (
    <div style={{ position: 'absolute', top: 16, right: 16, ...style }}>
      {/* Main toggle button - shows "Aa" to indicate text size control */}
      <button
        type="button"
        onClick={toggleSlider}
        aria-label="Toggle text size slider"
        title="Adjust text size"
        style={{
          padding: '10px 12px',
          borderRadius: 10,
          border: '1px solid rgba(0,0,0,0.15)',
          background: 'rgba(255,255,255,0.9)',
          cursor: 'pointer',
          fontWeight: 800,
          letterSpacing: 0.2,
        }}
      >
        Aa
      </button>
      
      {/* Slider panel - only rendered when showSlider is true */}
      {showSlider && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '8px',
            padding: '16px',
            backgroundColor: 'rgba(255,255,255,0.95)',
            border: '1px solid rgba(0,0,0,0.15)',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            zIndex: 1000, // Ensure slider appears above other content
            minWidth: '200px',
          }}
        >
          {/* Current text size display */}
          <div style={{ marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#333' }}>
            Text Size: {Math.round(textSize * 100)}%
          </div>
          
          {/* Range slider for text size selection */}
          <input
            type="range"
            min="1.0"
            max="2.0"
            step="0.1"
            value={textSize}
            onChange={handleSliderChange}
            style={{
              width: '100%',
              height: '6px',
              borderRadius: '3px',
              background: '#ddd',
              outline: 'none',
              cursor: 'pointer',
            }}
          />
          
          {/* Min/Max labels for slider */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            marginTop: '4px',
            fontSize: '12px',
            color: '#666'
          }}>
            <span>100%</span>
            <span>200%</span>
          </div>
        </div>
      )}
    </div>
  );
}