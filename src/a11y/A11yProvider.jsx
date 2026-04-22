import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'octagon_text_size';

const A11yContext = createContext(null);

function getStoredTextSize() {
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    if (v === 'normal' || v === 'large') return v;
  } catch {
    // ignore
  }
  return 'normal';
}

export function A11yProvider({ children }) {
  const [textSize, setTextSize] = useState(getStoredTextSize);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, textSize);
    } catch {
      // ignore
    }
  }, [textSize]);

  const value = useMemo(() => {
    const toggleTextSize = () => setTextSize((prev) => (prev === 'normal' ? 'large' : 'normal'));
    return { textSize, setTextSize, toggleTextSize };
  }, [textSize]);

  return <A11yContext.Provider value={value}>{children}</A11yContext.Provider>;
}

export function useA11y() {
  const ctx = useContext(A11yContext);
  if (!ctx) throw new Error('useA11y must be used within an A11yProvider');
  return ctx;
}