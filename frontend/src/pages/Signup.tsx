import { useState, useCallback } from 'react';
// React 19 (@types/react) marks FormEvent as deprecated in this project.
// We use the standard DOM SubmitEvent via a safe cast in the submit handler.
import { api, ACCESS_TOKEN_KEY } from '../api/client';
import { useI18n } from '../i18n/useI18n';
import LanguageToggle from '../components/LanguageToggle';

// Props provided by App.tsx
interface SignupProps {
  onSignupSuccess: () => void;
  /**
   * Optional: when rendered as a modal, allow closing it.
   * When undefined, Signup behaves like a normal page.
   */
  onRequestClose?: () => void;
}

const isValidEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const normalizeText = (value: string) => value.trim();

const isValidName = (value: string) => {
  const v = normalizeText(value);
  // Keep it permissive: allow letters, spaces, hyphens, apostrophes.
  return v.length >= 1 && v.length <= 50;
};

export default function Signup({ onSignupSuccess, onRequestClose }: SignupProps) {
  const { t } = useI18n();

  // Helper: normalize backend error into a readable string
  const formatError = (err: unknown): string => {
    try {
      const axiosErr = err as { response?: { status?: number; data?: unknown } };
      const status = axiosErr?.response?.status;
      const data = axiosErr?.response?.data;

      // Prefer a string 'detail' field if present
      const detail =
        data && typeof data === 'object' && data !== null
          ? ((data as { detail?: unknown; message?: unknown; error?: unknown }).detail ??
              (data as { detail?: unknown; message?: unknown; error?: unknown }).message ??
              (data as { detail?: unknown; message?: unknown; error?: unknown }).error)
          : undefined;
      if (typeof detail === 'string') {
        // Avoid aggressive decodeURIComponent: only attempt if it looks like percent-encoding.
        let candidate = detail;
        if (/%[0-9A-Fa-f]{2}/.test(detail)) {
          try {
            candidate = decodeURIComponent(detail);
          } catch {
            candidate = detail;
          }
        }

        // 2) attempt to fix common mojibake where UTF-8 bytes were read as Latin-1
        //    e.g. 'Ã©' should become 'é'. Convert each char -> byte then decode as UTF-8
        const looksLikeMojibake = /Ã[\u00C0-\u00FF]|Â[\u00C0-\u00FF]/.test(candidate);
        if (looksLikeMojibake && typeof TextDecoder !== 'undefined') {
          try {
            const bytes = new Uint8Array([...candidate].map((c) => c.charCodeAt(0) & 0xff));
            const fixed = new TextDecoder('utf-8').decode(bytes);
            // keep the fixed version if it contains typical accented letters
            if (/[\u00C0-\u017F]/.test(fixed)) {
              return `${status ? status + ' - ' : ''}${fixed}`;
            }
          } catch {
            // fallthrough
          }
        }

        // fall back to candidate
        return `${status ? status + ' - ' : ''}${candidate}`;
      }

      if (data && typeof data === 'object') {
        return `${status ? status + ' - ' : ''}${JSON.stringify(data)}`;
      }

      return status ? `Error ${status}` : String(err ?? 'Unknown error');
    } catch {
      return String(err ?? 'Unknown error');
    }
  };

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [email, setEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  // Global non-field error (server, generic)
  const [error, setError] = useState('');
  // Per-field errors: key is the input name (first_name, last_name, username, password, confirm_password, job_title)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const setFieldError = (field: string, msg: string) => {
    setFieldErrors((s) => ({ ...s, [field]: msg }));
  };
  const clearFieldError = (field: string) => {
    setFieldErrors((s) => {
      if (!(field in s)) return s;
      const copy = { ...s };
      delete copy[field];
      return copy;
    });
  };
  const clearAllFieldErrors = () => setFieldErrors({});

  const handleSignup = useCallback(
    async (evt?: unknown) => {
      const e = evt as SubmitEvent | undefined;
      e?.preventDefault();

      const normalizedFirstName = normalizeText(firstName);
      const normalizedLastName = normalizeText(lastName);
      const normalizedJobTitle = normalizeText(jobTitle);
      const normalizedEmail = email.trim().toLowerCase();

      // Clear previous errors
      setError('');
      clearAllFieldErrors();

      // Quick client-side validation before calling the API.
      if (!isValidName(normalizedFirstName)) {
        setFieldError('first_name', t('signup.firstName.required'));
        return;
      }
      if (!isValidName(normalizedLastName)) {
        setFieldError('last_name', t('signup.lastName.required'));
        return;
      }
      if (!normalizedEmail || !isValidEmail(normalizedEmail)) {
        setFieldError('username', t('signup.email.invalid'));
        return;
      }
      if (confirmEmail.trim() === '' || normalizedEmail !== confirmEmail.trim().toLowerCase()) {
        setFieldError('confirm_email', t('signup.email.mismatch'));
        return;
      }
      if (!password) {
        setFieldError('password', t('signup.password.required'));
        return;
      }
      if (password.length < 8) {
        setFieldError('password', t('signup.password.tooShort'));
        return;
      }
      if (password !== confirmPassword) {
        setFieldError('confirm_password', t('signup.password.mismatch'));
        return;
      }

      setError('');
      setIsLoading(true);

      try {
        // 1) Create account
        await api.post('/auth/register', {
          first_name: normalizedFirstName,
          last_name: normalizedLastName,
          job_title: normalizedJobTitle || null,
          email: normalizedEmail,
          password,
        });

        // 2) Auto-login after signup
        const formData = new URLSearchParams();
        formData.append('username', normalizedEmail);
        formData.append('password', password);

        const response = await api.post('/auth/token', formData, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });

        localStorage.setItem(ACCESS_TOKEN_KEY, response.data.access_token);
        onSignupSuccess();
      } catch (err: unknown) {
        if (import.meta.env.DEV) {
          console.error('Signup error:', err);
        }

        const axiosErr = err as { response?: { status?: number; data?: unknown } };
        const status = axiosErr?.response?.status;

        if (status === 503) {
          setError(t('signup.error.serverStarting'));
          return;
        }
        // Backend uses 400 for "Email already in use".
        if (status === 400) {
          // Map to the email field rather than global error
          setFieldError('username', t('signup.error.emailAlreadyUsed'));
          return;
        }
        if (typeof status === 'number' && status >= 500) {
          const msg = formatError(err);
          setError(msg);
          return;
        }

        const message = formatError(err) || t('signup.error.generic');
        setError(message);
      } finally {
        setIsLoading(false);
      }
    },
    [firstName, lastName, jobTitle, email, confirmEmail, password, confirmPassword, onSignupSuccess, t],
  );

  // Enable submit only when fields are filled AND email is valid.
  const canSubmit =
    firstName.trim() !== '' &&
    lastName.trim() !== '' &&
    email.trim() !== '' &&
    confirmEmail.trim() !== '' &&
    password !== '' &&
    confirmPassword !== '' &&
    isValidEmail(email.trim()) &&
    email.trim().toLowerCase() === confirmEmail.trim().toLowerCase() &&
    password === confirmPassword;

  const isDisabled = isLoading || !canSubmit;

  const content = (
    <div className={`stakr-signup ${onRequestClose ? 'is-modal' : 'is-page'}`}>
      {!onRequestClose && (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <LanguageToggle mode="login" />
        </div>
      )}

      {/* Reserve height to avoid layout jump between locales */}
      <div className="stakr-signup__header" style={{ minHeight: '5.6rem', textAlign: 'center' }}>
        <h1
          style={{
            margin: '0 0 0.5rem 0',
            fontSize: '2.5rem',
            lineHeight: 1.05,
            color: '#000',
          }}
        >
          {t('signup.title')}
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
          {t('signup.subtitle')}
        </p>
      </div>

      {/* Error area */}
      <div aria-live="polite" style={{ minHeight: '20px', marginBottom: '1rem' }}>
        {error && (
          <div
            id="signup-error"
            role="alert"
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

      <form onSubmit={handleSignup} className="stakr-signup__form" noValidate>
        <div className="stakr-signup__grid">
          {/* first name */}
          <div className="stakr-field">
            <input
              name="first_name"
              aria-label={t('signup.firstName.label')}
              aria-describedby={
                fieldErrors['first_name'] ? 'signup-error-first_name' : error ? 'signup-error' : undefined
              }
              type="text"
              autoComplete="given-name"
              required
              placeholder={t('signup.firstName.placeholder')}
              value={firstName}
              onChange={(e) => {
                setFirstName(e.target.value);
                if (error) setError('');
                clearFieldError('first_name');
              }}
              disabled={isLoading}
              style={{
                padding: '1rem',
                borderRadius: '0.75rem',
                border: fieldErrors['first_name'] ? '2px solid #ffcdd2' : '2px solid #f0f0f0',
                backgroundColor: isLoading ? '#e9ecef' : '#f8f9fa',
                fontSize: '1rem',
                outline: 'none',
                transition: 'all 0.2s',
                fontFamily: 'inherit',
              }}
              aria-invalid={!!fieldErrors['first_name']}
            />
            {fieldErrors['first_name'] && (
              <div id="signup-error-first_name" className="stakr-field-error">
                {fieldErrors['first_name']}
              </div>
            )}
          </div>

          {/* last name */}
          <div className="stakr-field">
            <input
              name="last_name"
              aria-label={t('signup.lastName.label')}
              aria-describedby={
                fieldErrors['last_name'] ? 'signup-error-last_name' : error ? 'signup-error' : undefined
              }
              type="text"
              autoComplete="family-name"
              required
              placeholder={t('signup.lastName.placeholder')}
              value={lastName}
              onChange={(e) => {
                setLastName(e.target.value);
                if (error) setError('');
                clearFieldError('last_name');
              }}
              disabled={isLoading}
              style={{
                padding: '1rem',
                borderRadius: '0.75rem',
                border: fieldErrors['last_name'] ? '2px solid #ffcdd2' : '2px solid #f0f0f0',
                backgroundColor: isLoading ? '#e9ecef' : '#f8f9fa',
                fontSize: '1rem',
                outline: 'none',
                transition: 'all 0.2s',
                fontFamily: 'inherit',
              }}
              aria-invalid={!!fieldErrors['last_name']}
            />
            {fieldErrors['last_name'] && (
              <div id="signup-error-last_name" className="stakr-field-error">
                {fieldErrors['last_name']}
              </div>
            )}
          </div>

          {/* job title (full width) */}
          <div className="stakr-signup__full stakr-field">
            <input
              name="job_title"
              aria-label={t('signup.jobTitle.label')}
              aria-describedby={
                fieldErrors['job_title'] ? 'signup-error-job_title' : error ? 'signup-error' : undefined
              }
              type="text"
              autoComplete="organization-title"
              placeholder={t('signup.jobTitle.placeholder')}
              value={jobTitle}
              onChange={(e) => {
                setJobTitle(e.target.value);
                if (error) setError('');
                clearFieldError('job_title');
              }}
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '1rem',
                borderRadius: '0.75rem',
                border: fieldErrors['job_title'] ? '2px solid #ffcdd2' : '2px solid #f0f0f0',
                backgroundColor: isLoading ? '#e9ecef' : '#f8f9fa',
                fontSize: '1rem',
                outline: 'none',
                transition: 'all 0.2s',
                fontFamily: 'inherit',
              }}
              aria-invalid={!!fieldErrors['job_title']}
            />
            {fieldErrors['job_title'] && (
              <div id="signup-error-job_title" className="stakr-field-error">
                {fieldErrors['job_title']}
              </div>
            )}
          </div>

          {/* email (full width) */}
          <div className="stakr-field">
            <input
              // Use a recognized username/email field name so password managers link it to credentials.
              name="username"
              aria-label="Email"
              aria-describedby={
                fieldErrors['username'] ? 'signup-error-username' : error ? 'signup-error' : undefined
              }
              type="email"
              autoComplete="username"
              inputMode="email"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              required
              placeholder={t('signup.email.placeholder')}
              value={email}
              onChange={(e) => {
                const v = e.target.value;
                setEmail(v);
                if (error) setError('');
                // Live email validation
                if (v.trim() === '') {
                  clearFieldError('username');
                } else if (!isValidEmail(v)) {
                  setFieldError('username', t('signup.email.invalid'));
                } else {
                  clearFieldError('username');
                }
                // Live confirm email validation
                if (confirmEmail.trim() === '') {
                  clearFieldError('confirm_email');
                } else if (v.trim().toLowerCase() !== confirmEmail.trim().toLowerCase()) {
                  setFieldError('confirm_email', t('signup.email.mismatch'));
                } else {
                  clearFieldError('confirm_email');
                }
              }}
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '1rem',
                borderRadius: '0.75rem',
                border: fieldErrors['username'] ? '2px solid #ffcdd2' : '2px solid #f0f0f0',
                backgroundColor: isLoading ? '#e9ecef' : '#f8f9fa',
                fontSize: '1rem',
                outline: 'none',
                transition: 'all 0.2s',
                fontFamily: 'inherit',
              }}
              aria-invalid={!!fieldErrors['username']}
            />
            {fieldErrors['username'] && (
              <div id="signup-error-username" className="stakr-field-error">
                {fieldErrors['username']}
              </div>
            )}
          </div>

          {/* confirm email */}
          <div className="stakr-field">
            <input
              name="confirm_email"
              aria-label={t('signup.emailConfirm.placeholder')}
              aria-describedby={
                fieldErrors['confirm_email'] ? 'signup-error-confirm_email' : error ? 'signup-error' : undefined
              }
              type="email"
              autoComplete="email"
              inputMode="email"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              required
              placeholder={t('signup.emailConfirm.placeholder')}
              value={confirmEmail}
              onChange={(e) => {
                const v = e.target.value;
                setConfirmEmail(v);
                if (error) setError('');
                if (v.trim() === '') {
                  clearFieldError('confirm_email');
                } else if (!isValidEmail(v)) {
                  setFieldError('confirm_email', t('signup.email.invalid'));
                } else if (email.trim().toLowerCase() !== v.trim().toLowerCase()) {
                  setFieldError('confirm_email', t('signup.email.mismatch'));
                } else {
                  clearFieldError('confirm_email');
                }
              }}
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '1rem',
                borderRadius: '0.75rem',
                border: fieldErrors['confirm_email'] ? '2px solid #ffcdd2' : '2px solid #f0f0f0',
                backgroundColor: isLoading ? '#e9ecef' : '#f8f9fa',
                fontSize: '1rem',
                outline: 'none',
                transition: 'all 0.2s',
                fontFamily: 'inherit',
              }}
              aria-invalid={!!fieldErrors['confirm_email']}
            />
            {fieldErrors['confirm_email'] && (
              <div id="signup-error-confirm_email" className="stakr-field-error">
                {fieldErrors['confirm_email']}
              </div>
            )}
          </div>

          {/* password */}
          <div className="stakr-field">
            <input
              name="password"
              aria-label="Password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              placeholder={t('signup.password.placeholder')}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError('');
                clearFieldError('password');
                if (confirmPassword !== '' && e.target.value !== confirmPassword) {
                  setFieldError('confirm_password', t('signup.password.mismatch'));
                } else {
                  clearFieldError('confirm_password');
                }
              }}
              disabled={isLoading}
              style={{
                padding: '1rem',
                borderRadius: '0.75rem',
                border: fieldErrors['password'] ? '2px solid #ffcdd2' : '2px solid #f0f0f0',
                backgroundColor: isLoading ? '#e9ecef' : '#f8f9fa',
                fontSize: '1rem',
                outline: 'none',
                fontFamily: 'inherit',
              }}
              aria-invalid={!!fieldErrors['password']}
            />
            {fieldErrors['password'] && (
              <div id="signup-error-password" className="stakr-field-error">
                {fieldErrors['password']}
              </div>
            )}
          </div>

          {/* confirm password */}
          <div className="stakr-field">
            <input
              // Standard name helps some password managers treat it as confirmation.
              name="confirm_password"
              aria-label="Confirm password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              placeholder={t('signup.passwordConfirm.placeholder')}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (error) setError('');
                if (password !== '' && e.target.value !== password) {
                  setFieldError('confirm_password', t('signup.password.mismatch'));
                } else {
                  clearFieldError('confirm_password');
                }
              }}
              disabled={isLoading}
              style={{
                padding: '1rem',
                borderRadius: '0.75rem',
                border: fieldErrors['confirm_password'] ? '2px solid #ffcdd2' : '2px solid #f0f0f0',
                backgroundColor: isLoading ? '#e9ecef' : '#f8f9fa',
                fontSize: '1rem',
                outline: 'none',
                fontFamily: 'inherit',
              }}
              aria-invalid={!!fieldErrors['confirm_password']}
            />
            {fieldErrors['confirm_password'] && (
              <div id="signup-error-confirm_password" className="stakr-field-error">
                {fieldErrors['confirm_password']}
              </div>
            )}
          </div>
        </div>

        <div className="stakr-signup__actions">
          <button
            type="submit"
            disabled={isDisabled}
            aria-busy={isLoading}
            style={{
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
            className="stakr-signup__primary"
          >
            {isLoading ? t('signup.submit.loading') : t('signup.submit')}
          </button>

          {onRequestClose && (
            <button
              type="button"
              onClick={onRequestClose}
              disabled={isLoading}
              style={{
                padding: '0.85rem',
                backgroundColor: 'transparent',
                color: '#333',
                border: '1px solid rgba(0,0,0,0.12)',
                borderRadius: '0.75rem',
                fontSize: '1rem',
                fontWeight: 700,
                cursor: isLoading ? 'not-allowed' : 'pointer',
              }}
              className="stakr-focus stakr-signup__secondary"
            >
              {t('common.cancel')}
            </button>
          )}
        </div>
      </form>
    </div>
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

        <div className="stakr-signup__card">
          {content}
        </div>
      </div>
    );
  }

  return content;
}

