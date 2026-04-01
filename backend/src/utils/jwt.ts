import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export type UserRole = 'superadmin' | 'tenant_admin' | 'staff';

export interface JwtPayload {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
  tenantId: string | null;
}

export interface AuthenticatedUser extends JwtPayload {
  iat: number;
  exp: number;
}

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): AuthenticatedUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthenticatedUser;
  } catch {
    return null;
  }
}

export function decodeToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.decode(token) as JwtPayload;
    return decoded;
  } catch {
    return null;
  }
}
