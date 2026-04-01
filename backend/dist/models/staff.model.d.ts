import mongoose, { Document, Types } from 'mongoose';
export type StaffRole = 'admin' | 'manager' | 'cashier';
export type StaffStatus = 'active' | 'inactive';
export interface IStaff extends Document {
    email?: string;
    name: string;
    phone?: string;
    pinHash?: string;
    role: StaffRole;
    status: StaffStatus;
    tenantId: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Staff: mongoose.Model<IStaff, {}, {}, {}, mongoose.Document<unknown, {}, IStaff, {}, {}> & IStaff & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=staff.model.d.ts.map