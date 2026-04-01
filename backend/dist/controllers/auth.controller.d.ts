import { Request, Response } from 'express';
export interface LoginBody {
    email: string;
    password: string;
}
export declare function login(req: Request, res: Response): Promise<void>;
export declare function registerSuperadmin(req: Request, res: Response): Promise<void>;
export declare function getMe(req: Request, res: Response): Promise<void>;
//# sourceMappingURL=auth.controller.d.ts.map