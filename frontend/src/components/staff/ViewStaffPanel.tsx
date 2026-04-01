'use client';
import { SidePanel } from '@/components/ui/SidePanel';
import { IconMail, IconPhone, IconLock, IconCheck, IconX } from '@/components/ui/Icons';
import { Staff } from './types';

interface ViewStaffPanelProps {
  isOpen: boolean;
  onClose: () => void;
  staff: Staff | null;
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

export function ViewStaffPanel({ isOpen, onClose, staff }: ViewStaffPanelProps) {
  if (!staff) return null;

  return (
    <SidePanel
      isOpen={isOpen}
      onClose={onClose}
      title="Staff Details"
      width="420px"
    >
      <div className="flex flex-col gap-5">
        <div className="bg-[#1E2535] border border-white/[0.07] rounded-xl p-5">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-lg font-bold">
              {staff.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-slate-100">{staff.name}</h3>
              <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold mt-1 ${roleColors[staff.role]}`}>
                {roleLabels[staff.role]}
              </span>
            </div>
            <div className="ml-auto">
              <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold ${
                staff.status === 'active' 
                  ? 'bg-emerald-500/15 text-emerald-400' 
                  : 'bg-slate-500/15 text-slate-400'
              }`}>
                {staff.status === 'active' ? (
                  <span className="flex items-center gap-1"><IconCheck size={10} /> Active</span>
                ) : (
                  <span className="flex items-center gap-1"><IconX size={10} /> Inactive</span>
                )}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-[#1E2535] border border-white/[0.07] rounded-xl p-4">
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">Contact Information</div>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                <IconMail size={14} />
              </div>
              <div>
                <div className="text-[10px] text-slate-500 uppercase">Email</div>
                <div className="text-[13px] text-slate-100">{staff.email}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <IconPhone size={14} />
              </div>
              <div>
                <div className="text-[10px] text-slate-500 uppercase">Phone</div>
                <div className="text-[13px] text-slate-100">{staff.phone}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
                <IconLock size={14} />
              </div>
              <div>
                <div className="text-[10px] text-slate-500 uppercase">PIN</div>
                <div className="text-[13px] text-slate-100">{'••••'}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#1E2535] border border-white/[0.07] rounded-xl p-4">
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">Statistics</div>
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 bg-[#161B27] rounded-lg border border-white/[0.07]">
              <div className="text-lg font-extrabold text-slate-100">0</div>
              <div className="text-[10px] text-slate-500">Orders Today</div>
            </div>
            <div className="text-center p-3 bg-[#161B27] rounded-lg border border-white/[0.07]">
              <div className="text-lg font-extrabold text-slate-100">$0</div>
              <div className="text-[10px] text-slate-500">Sales Today</div>
            </div>
          </div>
        </div>
      </div>
    </SidePanel>
  );
}
