import bcrypt from 'bcryptjs';
import { Staff } from './models/staff.model.js';

const DEFAULT_ADMIN = {
  email: 'admin@example.com',
  password: 'password',
  name: 'Admin',
  role: 'admin',
};

export async function seedAdmin() {
  try {
    const existingAdmin = await Staff.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('Admin already exists, skipping seed');
      return;
    }

    const adminEmail = process.env.ADMIN_EMAIL || DEFAULT_ADMIN.email;
    const adminPassword = process.env.ADMIN_PASSWORD || DEFAULT_ADMIN.password;
    const adminName = process.env.ADMIN_NAME || DEFAULT_ADMIN.name;

    const passwordHash = await bcrypt.hash(adminPassword, 10);

    await Staff.create({
      email: adminEmail,
      name: adminName,
      passwordHash,
      role: 'admin',
      status: 'active',
    });

    console.log(`Seeded admin user: ${adminEmail}`);
  } catch (error) {
    console.error('Seed error:', error);
  }
}
