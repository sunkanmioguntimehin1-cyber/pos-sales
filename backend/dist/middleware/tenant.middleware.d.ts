import { Request, Response, NextFunction } from 'express';
declare global {
    namespace Express {
        interface Request {
            tenantId?: string;
        }
    }
}
export declare function tenantMiddleware(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function validateTenantAccess(req: Request, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=tenant.middleware.d.ts.map