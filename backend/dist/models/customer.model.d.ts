import mongoose, { Document, Types } from 'mongoose';
export type CustomerTier = 'bronze' | 'silver' | 'gold' | 'platinum';
export interface ICustomer extends Document {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    tier: CustomerTier;
    totalSpent: number;
    visitCount: number;
    lastVisit?: Date;
    notes?: string;
    tenantId: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Customer: mongoose.Model<ICustomer, {}, {}, {}, mongoose.Document<unknown, {}, ICustomer, {}, {}> & ICustomer & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=customer.model.d.ts.map