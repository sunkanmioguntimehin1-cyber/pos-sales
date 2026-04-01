import mongoose, { Document } from 'mongoose';
export interface ISuperadmin extends Document {
    email: string;
    passwordHash: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Superadmin: mongoose.Model<ISuperadmin, {}, {}, {}, mongoose.Document<unknown, {}, ISuperadmin, {}, {}> & ISuperadmin & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=superadmin.model.d.ts.map