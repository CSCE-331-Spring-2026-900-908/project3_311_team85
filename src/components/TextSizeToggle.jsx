import { useA11y } from '../a11y/A11yProvider';
import { useI18n } from '../i18n/I18nProvider';

export default function TextSizeToggle({ style }) {
  const { textSize, toggleTextSize } = useA11y();
  const { t } = useI18n();

  const isLarge = textSize === 'large';
  const label = isLarge ? t('common.textSizeNormal') : t('common.textSizeLarger');
  const ariaLabel = isLarge ? t('common.useNormalTextSize') : t('common.increaseTextSize');

  return (
    <button
      type="button"
      onClick={toggleTextSize}
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
        fontWeight: 800,
        letterSpacing: 0.2,
        ...style,
      }}
    >
      {label}
    </button>
  );
}