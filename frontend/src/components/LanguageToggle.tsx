import type { CSSProperties } from 'react';

import { useI18n } from '../i18n/I18nProvider';

const buttonStyle: CSSProperties = {
  padding: '0.35rem 0.6rem',
  borderRadius: '999px',
  border: '1px solid rgba(0,0,0,0.15)',
  background: 'rgba(255,255,255,0.85)',
  cursor: 'pointer',
  fontSize: '0.8rem',
  fontWeight: 900,
  letterSpacing: '0.04em',
  minWidth: '5.25rem',
  height: '2rem',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.35rem',
  userSelect: 'none',
};

export default function LanguageToggle({ style }: { style?: CSSProperties }) {
  const { locale, toggleLocale } = useI18n();

  return (
    <button
      type="button"
      onClick={toggleLocale}
      aria-label="Toggle language"
      title="Switch language / Changer de langue"
      style={{ ...buttonStyle, ...style }}
    >
      <span
        style={{
          opacity: locale === 'fr' ? 1 : 0.35,
          textDecoration: locale === 'fr' ? 'underline' : 'none',
        }}
      >
        FR
      </span>
      <span style={{ opacity: 0.4 }}>|</span>
      <span
        style={{
          opacity: locale === 'en' ? 1 : 0.35,
          textDecoration: locale === 'en' ? 'underline' : 'none',
        }}
      >
        EN
      </span>
    </button>
  );
}
