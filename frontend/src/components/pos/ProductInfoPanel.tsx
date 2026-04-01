'use client';
import { IconStore, IconPackage, IconUser } from '@/components/ui/Icons';
import { SidePanel } from '@/components/ui/SidePanel';
import { Product } from './types';

interface BranchStock {
  branchId: number;
  branchName: string;
  quantity: number;
  location: string;
}

interface ProductInfoPanelProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  branchInventory: BranchStock[];
  onAddToCart: (product: Product) => void;
}

const stockStatus = (qty: number) => {
  if (qty === 0) return { label: 'Out', color: 'text-red-400 bg-red-500/15' };
  if (qty <= 10) return { label: 'Low', color: 'text-amber-400 bg-amber-500/15' };
  return { label: 'In Stock', color: 'text-emerald-400 bg-emerald-500/15' };
};

export function ProductInfoPanel({ isOpen, onClose, product, branchInventory, onAddToCart }: ProductInfoPanelProps) {
  if (!product) return null;

  const totalStock = branchInventory.reduce((sum, b) => sum + b.quantity, 0);

  return (
    <SidePanel
      isOpen={isOpen}
      onClose={onClose}
      title="Product Info"
      width="420px"
      footer={
        <>
          <button
            onClick={onClose}
            className="h-9 px-4 bg-[#1E2535] border border-white/[0.12] text-slate-400 hover:text-slate-200 rounded-lg text-[13px] font-semibold transition-all"
          >
            Close
          </button>
          <button
            onClick={() => { onAddToCart(product); onClose(); }}
            className="h-9 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-[13px] font-semibold shadow-[0_2px_8px_rgba(59,130,246,0.3)] transition-all"
          >
            Add to Cart
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <div className="bg-[#1E2535] border border-white/[0.07] rounded-xl p-5">
          <div className="flex items-start gap-4">
            <div className="text-[40px]">📦</div>
            <div className="flex-1">
              <h3 className="text-[15px] font-bold text-slate-100 mb-1">{product.name}</h3>
              <div className="font-mono text-[11px] text-slate-500 mb-2">{product.sku}</div>
              <div className="text-xl font-extrabold text-blue-400">${product.price.toFixed(2)}</div>
            </div>
          </div>
        </div>

        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">Attributes</div>
          <div className="bg-[#1E2535] border border-white/[0.07] rounded-xl p-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                  <IconPackage size={14} />
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase">Category</div>
                  <div className="text-[12px] text-slate-100 font-semibold">{product.category?.name || '-'}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                  </svg>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase">Stock</div>
                  <div className="text-[12px] text-slate-100 font-semibold">{product.stock}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                  </svg>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase">Barcode</div>
                  <div className="text-[12px] text-slate-100 font-semibold">{product.barcode || '-'}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <IconPackage size={14} />
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase">Total Stock</div>
                  <div className="text-[12px] text-slate-100 font-semibold">{totalStock} units</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-2">
            <IconStore size={12} />
            Branch Inventory
          </div>
          <div className="bg-[#1E2535] border border-white/[0.07] rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.07]">
                  <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500">Branch</th>
                  <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500">Location</th>
                  <th className="px-4 py-2.5 text-right text-[10px] font-bold uppercase tracking-widest text-slate-500">Qty</th>
                  <th className="px-4 py-2.5 text-right text-[10px] font-bold uppercase tracking-widest text-slate-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {branchInventory.map((branch) => {
                  const status = stockStatus(branch.quantity);
                  return (
                    <tr key={branch.branchId} className="border-b border-white/[0.07] last:border-0 hover:bg-white/[0.02]">
                      <td className="px-4 py-3 text-[12px] text-slate-100 font-semibold">{branch.branchName}</td>
                      <td className="px-4 py-3 text-[11px] text-slate-500 font-mono">{branch.location}</td>
                      <td className="px-4 py-3 text-[12px] text-slate-100 font-extrabold text-right tabular-nums">{branch.quantity}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </SidePanel>
  );
}
