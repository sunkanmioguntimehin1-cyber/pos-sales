'use client';
import { useState } from 'react';
import { IconPlus, IconSearch, IconEdit, IconEye, IconTrash, IconStore } from '@/components/ui/Icons';
import { BranchFormData } from './types';
import { AddBranchModal } from './AddBranchModal';
import { EditBranchModal } from './EditBranchModal';
import { ViewBranchPanel } from './ViewBranchPanel';
import { DeleteBranchModal } from './DeleteBranchModal';
import { SkeletonTable } from '@/components/ui/Skeleton';
import { useBranches, useCreateBranch, useUpdateBranch, useDeleteBranch, Branch } from '@/lib/hooks';

const selectCls = "w-full h-9 px-3 bg-[#1E2535] border border-white/[0.12] rounded-lg text-slate-300 text-[13px] outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer pr-7 bg-[image:url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%2364748B%22 stroke-width=%222%22><path d=%22M6 9l6 6 6-6%22/></svg>')] bg-no-repeat bg-[position:right_10px_center]";

export function BranchesScreen() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [viewPanelBranch, setViewPanelBranch] = useState<Branch | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const { data: branches = [], isLoading } = useBranches();
  const createBranch = useCreateBranch();
  const updateBranch = useUpdateBranch();
  const deleteBranch = useDeleteBranch();

  const activeCount = branches.filter(b => b.isDefault || !statusFilter).length;
  const inactiveCount = branches.filter(b => !b.isDefault).length;

  const filteredBranches = branches.filter(branch => {
    const matchesSearch = 
      branch.name.toLowerCase().includes(search.toLowerCase()) ||
      (branch.address?.toLowerCase().includes(search.toLowerCase()) ?? false);
    const matchesStatus = statusFilter === 'All' || 
      (statusFilter === 'active' && branch.isDefault) ||
      (statusFilter === 'inactive' && !branch.isDefault);
    return matchesSearch && matchesStatus;
  });

  const handleAddBranch = (data: BranchFormData) => {
    createBranch.mutate({
      name: data.name,
      address: data.address,
      phone: data.phone,
    });
  };

  const handleEditBranch = (id: string, data: BranchFormData) => {
    updateBranch.mutate({
      branchId: id,
      data: {
        name: data.name,
        address: data.address,
        phone: data.phone,
        isDefault: data.status === 'active',
      },
    });
  };

  const handleDeleteBranch = (id: string) => {
    deleteBranch.mutate(id);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[#1E2535] border border-white/[0.07] rounded-xl p-4">
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1.5">Total Branches</div>
          <div className="text-[26px] font-extrabold text-blue-400">{isLoading ? '...' : branches.length}</div>
        </div>
        <div className="bg-[#1E2535] border border-white/[0.07] rounded-xl p-4">
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1.5">Active</div>
          <div className="text-[26px] font-extrabold text-emerald-400">{isLoading ? '...' : branches.length}</div>
        </div>
        <div className="bg-[#1E2535] border border-white/[0.07] rounded-xl p-4">
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1.5">Inactive</div>
          <div className="text-[26px] font-extrabold text-slate-400">0</div>
        </div>
      </div>

      <div className="bg-[#161B27] border border-white/[0.07] rounded-xl overflow-hidden">
        <div className="px-4 py-3 flex items-center gap-2.5 border-b border-white/[0.07] flex-wrap">
          <div className="relative flex-1">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
              <IconSearch size={14} />
            </span>
            <input
              className="w-full h-9 pl-8 pr-3 bg-[#1E2535] border border-white/[0.12] rounded-lg text-slate-100 text-[13px] placeholder:text-slate-500 outline-none focus:border-blue-500 transition-all"
              placeholder="Search branches..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select className={selectCls} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="All">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="h-9 flex items-center gap-1.5 px-3.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-[13px] font-semibold shadow-[0_2px_8px_rgba(59,130,246,0.3)] transition-all"
          >
            <IconPlus size={12} /> Add Branch
          </button>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-4">
              <SkeletonTable rows={3} cols={6} />
            </div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {['Branch Name', 'Address', 'Phone', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500 border-b border-white/[0.07] bg-[#1E2535] whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredBranches.map(branch => (
                  <tr key={branch.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3.5 border-b border-white/[0.07]">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                          <IconStore size={14} />
                        </div>
                        <span className="font-semibold text-slate-100 text-[13px]">{branch.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 border-b border-white/[0.07] text-[12px] text-slate-400 max-w-[200px] truncate">{branch.address || '-'}</td>
                    <td className="px-4 py-3.5 border-b border-white/[0.07] text-[12px] text-slate-400">{branch.phone || '-'}</td>
                    <td className="px-4 py-3.5 border-b border-white/[0.07]">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        branch.isDefault 
                          ? 'bg-emerald-500/15 text-emerald-400' 
                          : 'bg-slate-500/15 text-slate-400'
                      }`}>
                        {branch.isDefault ? 'Default' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 border-b border-white/[0.07]">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setViewPanelBranch(branch)}
                          className="w-7 h-7 flex items-center justify-center rounded-md text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all"
                          title="View Details"
                        >
                          <IconEye size={14} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedBranch(branch);
                            setIsEditModalOpen(true);
                          }}
                          className="w-7 h-7 flex items-center justify-center rounded-md text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 transition-all"
                          title="Edit Branch"
                        >
                          <IconEdit size={14} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedBranch(branch);
                            setIsDeleteModalOpen(true);
                          }}
                          className="w-7 h-7 flex items-center justify-center rounded-md text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                          title="Delete Branch"
                        >
                          <IconTrash size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="px-4 py-2.5 border-t border-white/[0.07] bg-[#1E2535]">
          <span className="text-xs text-slate-500">
            Showing {filteredBranches.length} of {branches.length} branches
          </span>
        </div>
      </div>

      <AddBranchModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddBranch}
      />

      <EditBranchModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedBranch(null);
        }}
        onEdit={handleEditBranch}
        branch={selectedBranch}
      />

      <ViewBranchPanel
        isOpen={!!viewPanelBranch}
        onClose={() => setViewPanelBranch(null)}
        branch={viewPanelBranch}
      />

      <DeleteBranchModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedBranch(null);
        }}
        onDelete={handleDeleteBranch}
        branch={selectedBranch}
      />
    </div>
  );
}
