import { Request, Response } from 'express';
export interface CreateOrderBody {
    items: Array<{
        productId: string;
        productName: string;
        quantity: number;
        unitPrice: number;
        totalPrice: number;
    }>;
    subtotal: number;
    tax: number;
    total: number;
    paymentMethod?: string;
    customerId?: string;
    branchId?: string;
    notes?: string;
}
export declare function getOrders(req: Request, res: Response): Promise<void>;
export declare function createOrder(req: Request, res: Response): Promise<void>;
export declare function getOrder(req: Request, res: Response): Promise<void>;
export declare function updateOrderStatus(req: Request, res: Response): Promise<void>;
//# sourceMappingURL=orders.controller.d.ts.map