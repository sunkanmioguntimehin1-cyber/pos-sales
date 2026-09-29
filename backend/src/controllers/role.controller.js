import { Role } from '../models/role.model.js';
import { Staff } from '../models/staff.model.js';
import { ALL_PERMISSIONS } from '../constants/permissions.js';
import { respondWithError } from '../utils/respondWithError.js';

function toPublicRole(role, memberCount) {
  return {
    id: String(role._id),
    key: role.key,
    name: role.name,
    description: role.description,
    permissions: role.permissions,
    locationBound: role.locationBound,
    isSystem: role.isSystem,
    color: role.color,
    createdAt: role.createdAt,
    memberCount,
  };
}

/** Validates a permission list and returns { bad } when it contains unknown keys. */
function invalidPermissions(permissions) {
  return (permissions || []).filter((permission) => !ALL_PERMISSIONS.includes(permission));
}

export async function getRoles(req, res) {
  try {
    const roles = await Role.find().sort({ isSystem: -1, name: 1 }).lean();

    const counts = await Staff.aggregate([
      { $match: { role: { $exists: true, $ne: null } } },
      { $group: { _id: '$role', count: { $sum: 1 } } },
    ]);
    const byKey = new Map(counts.map((entry) => [entry._id, entry.count]));

    res.json({
      roles: roles.map((role) => toPublicRole(role, byKey.get(role.key) ?? 0)),
    });
  } catch (error) {
    respondWithError(res, error, { context: 'Get roles error', message: 'Failed to get roles' });
  }
}

export async function getRole(req, res) {
  try {
    const { roleId } = req.params;

    const role = await Role.findById(roleId).lean();
    if (!role) {
      res.status(404).json({ error: 'Role not found' });
      return;
    }

    const memberCount = await Staff.countDocuments({ role: role.key });
    res.json({ role: toPublicRole(role, memberCount) });
  } catch (error) {
    respondWithError(res, error, { context: 'Get role error', message: 'Failed to get role' });
  }
}

export async function createRole(req, res) {
  try {
    const { key, name, description, permissions, locationBound, color } = req.body;

    if (!key || !name) {
      res.status(400).json({ error: 'Role key and name are required' });
      return;
    }

    const bad = invalidPermissions(permissions);
    if (bad.length > 0) {
      res.status(400).json({ error: `Unknown permission${bad.length === 1 ? '' : 's'}: ${bad.join(', ')}` });
      return;
    }

    const normalizedKey = key.trim().toLowerCase();
    const existing = await Role.findOne({ key: normalizedKey });
    if (existing) {
      res.status(409).json({ error: `A role with the key "${normalizedKey}" already exists` });
      return;
    }

    const role = await Role.create({
      key: normalizedKey,
      name: name.trim(),
      description,
      permissions: permissions || [],
      locationBound: locationBound !== false,
      color,
    });

    res.status(201).json({ role: toPublicRole(role, 0) });
  } catch (error) {
    respondWithError(res, error, { context: 'Create role error', message: 'Failed to create role' });
  }
}

export async function updateRole(req, res) {
  try {
    const { roleId } = req.params;
    const { key, name, description, permissions, locationBound, color } = req.body;

    const role = await Role.findById(roleId);
    if (!role) {
      res.status(404).json({ error: 'Role not found' });
      return;
    }

    // The built-in Admin role is what guarantees the store can never end up
    // with nobody able to administer it, so its identity, permission set and
    // location binding are locked. Cosmetic fields stay editable.
    if (role.isSystem && (key !== undefined || permissions !== undefined || locationBound !== undefined)) {
      res.status(400).json({ error: 'The system Admin role cannot have its identity, permissions or location binding changed' });
      return;
    }

    const bad = invalidPermissions(permissions);
    if (bad.length > 0) {
      res.status(400).json({ error: `Unknown permission${bad.length === 1 ? '' : 's'}: ${bad.join(', ')}` });
      return;
    }

    if (key !== undefined) {
      const normalizedKey = key.trim().toLowerCase();
      const existing = await Role.findOne({ key: normalizedKey, _id: { $ne: role._id } });
      if (existing) {
        res.status(409).json({ error: `A role with the key "${normalizedKey}" already exists` });
        return;
      }
      role.key = normalizedKey;
    }
    if (name !== undefined) role.name = name.trim();
    if (description !== undefined) role.description = description;
    if (permissions !== undefined) role.permissions = permissions;
    if (locationBound !== undefined) role.locationBound = Boolean(locationBound);
    if (color !== undefined) role.color = color;

    await role.save();

    const memberCount = await Staff.countDocuments({ role: role.key });
    res.json({ role: toPublicRole(role.toObject(), memberCount) });
  } catch (error) {
    respondWithError(res, error, { context: 'Update role error', message: 'Failed to update role' });
  }
}

export async function deleteRole(req, res) {
  try {
    const { roleId } = req.params;

    const role = await Role.findById(roleId);
    if (!role) {
      res.status(404).json({ error: 'Role not found' });
      return;
    }

    if (role.isSystem) {
      res.status(400).json({ error: 'Cannot delete a system role' });
      return;
    }

    // Removing a role that is still assigned would leave staff pointing at a
    // key nobody has permissions for — invisible on every POS and locked out of
    // the store until someone re-files them manually.
    const inUse = await Staff.countDocuments({ role: role.key });
    if (inUse > 0) {
      res.status(409).json({
        error: `${role.name} is assigned to ${inUse} staff member${inUse === 1 ? '' : 's'}. Reassign them first.`,
      });
      return;
    }

    await Role.findByIdAndDelete(roleId);

    res.json({ message: 'Role deleted successfully' });
  } catch (error) {
    respondWithError(res, error, { context: 'Delete role error', message: 'Failed to delete role' });
  }
}