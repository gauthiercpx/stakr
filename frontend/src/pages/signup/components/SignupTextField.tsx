import type { CSSProperties } from 'react';

type Props = {
  name: string;
  value: string;
  placeholder: string;
  type?: string;
  autoComplete?: string;
  required?: boolean;
  disabled?: boolean;
  inputRef?: React.Ref<HTMLInputElement>;

  hasError?: boolean;
  describedBy?: string;
  ariaLabel?: string;

  onChange: (value: string) => void;
  onBlur?: () => void;

  fullWidth?: boolean;
  style?: CSSProperties;
};

export function SignupTextField({
  name,
  value,
  placeholder,
  type = 'text',
  autoComplete,
  required,
  disabled,
  inputRef,
  hasError,
  describedBy,
  ariaLabel,
  onChange,
  onBlur,
  fullWidth,
  style,
}: Props) {
  return (
    <div className={`${fullWidth ? 'stakr-signup__full ' : ''}stakr-field`}>
      <input
        ref={inputRef}
        name={name}
        aria-label={ariaLabel ?? placeholder}
        aria-describedby={describedBy}
        aria-invalid={!!hasError}
        type={type}
        autoComplete={autoComplete}
        required={required}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        disabled={disabled}
        className={`stakr-input${hasError ? ' stakr-input--error' : ''}`}
        style={style}
      />
    </div>
  );
}

