import { Request, Response, NextFunction } from 'express';
import { AuthenticatedUser, UserRole } from '../utils/jwt.js';
declare global {
    namespace Express {
        interface Request {
            user?: AuthenticatedUser;
        }
    }
}
export declare function authMiddleware(req: Request, res: Response, next: NextFunction): void;
export declare function requireRole(...allowedRoles: UserRole[]): (req: Request, res: Response, next: NextFunction) => void;
export declare function requireSuperadmin(req: Request, res: Response, next: NextFunction): void;
export declare function requireTenantAccess(req: Request, res: Response, next: NextFunction): void;
//# sourceMappingURL=auth.middleware.d.ts.map