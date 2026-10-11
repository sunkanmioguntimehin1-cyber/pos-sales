'use client';
import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { IconUser, IconLock } from '@/components/ui/Icons';
import { Staff } from '@/components/staff/types';
import { useVerifyPin } from '@/lib/hooks/useStaff';

interface StaffSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (staff: Staff) => void;
  staffList: Staff[];
}

const roleColors: Record<string, string> = {
  admin: 'bg-red-500/15 text-red-400',
  manager: 'bg-blue-500/15 text-blue-400',
  cashier: 'bg-emerald-500/15 text-emerald-400',
};

const roleLabels: Record<string, string> = {
  admin: 'Admin',
  manager: 'Manager',
  cashier: 'Cashier',
};

export function StaffSelectionModal({ isOpen, onClose, onSelect, staffList }: StaffSelectionModalProps) {
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const verifyPin = useVerifyPin();

  const reset = () => {
    setSelectedStaff(null);
    setPin('');
    setError('');
  };

  const handleSelectStaff = (staff: Staff) => {
    setSelectedStaff(staff);
    setPin('');
    setError('');
  };

  const handleConfirm = async () => {
    if (!selectedStaff || selectedStaff.hasPin === false) return;
    if (!/^\d{4,6}$/.test(pin)) {
      setError('Enter the 4 to 6 digit passcode');
      return;
    }

    try {
      await verifyPin.mutateAsync({ staffId: selectedStaff.id, pin });
      onSelect(selectedStaff);
      reset();
      onClose();
    } catch (err) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Incorrect passcode';
      setError(message);
      setPin('');
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const activeStaff = staffList.filter(s => s.status === 'active');
  const noPasscode = !!selectedStaff && selectedStaff.hasPin === false;
  const canConfirm =
    !!selectedStaff && selectedStaff.hasPin !== false && /^\d{4,6}$/.test(pin) && !verifyPin.isPending;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Select Staff Member"
      width="md"
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
            disabled={!canConfirm}
            className="h-9 px-4 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white rounded-lg text-[13px] font-semibold shadow-[0_2px_8px_rgba(59,130,246,0.3)] transition-all"
          >
            {verifyPin.isPending ? 'Verifying…' : 'Confirm & Complete Sale'}
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <div className="w-10 h-10 rounded-full bg-blue-500/15 flex items-center justify-center text-blue-400">
            <IconUser size={18} />
          </div>
          <div>
            <div className="text-[13px] font-semibold text-[var(--text)]">Staff Verification</div>
            <div className="text-[11px] text-muted">Select the staff member completing this sale</div>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-subtle mb-1.5">
            Select Staff Member
          </label>
          <div className="bg-[var(--surface-2)] border border-[var(--border-strong)] rounded-lg overflow-hidden">
            {activeStaff.length === 0 ? (
              <div className="p-4 text-center text-[13px] text-subtle">No active staff members found</div>
            ) : (
              activeStaff.map(staff => (
                <button
                  key={staff.id}
                  onClick={() => handleSelectStaff(staff)}
                  className={`w-full px-4 py-3 flex items-center gap-3 border-b border-[var(--border)] last:border-0 transition-colors ${
                    selectedStaff?.id === staff.id
                      ? 'bg-blue-500/15 border-blue-500/30'
                      : 'hover:bg-[var(--input-bg)]'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-[13px] font-bold flex-shrink-0">
                    {staff.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-[13px] font-semibold text-[var(--text)]">{staff.name}</div>
                    <div className="text-[11px] text-subtle">{staff.email}</div>
                  </div>
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${staff.roleColor ?? roleColors[staff.role] ?? 'bg-blue-500/15 text-blue-400'}`}>
                    {staff.roleName ?? roleLabels[staff.role] ?? staff.role}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>

        {selectedStaff && !noPasscode && (
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-subtle flex items-center gap-1.5">
              <IconLock size={12} /> Enter {selectedStaff.name.split(' ')[0]}&apos;s passcode
            </label>
            <input
              type="password"
              inputMode="numeric"
              autoComplete="off"
              value={pin}
              maxLength={6}
              placeholder="••••"
              onChange={(e) => {
                setPin(e.target.value.replace(/\D/g, '').slice(0, 6));
                if (error) setError('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && canConfirm) handleConfirm();
              }}
              className="h-11 px-3 text-center text-[20px] tracking-[0.5em] bg-[var(--input-bg)] border border-[var(--border-strong)] rounded-lg text-[var(--text)] focus:border-blue-500 focus:outline-none transition-colors"
            />
            {error && (
              <div className="text-[12px] text-red-400 font-medium">{error}</div>
            )}
          </div>
        )}

        {noPasscode && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-[12px] text-amber-400">
            <span className="font-semibold">{selectedStaff?.name}</span> has not set a passcode yet.
            Ask them to create one in <span className="font-semibold">Settings → Security</span> before
            completing this sale.
          </div>
        )}

        {selectedStaff && !noPasscode && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <IconUser size={14} />
            </div>
            <span className="text-[12px] text-emerald-400">
              <span className="font-semibold">{selectedStaff.name}</span> will be recorded as the cashier for this sale
            </span>
          </div>
        )}
      </div>
    </Modal>
  );
}
