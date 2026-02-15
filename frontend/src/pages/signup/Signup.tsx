import { useI18n } from '../../i18n/useI18n.ts';
import { SignupHeader } from './components/SignupHeader.tsx';
import { SignupErrorBanner } from './components/SignupErrorBanner.tsx';
import { SignupActions } from './components/SignupActions.tsx';
import { SignupTextField } from './components/SignupTextField.tsx';
import { SignupPasswordField } from './components/SignupPasswordField.tsx';
import { useSignupForm } from './hooks/useSignupForm.ts';

// Props provided by App.tsx
interface SignupProps {
  onSignupSuccess: () => void;
  onRequestClose?: () => void;
}

export default function Signup({ onSignupSuccess, onRequestClose }: SignupProps) {
  const { t } = useI18n();
  const form = useSignupForm({ t, onSignupSuccess });

  const {
    firstName,
    lastName,
    jobTitle,
    setJobTitle,
    email,
    confirmEmail,
    password,
    confirmPassword,
    showPassword,
    setShowPassword,
    isLoading,
    error,
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
  } = form;

  const isModal = !!onRequestClose;

  const emailHasError = !!(fieldErrors['username'] || fieldErrors['email_mismatch']);
  const confirmEmailHasError = !!(fieldErrors['confirm_email'] || fieldErrors['email_mismatch']);
  const passwordPairHasError = !!(fieldErrors['password'] || fieldErrors['confirm_password']);

  return (
    <div className={`stakr-signup ${isModal ? 'is-modal' : 'is-page'}`}>
      <SignupHeader title={t('signup.title')} subtitle={t('signup.subtitle')} isModal={isModal} />

      <SignupErrorBanner error={error} activeError={activeError} />

      <form onSubmit={handleSignup} className="stakr-signup__form" noValidate>
        <div className="stakr-signup__grid">
          <SignupTextField
            name="first_name"
            ariaLabel={t('signup.firstName.label')}
            describedBy={fieldErrors['first_name'] ? 'signup-error-first_name' : error ? 'signup-error' : undefined}
            autoComplete="given-name"
            required
            placeholder={t('signup.firstName.placeholder')}
            value={firstName}
            hasError={!!fieldErrors['first_name']}
            onChange={(v) => {
              onFirstNameChange(v);
            }}
            onBlur={validateFirstName}
            disabled={isLoading}
          />

          <SignupTextField
            name="last_name"
            ariaLabel={t('signup.lastName.label')}
            describedBy={fieldErrors['last_name'] ? 'signup-error-last_name' : error ? 'signup-error' : undefined}
            autoComplete="family-name"
            required
            placeholder={t('signup.lastName.placeholder')}
            value={lastName}
            hasError={!!fieldErrors['last_name']}
            onChange={(v) => {
              onLastNameChange(v);
            }}
            onBlur={validateLastName}
            disabled={isLoading}
          />

          <SignupTextField
            name="job_title"
            ariaLabel={t('signup.jobTitle.label')}
            describedBy={fieldErrors['job_title'] ? 'signup-error-job_title' : undefined}
            autoComplete="organization-title"
            placeholder={t('signup.jobTitle.placeholder')}
            value={jobTitle}
            hasError={!!fieldErrors['job_title']}
            onChange={(v) => setJobTitle(v)}
            onBlur={validateJobTitle}
            disabled={isLoading}
            fullWidth
          />

          <SignupTextField
            name="username"
            inputRef={emailRef}
            ariaLabel={t('signup.email.placeholder')}
            describedBy={fieldErrors['username'] ? 'signup-error-username' : error ? 'signup-error' : undefined}
            type="email"
            autoComplete="email"
            required
            placeholder={t('signup.email.placeholder')}
            value={email}
            hasError={emailHasError}
            onChange={(v) => onEmailChange(v)}
            onBlur={() => validateEmailField()}
            disabled={isLoading}
          />

          <SignupTextField
            name="confirm_email"
            inputRef={confirmEmailRef}
            ariaLabel={t('signup.emailConfirm.placeholder')}
            describedBy={fieldErrors['confirm_email'] ? 'signup-error-confirm_email' : error ? 'signup-error' : undefined}
            type="email"
            autoComplete="email"
            required
            placeholder={t('signup.emailConfirm.placeholder')}
            value={confirmEmail}
            hasError={confirmEmailHasError}
            onChange={(v) => onConfirmEmailChange(v)}
            onBlur={() => validateConfirmEmailField()}
            disabled={isLoading}
          />

          <SignupPasswordField
            name="password"
            ariaLabel={t('signup.password.placeholder')}
            describedBy={fieldErrors['password'] ? 'signup-error-passwords' : error ? 'signup-error' : undefined}
            autoComplete="new-password"
            required
            placeholder={t('signup.password.placeholder')}
            value={password}
            hasError={passwordPairHasError}
            onChange={(v) => onPasswordChange(v)}
            onBlur={validatePasswordField}
            disabled={isLoading}
            showPassword={showPassword}
            toggleLabel={showPassword ? t('common.hide') : t('common.show')}
            onToggleShow={() => setShowPassword((s) => !s)}
          />

          <SignupPasswordField
            name="confirm_password"
            ariaLabel={t('signup.passwordConfirm.placeholder')}
            describedBy={fieldErrors['confirm_password'] ? 'signup-error-passwords' : error ? 'signup-error' : undefined}
            autoComplete="new-password"
            required
            placeholder={t('signup.passwordConfirm.placeholder')}
            value={confirmPassword}
            hasError={passwordPairHasError}
            onChange={(v) => onConfirmPasswordChange(v)}
            onBlur={validateConfirmPasswordField}
            disabled={isLoading}
            showPassword={showPassword}
            toggleLabel={showPassword ? t('common.hide') : t('common.show')}
            onToggleShow={() => setShowPassword((s) => !s)}
          />
        </div>

        <SignupActions t={t} isDisabled={isDisabled} isLoading={isLoading} onRequestClose={onRequestClose} />
      </form>
    </div>
  );
}

