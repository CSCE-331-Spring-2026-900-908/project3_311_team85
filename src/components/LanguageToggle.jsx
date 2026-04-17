import { useI18n } from '../i18n/I18nProvider';

/**
 * LanguageToggle Component
 * 
 * A toggle button that allows users to switch between English and Spanish languages.
 * Positioned in the top-right corner of the screen, it displays the next available language
 * and updates the application's language context when clicked.
 */
export default function LanguageToggle({ style }) {
  // Access internationalization context for language state and translation functions
  const { lang, toggleLanguage, t } = useI18n();

  // Determine what label to show on the button (the next language option)
  const nextLangLabel = lang === 'en' ? t('common.spanish') : t('common.english');
  
  // Create accessibility labels for screen readers
  const ariaLabel = lang === 'en' ? t('common.switchToSpanish') : t('common.switchToEnglish');

  return (
    <button
      type="button"
      onClick={toggleLanguage} // Toggle between 'en' and 'es' when clicked
      aria-label={ariaLabel} // Screen reader label
      title={ariaLabel} // Tooltip on hover
      style={{
        position: 'absolute',
        top: 16,
        right: 16,
        padding: '10px 12px',
        borderRadius: 10,
        border: '1px solid rgba(0,0,0,0.15)',
        background: 'rgba(255,255,255,0.9)',
        cursor: 'pointer',
        fontWeight: 700,
        letterSpacing: 0.2,
        ...style, // Allow custom styling to override defaults
      }}
    >
      {nextLangLabel}
    </button>
  );
}