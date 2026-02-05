import type React from 'react';
import { useI18n } from '../i18n/useI18n';
import LanguageToggle from './LanguageToggle';

interface ServerWakingUpProps {
  title?: string;
  subtitle?: string;
  tip?: string;
}

const wrapperStyle: React.CSSProperties = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '1.25rem',
  background: 'linear-gradient(to right, #ffffff 0%, #bff104 100%)',
  position: 'relative',
};

const overlayStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  background:
    'linear-gradient(to right, rgba(255,255,255,0.85) 0%, rgba(191,241,4,0.15) 100%)',
  backdropFilter: 'blur(4px)',
  WebkitBackdropFilter: 'blur(4px)',
  pointerEvents: 'none',
};

const cardStyle: React.CSSProperties = {
  padding: '2.25rem',
  backgroundColor: 'white',
  borderRadius: '1.5rem',
  width: '100%',
  maxWidth: '26rem',
  textAlign: 'center',
  border: '1px solid rgba(0,0,0,0.06)',
  boxShadow: '0 14px 40px rgba(0,0,0,0.18), 0 3px 10px rgba(0,0,0,0.08)',
  position: 'relative',
  boxSizing: 'border-box',
};

const loaderStyle: React.CSSProperties = {
  width: '3.375rem',
  height: '3.375rem',
  borderRadius: '50%',
  border: '0.375rem solid rgba(0,0,0,0.12)',
  borderTopColor: '#000000',
  margin: '1.25rem auto 0 auto',
  animation: 'stakr-spin 1s linear infinite',
};

export default function ServerWakingUp({
  title,
  subtitle,
  tip,
}: ServerWakingUpProps) {
  const { t } = useI18n();

  const finalTitle = title ?? t('app.serverWaking.title');
  const finalSubtitle = subtitle ?? t('app.serverWaking.subtitle');
  const finalTip = tip ?? t('app.serverWaking.tip');

  return (
    <div style={wrapperStyle}>
      <div style={overlayStyle} />
      <div style={cardStyle}>
        <LanguageToggle mode="login" style={{ position: 'absolute', top: '1rem', right: '1rem' }} />

        <h1 style={{ margin: 0, fontSize: '2.25rem', color: '#000' }}>
          STAKR<span style={{ color: '#bff104' }}>.</span>
        </h1>

        {/* Reserve height (2 lines) to avoid layout jump between locales */}
        <div style={{ minHeight: '5.1rem' }}>
          <p
            style={{
              margin: '0.5rem 0 0 0',
              fontSize: '1.05rem',
              lineHeight: 1.25,
              color: '#444',
              fontWeight: 700,
            }}
          >
            {finalTitle}
          </p>
          <p
            style={{
              margin: '0.75rem 0 0 0',
              fontSize: '0.95rem',
              lineHeight: 1.4,
              color: '#666',
            }}
          >
            {finalSubtitle}
          </p>
        </div>

        <div aria-label="Loading" role="status" style={loaderStyle} />

        <p
          style={{
            margin: '1.25rem 0 0 0',
            fontSize: '0.85rem',
            lineHeight: 1.4,
            color: '#888',
            minHeight: '2.4rem',
          }}
        >
          {finalTip}
        </p>
      </div>
    </div>
  );
}
