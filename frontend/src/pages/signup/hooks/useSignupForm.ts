import { useCallback, useRef, useState } from 'react';
import type { FocusEvent } from 'react';

import { api, ACCESS_TOKEN_KEY } from '../../../api/client';
import type { TFunction } from '../../../i18n/types';
import { formatBackendError } from '../../../utils/formatError';
import { formatFirstName, formatJobTitle, formatLastName, normalizeText } from '../../../utils/format';
import { isValidEmail, isValidFirstNameFormat, isValidName } from '../../../utils/validate';
import type { ActiveError as AE } from '../types';

export type FieldErrors = Record<string, string>;
export type ActiveError = AE;

type UseSignupFormParams = {
  t: TFunction;
  onSignupSuccess: () => void;
};

export function useSignupForm({ t, onSignupSuccess }: UseSignupFormParams) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [email, setEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);

  const emailRef = useRef<HTMLInputElement | null>(null);
  const confirmEmailRef = useRef<HTMLInputElement | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const setFieldError = useCallback((field: string, msg: string) => {
    setFieldErrors((s) => ({ ...s, [field]: msg }));
  }, []);

  const clearFieldError = useCallback((field: string) => {
    setFieldErrors((s) => {
      if (!(field in s)) return s;
      const copy = { ...s };
      delete copy[field];
      return copy;
    });
  }, []);

  const clearAllFieldErrors = useCallback(() => setFieldErrors({}), []);

  const hasError = useCallback((field: string) => !!fieldErrors[field], [fieldErrors]);

  const clearEmailMismatchIfFixed = useCallback(
    (nextEmail: string, nextConfirm: string) => {
      if (!hasError('email_mismatch')) return;
      const e = nextEmail.trim().toLowerCase();
      const c = nextConfirm.trim().toLowerCase();
      if (e && c && e === c) {
        clearFieldError('email_mismatch');
      }
    },
    [clearFieldError, hasError],
  );

  const clearPasswordMismatchIfFixed = useCallback(
    (nextPwd: string, nextConfirmPwd: string) => {
      if (!hasError('confirm_password')) return;
      if (nextPwd && nextConfirmPwd && nextPwd === nextConfirmPwd) {
        clearFieldError('confirm_password');
      }
    },
    [clearFieldError, hasError],
  );

  const clearPasswordTooShortIfFixed = useCallback(
    (nextPwd: string) => {
      if (!hasError('password')) return;
      if (nextPwd.length >= 8) {
        clearFieldError('password');
      }
    },
    [clearFieldError, hasError],
  );

  const computeActiveError = useCallback((): ActiveError => {
    const order = [
      { key: 'first_name', id: 'signup-error-first_name', fields: ['first_name'] },
      { key: 'last_name', id: 'signup-error-last_name', fields: ['last_name'] },
      { key: 'job_title', id: 'signup-error-job_title', fields: ['job_title'] },
      { key: 'username', id: 'signup-error-username', fields: ['username'] },
      { key: 'email_mismatch', id: 'signup-error-emails', fields: ['username', 'confirm_email'] },
      { key: 'confirm_email', id: 'signup-error-confirm_email', fields: ['confirm_email'] },
      { key: 'password', id: 'signup-error-passwords', fields: ['password'] },
      { key: 'confirm_password', id: 'signup-error-passwords', fields: ['password', 'confirm_password'] },
    ];
    for (const c of order) {
      const msg = fieldErrors[c.key];
      if (msg) return { id: c.id, message: msg, fields: c.fields } as ActiveError;
    }
    return null;
  }, [fieldErrors]);

  const activeError = computeActiveError();

  // Validation helpers (on blur)
  const validateFirstName = useCallback(() => {
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
  }, [clearFieldError, firstName, setFieldError, t]);

  const validateLastName = useCallback(() => {
    const formatted = formatLastName(lastName);
    if (formatted !== lastName) setLastName(formatted);
    const v = normalizeText(formatted);
    if (!isValidName(v)) {
      setFieldError('last_name', t('signup.lastName.required'));
      return false;
    }
    clearFieldError('last_name');
    return true;
  }, [clearFieldError, lastName, setFieldError, t]);

  const validateJobTitle = useCallback(() => {
    const formatted = formatJobTitle(jobTitle);
    if (formatted !== jobTitle) setJobTitle(formatted);
    clearFieldError('job_title');
    return true;
  }, [clearFieldError, jobTitle]);

  const validateEmailField = useCallback(
    (e?: FocusEvent<HTMLInputElement>) => {
      const raw = e ? e.currentTarget.value : emailRef.current?.value ?? email;
      const trimmed = raw.trim();
      const lower = trimmed.toLowerCase();

      if (e) {
        try {
          e.currentTarget.value = lower;
        } catch {
          // ignore
        }
      } else if (emailRef.current) {
        try {
          emailRef.current.value = lower;
        } catch {
          // ignore
        }
      }

      setEmail(lower);

      if (!trimmed || !isValidEmail(lower)) {
        setFieldError('username', t('signup.email.invalid'));
        clearFieldError('email_mismatch');
        return false;
      }

      clearFieldError('username');

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

      if (lowerConfirm !== '' && lowerConfirm !== lower) {
        setFieldError('email_mismatch', t('signup.email.mismatch'));
      } else {
        clearFieldError('email_mismatch');
      }

      return true;
    },
    [clearFieldError, confirmEmail, email, setFieldError, t],
  );

  const validateConfirmEmailField = useCallback(
    (e?: FocusEvent<HTMLInputElement>) => {
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

      if (!trimmed || !isValidEmail(lower)) {
        setFieldError('confirm_email', t('signup.email.invalid'));
        clearFieldError('email_mismatch');
        return false;
      }

      if (email.trim().toLowerCase() !== lower) {
        setFieldError('email_mismatch', t('signup.email.mismatch'));
        return false;
      }

      clearFieldError('email_mismatch');
      clearFieldError('confirm_email');
      return true;
    },
    [clearFieldError, confirmEmail, email, setFieldError, t],
  );

  const validatePasswordField = useCallback(() => {
    if (!password) {
      setFieldError('password', t('signup.password.required'));
      return false;
    }
    if (password.length < 8) {
      setFieldError('password', t('signup.password.tooShort'));
      return false;
    }
    clearFieldError('password');

    if (confirmPassword !== '' && confirmPassword !== password) {
      setFieldError('confirm_password', t('signup.password.mismatch'));
    } else {
      clearFieldError('confirm_password');
    }

    return true;
  }, [clearFieldError, confirmPassword, password, setFieldError, t]);

  const validateConfirmPasswordField = useCallback(() => {
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
  }, [clearFieldError, confirmPassword, password, setFieldError, t]);

  // onChange clearing
  const onFirstNameChange = useCallback(
    (raw: string) => {
      setFirstName(raw);
      if (hasError('first_name')) {
        const nv = normalizeText(raw);
        if (isValidName(nv) && isValidFirstNameFormat(nv)) {
          clearFieldError('first_name');
        }
      }
    },
    [clearFieldError, hasError],
  );

  const onLastNameChange = useCallback(
    (raw: string) => {
      setLastName(raw);
      if (hasError('last_name')) {
        const nv = normalizeText(raw);
        if (isValidName(nv)) {
          clearFieldError('last_name');
        }
      }
    },
    [clearFieldError, hasError],
  );

  const onJobTitleChange = useCallback(
    (raw: string) => {
      setJobTitle(raw);
      if (hasError('job_title')) {
        clearFieldError('job_title');
      }
    },
    [clearFieldError, hasError],
  );

  const onEmailChange = useCallback(
    (raw: string) => {
      setEmail(raw);

      if (hasError('username')) {
        const normalized = raw.trim().toLowerCase();
        if (normalized && isValidEmail(normalized)) {
          clearFieldError('username');
        }
      }

      clearEmailMismatchIfFixed(raw, confirmEmail);
    },
    [clearEmailMismatchIfFixed, clearFieldError, confirmEmail, hasError],
  );

  const onConfirmEmailChange = useCallback(
    (raw: string) => {
      setConfirmEmail(raw);

      if (hasError('confirm_email')) {
        const normalized = raw.trim().toLowerCase();
        if (normalized && isValidEmail(normalized)) {
          clearFieldError('confirm_email');
        }
      }

      clearEmailMismatchIfFixed(email, raw);
    },
    [clearEmailMismatchIfFixed, clearFieldError, email, hasError],
  );

  const onPasswordChange = useCallback(
    (raw: string) => {
      setPassword(raw);
      clearPasswordTooShortIfFixed(raw);
      clearPasswordMismatchIfFixed(raw, confirmPassword);
    },
    [clearPasswordMismatchIfFixed, clearPasswordTooShortIfFixed, confirmPassword],
  );

  const onConfirmPasswordChange = useCallback(
    (raw: string) => {
      setConfirmPassword(raw);
      clearPasswordMismatchIfFixed(password, raw);
    },
    [clearPasswordMismatchIfFixed, password],
  );

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

  const handleSignup = useCallback(
    async (evt?: unknown) => {
      const e = evt as SubmitEvent | undefined;
      e?.preventDefault();

      const normalizedFirstName = normalizeText(firstName);
      const normalizedLastName = normalizeText(lastName);
      const normalizedJobTitle = normalizeText(jobTitle);

      const trimmedEmail = email.trim();
      const trimmedEmailLower = trimmedEmail.toLowerCase();
      setEmail(trimmedEmailLower);
      const normalizedEmail = trimmedEmailLower;

      setError('');
      clearAllFieldErrors();

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
        await api.post('/auth/register', {
          first_name: normalizedFirstName,
          last_name: normalizedLastName,
          job_title: normalizedJobTitle || null,
          email: normalizedEmail,
          password,
        });

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
        if (status === 400) {
          setFieldError('username', t('signup.error.emailAlreadyUsed'));
          return;
        }
        if (typeof status === 'number' && status >= 500) {
          setError(formatBackendError(err) || t('signup.error.generic'));
          return;
        }

        setError(formatBackendError(err) || t('signup.error.generic'));
      } finally {
        setIsLoading(false);
      }
    },
    [clearAllFieldErrors, confirmEmail, confirmPassword, email, firstName, jobTitle, lastName, onSignupSuccess, password, setFieldError, t],
  );

  return {
    firstName,
    lastName,
    jobTitle,
    setJobTitle: onJobTitleChange,
    email,
    confirmEmail,
    password,
    confirmPassword,

    showPassword,
    setShowPassword,

    isLoading,
    error,
    setError,
    fieldErrors,
    activeError,

    isDisabled,

    emailRef,
    confirmEmailRef,

    onFirstNameChange,
    onLastNameChange,
    onEmailChange,
    onConfirmEmailChange,
    onPasswordChange,
    onConfirmPasswordChange,

    validateFirstName,
    validateLastName,
    validateJobTitle,
    validateEmailField,
    validateConfirmEmailField,
    validatePasswordField,
    validateConfirmPasswordField,

    handleSignup,
  };
}

