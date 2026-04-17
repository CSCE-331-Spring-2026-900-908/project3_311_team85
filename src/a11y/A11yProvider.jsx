import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'octagon_text_size';

const A11yContext = createContext(null);

function getStoredTextSize() {
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    const parsed = parseFloat(v);
    if (!isNaN(parsed) && parsed >= 1.0 && parsed <= 2.0) return parsed;
  } catch {
    // ignore
  }
  return 1.0;
}

export function A11yProvider({ children }) {
  const [textSize, setTextSize] = useState(getStoredTextSize);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, textSize.toString());
    } catch {
      // ignore
    }
  }, [textSize]);

  const value = useMemo(() => {
    const setTextSizeValue = (value) => {
      const numValue = parseFloat(value);
      if (!isNaN(numValue) && numValue >= 1.0 && numValue <= 2.0) {
        setTextSize(numValue);
      }
    };
    return { textSize, setTextSize: setTextSizeValue };
  }, [textSize]);

  return <A11yContext.Provider value={value}>{children}</A11yContext.Provider>;
}

export function useA11y() {
  const ctx = useContext(A11yContext);
  if (!ctx) throw new Error('useA11y must be used within an A11yProvider');
  return ctx;
}