import bcrypt from 'bcryptjs';
import { Staff } from './models/staff.model.js';

const DEFAULT_ADMIN = {
  email: 'admin@example.com',
  password: 'password',
  name: 'Admin',
};

/**
 * Creates the bootstrap admin from ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_NAME.
 *
 * Keyed on the email, not on `role: 'admin'`, so changing ADMIN_EMAIL in .env
 * actually takes effect. An existing account is left completely untouched: the
 * password is only ever set at creation, so restarting the server never reverts
 * a password that was changed later through the app. For the same reason,
 * editing ADMIN_PASSWORD after the first run is a no-op — reset the account
 * through the staff endpoints instead.
 */
export async function seedAdmin() {
  try {
    const email = (process.env.ADMIN_EMAIL || DEFAULT_ADMIN.email).toLowerCase();
    const existingAdmin = await Staff.findOne({ email });

    if (existingAdmin) {
      console.log(`Admin "${email}" already exists, skipping seed`);
      return;
    }

    const adminPassword = process.env.ADMIN_PASSWORD || DEFAULT_ADMIN.password;
    const adminName = process.env.ADMIN_NAME || DEFAULT_ADMIN.name;

    if (!process.env.ADMIN_PASSWORD) {
      console.warn(
        `⚠️  ADMIN_PASSWORD is not set — seeding the built-in default password. Set it in .env before exposing this.`
      );
    }

    await Staff.create({
      email,
      name: adminName,
      passwordHash: await bcrypt.hash(adminPassword, 10),
      role: 'admin',
      status: 'active',
    });

    console.log(`Seeded admin user: ${email}`);
  } catch (error) {
    console.error('Seed error:', error);
  }
}
