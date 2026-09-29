'use client';
import { useState, useMemo } from 'react';
import { IconStore, IconAlertTriangle } from '@/components/ui/Icons';
import { InventoryItem, StockAdjustmentFormData } from './types';
import { InventoryTable } from './InventoryTable';
import { StockAdjustmentForm } from './StockAdjustmentForm';
import { AddInventoryModal } from './AddInventoryModal';
import { SidePanel } from '@/components/ui/SidePanel';
import { StockHistoryPanel } from './StockHistoryPanel';
import { useProducts, useAdjustStock, useCreateProduct, useBranches, getProductCategoryName } from '@/lib/hooks';
// A `<select>` needs a value, so "no location" is a sentinel rather than ''.
import { ALL_LOCATIONS_SENTINEL as ALL_LOCATIONS, toBranchQueryId } from '@/lib/utils/branchQuery';

export function InventoryScreen() {
  const { data: branches = [] } = useBranches();
  const [locationId, setLocationId] = useState<string>(ALL_LOCATIONS);
  const selectedBranch = branches.find((b) => b.id === locationId);

  /**
   * `ALL_LOCATIONS` is a UI sentinel, not a branch id, and must never reach the
   * API — the backend would try to cast it to an ObjectId and reject the
   * request. Omitting `branchId` is what asks for company-wide totals.
   */
  const branchId = toBranchQueryId(locationId);

  // `branchId` scopes `stock` to one location, which is also the location an
  // adjustment from this screen would hit.
  const { data: products = [], isLoading } = useProducts({ branchId });
  const adjustStock = useAdjustStock();
  const createProduct = useCreateProduct();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAdjustPanelOpen, setIsAdjustPanelOpen] = useState(false);
  const [historyItem, setHistoryItem] = useState<InventoryItem | null>(null);

  const onHandLabel = selectedBranch
    ? `On Hand (${selectedBranch.type === 'head_office' ? 'HQ' : selectedBranch.name})`
    : 'On Hand';

  const inventory: InventoryItem[] = useMemo(() => {
    return products.map(p => {
      const onHand = p.stock || 0;
      const reorder = p.lowStockThreshold || 0;
      let status: InventoryItem['status'] = 'ok';
      if (onHand === 0) status = 'out';
      else if (onHand <= reorder * 0.25) status = 'critical';
      else if (onHand <= reorder) status = 'low';

      return {
        id: p.id,
        productCode: p.sku || p.barcode || p.id,
        name: p.name,
        category: getProductCategoryName(p) ?? 'Uncategorized',
        onHand,
        totalStock: p.totalStock ?? p.stock ?? 0,
        reserved: 0,
        available: onHand,
        reorder,
        updated: new Date(p.createdAt).toLocaleDateString(),
        status,
      };
    });
  }, [products]);

  const totalUnits = inventory.reduce((acc, item) => acc + item.onHand, 0);
  const lowStockCount = inventory.filter(item => item.status === 'low' || item.status === 'critical').length;
  const outOfStockCount = inventory.filter(item => item.status === 'out').length;

  /**
   * The form carries its own product dropdown keyed by product code, so the
   * target has to be resolved from the submitted data — not from whichever row
   * last opened the panel.
   */
  const handleStockAdjustment = (data: StockAdjustmentFormData) => {
    const target = inventory.find(item => item.productCode === data.productCode);
    if (!target) return;

    const qty = parseInt(data.quantity, 10);
    if (Number.isNaN(qty)) return;

    // The backend only distinguishes "set to an absolute value" from
    // "add a (possibly negative) delta", so removals must arrive negative.
    let adjustment: number;
    let type: 'set' | 'adjust';

    switch (data.type) {
      case 'correction':
        adjustment = qty;
        type = 'set';
        break;
      case 'damage':
        adjustment = -qty;
        type = 'adjust';
        break;
      default:
        adjustment = qty;
        type = 'adjust';
    }

    adjustStock.mutate(
      { productId: target.id, adjustment, type, branchId: selectedBranch?.id },
      { onSettled: () => setIsAdjustPanelOpen(false) }
    );
  };

  /** "Add Inventory" creates a real product; fields with no schema column are not collected. */
  const handleAddInventory = (item: {
    productCode: string;
    name: string;
    price: number;
    costPrice?: number;
    onHand: number;
    reorder: number;
  }) => {
    createProduct.mutate(
      {
        name: item.name,
        sku: item.productCode,
        price: item.price,
        costPrice: item.costPrice,
        stock: item.onHand,
        lowStockThreshold: item.reorder,
      },
      { onSettled: () => setIsAddModalOpen(false) }
    );
  };

  const handleViewHistory = (item: InventoryItem) => {
    setHistoryItem(item);
  };

  const handlePrint = (item: InventoryItem) => {
    window.print();
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total Products', value: inventory.length.toString(), color: 'text-blue-400'    },
          { label: 'Total Units',    value: totalUnits.toLocaleString(), color: 'text-[var(--text)]'   },
          { label: 'Low Stock',     value: lowStockCount.toString(),    color: 'text-amber-400'   },
          { label: 'Out of Stock',  value: outOfStockCount.toString(), color: 'text-red-400'     },
        ].map(c => (
          <div key={c.label} className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-4">
            <div className="text-[10px] text-subtle font-bold uppercase tracking-widest mb-1.5">{c.label}</div>
            <div className={`text-[26px] font-extrabold tabular-nums ${c.color}`}>{c.value}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <div className="relative">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-subtle pointer-events-none">
            <IconStore size={14} />
          </span>
          <select
            className="h-9 pl-8 pr-8 bg-[var(--surface-2)] border border-[var(--border-strong)] rounded-lg text-[var(--text)] text-[13px] font-semibold outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer bg-[image:url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%2364748B%22 stroke-width=%222%22><path d=%22M6 9l6 6 6-6%22/></svg>')] bg-no-repeat bg-[position:right_10px_center]"
            value={locationId}
            onChange={(e) => setLocationId(e.target.value)}
            aria-label="Stock location"
          >
            <option value={ALL_LOCATIONS}>All locations (company total)</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}{b.type === 'head_office' ? ' (HQ)' : ''}
              </option>
            ))}
          </select>
        </div>
        {selectedBranch && (
          <span className="flex items-center gap-1 text-[11px] text-subtle">
            <IconAlertTriangle size={12} />
            Stock counts and adjustments are limited to this location.
          </span>
        )}
      </div>

      {isLoading && (
        <div className="text-[13px] text-subtle">Loading inventory…</div>
      )}

      <InventoryTable
        inventory={inventory}
        logs={[]}
        onAddInventory={() => setIsAddModalOpen(true)}
        onAdjustStock={() => setIsAdjustPanelOpen(true)}
        onViewHistory={handleViewHistory}
        onPrint={handlePrint}
        onHandLabel={onHandLabel}
        showTotal={!!selectedBranch}
        adjustDisabledReason={
          selectedBranch ? undefined : 'Select a single location to adjust its stock'
        }
      />

      <AddInventoryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddInventory}
      />

      <SidePanel
        isOpen={isAdjustPanelOpen}
        onClose={() => setIsAdjustPanelOpen(false)}
        title="Stock Adjustment"
        width="420px"
        footer={
          <>
            <button
              onClick={() => setIsAdjustPanelOpen(false)}
              className="h-9 px-4 bg-[var(--surface-2)] border border-[var(--border-strong)] text-muted hover:text-[var(--text)] rounded-lg text-[13px] font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                const form = document.getElementById('stock-adjustment-form');
                if (form) form.dispatchEvent(new Event('submit', { bubbles: true }));
              }}
              className="h-9 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-[13px] font-semibold shadow-[0_2px_8px_rgba(59,130,246,0.3)] transition-all"
            >
              Apply to {selectedBranch ? (selectedBranch.type === 'head_office' ? 'HQ' : selectedBranch.name) : 'Head Office'}
            </button>
          </>
        }
      >
        <StockAdjustmentForm
          onSubmit={handleStockAdjustment}
          inventory={inventory}
          locationName={selectedBranch?.type === 'head_office' ? 'head office' : selectedBranch?.name}
        />
      </SidePanel>

      <SidePanel
        isOpen={!!historyItem}
        onClose={() => setHistoryItem(null)}
        title={`Stock History — ${historyItem?.name || ''}`}
        width="480px"
      >
        {historyItem && <StockHistoryPanel product={historyItem} logs={[]} />}
      </SidePanel>
    </div>
  );
}
