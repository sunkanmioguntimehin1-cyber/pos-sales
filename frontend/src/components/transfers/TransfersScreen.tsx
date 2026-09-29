'use client';
import { useState, useMemo } from 'react';
import {
  IconStore, IconSearch, IconPlus, IconTrash, IconRefresh,
  IconArrowDown, IconAlertTriangle,
} from '@/components/ui/Icons';
import { Modal } from '@/components/ui/Modal';
import {
  useBranches, useProducts, useTransfers, useCreateTransfer, useCreateBranch, useStaff, useActiveBranch,
  getTransferFromName, getTransferToName, getTransferStaffName,
} from '@/lib/hooks';
import { AddBranchModal } from '@/components/branches/AddBranchModal';
import { BranchFormData } from '@/components/branches/types';
import { useCan } from '@/lib/auth/can';

interface DraftLine {
  productId: string;
  quantity: number;
}

const field = "w-full h-9 px-3 bg-[var(--surface-2)] border border-[var(--border-strong)] rounded-lg text-[var(--text)] text-[13px] outline-none focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)] transition-all";
const label = "block text-[10px] font-bold uppercase tracking-widest text-subtle mb-1.5";

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });

export function TransfersScreen() {
  const { data: branches = [] } = useBranches();
  const { activeBranch } = useActiveBranch();
  const { data: transfers = [], isLoading, refetch, isFetching } = useTransfers();
  const { data: staffList = [] } = useStaff({ status: 'active' });
  const createTransfer = useCreateTransfer();
  const { has } = useCan();
  const canTransfer = has('stock:transfer');
  const canMakeBranch = has('branches:manage');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddBranchOpen, setIsAddBranchOpen] = useState(false);
  const [search, setSearch] = useState('');
  const createBranch = useCreateBranch();

  const [fromBranchId, setFromBranchId] = useState('');
  const [toBranchId, setToBranchId] = useState('');
  const [staffId, setStaffId] = useState('');
  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState<DraftLine[]>([{ productId: '', quantity: 1 }]);

  /**
   * Resets the draft and opens the modal, defaulting the source to wherever
   * the till is set — that is usually where the stock being moved is. Done in
   * the click handler rather than an effect so the form never renders a
   * half-stale draft.
   */
  const openModal = () => {
    setFromBranchId(activeBranch?.id ?? '');
    setToBranchId('');
    setStaffId('');
    setNotes('');
    setLines([{ productId: '', quantity: 1 }]);
    setIsModalOpen(true);
  };

  // Scoped to the source: `stock` is that location's quantity, so the picker
  // only offers goods actually sitting on that shelf.
  const { data: sourceProducts = [] } = useProducts({ isActive: true, branchId: fromBranchId });
  const availableProducts = useMemo(
    () => sourceProducts.filter((p) => (p.stock ?? 0) > 0),
    [sourceProducts]
  );
  const stockAtSource = useMemo(
    () => new Map(availableProducts.map((p) => [p.id, p.stock])),
    [availableProducts]
  );

  const destinationOptions = useMemo(
    () => branches.filter((b) => b.id !== fromBranchId),
    [branches, fromBranchId]
  );

  const totalUnits = lines.reduce((sum, line) => sum + (line.quantity || 0), 0);

  const overdraw = useMemo(
    () => lines.find((line) => line.productId && line.quantity > (stockAtSource.get(line.productId) ?? 0)),
    [lines, stockAtSource]
  );

  const isValid =
    fromBranchId !== '' &&
    toBranchId !== '' &&
    toBranchId !== fromBranchId &&
    lines.some((l) => l.productId && l.quantity > 0) &&
    !overdraw;

  const handleSubmit = async () => {
    if (!isValid) return;

    const items = lines
      .filter((line) => line.productId && line.quantity > 0)
      .map((line) => ({
        productId: line.productId,
        productName: availableProducts.find((p) => p.id === line.productId)?.name,
        quantity: line.quantity,
      }));

    try {
      await createTransfer.mutateAsync({
        fromBranchId,
        toBranchId,
        items,
        staffId: staffId || undefined,
        notes: notes.trim() || undefined,
      });
      setIsModalOpen(false);
    } catch {
      // The interceptor surfaces the reason (e.g. insufficient stock); the
      // server rolls back, so the draft can stay open for correction.
    }
  };

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return transfers;
    return transfers.filter((t) =>
      t.items.some((item) => item.productName.toLowerCase().includes(term)) ||
      (getTransferFromName(t) ?? '').toLowerCase().includes(term) ||
      (getTransferToName(t) ?? '').toLowerCase().includes(term)
    );
  }, [transfers, search]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="relative flex-1 min-w-[200px]">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-subtle pointer-events-none">
            <IconSearch size={14} />
          </span>
          <input
            className={`${field} pl-8`}
            placeholder="Search by product or location…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          onClick={() => refetch()}
          className="icon-btn"
          title="Refresh"
          aria-label="Refresh transfers"
        >
          <IconRefresh size={15} className={isFetching ? 'animate-spin' : undefined} />
        </button>
        {canTransfer && (
        <button
          onClick={openModal}
          disabled={branches.length < 2}
          className="flex items-center gap-1.5 h-9 px-4 rounded-lg text-[13px] font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: 'var(--primary)' }}
        >
          <IconPlus size={14} /> New Transfer
        </button>
      )}
      </div>

      {branches.length < 2 && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-[12px] text-amber-400">
          <IconAlertTriangle size={14} className="flex-shrink-0" />
          <span className="flex-1 min-w-[220px]">
            A transfer needs somewhere to move stock <em>to</em>. Every new product
            is received at the head office, so add your first branch to start
            sending it out.
          </span>
          {canMakeBranch && (
          <button
            onClick={() => setIsAddBranchOpen(true)}
            className="flex items-center gap-1.5 h-8 px-3.5 rounded-lg text-[12px] font-semibold text-white transition-all"
            style={{ background: 'var(--primary)' }}
          >
            <IconPlus size={13} /> Add Branch
          </button>
        )}
        </div>
      )}

      <div
        className="rounded-2xl border overflow-hidden"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <table className="w-full">
          <thead>
            <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
              <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-subtle">When</th>
              <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-subtle">Movement</th>
              <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-subtle">Items</th>
              <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-subtle">By</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-subtle text-xs">
                  Loading transfers…
                </td>
              </tr>
            )}
            {!isLoading && filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-subtle text-xs">
                  {search ? 'No transfers match that search.' : 'No stock has been moved between locations yet.'}
                </td>
              </tr>
            )}
            {filtered.map((transfer) => (
              <tr key={transfer.id} className="border-b last:border-0" style={{ borderColor: 'var(--border)' }}>
                <td className="px-4 py-3 text-[12px] text-subtle whitespace-nowrap">
                  {fmtDate(transfer.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5 text-[12px] font-semibold whitespace-nowrap">
                    <span>{getTransferFromName(transfer) ?? '—'}</span>
                    <IconArrowDown size={12} className="text-subtle" />
                    <span>{getTransferToName(transfer) ?? '—'}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1.5">
                    {transfer.items.map((item, i) => (
                      <span
                        key={`${item.productId}-${i}`}
                        className="px-2 py-0.5 rounded-md text-[11px]"
                        style={{ backgroundColor: 'var(--input-bg)' }}
                      >
                        {item.productName}
                        <span className="text-subtle"> ×{item.quantity}</span>
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-[12px] text-subtle whitespace-nowrap">
                  {getTransferStaffName(transfer) ?? '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="New Stock Transfer"
        width="lg"
        footer={
          <>
            <button
              onClick={() => setIsModalOpen(false)}
              className="h-9 px-4 bg-[var(--surface-2)] border border-[var(--border-strong)] text-muted hover:text-[var(--text)] rounded-lg text-[13px] font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!isValid || createTransfer.isPending}
              className="h-9 px-4 rounded-lg text-[13px] font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: 'var(--primary)' }}
            >
              {createTransfer.isPending ? 'Moving…' : `Move ${totalUnits || ''} Unit${totalUnits === 1 ? '' : 's'}`.trim()}
            </button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <span className={label}>From</span>
              <select
                className={field}
                value={fromBranchId}
                onChange={(e) => {
                  setFromBranchId(e.target.value);
                  setToBranchId('');
                  // Quantities were chosen against the old shelf.
                  setLines([{ productId: '', quantity: 1 }]);
                }}
              >
                <option value="">Select source…</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}{b.type === 'head_office' ? ' (HQ)' : ''}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <span className={label}>To</span>
              <select
                className={field}
                value={toBranchId}
                onChange={(e) => setToBranchId(e.target.value)}
                disabled={!fromBranchId}
              >
                <option value="">Select destination…</option>
                {destinationOptions.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}{b.type === 'head_office' ? ' (HQ)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className={label + ' mb-0'}>Items</span>
              <button
                onClick={() => setLines((prev) => [...prev, { productId: '', quantity: 1 }])}
                className="flex items-center gap-1 text-[11px] font-semibold"
                style={{ color: 'var(--primary)' }}
              >
                <IconPlus size={12} /> Add line
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {lines.map((line, index) => {
                const available = line.productId ? (stockAtSource.get(line.productId) ?? 0) : null;
                const tooMany = available !== null && line.quantity > available;
                return (
                  <div key={index} className="flex items-center gap-2">
                    <div className="relative flex-1 min-w-0">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-subtle pointer-events-none">
                        <IconStore size={13} />
                      </span>
                      <select
                        className={`${field} pl-8`}
                        value={line.productId}
                        disabled={!fromBranchId}
                        onChange={(e) => setLines((prev) =>
                          prev.map((l, i) => i === index ? { ...l, productId: e.target.value } : l)
                        )}
                      >
                        <option value="">Select product…</option>
                        {availableProducts.map((p) => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="w-28">
                      <input
                        type="number"
                        min={1}
                        className={`${field} ${tooMany ? 'border-red-500' : ''}`}
                        value={line.quantity}
                        onChange={(e) => setLines((prev) =>
                          prev.map((l, i) => i === index
                            ? { ...l, quantity: Math.max(0, parseInt(e.target.value || '0', 10) || 0) }
                            : l)
                        )}
                      />
                    </div>
                    <button
                      onClick={() => setLines((prev) => prev.length === 1 ? prev : prev.filter((_, i) => i !== index))}
                      disabled={lines.length === 1}
                      className="icon-btn icon-btn-sm flex-shrink-0"
                      aria-label="Remove line"
                    >
                      <IconTrash size={13} />
                    </button>
                  </div>
                );
              })}
            </div>

            {overdraw && (
              <div className="mt-2 flex items-center gap-1.5 text-[11px] text-red-400">
                <IconAlertTriangle size={12} />
                Only {stockAtSource.get(overdraw.productId) ?? 0} in stock at the source location.
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <span className={label}>Handled by</span>
              <select
                className={field}
                value={staffId}
                onChange={(e) => setStaffId(e.target.value)}
              >
                <option value="">Not recorded</option>
                {staffList.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <span className={label}>Notes</span>
              <input
                className={field}
                placeholder="Optional"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
        </div>
      </Modal>

      {/* Creating a branch here rather than sending the user off to another
          screen: the whole reason they landed on Transfers is that they need
          a second location, so making them navigate away to get one is the
          same dead end in a different window. */}
      <AddBranchModal
        isOpen={isAddBranchOpen}
        onClose={() => setIsAddBranchOpen(false)}
        onAdd={(data: BranchFormData) => {
          createBranch.mutate(
            {
              name: data.name,
              address: data.address,
              phone: data.phone,
              status: data.status,
              manager: data.manager,
            },
            { onSuccess: () => setIsAddBranchOpen(false) }
          );
        }}
      />
    </div>
  );
}
