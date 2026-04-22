import { useI18n } from '../i18n/I18nProvider';

export default function LanguageToggle({ style }) {
  const { lang, toggleLanguage, t } = useI18n();

  const nextLangLabel = lang === 'en' ? t('common.spanish') : t('common.english');
  const ariaLabel = lang === 'en' ? t('common.switchToSpanish') : t('common.switchToEnglish');

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      aria-label={ariaLabel}
      title={ariaLabel}
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
        ...style,
      }}
    >
      {nextLangLabel}
    </button>
  );
}