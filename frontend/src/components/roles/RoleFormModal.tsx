'use client';
import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { IconShield } from '@/components/ui/Icons';
import {
  Role, PermissionKey, PERMISSION_GROUPS, permissionLabel,
} from '@/lib/api';
import { useCreateRole, useUpdateRole } from '@/lib/hooks';

interface RoleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Present when editing; a system role gets its identity fields locked. */
  role?: Role | null;
}

const inputCls = "w-full h-9 px-3 bg-[var(--surface-2)] border border-[var(--border-strong)] rounded-lg text-[var(--text)] text-[13px] placeholder:text-subtle outline-none focus:border-blue-500 transition-all";
const labelCls = "block text-[10px] font-bold uppercase tracking-widest text-subtle mb-1.5";

/**
 * Badge colour presets. These are tailwind class strings — the same keys baked
 * into the seeded roles — because staff badges render `roleColor` directly as
 * a className (e.g. `bg-red-500/15 text-red-400`).
 */
const ROLE_COLORS: { value: string; label: string; swatch: string }[] = [
  { value: 'bg-red-500/15 text-red-400', label: 'Red', swatch: '#ef4444' },
  { value: 'bg-blue-500/15 text-blue-400', label: 'Blue', swatch: '#3b82f6' },
  { value: 'bg-emerald-500/15 text-emerald-400', label: 'Green', swatch: '#10b981' },
  { value: 'bg-amber-500/15 text-amber-400', label: 'Amber', swatch: '#f59e0b' },
  { value: 'bg-purple-500/15 text-purple-400', label: 'Purple', swatch: '#a855f7' },
  { value: 'bg-pink-500/15 text-pink-400', label: 'Pink', swatch: '#ec4899' },
  { value: 'bg-cyan-500/15 text-cyan-400', label: 'Cyan', swatch: '#06b6d4' },
  { value: 'bg-slate-500/15 text-slate-300', label: 'Slate', swatch: '#94a3b8' },
];

/** Turn any display name into a URL-safe key, e.g. "Floor Supervisor" → "floor-supervisor". */
function slugify(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export function RoleFormModal({ isOpen, onClose, role }: RoleFormModalProps) {
  const isEdit = !!role;
  const isSystem = !!role?.isSystem;

  // The Modal unmounts its body whenever `isOpen` flips false, and the parent
  // keys this component by the role being edited, so the fields below are
  // re-read from `role` on every fresh mount — no effect needed to re-seed.
  const [name, setName] = useState(role?.name ?? '');
  const [key, setKey] = useState(role?.key ?? '');
  const [description, setDescription] = useState(role?.description ?? '');
  const [color, setColor] = useState(role?.color || ROLE_COLORS[1].value);
  const [locationBound, setLocationBound] = useState(role?.locationBound ?? true);
  const [selected, setSelected] = useState<PermissionKey[]>(role?.permissions ? [...role.permissions] : []);

  const createRole = useCreateRole();
  const updateRole = useUpdateRole();

  // Editing mode shows the key greyed out — renaming is possible via the API,
  // but a live rename mid-shift would be invisible until the next login, so
  // the UI treats the key as fixed the moment a role exists.
  const handleNameChange = (value: string) => {
    setName(value);
    if (!isEdit && !key) setKey(slugify(value));
  };

  const toggle = (permission: PermissionKey) => {
    setSelected((current) =>
      current.includes(permission)
        ? current.filter((p) => p !== permission)
        : [...current, permission]
    );
  };

  const setGroup = (permissions: PermissionKey[], enabled: boolean) => {
    setSelected((current) => {
      const next = current.filter((p) => !permissions.includes(p));
      return enabled ? [...next, ...permissions] : next;
    });
  };

  const handleSubmit = () => {
    const payload = {
      name: name.trim(),
      description: description.trim() || undefined,
      color,
      locationBound,
      permissions: selected,
    };

    if (isEdit && role) {
      // System roles keep their identity, permission set and location binding;
      // only cosmetic fields are sent.
      updateRole.mutate(
        { roleId: role.id, data: isSystem
          ? { name: payload.name, description: payload.description, color: payload.color }
          : payload },
        { onSuccess: () => onClose() }
      );
    } else {
      createRole.mutate(
        { key: key || slugify(name), ...payload },
        { onSuccess: () => onClose() }
      );
    }
  };

  const groupChecked = (permissions: PermissionKey[]) => permissions.length > 0 && permissions.every((p) => selected.includes(p));
  const groupIndeterminate = (permissions: PermissionKey[]) => {
    const count = permissions.filter((p) => selected.includes(p)).length;
    return count > 0 && count < permissions.length;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? `Edit ${role?.name}` : 'Create Role'}
      width="xl"
      footer={
        <>
          <button
            onClick={onClose}
            className="h-9 px-4 bg-[var(--surface-2)] border border-[var(--border-strong)] text-muted hover:text-[var(--text)] rounded-lg text-[13px] font-semibold transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!name.trim()}
            className="h-9 px-4 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white rounded-lg text-[13px] font-semibold shadow-[0_2px_8px_rgba(59,130,246,0.3)] transition-all"
          >
            {isEdit ? 'Save Changes' : 'Create Role'}
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {isSystem && (
          <div className="flex items-start gap-2.5 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <IconShield size={16} className="text-amber-400 mt-0.5 flex-shrink-0" />
            <p className="text-[12px] text-amber-400">
              This is a built-in role. Its identity, permissions and location binding are locked to
              guarantee the store can always be administered — only its name, description and badge
              colour can change.
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Role Name *</label>
            <input
              className={inputCls}
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Floor Supervisor"
            />
          </div>
          <div>
            <label className={labelCls}>Key</label>
            <input
              className={`${inputCls} ${isEdit ? 'cursor-not-allowed opacity-50' : ''}`}
              value={key}
              onChange={(e) => setKey(slugify(e.target.value))}
              placeholder="floor-supervisor"
              disabled={isEdit}
            />
            {!isEdit && <span className="text-[11px] text-subtle mt-1 block">URL-safe identifier — auto-suggested from the name</span>}
          </div>
        </div>

        <div>
          <label className={labelCls}>Description</label>
          <textarea
            className={`${inputCls} h-auto min-h-[60px] py-2 resize-none`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What does this role do?"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Badge Colour</label>
            <div className="flex flex-wrap items-center gap-2">
              {ROLE_COLORS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  title={option.label}
                  aria-label={option.label}
                  onClick={() => setColor(option.value)}
                  className={`h-8 w-8 rounded-full flex items-center justify-center transition-all border-2 ${
                    color === option.value ? 'border-blue-500 scale-110' : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: `${option.swatch}22`, color: option.swatch }}
                >
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: option.swatch }} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className={labelCls}>Location</label>
            <label className="flex items-center gap-2.5 px-3 h-9 bg-[var(--surface-2)] border border-[var(--border-strong)] rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={locationBound}
                onChange={(e) => setLocationBound(e.target.checked)}
                disabled={isSystem}
                className="accent-blue-500"
              />
              <span className="text-[13px] text-muted">{locationBound ? 'Tied to their branch' : 'Works at any location'}</span>
            </label>
            <span className="text-[11px] text-subtle mt-1 block">
              Untie the role from a branch to let holders ring up sales anywhere, like the Admin role.
            </span>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className={labelCls + ' mb-0'}>Permissions</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => isSystem || setSelected([])}
                className="text-[11px] font-semibold text-subtle hover:text-[var(--text)] transition-colors disabled:opacity-40"
                disabled={isSystem}
              >
                Clear all
              </button>
              <button
                type="button"
                onClick={() => isSystem || setSelected(PERMISSION_GROUPS.flatMap((g) => g.permissions))}
                className="text-[11px] font-semibold text-subtle hover:text-[var(--text)] transition-colors disabled:opacity-40"
                disabled={isSystem}
              >
                Select all
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-[var(--border-strong)] overflow-hidden">
            {PERMISSION_GROUPS.map((group, index) => (
              <div
                key={group.label}
                className={`px-4 py-3 ${index > 0 ? 'border-t border-[var(--border)]' : ''} ${index % 2 ? 'bg-[var(--surface-2)]' : ''}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-subtle">{group.label}</span>
                  <button
                    type="button"
                    disabled={isSystem}
                    onClick={() => setGroup(group.permissions, !groupChecked(group.permissions))}
                    className="text-[11px] font-semibold text-subtle hover:text-[var(--text)] transition-colors disabled:opacity-40"
                  >
                    {groupChecked(group.permissions) ? 'Clear' : groupIndeterminate(group.permissions) ? 'Select all' : 'Select all'}
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {group.permissions.map((permission) => (
                    <label
                      key={permission}
                      className={`flex items-center gap-2 rounded-lg px-2 py-1.5 cursor-pointer transition-colors ${
                        selected.includes(permission) ? 'bg-blue-500/10' : 'hover:bg-[var(--input-bg)]'
                      } ${isSystem ? 'cursor-not-allowed opacity-60' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={selected.includes(permission)}
                        onChange={() => isSystem || toggle(permission)}
                        disabled={isSystem}
                        className="accent-blue-500"
                      />
                      <span className="text-[12.5px] text-muted">{permissionLabel(permission)}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}