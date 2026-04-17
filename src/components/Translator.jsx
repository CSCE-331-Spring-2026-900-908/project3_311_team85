import React, { useEffect } from 'react';

/**
 * Translator Component
 * 
 * A wrapper component for Google Translate functionality.
 * Renders a container div with the Google Translate element that gets initialized
 * by the Google Translate script. This component provides automatic translation
 * capabilities for the entire application.
 */
const Translator = () => {
  return (
    <div className="translation-container">
      {/* 
        Google Translate element target.
        This div is populated by the Google Translate script when it initializes.
        The script automatically detects this element and inserts the translation
        dropdown and functionality here.
      */}
      <div id="google_translate_element"></div>
    </div>
  );
};

export default Translator;