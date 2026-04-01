'use client';
import { SidePanel } from '@/components/ui/SidePanel';
import { IconMapPin, IconPhone, IconCheck, IconX } from '@/components/ui/Icons';
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
        <div className="bg-[#1E2535] border border-white/[0.07] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[15px] font-bold text-slate-100">{branch.name}</h3>
            <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold ${
              branch.isDefault 
                ? 'bg-emerald-500/15 text-emerald-400' 
                : 'bg-slate-500/15 text-slate-400'
            }`}>
              {branch.isDefault ? (
                <span className="flex items-center gap-1"><IconCheck size={10} /> Default</span>
              ) : (
                <span className="flex items-center gap-1"><IconX size={10} /> Inactive</span>
              )}
            </span>
          </div>
          <div className="flex items-center gap-2 text-slate-500">
            <IconMapPin size={14} />
            <span className="text-[13px]">{branch.address || '-'}</span>
          </div>
        </div>

        <div className="bg-[#1E2535] border border-white/[0.07] rounded-xl p-4">
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">Contact Information</div>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                <IconPhone size={14} />
              </div>
              <div>
                <div className="text-[10px] text-slate-500 uppercase">Phone</div>
                <div className="text-[13px] text-slate-100">{branch.phone || '-'}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#1E2535] border border-white/[0.07] rounded-xl p-4">
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">Statistics</div>
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 bg-[#161B27] rounded-lg border border-white/[0.07]">
              <div className="text-lg font-extrabold text-slate-100">0</div>
              <div className="text-[10px] text-slate-500">Staff</div>
            </div>
            <div className="text-center p-3 bg-[#161B27] rounded-lg border border-white/[0.07]">
              <div className="text-lg font-extrabold text-slate-100">0</div>
              <div className="text-[10px] text-slate-500">Orders Today</div>
            </div>
          </div>
        </div>
      </div>
    </SidePanel>
  );
}
