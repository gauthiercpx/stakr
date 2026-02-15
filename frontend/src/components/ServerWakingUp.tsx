import { useI18n } from '../i18n/useI18n';

export default function ServerWakingUp({ title, subtitle, tip }: { title?: string; subtitle?: string; tip?: string }) {
  const { t } = useI18n();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.25rem', background: 'linear-gradient(to right, #ffffff 0%, #f7f7f7 100%)' }}>
      <div style={{ backgroundColor: 'white', borderRadius: '1.5rem', padding: '1.5rem', maxWidth: '28rem', textAlign: 'center', border: '1px solid rgba(0,0,0,0.06)' }}>
        <h2 style={{ marginTop: 0 }}>{title ?? t('app.serverWaking.title')}</h2>
        <p style={{ color: '#666' }}>{subtitle ?? t('app.serverWaking.subtitle')}</p>
        {tip && <p style={{ marginTop: '0.75rem', color: '#444', fontSize: '0.9rem' }}>{tip}</p>}
      </div>
    </div>
  );
}
