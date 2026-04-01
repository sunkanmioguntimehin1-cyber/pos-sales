'use client';
import { SidePanel } from '@/components/ui/SidePanel';
import { Product } from '@/lib/api/products';

interface ViewProductPanelProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export function ViewProductPanel({ isOpen, onClose, product, onEdit, onDelete }: ViewProductPanelProps) {
  const margin = (p: Product) => {
    const finalPrice = p.price;
    const cost = p.costPrice || 0;
    if (finalPrice === 0) return '0';
    return (((finalPrice - cost) / finalPrice) * 100).toFixed(0);
  };

  const getStatus = (p: Product): string => {
    if (!p.isActive) return 'inactive';
    if (p.stock === 0) return 'out';
    if (p.stock < (p.lowStockThreshold || 10)) return 'low';
    return 'active';
  };

  const statusBadge = (s: string) => {
    if (s === 'active') return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400">Active</span>;
    if (s === 'low')    return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400">Low Stock</span>;
    if (s === 'out')    return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/15 text-red-400">Out of Stock</span>;
    return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-500/15 text-slate-400">Inactive</span>;
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <SidePanel
      isOpen={isOpen}
      onClose={handleClose}
      title="Product Details"
      footer={
        <>
          <button 
            onClick={() => product && onDelete(product)} 
            className="h-9 px-4 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white rounded-lg text-[13px] font-semibold transition-all"
          >
            Delete
          </button>
          <button 
            onClick={() => product && onEdit(product)} 
            className="h-9 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-[13px] font-semibold shadow-[0_2px_8px_rgba(59,130,246,0.3)] transition-all"
          >
            Edit Product
          </button>
        </>
      }
    >
      {product && (
        <div className="space-y-5">
          <div className="w-full h-48 bg-[#1E2535] border border-white/[0.07] rounded-xl overflow-hidden flex items-center justify-center">
            {product.image ? (
              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-6xl">📦</span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <h3 className="text-[18px] font-bold text-slate-100">{product.name}</h3>
            {statusBadge(getStatus(product))}
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'SKU', value: product.sku || '-' },
              { label: 'Barcode', value: product.barcode || '-' },
            ].map(item => (
              <div key={item.label} className="bg-[#1E2535] border border-white/[0.07] rounded-lg p-3">
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">{item.label}</div>
                <div className="text-[13px] text-slate-100 font-medium">{item.value}</div>
              </div>
            ))}
          </div>

          <div className="bg-[#1E2535] border border-white/[0.07] rounded-lg p-3">
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Category</div>
            <div className="text-[13px] text-slate-100 font-medium">{product.category?.name || '-'}</div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#1E2535] border border-white/[0.07] rounded-lg p-3">
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Price</div>
              <div className="text-[16px] font-bold tabular-nums text-slate-100">${product.price.toFixed(2)}</div>
            </div>
            <div className="bg-[#1E2535] border border-white/[0.07] rounded-lg p-3">
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Cost</div>
              <div className="text-[16px] font-bold tabular-nums text-slate-400">${(product.costPrice || 0).toFixed(2)}</div>
            </div>
          </div>

          <div className="bg-[#1E2535] border border-white/[0.07] rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Stock</div>
                <div className={`text-[24px] font-extrabold tabular-nums ${product.stock === 0 ? 'text-red-400' : product.stock < (product.lowStockThreshold || 10) ? 'text-amber-400' : 'text-slate-100'}`}>
                  {product.stock}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Status</div>
                <div className={`text-[14px] font-semibold ${product.stock === 0 ? 'text-red-400' : product.stock < (product.lowStockThreshold || 10) ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {product.stock === 0 ? 'Out of Stock' : product.stock < (product.lowStockThreshold || 10) ? 'Low Stock' : 'In Stock'}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#1E2535] border border-white/[0.07] rounded-lg p-4">
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-3">Profit Analysis</div>
            <div className="space-y-2">
              <div className="flex justify-between text-[13px]">
                <span className="text-slate-400">Gross Profit</span>
                <span className="text-slate-100 font-medium">${(product.price - (product.costPrice || 0)).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-slate-400">Profit Margin</span>
                <span className={`font-medium ${parseInt(margin(product)) > 30 ? 'text-emerald-400' : 'text-slate-100'}`}>{margin(product)}%</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </SidePanel>
  );
}
