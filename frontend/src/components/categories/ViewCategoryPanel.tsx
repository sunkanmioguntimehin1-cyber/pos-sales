'use client';
import { SidePanel } from '@/components/ui/SidePanel';

interface CategoryDisplay {
  id: string;
  name: string;
  description?: string;
  color?: string;
  productCount: number;
  isActive: boolean;
  createdAt: string;
}

interface ViewCategoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  category: CategoryDisplay | null;
  onEdit: (category: CategoryDisplay) => void;
  onDelete: (category: CategoryDisplay) => void;
}

export function ViewCategoryPanel({ isOpen, onClose, category, onEdit, onDelete }: ViewCategoryPanelProps) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const statusBadge = (isActive: boolean) => {
    if (isActive) return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400">Active</span>;
    return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-500/15 text-slate-400">Inactive</span>;
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <SidePanel
      isOpen={isOpen}
      onClose={handleClose}
      title="Category Details"
      footer={
        <>
          <button 
            onClick={() => category && onDelete(category)} 
            className="h-9 px-4 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white rounded-lg text-[13px] font-semibold transition-all"
          >
            Delete
          </button>
          <button 
            onClick={() => category && onEdit(category)} 
            className="h-9 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-[13px] font-semibold shadow-[0_2px_8px_rgba(59,130,246,0.3)] transition-all"
          >
            Edit Category
          </button>
        </>
      }
    >
      {category && (
        <div className="space-y-5">
          <div className="w-full h-40 bg-[#1E2535] border border-white/[0.07] rounded-xl flex items-center justify-center" style={{ backgroundColor: category.color || '#1E2535' }}>
            <span className="text-7xl">{category.name.charAt(0).toUpperCase()}</span>
          </div>

          <div className="flex items-center justify-between">
            <h3 className="text-[18px] font-bold text-slate-100">{category.name}</h3>
            {statusBadge(category.isActive)}
          </div>

          {category.description && (
            <div className="bg-[#1E2535] border border-white/[0.07] rounded-lg p-4">
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">Description</div>
              <p className="text-[13px] text-slate-300 leading-relaxed">{category.description}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#1E2535] border border-white/[0.07] rounded-lg p-4">
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Products</div>
              <div className="text-[24px] font-extrabold text-blue-400">{category.productCount}</div>
            </div>
            <div className="bg-[#1E2535] border border-white/[0.07] rounded-lg p-4">
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Status</div>
              <div className={`text-[16px] font-bold ${category.isActive ? 'text-emerald-400' : 'text-slate-400'}`}>
                {category.isActive ? 'Active' : 'Inactive'}
              </div>
            </div>
          </div>

          <div className="bg-[#1E2535] border border-white/[0.07] rounded-lg p-4">
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Created</div>
            <div className="text-[13px] text-slate-300">{formatDate(category.createdAt)}</div>
          </div>
        </div>
      )}
    </SidePanel>
  );
}
