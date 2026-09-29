'use client';
import { IconStore, IconAlertTriangle } from '@/components/ui/Icons';
import { useActiveBranch } from '@/lib/hooks';

const selectCls =
  "w-full h-9 pl-8 pr-8 bg-[var(--surface-2)] border border-[var(--border-strong)] rounded-lg text-[var(--text)] text-[13px] font-semibold outline-none focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)] transition-all appearance-none cursor-pointer bg-[image:url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%2364748B%22 stroke-width=%222%22><path d=%22M6 9l6 6 6-6%22/></svg>')] bg-no-repeat bg-[position:right_10px_center]";

interface LocationSwitcherProps {
  /** Switching mid-sale would re-validate the cart against a different shelf. */
  locked?: boolean;
}

/**
 * Chooses which location the terminal is selling from.
 *
 * This is not a filter. It decides which branch's stock a sale draws from, so
 * it is shown with the same weight as the search box rather than buried in a
 * settings page.
 */
export function LocationSwitcher({ locked = false }: LocationSwitcherProps) {
  const { activeBranch, branches, setActiveBranchId } = useActiveBranch();

  if (branches.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-shrink-0">
        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-subtle pointer-events-none">
          <IconStore size={14} />
        </span>
        <select
          className={selectCls}
          style={{ width: `${Math.max(11, Math.min(26, (activeBranch?.name.length ?? 10) + 4))}ch` }}
          value={activeBranch?.id ?? ''}
          disabled={locked}
          onChange={(e) => setActiveBranchId(e.target.value)}
          aria-label="Selling location"
          title={locked ? 'Clear the cart before switching location' : 'Selling location'}
        >
          {branches.map((branch) => (
            <option key={branch.id} value={branch.id}>
              {branch.name}
              {branch.type === 'head_office' ? ' (HQ)' : ''}
            </option>
          ))}
        </select>
      </div>

      {activeBranch?.type === 'head_office' && (
        <span className="hidden lg:inline-flex px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-400 text-[10px] font-bold whitespace-nowrap">
          Headquarters
        </span>
      )}

      {locked && (
        <span className="hidden lg:flex items-center gap-1 text-[11px] text-amber-400 whitespace-nowrap">
          <IconAlertTriangle size={12} /> Clear the cart to switch
        </span>
      )}
    </div>
  );
}
