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
export declare function generateToken(payload: JwtPayload): string;
export declare function verifyToken(token: string): AuthenticatedUser | null;
export declare function decodeToken(token: string): JwtPayload | null;
//# sourceMappingURL=jwt.d.ts.map