'use client';
import { useEffect, useCallback, ReactNode } from 'react';
import { IconX } from './Icons';

interface SidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  width?: string;
}

export function SidePanel({ isOpen, onClose, title, children, footer, width = '480px' }: SidePanelProps) {
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
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="animate-fade-in absolute inset-0 backdrop-blur-sm"
        style={{ backgroundColor: 'var(--overlay)' }}
        onClick={onClose}
      />
      <div
        className="animate-slide-in-right relative flex h-full w-full flex-col overflow-hidden border-l shadow-2xl"
        style={{ maxWidth: width, backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <div
          className="flex flex-shrink-0 items-center justify-between border-b px-5 py-4"
          style={{ borderColor: 'var(--border)' }}
        >
          <h2 className="text-[15px] font-semibold tracking-tight">{title}</h2>
          <button onClick={onClose} className="icon-btn icon-btn-sm" aria-label="Close">
            <IconX size={16} />
          </button>
        </div>
        <div className="scroll-area flex-1 overflow-y-auto px-5 py-4">
          {children}
        </div>
        {footer && (
          <div
            className="flex flex-shrink-0 items-center justify-end gap-2 border-t px-5 py-4"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface-2)' }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
