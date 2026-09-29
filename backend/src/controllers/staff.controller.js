import bcrypt from 'bcryptjs';
import { Staff } from '../models/staff.model.js';
import { Branch } from '../models/branch.model.js';
import { getHeadOfficeId } from '../services/stock.service.js';
import { getRoleByKey, getRolesMap, getNonLocationBoundRoleKeys } from '../services/role.service.js';
import { respondWithError } from '../utils/respondWithError.js';

/**
 * Strip the password/PIN hashes before sending a staff record to a client.
 *
 * `branchId` arrives either as a raw id or as a populated `{ id, name, type }`
 * depending on whether the caller selected it, so it is normalised here rather
 * than at each call site. Staff with no branchId (a database that has not been
 * backfilled yet) report null rather than pretending they work everywhere.
 *
 * `rolesMap` also attaches the display name and badge colour for the role key
 * stored on the record, so the whole staff list is labelled in one pass.
 */
function toPublicStaff(s, rolesMap) {
  const branch = s.branchId && typeof s.branchId === 'object' && s.branchId.name
    ? s.branchId
    : null;
  const role = s.role ? rolesMap.get(s.role) : undefined;

  return {
    id: String(s._id),
    name: s.name,
    email: s.email,
    phone: s.phone,
    role: s.role,
    roleName: role?.name ?? s.role,
    roleColor: role?.color ?? 'bg-[var(--input-bg)] text-muted',
    status: s.status,
    branchId: branch ? branch.id : (s.branchId ? String(s.branchId) : null),
    branchName: branch ? branch.name : undefined,
    branchType: branch ? branch.type : undefined,
    createdAt: s.createdAt,
  };
}

/**
 * Resolves a requested branch to a real, existing id, or fails.
 *
 * Falling back to head office for an unknown id would silently file someone at
 * the wrong location, so a caller that names a branch must name a real one.
 */
async function resolveBranchId(requested) {
  if (!requested) return getHeadOfficeId();

  const branch = await Branch.findById(requested).select('_id').lean();
  if (!branch) return { error: `Branch ${requested} not found` };

  return branch._id;
}

/**
 * Resolves a requested role key, or fails.
 *
 * The schema defaults to 'cashier' when the field is omitted, but an explicit
 * unknown key must be a client error rather than a doc with a role nobody has
 * permissions for.
 */
async function resolveRoleKey(requested) {
  const role = await getRoleByKey(requested || 'cashier');
  if (!role) return { error: `Unknown role "${requested}"` };
  return role.key;
}

export async function getStaff(req, res) {
  try {
    const { role, status, search, branchId } = req.query;

    const filter = {};

    if (role && role !== 'all') {
      filter.role = role;
    }

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (branchId && branchId !== 'all') {
      // Staff assigned to this location, plus anyone whose role is not
      // location-bound (one role can say "works anywhere" — the old hard-coded
      // `role === 'admin'` exemption generalised). Excluding them would leave a
      // till with nobody able to ring up a sale whenever its cashier is away.
      const exemptKeys = await getNonLocationBoundRoleKeys();
      filter.$or = [{ branchId }, { role: { $in: exemptKeys } }];
    }

    if (search) {
      const nameOrEmail = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
      // A name/email search and a location filter are both `$or` queries, so
      // they cannot both live at the top level — the second would overwrite the
      // first. `$and` keeps them independent.
      filter.$and = [...(filter.$and ?? []), { $or: nameOrEmail }];
    }

    const rolesMap = await getRolesMap();
    const staff = await Staff.find(filter)
      .populate('branchId', 'name type')
      .sort({ createdAt: -1 });

    res.json({ staff: staff.map((member) => toPublicStaff(member, rolesMap)) });
  } catch (error) {
    respondWithError(res, error, { context: 'Get staff error', message: 'Failed to get staff' });
  }
}

export async function getStaffMember(req, res) {
  try {
    const { staffId } = req.params;

    const staff = await Staff.findById(staffId).populate('branchId', 'name type');

    if (!staff) {
      res.status(404).json({ error: 'Staff not found' });
      return;
    }

    const rolesMap = await getRolesMap();
    res.json({ staff: toPublicStaff(staff, rolesMap) });
  } catch (error) {
    respondWithError(res, error, { context: 'Get staff member error', message: 'Failed to get staff' });
  }
}

export async function createStaff(req, res) {
  try {
    const { name, email, phone, password, pin, role, status, branchId } = req.body;

    if (!name || !role) {
      res.status(400).json({ error: 'Name and role are required' });
      return;
    }

    // No branch named means the head office — the central store every
    // business starts from — rather than "works at all locations".
    const resolvedBranch = await resolveBranchId(branchId);
    if (resolvedBranch.error) {
      res.status(400).json({ error: resolvedBranch.error });
      return;
    }

    const resolvedRole = await resolveRoleKey(role);
    if (resolvedRole.error) {
      res.status(400).json({ error: resolvedRole.error });
      return;
    }

    if (email) {
      const existing = await Staff.findOne({ email: email.toLowerCase() });
      if (existing) {
        res.status(400).json({ error: 'Email already in use' });
        return;
      }
    }

    const staff = new Staff({
      name,
      email: email?.toLowerCase(),
      phone,
      passwordHash: password ? await bcrypt.hash(password, 10) : undefined,
      pinHash: pin ? await bcrypt.hash(pin, 10) : undefined,
      role: resolvedRole,
      status: status || 'active',
      branchId: resolvedBranch,
    });

    await staff.save();
    await staff.populate('branchId', 'name type');

    const rolesMap = await getRolesMap();
    res.status(201).json({ staff: toPublicStaff(staff, rolesMap) });
  } catch (error) {
    respondWithError(res, error, { context: 'Create staff error', message: 'Failed to create staff' });
  }
}

export async function updateStaff(req, res) {
  try {
    const { staffId } = req.params;
    const { name, email, phone, password, pin, role, status, branchId } = req.body;

    const staff = await Staff.findById(staffId);
    if (!staff) {
      res.status(404).json({ error: 'Staff not found' });
      return;
    }

    // Only re-resolve when a branch is actually named, so an update that omits
    // the field leaves an existing assignment alone.
    let resolvedBranch;
    if (branchId !== undefined) {
      resolvedBranch = await resolveBranchId(branchId);
      if (resolvedBranch.error) {
        res.status(400).json({ error: resolvedBranch.error });
        return;
      }
    }

    let resolvedRole;
    if (role !== undefined && role !== staff.role) {
      resolvedRole = await resolveRoleKey(role);
      if (resolvedRole.error) {
        res.status(400).json({ error: resolvedRole.error });
        return;
      }
    }

    if (name) staff.name = name;
    if (email !== undefined) staff.email = email?.toLowerCase();
    if (phone !== undefined) staff.phone = phone;
    if (resolvedRole) staff.role = resolvedRole;
    if (status) staff.status = status;
    if (password) staff.passwordHash = await bcrypt.hash(password, 10);
    if (pin) staff.pinHash = await bcrypt.hash(pin, 10);
    if (resolvedBranch) staff.branchId = resolvedBranch;

    await staff.save();
    await staff.populate('branchId', 'name type');

    const rolesMap = await getRolesMap();
    res.json({ staff: toPublicStaff(staff, rolesMap) });
  } catch (error) {
    respondWithError(res, error, { context: 'Update staff error', message: 'Failed to update staff' });
  }
}

export async function deleteStaff(req, res) {
  try {
    const { staffId } = req.params;

    const staff = await Staff.findByIdAndDelete({ _id: staffId });
    if (!staff) {
      res.status(404).json({ error: 'Staff not found' });
      return;
    }

    res.json({ message: 'Staff deleted successfully' });
  } catch (error) {
    respondWithError(res, error, { context: 'Delete staff error', message: 'Failed to delete staff' });
  }
}

export async function verifyPin(req, res) {
  try {
    const { staffId, pin } = req.body;

    if (!staffId || !pin) {
      res.status(400).json({ error: 'Staff ID and PIN required' });
      return;
    }

    const staff = await Staff.findOne({ _id: staffId, status: 'active' });
    if (!staff) {
      res.status(404).json({ error: 'Staff not found' });
      return;
    }

    if (!staff.pinHash) {
      res.status(400).json({ error: 'Staff has no PIN set' });
      return;
    }

    const isValid = await bcrypt.compare(pin, staff.pinHash);
    if (!isValid) {
      res.status(401).json({ error: 'Invalid PIN' });
      return;
    }

    const role = await getRoleByKey(staff.role);

    res.json({
      success: true,
      staff: {
        id: String(staff._id),
        name: staff.name,
        role: staff.role,
        roleName: role?.name ?? staff.role,
        permissions: role?.permissions ?? [],
      },
    });
  } catch (error) {
    respondWithError(res, error, { context: 'Verify PIN error', message: 'Failed to verify PIN' });
  }
}
