import {useCallback, useEffect, useRef, useState} from 'react';
import Modal from '../../../components/Modal';
import NeonButton from '../../../components/NeonButton';
import {createPortfolio, type PortfolioResponse} from '../../../api/portfolio';
import {useI18n} from '../../../i18n/useI18n';

const NAME_MAX_LENGTH = 100;

interface CreatePortfolioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (portfolio: PortfolioResponse) => void;
  onSessionInvalid: () => void;
}

export default function CreatePortfolioModal({
  isOpen,
  onClose,
  onCreated,
  onSessionInvalid,
}: CreatePortfolioModalProps) {
  const {t} = useI18n();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Start from a clean form every time the modal is reopened.
  useEffect(() => {
    if (isOpen) {
      setName('');
      setError('');
      setIsSubmitting(false);
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleSubmit = useCallback(async () => {
    const trimmed = name.trim();

    if (!trimmed) {
      setError(t('dashboard.createPortfolio.nameRequired'));
      return;
    }
    if (trimmed.length > NAME_MAX_LENGTH) {
      setError(t('dashboard.createPortfolio.nameTooLong'));
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const portfolio = await createPortfolio(trimmed);
      onCreated(portfolio);
      onClose();
    } catch (err: unknown) {
      const status = (err as {response?: {status?: number}})?.response?.status;

      if (status === 401 || status === 403) {
        onSessionInvalid();
        return;
      }

      if (import.meta.env.DEV) {
        console.error('Create portfolio error:', err);
      }

      const detail = (err as {response?: {data?: {detail?: string}}})?.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : t('dashboard.createPortfolio.error'));
    } finally {
      setIsSubmitting(false);
    }
  }, [name, onClose, onCreated, onSessionInvalid, t]);

  if (!isOpen) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={isSubmitting ? () => {} : onClose}
      title={t('dashboard.createPortfolio.title')}
      size="sm"
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}
      >
        <div aria-live="polite" style={{minHeight: '20px'}}>
          {error && (
            <div
              style={{
                color: '#d32f2f',
                backgroundColor: '#ffebee',
                padding: '10px',
                borderRadius: '8px',
                fontSize: '0.9rem',
                border: '1px solid #ffcdd2',
              }}
            >
              {error}
            </div>
          )}
        </div>

        <label
          htmlFor="create-portfolio-name"
          style={{fontSize: '0.9rem', fontWeight: 700, color: '#555'}}
        >
          {t('dashboard.createPortfolio.nameLabel')}
        </label>

        <input
          id="create-portfolio-name"
          ref={inputRef}
          name="name"
          type="text"
          autoComplete="off"
          autoFocus
          maxLength={NAME_MAX_LENGTH}
          placeholder={t('dashboard.createPortfolio.namePlaceholder')}
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isSubmitting}
          style={{
            padding: '1rem',
            borderRadius: '0.75rem',
            border: error ? '2px solid #ffcdd2' : '2px solid #f0f0f0',
            backgroundColor: isSubmitting ? '#e9ecef' : '#f8f9fa',
            fontSize: '1rem',
            outline: 'none',
            fontFamily: 'inherit',
          }}
        />

        <NeonButton
          type="submit"
          disabled={isSubmitting || name.trim() === ''}
          variant="solid"
          label={
            isSubmitting
              ? t('dashboard.createPortfolio.submitting')
              : t('dashboard.createPortfolio.submit')
          }
          style={{
            padding: '1rem',
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
          }}
        />

        <NeonButton
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          variant="outline"
          label={t('dashboard.createPortfolio.cancel')}
          style={{
            padding: '0.75rem',
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
          }}
        />
      </form>
    </Modal>
  );
}
