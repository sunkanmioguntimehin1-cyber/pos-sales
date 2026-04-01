import { Request, Response } from 'express';
export interface CreateStoreBody {
    name: string;
    subdomain: string;
    description?: string;
    adminName: string;
    adminEmail: string;
    adminPassword: string;
    settings?: {
        primaryColor?: string;
        accentColor?: string;
        theme?: 'dark' | 'light' | 'gold';
    };
}
export declare function createStore(req: Request, res: Response): Promise<void>;
export declare function getStores(req: Request, res: Response): Promise<void>;
export declare function getStore(req: Request, res: Response): Promise<void>;
export declare function updateStore(req: Request, res: Response): Promise<void>;
export declare function deleteStore(req: Request, res: Response): Promise<void>;
//# sourceMappingURL=superadmin.controller.d.ts.map