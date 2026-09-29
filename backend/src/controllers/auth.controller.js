import bcrypt from 'bcryptjs';
import { Staff } from '../models/staff.model.js';
import { generateToken } from '../utils/jwt.js';
import { getRoleByKey } from '../services/role.service.js';
import { respondWithError } from '../utils/respondWithError.js';

/** Attach the role the token itself could not hold (display name + permissions) onto a user payload. */
async function withRoleDetails(user) {
  // A staff record whose role key has been deleted (shouldn't happen — delete
  // is guarded) must still authenticate, so degrade to no permissions rather
  // than a hard 500.
  const role = await getRoleByKey(user.role);
  return {
    ...user,
    roleName: role?.name ?? user.role,
    permissions: role?.permissions ?? [],
  };
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const staffMember = await Staff.findOne({ email: email.toLowerCase() });
    if (!staffMember) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const isValid = await bcrypt.compare(password, staffMember.passwordHash || '');
    if (!isValid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const role = await getRoleByKey(staffMember.role);
    const permissions = role?.permissions ?? [];

    const token = generateToken({
      userId: staffMember._id.toString(),
      email: staffMember.email || '',
      name: staffMember.name,
      role: staffMember.role,
      // Baked into the token so requirePermission is one check, no DB query.
      permissions,
    });

    res.json({
      token,
      user: {
        id: staffMember._id,
        email: staffMember.email,
        name: staffMember.name,
        role: staffMember.role,
        roleName: role?.name ?? staffMember.role,
        permissions,
      },
    });
  } catch (error) {
    respondWithError(res, error, { context: 'Login error', message: 'Login failed' });
  }
}

export async function getMe(req, res) {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    // Return the same shape as /login so the client can hydrate its store
    // without a second normalisation step.
    const staffMember = await Staff.findById(req.user.userId);

    if (!staffMember) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const baseUser = {
      id: String(staffMember._id),
      email: staffMember.email,
      name: staffMember.name,
      role: staffMember.role,
    };
    const user = await withRoleDetails(baseUser);

    res.json({ user });
  } catch (error) {
    respondWithError(res, error, { context: 'Get me error', message: 'Failed to get user' });
  }
}
