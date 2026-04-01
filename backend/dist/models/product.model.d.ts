import mongoose, { Document, Types } from 'mongoose';
export interface IProduct extends Document {
    name: string;
    sku?: string;
    barcode?: string;
    description?: string;
    price: number;
    costPrice?: number;
    categoryId?: Types.ObjectId;
    image?: string;
    stock: number;
    lowStockThreshold: number;
    isActive: boolean;
    tenantId: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Product: mongoose.Model<IProduct, {}, {}, {}, mongoose.Document<unknown, {}, IProduct, {}, {}> & IProduct & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=product.model.d.ts.map