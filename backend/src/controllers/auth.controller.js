import bcrypt from 'bcryptjs';
import { Staff } from '../models/staff.model.js';
import { generateToken } from '../utils/jwt.js';

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
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
}

export async function getMe(req, res) {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    res.json({ user: req.user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get user' });
  }
}
