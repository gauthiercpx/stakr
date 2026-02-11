import { Link } from 'react-router-dom';
import { useI18n } from '../i18n/useI18n';

export default function Footer() {
  const { t } = useI18n();

  return (
    <footer
      style={{
        marginTop: '3rem',
        padding: '1.6rem 1.25rem',
        borderTop: '1px solid rgba(0,0,0,0.06)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1rem',
        background: 'transparent',
      }}
    >
      <div style={{ color: '#666' }}>© {new Date().getFullYear()} Stakr</div>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <Link to="/about" style={{ color: '#333', textDecoration: 'none', fontWeight: 700 }}>
          {t('nav.about')}
        </Link>
        <a href="/privacy" style={{ color: '#666', textDecoration: 'none' }}>
          {t('common.comingSoon')}
        </a>
      </div>
    </footer>
  );
}

