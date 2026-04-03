import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  fullScreen?: boolean;
}

export function Modal({ isOpen, onClose, title, children, fullScreen = false }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        className={`relative bg-white z-10 ${
          fullScreen
            ? 'w-full h-full'
            : 'w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[85vh] overflow-auto'
        }`}
      >
        {title && (
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <h2 className="text-lg font-semibold">{title}</h2>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100">
              <X size={20} className="text-slate-500" />
            </button>
          </div>
        )}
        <div className={title ? '' : 'pt-4'}>{children}</div>
      </div>
    </div>,
    document.body
  );
}
