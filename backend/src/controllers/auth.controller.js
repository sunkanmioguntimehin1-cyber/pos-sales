import bcrypt from 'bcryptjs';
import { Staff } from '../models/staff.model.js';
import { generateToken } from '../utils/jwt.js';
import { respondWithError } from '../utils/respondWithError.js';

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

    const token = generateToken({
      userId: staffMember._id.toString(),
      email: staffMember.email || '',
      name: staffMember.name,
      role: staffMember.role,
    });

    res.json({
      token,
      user: {
        id: staffMember._id,
        email: staffMember.email,
        name: staffMember.name,
        role: staffMember.role,
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

    res.json({
      user: {
        id: String(staffMember._id),
        email: staffMember.email,
        name: staffMember.name,
        role: staffMember.role,
      },
    });
  } catch (error) {
    respondWithError(res, error, { context: 'Get me error', message: 'Failed to get user' });
  }
}
