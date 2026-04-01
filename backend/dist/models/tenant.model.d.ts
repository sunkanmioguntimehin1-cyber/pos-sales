import mongoose, { Document, Types } from 'mongoose';
export interface ITenantSettings {
    primaryColor: string;
    accentColor: string;
    theme: 'dark' | 'light' | 'gold';
}
export interface ITenant extends Document {
    subdomain: string;
    name: string;
    description?: string;
    logo?: string;
    isActive: boolean;
    settings: ITenantSettings;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Tenant: mongoose.Model<ITenant, {}, {}, {}, mongoose.Document<unknown, {}, ITenant, {}, {}> & ITenant & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=tenant.model.d.ts.map