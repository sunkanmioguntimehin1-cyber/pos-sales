'use client';
import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { IconUser } from '@/components/ui/Icons';
import { Staff } from '@/components/staff/types';

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

  const handleConfirm = () => {
    if (selectedStaff) {
      onSelect(selectedStaff);
      setSelectedStaff(null);
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedStaff(null);
    onClose();
  };

  const activeStaff = staffList.filter(s => s.status === 'active');

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
            className="h-9 px-4 bg-[#1E2535] border border-white/[0.12] text-slate-400 hover:text-slate-200 rounded-lg text-[13px] font-semibold transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedStaff}
            className="h-9 px-4 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white rounded-lg text-[13px] font-semibold shadow-[0_2px_8px_rgba(59,130,246,0.3)] transition-all"
          >
            Confirm & Complete Sale
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
            <div className="text-[13px] font-semibold text-slate-100">Staff Verification</div>
            <div className="text-[11px] text-slate-400">Select the staff member completing this sale</div>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">
            Select Staff Member
          </label>
          <div className="bg-[#1E2535] border border-white/[0.12] rounded-lg overflow-hidden">
            {activeStaff.length === 0 ? (
              <div className="p-4 text-center text-[13px] text-slate-500">No active staff members found</div>
            ) : (
              activeStaff.map(staff => (
                <button
                  key={staff.id}
                  onClick={() => setSelectedStaff(staff)}
                  className={`w-full px-4 py-3 flex items-center gap-3 border-b border-white/[0.07] last:border-0 transition-colors ${
                    selectedStaff?.id === staff.id
                      ? 'bg-blue-500/15 border-blue-500/30'
                      : 'hover:bg-white/[0.02]'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-[13px] font-bold flex-shrink-0">
                    {staff.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-[13px] font-semibold text-slate-100">{staff.name}</div>
                    <div className="text-[11px] text-slate-500">{staff.email}</div>
                  </div>
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${roleColors[staff.role]}`}>
                    {roleLabels[staff.role]}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>

        {selectedStaff && (
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
