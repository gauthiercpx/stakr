import type { TFunction } from '../../../i18n/types';

type Props = {
  t: TFunction;
  isDisabled: boolean;
  isLoading: boolean;
  onRequestClose?: () => void;
};

export function SignupActions({ t, isDisabled, isLoading}: Props) {
  return (
    <div className="stakr-signup__actions">
      <button
        type="submit"
        disabled={isDisabled}
        aria-busy={isLoading}
        className="stakr-signup__primary stakr-signup__full"

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
      >
        {isLoading ? t('signup.submit.loading') : t('signup.submit')}
      </button>


    </div>
  );
}
