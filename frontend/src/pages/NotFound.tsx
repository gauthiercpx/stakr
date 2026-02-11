import NeonButton from '../components/NeonButton';
import {useI18n} from '../i18n/useI18n';
import {useNavigate} from 'react-router-dom';
import AppNavbar from '../components/AppNavbar';

export default function NotFound() {
  const {t} = useI18n();
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#f4f4f4',
        fontFamily: "'Baloo 2', cursive",
      }}
    >
      <AppNavbar />

      <main
        style={{
          padding: '3rem 2rem 4rem',
          maxWidth: '760px',
          margin: '0 auto',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '1.8rem',
            padding: '2.5rem',
            border: '1px solid rgba(0,0,0,0.06)',
            boxShadow: '0 14px 40px rgba(0,0,0,0.12)',
          }}
        >
          <div
            style={{
              fontSize: '3rem',
              fontWeight: 900,
              lineHeight: 1,
              marginBottom: '0.75rem',
              color: '#000',
            }}
          >
            404
          </div>

          <h1 style={{margin: 0, fontSize: '1.6rem', color: '#000'}}>
            {t('notFound.title')}
          </h1>

          <p style={{margin: '0.9rem auto 1.75rem', color: '#666', maxWidth: '32rem'}}>
            {t('notFound.subtitle')}
          </p>

          <div style={{display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap'}}>
            <NeonButton
              label={t('notFound.goHome')}
              onClick={() => navigate('/')}
              variant="solid"
              style={{
                backgroundColor: '#bff104',
                color: '#000',
                minWidth: 'clamp(10rem, 45vw, 12rem)',
              }}
            />

            <NeonButton
              label={t('notFound.goBack')}
              onClick={() => navigate(-1)}
              variant="outline"
              style={{minWidth: 'clamp(10rem, 45vw, 12rem)'}}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
