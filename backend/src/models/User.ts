import { Schema, model } from 'mongoose';
import { AuthUser } from '@shared/types';

const userSchema = new Schema<AuthUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'manager', 'employee'], default: 'employee' },
    avatarUrl: { type: String },
    department: { type: String },
    location: { type: String },
    bio: { type: String },
    phone: { type: String },
    skills: [{ type: String }],
    status: { type: String, enum: ['active', 'on-leave', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

export const UserModel = model<AuthUser>('User', userSchema);

