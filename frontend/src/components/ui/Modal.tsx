'use client';
import { useEffect, useCallback, ReactNode } from 'react';
import { IconX } from './Icons';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  width?: 'sm' | 'md' | 'lg' | 'xl';
}

const widthClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export function Modal({ isOpen, onClose, title, children, footer, width = 'md' }: ModalProps) {
  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="animate-fade-in absolute inset-0 backdrop-blur-sm"
        style={{ backgroundColor: 'var(--overlay)' }}
        onClick={onClose}
      />
      <div
        className={`animate-scale-in relative w-full ${widthClasses[width]} overflow-hidden rounded-2xl border shadow-2xl`}
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <div
          className="flex items-center justify-between border-b px-5 py-4"
          style={{ borderColor: 'var(--border)' }}
        >
          <h2 className="text-[15px] font-semibold tracking-tight">{title}</h2>
          <button onClick={onClose} className="icon-btn icon-btn-sm" aria-label="Close">
            <IconX size={16} />
          </button>
        </div>
        <div className="scroll-area max-h-[calc(100vh-200px)] overflow-y-auto px-5 py-4">
          {children}
        </div>
        {footer && (
          <div
            className="flex items-center justify-end gap-2 border-t px-5 py-4"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface-2)' }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
