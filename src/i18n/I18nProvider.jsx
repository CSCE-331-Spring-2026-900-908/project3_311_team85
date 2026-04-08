import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const SUPPORTED_LANGS = /** @type {const} */ (['en', 'es']);
const DEFAULT_LANG = 'en';
const STORAGE_KEY = 'octagon_lang';

const STRINGS = {
  en: {
    common: {
      language: 'Language',
      switchToEnglish: 'Switch to English',
      switchToSpanish: 'Cambiar a español',
      english: 'English',
      spanish: 'Español',
      textSizeLarger: 'A+',
      textSizeNormal: 'A',
      increaseTextSize: 'Increase text size',
      useNormalTextSize: 'Use normal text size',
      backToPortal: 'Back to Portal',
      loading: 'Loading...',
    },
    portal: {
      title: 'OCTAGON - System Portal',
      selectInterface: 'Select your interface to begin.',
      manager: 'Manager',
      cashier: 'Cashier',
      customerKiosk: 'Customer Kiosk',
      menuBoard: 'Menu Board',
      managerDesc: 'Desktop / Keyboard & Mouse',
      cashierDesc: 'Touchscreen POS',
      customerKioskDesc: 'Self-Service Touchscreen',
      menuBoardDesc: 'Non-Interactive Display',
    },
    manager: {
      title: 'Manager Dashboard',
      subtitle: 'Inventory Management',
      inventoryLevels: 'Inventory Levels',
      addItem: '+ Add Item',
      table: {
        id: 'ID',
        itemName: 'Item Name',
        currentStock: 'Current Stock',
        status: 'Status',
        actions: 'Actions',
        update: 'Update',
      },
    },
    cashier: {
      title: 'Cashier Terminal',
      ticketTitle: 'Current Ticket',
      ticketEmpty: 'Ticket is empty',
      total: 'Total',
      void: 'Void',
      submitOrder: 'Submit Order',
    },
    customer: {
      title: 'Touch to Order',
      yourOrder: 'Your Order',
      emptyCart: 'Tap an item to add it.',
      total: 'Total',
      payNow: 'Pay Now',
    },
  },
  es: {
    common: {
      language: 'Idioma',
      switchToEnglish: 'Cambiar a inglés',
      switchToSpanish: 'Switch to Spanish',
      english: 'English',
      spanish: 'Español',
      textSizeLarger: 'A+',
      textSizeNormal: 'A',
      increaseTextSize: 'Aumentar tamaño del texto',
      useNormalTextSize: 'Usar tamaño de texto normal',
      backToPortal: 'Volver al portal',
      loading: 'Cargando...',
    },
    portal: {
      title: 'OCTAGON - Portal del sistema',
      selectInterface: 'Selecciona tu interfaz para comenzar.',
      manager: 'Gerente',
      cashier: 'Cajero',
      customerKiosk: 'Kiosco de clientes',
      menuBoard: 'Menú',
      managerDesc: 'Escritorio / Teclado y mouse',
      cashierDesc: 'POS con pantalla táctil',
      customerKioskDesc: 'Autoservicio con pantalla táctil',
      menuBoardDesc: 'Pantalla no interactiva',
    },
    manager: {
      title: 'Panel de gerente',
      subtitle: 'Gestión de inventario',
      inventoryLevels: 'Niveles de inventario',
      addItem: '+ Agregar artículo',
      table: {
        id: 'ID',
        itemName: 'Nombre del artículo',
        currentStock: 'Stock actual',
        status: 'Estado',
        actions: 'Acciones',
        update: 'Actualizar',
      },
    },
    cashier: {
      title: 'Terminal de cajero',
      ticketTitle: 'Ticket actual',
      ticketEmpty: 'El ticket está vacío',
      total: 'Total',
      void: 'Anular',
      submitOrder: 'Enviar pedido',
    },
    customer: {
      title: 'Toca para pedir',
      yourOrder: 'Tu pedido',
      emptyCart: 'Toca un artículo para agregarlo.',
      total: 'Total',
      payNow: 'Pagar ahora',
    },
  },
};

function getStoredLang() {
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    if (v && SUPPORTED_LANGS.includes(v)) return v;
  } catch {
    // ignore
  }
  return DEFAULT_LANG;
}

function getByPath(obj, path) {
  return path.split('.').reduce((acc, key) => (acc && acc[key] != null ? acc[key] : undefined), obj);
}

const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(getStoredLang);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // ignore
    }
    document.documentElement.lang = lang;
  }, [lang]);

  const value = useMemo(() => {
    const t = (key) => {
      const fromLang = getByPath(STRINGS[lang], key);
      if (fromLang != null) return fromLang;
      const fallback = getByPath(STRINGS[DEFAULT_LANG], key);
      return fallback != null ? fallback : key;
    };

    const toggleLanguage = () => {
      setLang((prev) => (prev === 'en' ? 'es' : 'en'));
    };

    return { lang, setLang, toggleLanguage, t, supported: SUPPORTED_LANGS };
  }, [lang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within an I18nProvider');
  return ctx;
}
