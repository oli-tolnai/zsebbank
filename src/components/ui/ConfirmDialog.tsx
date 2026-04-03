import { Modal } from './Modal';
import { Button } from './Button';
import { Strings } from '@/constants/strings';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
}

export function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmLabel, danger = true }: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="p-4 space-y-4">
        <p className="text-slate-600">{message}</p>
        <div className="flex gap-3">
          <Button variant="secondary" fullWidth onClick={onClose}>
            {Strings.common.cancel}
          </Button>
          <Button variant={danger ? 'danger' : 'primary'} fullWidth onClick={onConfirm}>
            {confirmLabel ?? Strings.common.confirm}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
