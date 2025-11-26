import { TaskPriority, TaskStatus } from '@shared/types';

export interface TaskFilters {
  status: TaskStatus | 'all';
  priority: TaskPriority | 'all';
  search: string;
}

