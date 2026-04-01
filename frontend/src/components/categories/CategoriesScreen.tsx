'use client';
import { useState } from 'react';
import { IconSearch, IconPlus, IconEdit, IconTrash, IconDownload } from '@/components/ui/Icons';
import { AddCategoryModal } from './AddCategoryModal';
import { EditCategoryModal } from './EditCategoryModal';
import { ViewCategoryPanel } from './ViewCategoryPanel';
import { DeleteCategoryModal } from './DeleteCategoryModal';
import { SkeletonTable } from '@/components/ui/Skeleton';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory, Category } from '@/lib/hooks';

const selectCls = "w-full h-9 px-3 bg-[#1E2535] border border-white/[0.12] rounded-lg text-slate-300 text-[13px] outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer pr-7 bg-[image:url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%2364748B%22 stroke-width=%222%22><path d=%22M6 9l6 6 6-6%22/></svg>')] bg-no-repeat bg-[position:right_10px_center]";

interface CategoryDisplay {
  id: string;
  name: string;
  description?: string;
  color?: string;
  productCount: number;
  isActive: boolean;
  createdAt: string;
}

export function CategoriesScreen() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewPanelOpen, setIsViewPanelOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryDisplay | null>(null);

  const { data: apiCategories = [], isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const categories: CategoryDisplay[] = apiCategories.map(c => ({
    id: c.id,
    name: c.name,
    description: c.description,
    color: c.color,
    productCount: 0,
    isActive: true,
    createdAt: new Date().toISOString(),
  }));

  const existingNames = categories.map(c => c.name.toLowerCase());

  const filtered = categories.filter(c =>
    (statusFilter === 'All' || (statusFilter === 'active' && c.isActive) || (statusFilter === 'inactive' && !c.isActive)) &&
    (c.name.toLowerCase().includes(search.toLowerCase()) || (c.description?.toLowerCase().includes(search.toLowerCase()) ?? false))
  );

  const statusBadge = (isActive: boolean) => {
    if (isActive) return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400">Active</span>;
    return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-500/15 text-slate-400">Inactive</span>;
  };

  const handleAddCategory = (data: { name: string; description?: string; color?: string }) => {
    createCategory.mutate(data);
  };

  const handleUpdateCategory = (id: string, data: { name: string; description?: string; color?: string }) => {
    updateCategory.mutate({ categoryId: id, data });
  };

  const handleDeleteCategory = () => {
    if (selectedCategory) {
      deleteCategory.mutate(selectedCategory.id);
      setSelectedCategory(null);
    }
  };

  const openViewPanel = (category: CategoryDisplay) => {
    setSelectedCategory(category);
    setIsViewPanelOpen(true);
  };

  const openEditModal = (category: CategoryDisplay) => {
    setSelectedCategory(category);
    setIsViewPanelOpen(false);
    setIsEditModalOpen(true);
  };

  const openDeleteConfirm = (category: CategoryDisplay) => {
    setSelectedCategory(category);
    setIsDeleteConfirmOpen(true);
  };

  const closeViewPanel = () => {
    setIsViewPanelOpen(false);
    setSelectedCategory(null);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-[#1E2535] border border-white/[0.07] rounded-xl p-4">
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1.5">Total Categories</div>
          <div className="text-[26px] font-extrabold tabular-nums text-blue-400">{isLoading ? '...' : categories.length}</div>
        </div>
        <div className="bg-[#1E2535] border border-white/[0.07] rounded-xl p-4">
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1.5">Active Categories</div>
          <div className="text-[26px] font-extrabold tabular-nums text-emerald-400">{isLoading ? '...' : categories.filter(c => c.isActive).length}</div>
        </div>
        <div className="bg-[#1E2535] border border-white/[0.07] rounded-xl p-4">
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1.5">Inactive</div>
          <div className="text-[26px] font-extrabold tabular-nums text-slate-400">{isLoading ? '...' : categories.filter(c => !c.isActive).length}</div>
        </div>
        <div className="bg-[#1E2535] border border-white/[0.07] rounded-xl p-4">
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1.5">Total Products</div>
          <div className="text-[26px] font-extrabold tabular-nums text-amber-400">0</div>
        </div>
      </div>

      <div className="bg-[#161B27] border border-white/[0.07] rounded-xl overflow-hidden">
        <div className="px-4 py-3 flex items-center gap-2.5 border-b border-white/[0.07] flex-wrap">
          <div className="relative max-w-[280px] flex-1">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
              <IconSearch size={14} />
            </span>
            <input 
              className="w-full h-9 pl-8 pr-3 bg-[#1E2535] border border-white/[0.12] rounded-lg text-slate-100 text-[13px] placeholder:text-slate-500 outline-none focus:border-blue-500 transition-all" 
              placeholder="Search categories..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
            />
          </div>
          <select className={selectCls} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            {['All', 'Active', 'Inactive'].map(s => <option key={s}>{s}</option>)}
          </select>
          <div className="flex-1" />
          <button className="h-9 flex items-center gap-1.5 px-3.5 bg-[#1E2535] border border-white/[0.12] text-slate-400 hover:text-slate-200 hover:bg-[#252D3D] rounded-lg text-[13px] font-semibold transition-all">
            <IconDownload size={12} /> Export
          </button>
          <button 
            onClick={() => setIsAddModalOpen(true)} 
            className="h-9 flex items-center gap-1.5 px-3.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-[13px] font-semibold shadow-[0_2px_8px_rgba(59,130,246,0.3)] transition-all"
          >
            <IconPlus size={12} /> Add Category
          </button>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-4">
              <SkeletonTable rows={3} cols={5} />
            </div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="w-10 px-3.5 py-2.5 text-left border-b border-white/[0.07] bg-[#1E2535]">
                    <input type="checkbox" className="accent-blue-500" />
                  </th>
                  {['Category', 'Description', 'Products', 'Status', ''].map(h => (
                    <th key={h} className="px-3.5 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500 border-b border-white/[0.07] bg-[#1E2535] whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id} className="hover:bg-white/[0.02] transition-colors cursor-pointer" onClick={() => openViewPanel(c)}>
                    <td className="px-3.5 py-3 border-b border-white/[0.07]" onClick={e => e.stopPropagation()}>
                      <input type="checkbox" className="accent-blue-500" />
                    </td>
                    <td className="px-3.5 py-3 border-b border-white/[0.07]">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-lg bg-[#1E2535] border border-white/[0.07] flex items-center justify-center text-xl flex-shrink-0" style={{ backgroundColor: c.color || '#1E2535' }}>
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-100 text-[13px]">{c.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3.5 py-3 border-b border-white/[0.07]">
                      <span className="text-xs text-slate-400 line-clamp-1 max-w-[300px] block">{c.description || 'No description'}</span>
                    </td>
                    <td className="px-3.5 py-3 border-b border-white/[0.07]">
                      <span className="font-bold tabular-nums text-slate-100">{c.productCount}</span>
                    </td>
                    <td className="px-3.5 py-3 border-b border-white/[0.07]">{statusBadge(c.isActive)}</td>
                    <td className="px-3.5 py-3 border-b border-white/[0.07]" onClick={e => e.stopPropagation()}>
                      <div className="flex gap-1">
                        <button onClick={() => openEditModal(c)} className="w-7 h-7 flex items-center justify-center rounded-md bg-[#1E2535] border border-white/[0.12] text-slate-400 hover:text-slate-200 transition-all"><IconEdit size={11} /></button>
                        <button onClick={() => openDeleteConfirm(c)} className="w-7 h-7 flex items-center justify-center rounded-md bg-[#1E2535] border border-white/[0.12] text-slate-400 hover:text-red-400 transition-all"><IconTrash size={11} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="px-4 py-2.5 border-t border-white/[0.07] bg-[#1E2535] flex items-center justify-between">
          <span className="text-xs text-slate-500">Showing {filtered.length} of {categories.length} categories</span>
          <div className="flex gap-1">
            {['Prev', '1', 'Next'].map((p, i) => (
              <button key={p} className={`h-7 min-w-[28px] px-2 flex items-center justify-center rounded-md text-xs font-semibold transition-all ${i === 1 ? 'bg-blue-500 text-white' : 'bg-[#252D3D] border border-white/[0.12] text-slate-400 hover:text-slate-200'}`}>{p}</button>
            ))}
          </div>
        </div>
      </div>

      <AddCategoryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddCategory}
        existingNames={existingNames}
      />

      <EditCategoryModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedCategory(null);
        }}
        category={selectedCategory}
        onUpdate={handleUpdateCategory}
        existingNames={existingNames}
      />

      <ViewCategoryPanel
        isOpen={isViewPanelOpen}
        onClose={closeViewPanel}
        category={selectedCategory}
        onEdit={openEditModal}
        onDelete={openDeleteConfirm}
      />

      <DeleteCategoryModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => {
          setIsDeleteConfirmOpen(false);
          setSelectedCategory(null);
        }}
        category={selectedCategory}
        onConfirm={handleDeleteCategory}
      />
    </div>
  );
}
