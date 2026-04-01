import mongoose, { Document, Types } from 'mongoose';
export interface ITenantAdmin extends Document {
    email: string;
    passwordHash: string;
    name: string;
    tenantId: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export declare const TenantAdmin: mongoose.Model<ITenantAdmin, {}, {}, {}, mongoose.Document<unknown, {}, ITenantAdmin, {}, {}> & ITenantAdmin & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=tenantAdmin.model.d.ts.map