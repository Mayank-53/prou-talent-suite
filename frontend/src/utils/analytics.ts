import { AnalyticsSummary, Employee, Task } from '@shared/types';

export const buildAnalyticsFromData = (tasks: Task[], employees: Employee[]): AnalyticsSummary => {
  const summary: AnalyticsSummary = {
    totalEmployees: employees.length,
    activeEmployees: employees.filter((emp) => emp.status === 'active').length,
    totalTasks: tasks.length,
    completedTasks: tasks.filter((task) => task.status === 'done').length,
    overdueTasks: tasks.filter(
      (task) => new Date(task.dueDate) < new Date() && task.status !== 'done'
    ).length,
    priorityBreakdown: {
      low: tasks.filter((task) => task.priority === 'low').length,
      medium: tasks.filter((task) => task.priority === 'medium').length,
      high: tasks.filter((task) => task.priority === 'high').length,
    },
  };

  return summary;
};

