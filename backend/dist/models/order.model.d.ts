import mongoose, { Document, Types } from 'mongoose';
export type OrderStatus = 'pending' | 'completed' | 'cancelled' | 'refunded';
export interface IOrderItem {
    productId: Types.ObjectId;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}
export interface IOrder extends Document {
    orderNumber: string;
    items: IOrderItem[];
    subtotal: number;
    tax: number;
    total: number;
    paymentMethod?: string;
    status: OrderStatus;
    customerId?: Types.ObjectId;
    staffId: Types.ObjectId;
    branchId?: Types.ObjectId;
    tenantId: Types.ObjectId;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Order: mongoose.Model<IOrder, {}, {}, {}, mongoose.Document<unknown, {}, IOrder, {}, {}> & IOrder & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=order.model.d.ts.map