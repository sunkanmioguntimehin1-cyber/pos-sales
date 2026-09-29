'use client';
import { SidePanel } from '@/components/ui/SidePanel';
import { IconMail, IconPhone, IconLock, IconCheck, IconX, IconStore } from '@/components/ui/Icons';
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
        <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-5">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-lg font-bold">
              {staff.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-[var(--text)]">{staff.name}</h3>
              <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold mt-1 ${roleColors[staff.role]}`}>
                {roleLabels[staff.role]}
              </span>
            </div>
            <div className="ml-auto">
              <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold ${
                staff.status === 'active' 
                  ? 'bg-emerald-500/15 text-emerald-400' 
                  : 'bg-[var(--input-bg)] text-muted'
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

        <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-4">
          <div className="text-[10px] font-bold uppercase tracking-widest text-subtle mb-3">Contact Information</div>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                <IconMail size={14} />
              </div>
              <div>
                <div className="text-[10px] text-subtle uppercase">Email</div>
                <div className="text-[13px] text-[var(--text)]">{staff.email}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <IconPhone size={14} />
              </div>
              <div>
                <div className="text-[10px] text-subtle uppercase">Phone</div>
                <div className="text-[13px] text-[var(--text)]">{staff.phone}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
                <IconStore size={14} />
              </div>
              <div>
                <div className="text-[10px] text-subtle uppercase">Works At</div>
                <div className="text-[13px] text-[var(--text)]">
                  {staff.branchName ?? 'Unassigned'}
                  {staff.branchType === 'head_office' && (
                    <span className="ml-1.5 text-[10px] font-bold text-subtle">HQ</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
                <IconLock size={14} />
              </div>
              <div>
                <div className="text-[10px] text-subtle uppercase">PIN</div>
                <div className="text-[13px] text-[var(--text)]">{'••••'}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-4">
          <div className="text-[10px] font-bold uppercase tracking-widest text-subtle mb-3">Statistics</div>
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 bg-[var(--card)] rounded-lg border border-[var(--border)]">
              <div className="text-lg font-extrabold text-[var(--text)]">0</div>
              <div className="text-[10px] text-subtle">Orders Today</div>
            </div>
            <div className="text-center p-3 bg-[var(--card)] rounded-lg border border-[var(--border)]">
              <div className="text-lg font-extrabold text-[var(--text)]">$0</div>
              <div className="text-[10px] text-subtle">Sales Today</div>
            </div>
          </div>
        </div>
      </div>
    </SidePanel>
  );
}
