import type { TFunction } from '../../../i18n/types';

type Props = {
  t: TFunction;
  isDisabled: boolean;
  isLoading: boolean;
  onRequestClose?: () => void;
};

export function SignupActions({ t, isDisabled, isLoading, onRequestClose }: Props) {
  return (
    <div className="stakr-signup__actions">
      <button
        type="submit"
        disabled={isDisabled}
        aria-busy={isLoading}
        className="stakr-signup__primary"
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

      {onRequestClose && (
        <button
          type="button"
          onClick={onRequestClose}
          disabled={isLoading}
          className="stakr-signup__secondary stakr-focus"
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
        >
          {t('common.cancel')}
        </button>
      )}
    </div>
  );
}

