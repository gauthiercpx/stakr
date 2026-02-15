type Props = {
  name: string;
  value: string;
  placeholder: string;
  autoComplete?: string;
  required?: boolean;
  disabled?: boolean;

  showPassword: boolean;
  toggleLabel: string;
  onToggleShow: () => void;

  hasError?: boolean;
  describedBy?: string;
  ariaLabel?: string;

  onChange: (value: string) => void;
  onBlur?: () => void;
};

export function SignupPasswordField({
  name,
  value,
  placeholder,
  autoComplete,
  required,
  disabled,
  showPassword,
  toggleLabel,
  onToggleShow,
  hasError,
  describedBy,
  ariaLabel,
  onChange,
  onBlur,
}: Props) {
  return (
    <div className={`stakr-field stakr-passwordField ${disabled ? 'is-disabled' : ''}`}>
      <input
        name={name}
        aria-label={ariaLabel ?? placeholder}
        aria-describedby={describedBy}
        aria-invalid={!!hasError}
        type={showPassword ? 'text' : 'password'}
        autoComplete={autoComplete}
        required={required}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        disabled={disabled}
        className={`stakr-input${hasError ? ' stakr-input--error' : ''}`}
      />
      <button
        type="button"
        onClick={onToggleShow}
        aria-label={toggleLabel}
        aria-pressed={showPassword}
        disabled={disabled}
        className="stakr-passwordToggle"
      >
        {toggleLabel}
      </button>
    </div>
  );
}

