'use client';
import { useState } from 'react';
import { IconSearch, IconPlus, IconEdit, IconTrash, IconDownload } from '@/components/ui/Icons';
import { AddProductModal } from './AddProductModal';
import { EditProductModal } from './EditProductModal';
import { ViewProductPanel } from './ViewProductPanel';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { SkeletonTable } from '@/components/ui/Skeleton';
import { useProducts, useCategories, useCreateProduct, useUpdateProduct, useDeleteProduct, Product } from '@/lib/hooks';
import { CreateProductData } from '@/lib/api/products';

const selectCls = "w-full h-9 px-3 bg-[#1E2535] border border-white/[0.12] rounded-lg text-slate-300 text-[13px] outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer pr-7 bg-[image:url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%2364748B%22 stroke-width=%222%22><path d=%22M6 9l6 6 6-6%22/></svg>')] bg-no-repeat bg-[position:right_10px_center]";

interface AddProductFormData {
  name: string;
  productCode: string;
  sellingPrice: number;
  cost: number;
  stock: number;
  categoryId?: string;
  image?: string;
}

interface UpdateProductFormData {
  productCode: string;
  name: string;
  sellingPrice: number;
  cost: number;
  stock: number;
  categoryId?: string;
  image?: string;
}

export function ProductsScreen() {
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewPanelOpen, setIsViewPanelOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const { data: products = [], isLoading } = useProducts({
    category: catFilter !== 'All' ? catFilter : undefined,
    search: search || undefined,
  });
  
  const { data: categories = [] } = useCategories();
  
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const filteredProducts = products.filter(p =>
    (statusFilter === 'All' || getProductStatus(p) === statusFilter.toLowerCase()) &&
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const getProductStatus = (p: Product): string => {
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

  const handleAddProduct = (productData: AddProductFormData) => {
    const data: CreateProductData = {
      name: productData.name,
      sku: productData.productCode,
      price: productData.sellingPrice,
      costPrice: productData.cost,
      stock: productData.stock,
      categoryId: productData.categoryId,
      image: productData.image,
    };
    createProduct.mutate(data);
  };

  const handleUpdateProduct = (productId: string, productData: UpdateProductFormData) => {
    updateProduct.mutate({
      productId,
      data: {
        name: productData.name,
        sku: productData.productCode,
        price: productData.sellingPrice,
        costPrice: productData.cost,
        stock: productData.stock,
        categoryId: productData.categoryId,
        image: productData.image,
      },
    });
  };

  const handleDeleteProduct = () => {
    if (selectedProduct) {
      deleteProduct.mutate(selectedProduct.id);
      setSelectedProduct(null);
    }
  };

  const openViewPanel = (product: Product) => {
    setSelectedProduct(product);
    setIsViewPanelOpen(true);
  };

  const openEditModal = (product: Product) => {
    setSelectedProduct(product);
    setIsViewPanelOpen(false);
    setIsEditModalOpen(true);
  };

  const openDeleteConfirm = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteConfirmOpen(true);
  };

  const closeViewPanel = () => {
    setIsViewPanelOpen(false);
    setSelectedProduct(null);
  };

  const activeCount = products.filter(p => getProductStatus(p) === 'active').length;
  const lowStockCount = products.filter(p => getProductStatus(p) === 'low').length;
  const outOfStockCount = products.filter(p => getProductStatus(p) === 'out').length;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-[#1E2535] border border-white/[0.07] rounded-xl p-4">
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1.5">Total Products</div>
          <div className="text-[26px] font-extrabold text-blue-400">{isLoading ? '...' : products.length}</div>
        </div>
        <div className="bg-[#1E2535] border border-white/[0.07] rounded-xl p-4">
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1.5">Active Listings</div>
          <div className="text-[26px] font-extrabold text-emerald-400">{isLoading ? '...' : activeCount}</div>
        </div>
        <div className="bg-[#1E2535] border border-white/[0.07] rounded-xl p-4">
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1.5">Low Stock Items</div>
          <div className="text-[26px] font-extrabold text-amber-400">{isLoading ? '...' : lowStockCount}</div>
        </div>
        <div className="bg-[#1E2535] border border-white/[0.07] rounded-xl p-4">
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1.5">Out of Stock</div>
          <div className="text-[26px] font-extrabold text-red-400">{isLoading ? '...' : outOfStockCount}</div>
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
              placeholder="Search by name or SKU..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
            />
          </div>
          <select className={selectCls} value={catFilter} onChange={e => setCatFilter(e.target.value)}>
            <option value="All">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
          <select className={selectCls} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="All">All Status</option>
            <option value="active">Active</option>
            <option value="low">Low Stock</option>
            <option value="out">Out of Stock</option>
          </select>
          <div className="flex-1" />
          <button className="h-9 flex items-center gap-1.5 px-3.5 bg-[#1E2535] border border-white/[0.12] text-slate-400 hover:text-slate-200 hover:bg-[#252D3D] rounded-lg text-[13px] font-semibold transition-all">
            <IconDownload size={12} /> Export
          </button>
          <button 
            onClick={() => setIsAddModalOpen(true)} 
            className="h-9 flex items-center gap-1.5 px-3.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-[13px] font-semibold shadow-[0_2px_8px_rgba(59,130,246,0.3)] transition-all"
          >
            <IconPlus size={12} /> Add Product
          </button>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-4">
              <SkeletonTable rows={5} cols={9} />
            </div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="w-10 px-3.5 py-2.5 text-left border-b border-white/[0.07] bg-[#1E2535]">
                    <input type="checkbox" className="accent-blue-500" />
                  </th>
                  {['Product', 'SKU', 'Category', 'Price', 'Stock', 'Status', ''].map(h => (
                    <th key={h} className="px-3.5 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500 border-b border-white/[0.07] bg-[#1E2535] whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(p => (
                  <tr key={p.id} className="hover:bg-white/[0.02] transition-colors cursor-pointer" onClick={() => openViewPanel(p)}>
                    <td className="px-3.5 py-3 border-b border-white/[0.07]" onClick={e => e.stopPropagation()}>
                      <input type="checkbox" className="accent-blue-500" />
                    </td>
                    <td className="px-3.5 py-3 border-b border-white/[0.07]">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-lg bg-[#1E2535] border border-white/[0.07] flex items-center justify-center text-lg flex-shrink-0 overflow-hidden">
                          {p.image ? <img src={p.image} alt="" className="w-full h-full object-cover" /> : '📦'}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-100 text-[13px]">{p.name}</div>
                          <div className="text-[10px] text-slate-500 mt-px">{p.sku || 'No SKU'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3.5 py-3 border-b border-white/[0.07]">
                      <span className="text-xs text-slate-300">{p.sku || '-'}</span>
                    </td>
                    <td className="px-3.5 py-3 border-b border-white/[0.07]">
                      <span className="text-xs text-slate-300">{p.category?.name || '-'}</span>
                    </td>
                    <td className="px-3.5 py-3 border-b border-white/[0.07] font-bold tabular-nums text-slate-100">${p.price.toFixed(2)}</td>
                    <td className={`px-3.5 py-3 border-b border-white/[0.07] font-bold tabular-nums ${p.stock === 0 ? 'text-red-400' : p.stock < (p.lowStockThreshold || 10) ? 'text-amber-400' : 'text-slate-100'}`}>{p.stock}</td>
                    <td className="px-3.5 py-3 border-b border-white/[0.07]">{statusBadge(getProductStatus(p))}</td>
                    <td className="px-3.5 py-3 border-b border-white/[0.07]" onClick={e => e.stopPropagation()}>
                      <div className="flex gap-1">
                        <button onClick={() => openEditModal(p)} className="w-7 h-7 flex items-center justify-center rounded-md bg-[#1E2535] border border-white/[0.12] text-slate-400 hover:text-slate-200 transition-all"><IconEdit size={11} /></button>
                        <button onClick={() => openDeleteConfirm(p)} className="w-7 h-7 flex items-center justify-center rounded-md bg-[#1E2535] border border-white/[0.12] text-slate-400 hover:text-red-400 transition-all"><IconTrash size={11} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="px-4 py-2.5 border-t border-white/[0.07] bg-[#1E2535] flex items-center justify-between">
          <span className="text-xs text-slate-500">Showing {filteredProducts.length} of {products.length} products</span>
          <div className="flex gap-1">
            {['Prev', '1', '2', '3', 'Next'].map((p, i) => (
              <button key={p} className={`h-7 min-w-[28px] px-2 flex items-center justify-center rounded-md text-xs font-semibold transition-all ${i === 1 ? 'bg-blue-500 text-white' : 'bg-[#252D3D] border border-white/[0.12] text-slate-400 hover:text-slate-200'}`}>{p}</button>
            ))}
          </div>
        </div>
      </div>

      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddProduct}
      />

      <EditProductModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
        onUpdate={handleUpdateProduct}
      />

      <ViewProductPanel
        isOpen={isViewPanelOpen}
        onClose={closeViewPanel}
        product={selectedProduct}
        onEdit={openEditModal}
        onDelete={openDeleteConfirm}
      />

      <DeleteConfirmModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => {
          setIsDeleteConfirmOpen(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
        onConfirm={handleDeleteProduct}
      />
    </div>
  );
}
