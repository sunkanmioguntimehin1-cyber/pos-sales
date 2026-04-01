import mongoose, { Document, Schema } from 'mongoose';

export interface ISuperadmin extends Document {
  email: string;
  passwordHash: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const superadminSchema = new Schema<ISuperadmin>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

superadminSchema.index({ email: 1 });

export const Superadmin = mongoose.model<ISuperadmin>('Superadmin', superadminSchema);
