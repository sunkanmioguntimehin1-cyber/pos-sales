import mongoose, { Document, Types } from 'mongoose';
export interface ICategory extends Document {
    name: string;
    description?: string;
    color?: string;
    tenantId: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Category: mongoose.Model<ICategory, {}, {}, {}, mongoose.Document<unknown, {}, ICategory, {}, {}> & ICategory & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=category.model.d.ts.map