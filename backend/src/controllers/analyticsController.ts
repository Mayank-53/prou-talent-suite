import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { EmployeeModel } from '../models/Employee';
import { TaskModel } from '../models/Task';

export const getAnalyticsSummary = asyncHandler(async (_req: Request, res: Response) => {
  const [employees, tasks] = await Promise.all([
    EmployeeModel.find(),
    TaskModel.find(),
  ]);

  const summary = {
    totalEmployees: employees.length,
    activeEmployees: employees.filter((emp) => emp.status === 'active').length,
    totalTasks: tasks.length,
    completedTasks: tasks.filter((task) => task.status === 'done').length,
    overdueTasks: tasks.filter((task) => new Date(task.dueDate) < new Date() && task.status !== 'done').length,
    priorityBreakdown: {
      low: tasks.filter((task) => task.priority === 'low').length,
      medium: tasks.filter((task) => task.priority === 'medium').length,
      high: tasks.filter((task) => task.priority === 'high').length,
    },
  };

  res.json(summary);
});

