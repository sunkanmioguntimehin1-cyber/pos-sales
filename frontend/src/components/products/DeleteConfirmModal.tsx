'use client';
import { Modal } from '@/components/ui/Modal';
import { IconTrash } from '@/components/ui/Icons';
import { Product } from '@/lib/api/products';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onConfirm: () => void;
}

export function DeleteConfirmModal({ isOpen, onClose, product, onConfirm }: DeleteConfirmModalProps) {
  const handleClose = () => {
    onClose();
  };

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Delete Product"
      width="sm"
      footer={
        <>
          <button 
            onClick={handleClose} 
            className="h-9 px-4 bg-[var(--surface-2)] border border-[var(--border-strong)] text-muted hover:text-[var(--text)] rounded-lg text-[13px] font-semibold transition-all"
          >
            Cancel
          </button>
          <button 
            onClick={handleConfirm} 
            className="h-9 px-4 bg-red-500 hover:bg-red-600 text-white rounded-lg text-[13px] font-semibold transition-all"
          >
            Delete
          </button>
        </>
      }
    >
      <div className="text-center py-4">
        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
          <IconTrash size={24} className="text-red-400" />
        </div>
        <p className="text-[var(--text)] text-[15px] font-semibold mb-2">Are you sure?</p>
        <p className="text-muted text-[13px]">
          This will permanently delete <span className="text-[var(--text)] font-medium">{product?.name}</span>. This action cannot be undone.
        </p>
      </div>
    </Modal>
  );
}
