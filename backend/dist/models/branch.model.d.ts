import mongoose, { Document, Types } from 'mongoose';
export interface IBranch extends Document {
    name: string;
    address?: string;
    phone?: string;
    isDefault: boolean;
    tenantId: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Branch: mongoose.Model<IBranch, {}, {}, {}, mongoose.Document<unknown, {}, IBranch, {}, {}> & IBranch & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=branch.model.d.ts.map