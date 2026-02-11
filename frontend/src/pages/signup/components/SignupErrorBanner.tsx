import type { ActiveError } from '../../signup/hooks/useSignupForm';

type Props = { error: string; activeError: ActiveError | null };
export function SignupErrorBanner({ error, activeError }: Props) {
  return (
    <div aria-live="polite" style={{ minHeight: '20px', marginBottom: '1rem' }}>
      {error ? (
        <div id="signup-error" role="alert" style={{ color: '#d32f2f', backgroundColor: '#ffebee', padding: '10px', borderRadius: '8px', fontSize: '0.9rem', border: '1px solid #ffcdd2', animation: 'fadeIn 0.3s' }}>
          {error}
        </div>
      ) : activeError ? (
        <div id={activeError.id} role="alert" className="stakr-field-error" style={{ width: '100%' }}>
          {activeError.message}
        </div>
      ) : null}
    </div>
  );
}

