'use client';
import { SidePanel } from '@/components/ui/SidePanel';
import { IconMapPin, IconPhone, IconUser, IconStore, IconXCircle } from '@/components/ui/Icons';
import { Branch } from '@/lib/api/branches';

interface ViewBranchPanelProps {
  isOpen: boolean;
  onClose: () => void;
  branch: Branch | null;
}

export function ViewBranchPanel({ isOpen, onClose, branch }: ViewBranchPanelProps) {
  if (!branch) return null;

  return (
    <SidePanel
      isOpen={isOpen}
      onClose={onClose}
      title="Branch Details"
      width="420px"
    >
      <div className="flex flex-col gap-5">
        <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-5">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="min-w-0">
              <h3 className="text-[15px] font-bold text-[var(--text)] truncate">{branch.name}</h3>
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                {branch.type === 'head_office' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-500/15 text-violet-400">
                    <IconStore size={10} /> Head Office
                  </span>
                )}
                {/* Status and default are separate facts: the head office is
                    always the default, and any branch can be inactive. */}
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  branch.status === 'active'
                    ? 'bg-emerald-500/15 text-emerald-400'
                    : 'bg-[var(--input-bg)] text-muted'
                }`}>
                  {branch.status === 'active' ? 'Active' : (
                    <><IconXCircle size={10} /> Inactive</>
                  )}
                </span>
                {branch.isDefault && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-400">
                    Default Location
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-subtle">
            <IconMapPin size={14} />
            <span className="text-[13px]">{branch.address || '-'}</span>
          </div>
        </div>

        <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-4">
          <div className="text-[10px] font-bold uppercase tracking-widest text-subtle mb-3">Contact Information</div>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <IconUser size={14} />
              </div>
              <div>
                <div className="text-[10px] text-subtle uppercase">Manager</div>
                <div className="text-[13px] text-[var(--text)]">{branch.manager || '-'}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                <IconPhone size={14} />
              </div>
              <div>
                <div className="text-[10px] text-subtle uppercase">Phone</div>
                <div className="text-[13px] text-[var(--text)]">{branch.phone || '-'}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-4">
          <div className="text-[10px] font-bold uppercase tracking-widest text-subtle mb-3">Statistics</div>
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 bg-[var(--card)] rounded-lg border border-[var(--border)]">
              <div className="text-lg font-extrabold text-[var(--text)]">0</div>
              <div className="text-[10px] text-subtle">Staff</div>
            </div>
            <div className="text-center p-3 bg-[var(--card)] rounded-lg border border-[var(--border)]">
              <div className="text-lg font-extrabold text-[var(--text)]">0</div>
              <div className="text-[10px] text-subtle">Orders Today</div>
            </div>
          </div>
        </div>
      </div>
    </SidePanel>
  );
}
