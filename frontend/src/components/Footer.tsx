import { Link } from 'react-router-dom';
import { useI18n } from '../i18n/useI18n';
import { useEffect, useState } from 'react';
import { api } from '../api/client';

// Vite lets us import JSON in TS projects.
import pkg from '../../package.json';

export default function Footer() {
  const { t } = useI18n();

  const frontendVersion = (pkg as { version?: string }).version ?? 'dev';
  const [backendVersion, setBackendVersion] = useState<string>('');

  useEffect(() => {
    let cancelled = false;
    api
      .get('/version')
      .then((res) => {
        const v = (res.data as { version?: string })?.version;
        if (!cancelled && typeof v === 'string') {
          setBackendVersion(v);
        }
      })
      .catch(() => {
        // Keep footer clean if backend is offline.
      });
    return () => {
      cancelled = true;
    };
  }, []);

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
        flexWrap: 'wrap',
      }}
    >
      <div style={{ color: '#666', display: 'flex', gap: '0.75rem', alignItems: 'baseline', flexWrap: 'wrap' }}>
        <span>© {new Date().getFullYear()} Stakr</span>
        <span style={{ fontSize: '0.92rem' }}>
          v{frontendVersion}{backendVersion ? ` · API v${backendVersion}` : ''}
        </span>
      </div>
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
