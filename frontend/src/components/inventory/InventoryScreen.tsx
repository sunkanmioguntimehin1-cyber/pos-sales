'use client';
import { useState, useMemo } from 'react';
import { InventoryItem, StockLog, StockAdjustmentFormData } from './types';
import { InventoryTable } from './InventoryTable';
import { StockAdjustmentForm } from './StockAdjustmentForm';
import { AddInventoryModal } from './AddInventoryModal';
import { SidePanel } from '@/components/ui/SidePanel';
import { StockHistoryPanel } from './StockHistoryPanel';
import { useProducts, useAdjustStock } from '@/lib/hooks';
import { Skeleton } from '@/components/ui/Skeleton';

export function InventoryScreen() {
  const { data: products = [], isLoading } = useProducts();
  const adjustStock = useAdjustStock();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAdjustPanelOpen, setIsAdjustPanelOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<InventoryItem | null>(null);

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
        color: '',
        size: '',
        onHand,
        reserved: 0,
        available: onHand,
        reorder,
        location: '',
        updated: new Date(p.createdAt).toLocaleDateString(),
        status,
      };
    });
  }, [products]);

  const totalUnits = inventory.reduce((acc, item) => acc + item.onHand, 0);
  const lowStockCount = inventory.filter(item => item.status === 'low' || item.status === 'critical').length;
  const outOfStockCount = inventory.filter(item => item.status === 'out').length;

  const handleStockAdjustment = (data: StockAdjustmentFormData) => {
    if (!selectedProduct) return;
    const qty = parseInt(data.quantity, 10);
    if (isNaN(qty)) return;
    
    adjustStock.mutate({
      productId: selectedProduct.id,
      adjustment: data.type === 'set' ? qty - selectedProduct.onHand : qty,
      type: data.type as 'set' | 'adjust',
    });
    setIsAdjustPanelOpen(false);
  };

  const handleAddInventory = () => {
    setIsAddModalOpen(false);
  };

  const handleViewHistory = (item: InventoryItem) => {
    setSelectedProduct(item);
  };

  const handlePrint = (item: InventoryItem) => {
    console.log('Print label for:', item.productCode);
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

      <InventoryTable
        inventory={inventory}
        logs={[]}
        onAddInventory={() => setIsAddModalOpen(true)}
        onAdjustStock={() => setIsAdjustPanelOpen(true)}
        onViewHistory={handleViewHistory}
        onPrint={handlePrint}
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
              Apply Adjustment
            </button>
          </>
        }
      >
        <StockAdjustmentForm onSubmit={handleStockAdjustment} inventory={inventory} />
      </SidePanel>

      <SidePanel
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        title={`Stock History — ${selectedProduct?.name || ''}`}
        width="480px"
      >
        {selectedProduct && <StockHistoryPanel product={selectedProduct} logs={[]} />}
      </SidePanel>
    </div>
  );
}
