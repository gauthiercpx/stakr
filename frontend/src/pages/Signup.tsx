import { useState, useCallback, useRef } from 'react';
import type { FocusEvent } from 'react';
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

const formatFirstName = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return '';
  // Title Case for composed first names: after space or hyphen.
  // Keep apostrophes within segments (e.g. d'Artagnan -> D'artagnan).
  return trimmed
    .toLowerCase()
    .split(/(\s+|-)/g)
    .map((part) => {
      if (part === '-' || /^\s+$/.test(part)) return part;
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join('');
};

const formatLastName = (value: string) => value.trim().toUpperCase();

const formatJobTitle = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return '';
  // Standard-ish title case: capitalize each word, keep separators.
  return trimmed
    .toLowerCase()
    .split(/(\s+|-)/g)
    .map((part) => {
      if (part === '-' || /^\s+$/.test(part)) return part;
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join('');
};

const isValidFirstNameFormat = (value: string) => {
  const v = normalizeText(value);
  // letters (incl accents), spaces, hyphens, apostrophes
  return /^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/.test(v);
};

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

  const [showPassword, setShowPassword] = useState(false);

  // Refs to force immediate DOM updates on blur (avoid perceived lag)
  const emailRef = useRef<HTMLInputElement | null>(null);
  const confirmEmailRef = useRef<HTMLInputElement | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  // Global non-field error (server, generic)
  const [error, setError] = useState('');
  // Per-field errors: key is the input name (first_name, last_name, username, password, confirm_password, job_title)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // --- Single-error policy ---
  // We only display one error message at a time, with a clear priority order.
  // We still keep fieldErrors as raw state to drive red borders, but the UI message is single.
  type ActiveError = { id: string; message: string; fields: string[] };
  const getActiveError = (): ActiveError | null => {
    // field-level order
    const candidates: Array<{ key: string; id: string; fields: string[] }> = [
      { key: 'first_name', id: 'signup-error-first_name', fields: ['first_name'] },
      { key: 'last_name', id: 'signup-error-last_name', fields: ['last_name'] },
      { key: 'job_title', id: 'signup-error-job_title', fields: ['job_title'] },
      { key: 'username', id: 'signup-error-username', fields: ['username'] },
      // mismatch (pair)
      { key: 'email_mismatch', id: 'signup-error-emails', fields: ['username', 'confirm_email'] },
      { key: 'confirm_email', id: 'signup-error-confirm_email', fields: ['confirm_email'] },
      { key: 'password', id: 'signup-error-passwords', fields: ['password'] },
      { key: 'confirm_password', id: 'signup-error-passwords', fields: ['password', 'confirm_password'] },
    ];
    for (const c of candidates) {
      const msg = fieldErrors[c.key];
      if (msg) return { id: c.id, message: msg, fields: c.fields };
    }
    return null;
  };

  const activeError = getActiveError();

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

  // --- UX rule: show errors on blur/submit only, but clear them immediately once fixed ---
  const hasError = (field: string) => !!fieldErrors[field];

  const clearEmailMismatchIfFixed = (nextEmail: string, nextConfirm: string) => {
    if (!hasError('email_mismatch')) return;
    const e = nextEmail.trim().toLowerCase();
    const c = nextConfirm.trim().toLowerCase();
    if (e && c && e === c) {
      clearFieldError('email_mismatch');
    }
  };

  const clearPasswordMismatchIfFixed = (nextPwd: string, nextConfirmPwd: string) => {
    if (!hasError('confirm_password')) return;
    if (nextPwd && nextConfirmPwd && nextPwd === nextConfirmPwd) {
      clearFieldError('confirm_password');
    }
  };

  const clearPasswordTooShortIfFixed = (nextPwd: string) => {
    if (!hasError('password')) return;
    if (nextPwd.length >= 8) {
      clearFieldError('password');
    }
  };

  const handleSignup = useCallback(
    async (evt?: unknown) => {
      const e = evt as SubmitEvent | undefined;
      e?.preventDefault();

      const normalizedFirstName = normalizeText(firstName);
      const normalizedLastName = normalizeText(lastName);
      const normalizedJobTitle = normalizeText(jobTitle);
      // Trim + lowercase the visible email field so the input is updated when the user clicks Create.
      const trimmedEmail = email.trim();
      const trimmedEmailLower = trimmedEmail.toLowerCase();
      setEmail(trimmedEmailLower);
      const normalizedEmail = trimmedEmailLower;

      // Clear previous errors
      setError('');
      clearAllFieldErrors();

      // Quick client-side validation before calling the API.
      if (!isValidName(normalizedFirstName)) {
        setFieldError('first_name', t('signup.firstName.required'));
        return;
      }
      if (!isValidFirstNameFormat(normalizedFirstName)) {
        setFieldError('first_name', t('signup.firstName.invalidFormat'));
        return;
      }
      if (!isValidName(normalizedLastName)) {
        setFieldError('last_name', t('signup.lastName.required'));
        return;
      }
      if (confirmEmail.trim() === '' || normalizedEmail !== confirmEmail.trim().toLowerCase()) {
        setFieldError('email_mismatch', t('signup.email.mismatch'));
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

  // --- New: validate on blur helpers ---
  const validateFirstName = () => {
    const formatted = formatFirstName(firstName);
    if (formatted !== firstName) setFirstName(formatted);
    const v = normalizeText(formatted);
    if (!isValidName(v)) {
      setFieldError('first_name', t('signup.firstName.required'));
      return false;
    }
    if (!isValidFirstNameFormat(v)) {
      setFieldError('first_name', t('signup.firstName.invalidFormat'));
      return false;
    }
    clearFieldError('first_name');
    return true;
  };

  const validateLastName = () => {
    const formatted = formatLastName(lastName);
    if (formatted !== lastName) setLastName(formatted);
    const v = normalizeText(formatted);
    if (!isValidName(v)) {
      setFieldError('last_name', t('signup.lastName.required'));
      return false;
    }
    clearFieldError('last_name');
    return true;
  };

  const validateJobTitle = () => {
    // job title is optional; normalize on blur
    const formatted = formatJobTitle(jobTitle);
    if (formatted !== jobTitle) setJobTitle(formatted);
    clearFieldError('job_title');
    return true;
  };

  const validateEmailField = (e?: FocusEvent<HTMLInputElement>) => {
    // prefer event value, else ref, else state
    const raw = e ? e.currentTarget.value : emailRef.current?.value ?? email;
    const trimmed = raw.trim();
    const lower = trimmed.toLowerCase();
    // update DOM immediately via ref/event with lowercase
    if (e) {
      try {
        e.currentTarget.value = lower;
      } catch {
        // ignore (some browsers/inputs may throw on programmatic value set)
      }
    } else if (emailRef.current) {
      try {
        emailRef.current.value = lower;
      } catch {
        // ignore
      }
    }
    setEmail(lower);
    const normalized = lower; // already lowercase
    if (!trimmed || !isValidEmail(normalized)) {
      setFieldError('username', t('signup.email.invalid'));
      clearFieldError('email_mismatch');
      return false;
    }
    clearFieldError('username');
    // also check confirm if already filled
    // normalize confirm email value too if present (use ref to update DOM)
    const rawConfirm = confirmEmailRef.current?.value ?? confirmEmail;
    const trimmedConfirm = rawConfirm.trim();
    const lowerConfirm = trimmedConfirm.toLowerCase();
    if (confirmEmailRef.current) {
      try {
        confirmEmailRef.current.value = lowerConfirm;
      } catch {
        // ignore
      }
    }
    setConfirmEmail(lowerConfirm);
    if (lowerConfirm !== '' && lowerConfirm !== normalized) {
      setFieldError('email_mismatch', t('signup.email.mismatch'));
    } else {
      clearFieldError('email_mismatch');
    }
    return true;
  };

  const validateConfirmEmailField = (e?: FocusEvent<HTMLInputElement>) => {
    const raw = e ? e.currentTarget.value : confirmEmailRef.current?.value ?? confirmEmail;
    const trimmed = raw.trim();
    const lower = trimmed.toLowerCase();
    if (e) {
      try {
        e.currentTarget.value = lower;
      } catch {
        // ignore
      }
    } else if (confirmEmailRef.current) {
      try {
        confirmEmailRef.current.value = lower;
      } catch {
        // ignore
      }
    }
    setConfirmEmail(lower);
    const normalized = lower;
    if (!trimmed || !isValidEmail(normalized)) {
      setFieldError('confirm_email', t('signup.email.invalid'));
      clearFieldError('email_mismatch');
      return false;
    }
    if (email.trim().toLowerCase() !== normalized) {
      setFieldError('email_mismatch', t('signup.email.mismatch'));
      return false;
    }
    clearFieldError('email_mismatch');
    clearFieldError('confirm_email');
    return true;
  };

  const validatePasswordField = () => {
    if (!password) {
      setFieldError('password', t('signup.password.required'));
      return false;
    }
    if (password.length < 8) {
      setFieldError('password', t('signup.password.tooShort'));
      return false;
    }
    clearFieldError('password');
    // also validate confirm password if present
    if (confirmPassword !== '' && confirmPassword !== password) {
      setFieldError('confirm_password', t('signup.password.mismatch'));
    } else {
      clearFieldError('confirm_password');
    }
    return true;
  };

  const validateConfirmPasswordField = () => {
    if (!confirmPassword) {
      setFieldError('confirm_password', t('signup.password.mismatch'));
      return false;
    }
    if (password !== confirmPassword) {
      setFieldError('confirm_password', t('signup.password.mismatch'));
      return false;
    }
    clearFieldError('confirm_password');
    return true;
  };

  // --- onChange clearing (does NOT create new errors) ---
  const onFirstNameChange = (raw: string) => {
    // Don't force casing while typing; normalize on blur.
    setFirstName(raw);
    if (hasError('first_name')) {
      const nv = normalizeText(raw);
      if (isValidName(nv) && isValidFirstNameFormat(nv)) {
        clearFieldError('first_name');
      }
    }
  };

  const onLastNameChange = (raw: string) => {
    // Don't force casing while typing; normalize on blur.
    setLastName(raw);
    if (hasError('last_name')) {
      const nv = normalizeText(raw);
      if (isValidName(nv)) {
        clearFieldError('last_name');
      }
    }
  };

  const onEmailChange = (raw: string) => {
    setEmail(raw);

    // clear invalid-format error as soon as it's valid
    if (hasError('username')) {
      const normalized = raw.trim().toLowerCase();
      if (normalized && isValidEmail(normalized)) {
        clearFieldError('username');
      }
    }
    // clear mismatch if fixed
    clearEmailMismatchIfFixed(raw, confirmEmail);
  };

  const onConfirmEmailChange = (raw: string) => {
    setConfirmEmail(raw);

    if (hasError('confirm_email')) {
      const normalized = raw.trim().toLowerCase();
      if (normalized && isValidEmail(normalized)) {
        clearFieldError('confirm_email');
      }
    }
    clearEmailMismatchIfFixed(email, raw);
  };

  const onPasswordChange = (raw: string) => {
    setPassword(raw);
    clearPasswordTooShortIfFixed(raw);
    clearPasswordMismatchIfFixed(raw, confirmPassword);
  };

  const onConfirmPasswordChange = (raw: string) => {
    setConfirmPassword(raw);
    clearPasswordMismatchIfFixed(password, raw);
  };

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

      {/* Error area (single message) */}
      <div aria-live="polite" style={{ minHeight: '20px', marginBottom: '1rem' }}>
        {error ? (
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
        ) : activeError ? (
          <div
            id={activeError.id}
            role="alert"
            className="stakr-field-error"
            style={{ width: '100%' }}
          >
            {activeError.message}
          </div>
        ) : null}
      </div>

      <form onSubmit={handleSignup} className="stakr-signup__form" noValidate>
        <div className="stakr-signup__grid">
          {/* first name */}
          <div className="stakr-field">
            <input
              name="first_name"
              aria-label={t('signup.firstName.label')}
              aria-describedby={fieldErrors['first_name'] ? 'signup-error-first_name' : error ? 'signup-error' : undefined}
              type="text"
              autoComplete="given-name"
              required
              placeholder={t('signup.firstName.placeholder')}
              value={firstName}
              onChange={(e) => {
                onFirstNameChange(e.target.value);
                if (error) setError('');
              }}
              onBlur={validateFirstName}
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
          </div>

          {/* last name */}
          <div className="stakr-field">
            <input
              name="last_name"
              aria-label={t('signup.lastName.label')}
              aria-describedby={fieldErrors['last_name'] ? 'signup-error-last_name' : error ? 'signup-error' : undefined}
              type="text"
              autoComplete="family-name"
              required
              placeholder={t('signup.lastName.placeholder')}
              value={lastName}
              onChange={(e) => {
                onLastNameChange(e.target.value);
                if (error) setError('');
              }}
              onBlur={validateLastName}
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
          </div>

          {/* job title (optional, full width) */}
          <div className="stakr-signup__full stakr-field">
            <input
              name="job_title"
              aria-label={t('signup.jobTitle.label')}
              aria-describedby={fieldErrors['job_title'] ? 'signup-error-job_title' : undefined}
              type="text"
              autoComplete="organization-title"
              placeholder={t('signup.jobTitle.placeholder')}
              value={jobTitle}
              onChange={(e) => {
                setJobTitle(e.target.value);
                if (error) setError('');
              }}
              onBlur={validateJobTitle}
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
          </div>

          {/* email */}
          <div className="stakr-field">
            <input
              ref={emailRef}
              name="username"
              aria-label={t('signup.email.placeholder')}
              aria-describedby={fieldErrors['username'] ? 'signup-error-username' : error ? 'signup-error' : undefined}
              type="email"
              autoComplete="email"
              required
              placeholder={t('signup.email.placeholder')}
              value={email}
              onChange={(e) => {
                onEmailChange(e.target.value);
                if (error) setError('');
              }}
              onBlur={validateEmailField}
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '1rem',
                borderRadius: '0.75rem',
                border: fieldErrors['username'] || fieldErrors['email_mismatch'] ? '2px solid #ffcdd2' : '2px solid #f0f0f0',
                backgroundColor: isLoading ? '#e9ecef' : '#f8f9fa',
                fontSize: '1rem',
                outline: 'none',
                transition: 'all 0.2s',
                fontFamily: 'inherit',
              }}
              aria-invalid={!!(fieldErrors['username'] || fieldErrors['email_mismatch'])}
            />
          </div>

          {/* confirm email */}
          <div className="stakr-field">
            <input
              ref={confirmEmailRef}
              name="confirm_email"
              aria-label={t('signup.emailConfirm.placeholder')}
              aria-describedby={
                fieldErrors['confirm_email'] ? 'signup-error-confirm_email' : error ? 'signup-error' : undefined
              }
              type="email"
              autoComplete="email"
              required
              placeholder={t('signup.emailConfirm.placeholder')}
              value={confirmEmail}
              onChange={(e) => {
                onConfirmEmailChange(e.target.value);
                if (error) setError('');
              }}
              onBlur={validateConfirmEmailField}
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '1rem',
                borderRadius: '0.75rem',
                border: fieldErrors['confirm_email'] || fieldErrors['email_mismatch'] ? '2px solid #ffcdd2' : '2px solid #f0f0f0',
                backgroundColor: isLoading ? '#e9ecef' : '#f8f9fa',
                fontSize: '1rem',
                outline: 'none',
                transition: 'all 0.2s',
                fontFamily: 'inherit',
              }}
              aria-invalid={!!(fieldErrors['confirm_email'] || fieldErrors['email_mismatch'])}
            />
          </div>

          {/* password */}
          <div className={`stakr-field stakr-passwordField ${isLoading ? 'is-disabled' : ''}`}>
             <input
               name="password"
               aria-label={t('signup.password.placeholder')}
               aria-describedby={fieldErrors['password'] ? 'signup-error-passwords' : error ? 'signup-error' : undefined}
               type={showPassword ? 'text' : 'password'}
               autoComplete="new-password"
               required
               placeholder={t('signup.password.placeholder')}
               value={password}
               onChange={(e) => {
                 onPasswordChange(e.target.value);
                 if (error) setError('');
               }}
               onBlur={validatePasswordField}
               disabled={isLoading}
               style={{
                 width: '100%',
                 padding: '1rem',
                 borderRadius: '0.75rem',
                 border: fieldErrors['password'] || fieldErrors['confirm_password'] ? '2px solid #ffcdd2' : '2px solid #f0f0f0',
                 backgroundColor: isLoading ? '#e9ecef' : '#f8f9fa',
                 fontSize: '1rem',
                 outline: 'none',
                 transition: 'all 0.2s',
                 fontFamily: 'inherit',
               }}
               aria-invalid={!!(fieldErrors['password'] || fieldErrors['confirm_password'])}
             />
             <button
               type="button"
               onClick={() => setShowPassword((s) => !s)}
               aria-label={showPassword ? t('common.hide') : t('common.show')}
               aria-pressed={showPassword}
               disabled={isLoading}
               className="stakr-passwordToggle"
             >
               {showPassword ? t('common.hide') : t('common.show')}
             </button>
           </div>

           {/* confirm password */}
           <div className={`stakr-field stakr-passwordField ${isLoading ? 'is-disabled' : ''}`}>
             <input
               name="confirm_password"
               aria-label={t('signup.passwordConfirm.placeholder')}
               aria-describedby={
                 fieldErrors['confirm_password'] ? 'signup-error-passwords' : error ? 'signup-error' : undefined
               }
               type={showPassword ? 'text' : 'password'}
               autoComplete="new-password"
               required
               placeholder={t('signup.passwordConfirm.placeholder')}
               value={confirmPassword}
               onChange={(e) => {
                 onConfirmPasswordChange(e.target.value);
                 if (error) setError('');
               }}
               onBlur={validateConfirmPasswordField}
               disabled={isLoading}
               style={{
                 width: '100%',
                 padding: '1rem',
                 borderRadius: '0.75rem',
                 border: fieldErrors['password'] || fieldErrors['confirm_password'] ? '2px solid #ffcdd2' : '2px solid #f0f0f0',
                 backgroundColor: isLoading ? '#e9ecef' : '#f8f9fa',
                 fontSize: '1rem',
                 outline: 'none',
                 transition: 'all 0.2s',
                 fontFamily: 'inherit',
               }}
               aria-invalid={!!(fieldErrors['password'] || fieldErrors['confirm_password'])}
             />
             <button
               type="button"
               onClick={() => setShowPassword((s) => !s)}
               aria-label={showPassword ? t('common.hide') : t('common.show')}
               aria-pressed={showPassword}
               disabled={isLoading}
               className="stakr-passwordToggle"
             >
               {showPassword ? t('common.hide') : t('common.show')}
             </button>
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
              width: '100%',
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
                width: '100%',
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

  return content;
}

