'use client';
import { useState, useMemo } from 'react';
import { IconPlus, IconSearch, IconEdit, IconEye, IconTrash } from '@/components/ui/Icons';
import { StaffFormData } from './types';
import { AddStaffModal } from './AddStaffModal';
import { EditStaffModal } from './EditStaffModal';
import { ViewStaffPanel } from './ViewStaffPanel';
import { DeleteStaffModal } from './DeleteStaffModal';
import { SkeletonTable } from '@/components/ui/Skeleton';
import { useStaff, useCreateStaff, useUpdateStaff, useDeleteStaff, Staff } from '@/lib/hooks';

const selectCls = "w-full h-9 px-3 bg-[#1E2535] border border-white/[0.12] rounded-lg text-slate-300 text-[13px] outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer pr-7 bg-[image:url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%2364748B%22 stroke-width=%222%22><path d=%22M6 9l6 6 6-6%22/></svg>')] bg-no-repeat bg-[position:right_10px_center]";

const roleColors: Record<string, string> = {
  admin: 'bg-red-500/15 text-red-400',
  manager: 'bg-blue-500/15 text-blue-400',
  cashier: 'bg-emerald-500/15 text-emerald-400',
};

const roleLabels: Record<string, string> = {
  admin: 'Admin',
  manager: 'Manager',
  cashier: 'Cashier',
};

export function StaffScreen() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [viewPanelStaff, setViewPanelStaff] = useState<Staff | null>(null);

  const { data: staff = [], isLoading } = useStaff({
    role: roleFilter !== 'All' ? roleFilter : undefined,
    status: statusFilter !== 'All' ? statusFilter : undefined,
    search: search || undefined,
  });

  const createStaff = useCreateStaff();
  const updateStaff = useUpdateStaff();
  const deleteStaff = useDeleteStaff();

  const activeCount = useMemo(() => staff.filter(s => s.status === 'active').length, [staff]);
  const adminCount = useMemo(() => staff.filter(s => s.role === 'admin').length, [staff]);
  const managerCount = useMemo(() => staff.filter(s => s.role === 'manager').length, [staff]);
  const cashierCount = useMemo(() => staff.filter(s => s.role === 'cashier').length, [staff]);

  const filteredStaff = useMemo(() => {
    return staff.filter(member => {
      const matchesSearch = 
        member.name.toLowerCase().includes(search.toLowerCase()) ||
        (member.email?.toLowerCase().includes(search.toLowerCase()) ?? false);
      return matchesSearch;
    });
  }, [staff, search]);

  const handleAddStaff = (data: StaffFormData) => {
    createStaff.mutate({
      name: data.name,
      email: data.email,
      phone: data.phone,
      pin: data.pin,
      role: data.role,
      status: data.status,
    });
  };

  const handleEditStaff = (id: string, data: StaffFormData) => {
    updateStaff.mutate({
      staffId: id,
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        role: data.role,
        status: data.status,
      },
    });
  };

  const handleDeleteStaff = (id: string) => {
    deleteStaff.mutate(id);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-[#1E2535] border border-white/[0.07] rounded-xl p-4">
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1.5">Total Staff</div>
          <div className="text-[26px] font-extrabold text-blue-400">{isLoading ? '...' : staff.length}</div>
        </div>
        <div className="bg-[#1E2535] border border-white/[0.07] rounded-xl p-4">
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1.5">Active</div>
          <div className="text-[26px] font-extrabold text-emerald-400">{isLoading ? '...' : activeCount}</div>
        </div>
        <div className="bg-[#1E2535] border border-white/[0.07] rounded-xl p-4">
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1.5">Admins</div>
          <div className="text-[26px] font-extrabold text-red-400">{isLoading ? '...' : adminCount}</div>
        </div>
        <div className="bg-[#1E2535] border border-white/[0.07] rounded-xl p-4">
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1.5">Cashiers</div>
          <div className="text-[26px] font-extrabold text-slate-400">{isLoading ? '...' : cashierCount}</div>
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
              placeholder="Search staff..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select className={selectCls} value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
            <option value="All">All Roles</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="cashier">Cashier</option>
          </select>
          <select className={selectCls} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="All">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="h-9 flex items-center gap-1.5 px-3.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-[13px] font-semibold shadow-[0_2px_8px_rgba(59,130,246,0.3)] transition-all"
          >
            <IconPlus size={12} /> Add Staff
          </button>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-4">
              <SkeletonTable rows={5} cols={5} />
            </div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {['Staff Member', 'Email', 'Role', 'Phone', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500 border-b border-white/[0.07] bg-[#1E2535] whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredStaff.map(member => (
                  <tr key={member.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3.5 border-b border-white/[0.07]">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                          {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </div>
                        <span className="font-semibold text-slate-100 text-[13px]">{member.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 border-b border-white/[0.07] text-[12px] text-slate-400">{member.email || '-'}</td>
                    <td className="px-4 py-3.5 border-b border-white/[0.07]">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${roleColors[member.role]}`}>
                        {roleLabels[member.role]}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 border-b border-white/[0.07] text-[12px] text-slate-400">{member.phone || '-'}</td>
                    <td className="px-4 py-3.5 border-b border-white/[0.07]">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        member.status === 'active' 
                          ? 'bg-emerald-500/15 text-emerald-400' 
                          : 'bg-slate-500/15 text-slate-400'
                      }`}>
                        {member.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 border-b border-white/[0.07]">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setViewPanelStaff(member)}
                          className="w-7 h-7 flex items-center justify-center rounded-md text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all"
                          title="View Details"
                        >
                          <IconEye size={14} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedStaff(member);
                            setIsEditModalOpen(true);
                          }}
                          className="w-7 h-7 flex items-center justify-center rounded-md text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 transition-all"
                          title="Edit Staff"
                        >
                          <IconEdit size={14} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedStaff(member);
                            setIsDeleteModalOpen(true);
                          }}
                          className="w-7 h-7 flex items-center justify-center rounded-md text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                          title="Delete Staff"
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
            Showing {filteredStaff.length} of {staff.length} staff members
          </span>
        </div>
      </div>

      <AddStaffModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddStaff}
      />

      <EditStaffModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedStaff(null);
        }}
        onEdit={handleEditStaff}
        staff={selectedStaff}
      />

      <ViewStaffPanel
        isOpen={!!viewPanelStaff}
        onClose={() => setViewPanelStaff(null)}
        staff={viewPanelStaff}
      />

      <DeleteStaffModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedStaff(null);
        }}
        onDelete={handleDeleteStaff}
        staff={selectedStaff}
      />
    </div>
  );
}
