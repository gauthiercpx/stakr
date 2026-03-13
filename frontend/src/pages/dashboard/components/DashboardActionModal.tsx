import Modal from '../../../components/Modal';
import NeonButton from '../../../components/NeonButton';

interface DashboardActionModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  onClose: () => void;
}

export default function DashboardActionModal({
  isOpen,
  title,
  description,
  onClose,
}: DashboardActionModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onRequestClose={onClose} title={title} size="sm">
      <div style={{ display: 'grid', gap: '1rem' }}>
        <p style={{ margin: 0, color: '#555' }}>{description}</p>
        <NeonButton label="OK" onClick={onClose} variant="solid" style={{ width: '100%' }} />
      </div>
    </Modal>
  );
}
