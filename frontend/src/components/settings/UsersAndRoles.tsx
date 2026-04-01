'use client';
import { useState } from 'react';
import { IconPlus, IconEdit, IconTrash, IconCheck, IconX } from '@/components/ui/Icons';
import { Staff, StaffFormData } from '@/components/staff/types';

interface UsersAndRolesProps {
  staff: Staff[];
  onUpdate: (staff: Staff[]) => void;
}

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

export function UsersAndRoles({ staff, onUpdate }: UsersAndRolesProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<StaffFormData>({
    name: '',
    email: '',
    role: 'cashier',
    phone: '',
    pin: '',
    status: 'active',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      role: 'cashier',
      phone: '',
      pin: '',
      status: 'active',
    });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleAdd = () => {
    if (!formData.name || !formData.email) return;
    
    const newStaff: Staff = {
      id: String(Date.now()),
      name: formData.name,
      email: formData.email,
      role: formData.role,
      phone: formData.phone,
      status: formData.status,
    };
    onUpdate([...staff, newStaff]);
    resetForm();
  };

  const handleEdit = (id: string) => {
    const s = staff.find(st => st.id === id);
    if (!s) return;
    
    setFormData({
      name: s.name,
      email: s.email,
      role: s.role,
      phone: s.phone,
      status: s.status,
    });
    setEditingId(id);
    setIsAdding(false);
  };

  const handleUpdate = () => {
    if (!editingId || !formData.name || !formData.email) return;
    
    onUpdate(staff.map(s => {
      if (s.id === editingId) {
        return {
          ...s,
          name: formData.name,
          email: formData.email,
          role: formData.role,
          phone: formData.phone,
          status: formData.status,
        };
      }
      return s;
    }));
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      onUpdate(staff.filter(s => s.id !== id));
    }
  };

  const toggleStatus = (id: string) => {
    onUpdate(staff.map(s => {
      if (s.id === id) {
        return { ...s, status: s.status === 'active' ? 'inactive' : 'active' };
      }
      return s;
    }));
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[15px] font-bold text-slate-100">Users & Roles</h3>
          <p className="text-[12px] text-slate-500 mt-0.5">Manage staff accounts and their permissions</p>
        </div>
        {!isAdding && editingId === null && (
          <button
            onClick={() => setIsAdding(true)}
            className="h-9 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-[13px] font-semibold shadow-[0_2px_8px_rgba(59,130,246,0.3)] transition-all flex items-center gap-2"
          >
            <IconPlus size={14} /> Add User
          </button>
        )}
      </div>

      {(isAdding || editingId !== null) && (
        <div className="bg-[#1E2535] border border-blue-500/30 rounded-xl p-4">
          <div className="text-[13px] font-bold text-slate-100 mb-4">
            {editingId !== null ? 'Edit User' : 'Add New User'}
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Full Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full h-9 px-3 bg-[#161B27] border border-white/[0.12] rounded-lg text-slate-100 text-[13px] outline-none focus:border-blue-500"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full h-9 px-3 bg-[#161B27] border border-white/[0.12] rounded-lg text-slate-100 text-[13px] outline-none focus:border-blue-500"
                placeholder="john@example.com"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full h-9 px-3 bg-[#161B27] border border-white/[0.12] rounded-lg text-slate-100 text-[13px] outline-none focus:border-blue-500"
                placeholder="+31 6 1234 5678"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Role</label>
              <select
                value={formData.role}
                onChange={e => setFormData({ ...formData, role: e.target.value as 'admin' | 'manager' | 'cashier' })}
                className="w-full h-9 px-3 bg-[#161B27] border border-white/[0.12] rounded-lg text-slate-100 text-[13px] outline-none focus:border-blue-500"
              >
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="cashier">Cashier</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">PIN {editingId !== null && '(leave blank to keep)'}</label>
              <input
                type="password"
                maxLength={6}
                value={formData.pin}
                onChange={e => setFormData({ ...formData, pin: e.target.value })}
                className="w-full h-9 px-3 bg-[#161B27] border border-white/[0.12] rounded-lg text-slate-100 text-[13px] outline-none focus:border-blue-500"
                placeholder="****"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Status</label>
              <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                className="w-full h-9 px-3 bg-[#161B27] border border-white/[0.12] rounded-lg text-slate-100 text-[13px] outline-none focus:border-blue-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={resetForm}
              className="h-9 px-4 bg-[#252D3D] border border-white/[0.12] text-slate-400 hover:text-slate-200 rounded-lg text-[13px] font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              onClick={editingId !== null ? handleUpdate : handleAdd}
              disabled={!formData.name || !formData.email}
              className="h-9 px-4 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white rounded-lg text-[13px] font-semibold shadow-[0_2px_8px_rgba(59,130,246,0.3)] transition-all"
            >
              {editingId !== null ? 'Save Changes' : 'Add User'}
            </button>
          </div>
        </div>
      )}

      <div className="bg-[#161B27] border border-white/[0.07] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.07]">
              <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500">User</th>
              <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500">Role</th>
              <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500">Phone</th>
              <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500">Status</th>
              <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-widest text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {staff.map(s => (
              <tr key={s.id} className="border-b border-white/[0.07] last:border-0 hover:bg-white/[0.02]">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-[11px] font-bold text-white">
                      {s.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                    <div>
                      <div className="text-[13px] font-semibold text-slate-100">{s.name}</div>
                      <div className="text-[11px] text-slate-500">{s.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${roleColors[s.role]}`}>
                    {roleLabels[s.role]}
                  </span>
                </td>
                <td className="px-4 py-3 text-[12px] text-slate-400">{s.phone}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleStatus(s.id)}
                    className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                      s.status === 'active' 
                        ? 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25' 
                        : 'bg-slate-500/15 text-slate-400 hover:bg-slate-500/25'
                    }`}
                  >
                    {s.status === 'active' ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => handleEdit(s.id)}
                      className="w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 transition-all"
                    >
                      <IconEdit size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    >
                      <IconTrash size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
