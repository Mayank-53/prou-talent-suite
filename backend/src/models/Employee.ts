import { model, Schema } from 'mongoose';
import { Employee } from '@shared/types';

const employeeSchema = new Schema<Employee>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    role: { type: String, enum: ['admin', 'manager', 'employee'], required: true },
    department: { type: String, required: true },
    avatarUrl: String,
    location: String,
    status: { type: String, enum: ['active', 'on-leave', 'inactive'], default: 'active' },
    skills: { type: [String], default: [] },
    bio: String,
    phone: String,
    manager: { type: Schema.Types.ObjectId, ref: 'Employee' },
    salary: { type: Number },
    startDate: String,
    joinedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const EmployeeModel = model<Employee>('Employee', employeeSchema);

