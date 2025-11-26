import { model, Schema, Types } from 'mongoose';
import { Task } from '@shared/types';

export interface TaskDocument extends Omit<Task, 'assignedTo' | 'dueDate' | 'createdBy' | 'comments' | 'submission'> {
  assignedTo: Types.ObjectId;
  dueDate: Date;
  createdBy?: Types.ObjectId;
  comments?: {
    author: Types.ObjectId;
    content: string;
    createdAt: Date;
  }[];
  submission?: {
    comment: string;
    remarks: string;
    files: {
      url: string;
      publicId?: string;
      originalName: string;
      fileType: string;
    }[];
    submittedAt: Date;
    submittedBy: Types.ObjectId;
  };
}

const commentSchema = new Schema({
  author: { type: Types.ObjectId, ref: 'Employee', required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// File schema for task submissions
const fileSchema = new Schema({
  url: { type: String, required: true },
  publicId: { type: String },
  originalName: { type: String, required: true },
  fileType: { type: String, required: true },
});

// Submission schema for completed tasks
const submissionSchema = new Schema({
  comment: { type: String, required: true },
  remarks: { type: String },
  files: { type: [fileSchema], default: [] },
  submittedAt: { type: Date, default: Date.now },
  submittedBy: { type: Types.ObjectId, ref: 'User', required: true },
});

const taskSchema = new Schema<TaskDocument>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    assignedTo: { type: Types.ObjectId, ref: 'Employee', required: true },
    dueDate: { type: Date, required: true },
    status: { type: String, enum: ['todo', 'in-progress', 'blocked', 'done'], default: 'todo' },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    tags: { type: [String], default: [] },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    createdBy: { type: Types.ObjectId, ref: 'User' },
    estimatedHours: { type: Number, min: 0 },
    actualHours: { type: Number, min: 0 },
    attachments: { type: [String], default: [] },
    comments: { type: [commentSchema], default: [] },
    submission: { type: submissionSchema },
  },
  { timestamps: true }
);

export const TaskModel = model<TaskDocument>('Task', taskSchema);

