export type Role = 'admin' | 'manager' | 'employee';

export interface Employee {
  _id?: string;
  name: string;
  email: string;
  role: Role;
  department: string;
  avatarUrl?: string;
  location?: string;
  status: 'active' | 'on-leave' | 'inactive';
  skills: string[];
  bio?: string;
  phone?: string;
  manager?: string | Employee;
  salary?: number;
  startDate?: string;
  joinedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type TaskStatus = 'todo' | 'in-progress' | 'blocked' | 'done';

export type TaskPriority = 'low' | 'medium' | 'high';

export interface TaskSubmissionFile {
  url: string;
  publicId?: string;
  originalName: string;
  fileType: string;
}

export interface TaskSubmission {
  comment: string;
  remarks: string;
  files: TaskSubmissionFile[];
  submittedAt: string;
  submittedBy: string;
}

export interface Task {
  _id?: string;
  title: string;
  description: string;
  assignedTo: string | Employee;
  dueDate: string;
  status: TaskStatus;
  priority: TaskPriority;
  tags: string[];
  progress: number;
  createdBy?: string;
  estimatedHours?: number;
  actualHours?: number;
  attachments?: string[];
  comments?: TaskComment[];
  submission?: TaskSubmission;
  createdAt?: string;
  updatedAt?: string;
}

export interface TaskComment {
  _id?: string;
  author: string | Employee;
  content: string;
  createdAt: string;
}

export interface AuthUser {
  _id?: string;
  email: string;
  password: string;
  role: Role;
  name: string;
  avatarUrl?: string;
  department?: string;
  location?: string;
  bio?: string;
  phone?: string;
  skills?: string[];
  status?: 'active' | 'on-leave' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

export interface AnalyticsSummary {
  totalEmployees: number;
  activeEmployees: number;
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  priorityBreakdown: Record<TaskPriority, number>;
}

