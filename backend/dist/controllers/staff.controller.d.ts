import { Request, Response } from 'express';
export interface CreateStaffBody {
    name: string;
    email?: string;
    phone?: string;
    pin?: string;
    role: 'admin' | 'manager' | 'cashier';
    status?: 'active' | 'inactive';
}
export declare function getStaff(req: Request, res: Response): Promise<void>;
export declare function createStaff(req: Request, res: Response): Promise<void>;
export declare function updateStaff(req: Request, res: Response): Promise<void>;
export declare function deleteStaff(req: Request, res: Response): Promise<void>;
export declare function verifyPin(req: Request, res: Response): Promise<void>;
//# sourceMappingURL=staff.controller.d.ts.map