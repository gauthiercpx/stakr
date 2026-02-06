import { useState, useCallback } from 'react';
import { api, ACCESS_TOKEN_KEY } from '../api/client';
import { useI18n } from '../i18n/useI18n';
import LanguageToggle from '../components/LanguageToggle';

// Props provided by App.tsx
interface LoginProps {
  onLoginSuccess: () => void;
  /**
   * Optional: when rendered as a modal, allow closing it.
   * When undefined, Login behaves like a normal page.
   */
  onRequestClose?: () => void;
}

const isValidEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export default function Login({ onLoginSuccess, onRequestClose }: LoginProps) {
  const { t } = useI18n();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = useCallback(
    async (evt?: React.FormEvent) => {
      if (evt) evt.preventDefault();

      const normalizedEmail = email.trim().toLowerCase();

      // Quick client-side validation before calling the API.
      if (!normalizedEmail || !isValidEmail(normalizedEmail)) {
        setError(t('login.email.invalid'));
        return;
      }
      if (!password) {
        setError(t('login.password.required'));
        return;
      }

      setError('');
      setIsLoading(true);

      try {
        const formData = new URLSearchParams();
        formData.append('username', normalizedEmail);
        formData.append('password', password);

        const response = await api.post('/auth/token', formData, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });

        localStorage.setItem(ACCESS_TOKEN_KEY, response.data.access_token);
        onLoginSuccess();
      } catch (err: unknown) {
        // Helpful in dev, but we keep UI messages user-friendly.
        if (import.meta.env.DEV) {
          console.error('Login error:', err);
        }

        const axiosErr = err as {
          response?: { status?: number; data?: { detail?: string } };
        };
        const status = axiosErr?.response?.status;
        if (status === 503) {
          setError(t('login.error.serverStarting'));
          return;
        }
        if (typeof status === 'number' && status >= 500) {
          setError(t('login.error.serverError'));
          return;
        }

        // Try to show the backend error detail when available.
        const message =
          axiosErr?.response?.data?.detail ||
          t('login.error.incorrectCredentials');
        setError(message);
      } finally {
        setIsLoading(false);
      }
    },
    [email, password, onLoginSuccess, t],
  );

  // Enable submit only when fields are filled AND email is valid.
  const canSubmit =
    email.trim() !== '' && password !== '' && isValidEmail(email.trim());

  const isDisabled = isLoading || !canSubmit;

  const content = (
    <>
      {!onRequestClose && (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <LanguageToggle mode="login" />
        </div>
      )}

      {/* Reserve height to avoid layout jump between locales */}
      <div style={{ minHeight: '5.6rem', textAlign: 'center' }}>
        <h1
          style={{
            margin: '0 0 0.5rem 0',
            fontSize: '2.5rem',
            lineHeight: 1.05,
            color: '#000',
          }}
        >
          {t('login.title')}
          <span style={{ color: '#bff104' }}>.</span>
        </h1>
        <p
          style={{
            margin: '0 0 1.5rem 0',
            fontSize: '1.1rem',
            lineHeight: 1.3,
            color: '#666',
            fontWeight: 600,
          }}
        >
          {t('login.subtitle')}
        </p>
      </div>

      {/* Error area */}
      <div aria-live="polite" style={{ minHeight: '20px', marginBottom: '1rem' }}>
        {error && (
          <div
            style={{
              color: '#d32f2f',
              backgroundColor: '#ffebee',
              padding: '10px',
              borderRadius: '8px',
              fontSize: '0.9rem',
              border: '1px solid #ffcdd2',
              animation: 'fadeIn 0.3s',
            }}
          >
            {error}
          </div>
        )}
      </div>

      <form
        onSubmit={handleLogin}
        style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
      >
        <input
          aria-label="Email"
          type="email"
          placeholder={t('login.email.placeholder')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          style={{
            padding: '1rem',
            borderRadius: '0.75rem',
            border: error ? '2px solid #ffcdd2' : '2px solid #f0f0f0',
            backgroundColor: isLoading ? '#e9ecef' : '#f8f9fa',
            fontSize: '1rem',
            outline: 'none',
            transition: 'all 0.2s',
            fontFamily: 'inherit',
          }}
        />

        <input
          aria-label="Password"
          type="password"
          placeholder={t('login.password.placeholder')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
          style={{
            padding: '1rem',
            borderRadius: '0.75rem',
            border: error ? '2px solid #ffcdd2' : '2px solid #f0f0f0',
            backgroundColor: isLoading ? '#e9ecef' : '#f8f9fa',
            fontSize: '1rem',
            outline: 'none',
            fontFamily: 'inherit',
          }}
        />

        <button
          type="submit"
          disabled={isDisabled}
          aria-busy={isLoading}
          style={{
            marginTop: '0.75rem',
            padding: '1rem',
            backgroundColor: '#000000',
            color: '#bff104',
            border: 'none',
            borderRadius: '0.75rem',
            fontSize: '1.1rem',
            fontWeight: 700,
            boxShadow: '0 6px 14px rgba(0,0,0,0.20)',
            transition: 'all 0.2s',
            opacity: isDisabled ? 0.5 : 1,
            cursor: isDisabled ? 'not-allowed' : 'pointer',
          }}
        >
          {isLoading ? t('login.submit.loading') : t('login.submit')}
        </button>

        {onRequestClose && (
          <button
            type="button"
            onClick={onRequestClose}
            disabled={isLoading}
            style={{
              marginTop: '0.25rem',
              padding: '0.85rem',
              backgroundColor: 'transparent',
              color: '#333',
              border: '1px solid rgba(0,0,0,0.12)',
              borderRadius: '0.75rem',
              fontSize: '1rem',
              fontWeight: 700,
              cursor: isLoading ? 'not-allowed' : 'pointer',
            }}
            className="stakr-focus"
          >
            {t('common.cancel')}
          </button>
        )}
      </form>
    </>
  );

  // If used as a page, keep the previous background.
  if (!onRequestClose) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          padding: '1.25rem',
          position: 'relative',
          background: 'linear-gradient(to right, #ffffff 0%, #bff104 100%)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(to right, rgba(255,255,255,0.85) 0%, rgba(191,241,4,0.15) 100%)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            padding: '2.5rem',
            backgroundColor: 'white',
            borderRadius: '1.5rem',
            width: '100%',
            maxWidth: '22.5rem',
            border: '1px solid rgba(0,0,0,0.06)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.18), 0 2px 6px rgba(0,0,0,0.08)',
            position: 'relative',
          }}
        >
          {content}
        </div>
      </div>
    );
  }

  return content;
}