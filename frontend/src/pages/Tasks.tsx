import { useState } from 'react';
import { AppShell } from '../components/layout/AppShell';
import { TaskBoard } from '../components/tasks/TaskBoard';
import { TaskFilters } from '../components/tasks/TaskFilters';
import { TaskModal } from '../components/tasks/TaskModal';
import { useTasks } from '../hooks/useTasks';
import { useEmployees } from '../hooks/useEmployees';
import { useDashboardFilters } from '../hooks/useDashboardFilters';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'framer-motion';
import { Plus, CheckSquare, Clock, AlertTriangle, Target } from 'lucide-react';

const Tasks = () => {
  const { user } = useAuth();
  const { filters } = useDashboardFilters();
  const { data: allTasks, isLoading, error } = useTasks(filters);
  const { data: employees } = useEmployees();
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Filter tasks based on user role
  const tasks = allTasks?.filter(task => {
    // For employees, only show tasks assigned to them
    if (user?.role === 'employee') {
      if (typeof task.assignedTo === 'object') {
        return task.assignedTo.email === user.email;
      }
      return false;
    }
    // For admins and managers, show all tasks
    return true;
  }) || [];

  const taskStats = {
    total: tasks.length || 0,
    todo: tasks.filter(task => task.status === 'todo').length || 0,
    inProgress: tasks.filter(task => task.status === 'in-progress').length || 0,
    blocked: tasks.filter(task => task.status === 'blocked').length || 0,
    done: tasks.filter(task => task.status === 'done').length || 0,
    overdue: tasks.filter(task => {
      const dueDate = new Date(task.dueDate);
      return dueDate < new Date() && task.status !== 'done';
    }).length || 0,
  };

  return (
    <AppShell>
      <div className="page-container">
        <motion.div 
          className="page-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="page-title">
            <CheckSquare size={32} className="page-icon" />
            <div>
              <h1>Task Management</h1>
              <p>Track and manage project tasks across your team</p>
            </div>
          </div>
          <div className="header-actions">
            <div className="view-toggle">
              <button 
                className={viewMode === 'board' ? 'active' : ''}
                onClick={() => setViewMode('board')}
              >
                Board
              </button>
              <button 
                className={viewMode === 'list' ? 'active' : ''}
                onClick={() => setViewMode('list')}
              >
                List
              </button>
            </div>
            {(user?.role === 'admin' || user?.role === 'manager') && (
              <button 
                className="primary-button"
                onClick={() => setIsModalOpen(true)}
              >
                <Plus size={20} />
                New Task
              </button>
            )}
          </div>
        </motion.div>

        <motion.div 
          className="page-content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="stats-cards">
            <div className="stat-card">
              <div className="stat-icon">
                <Target size={24} />
              </div>
              <div>
                <h3>Total Tasks</h3>
                <p className="stat-number">{taskStats.total}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon todo">
                <Clock size={24} />
              </div>
              <div>
                <h3>To Do</h3>
                <p className="stat-number">{taskStats.todo}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon progress">
                <CheckSquare size={24} />
              </div>
              <div>
                <h3>In Progress</h3>
                <p className="stat-number">{taskStats.inProgress}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon blocked">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3>Blocked</h3>
                <p className="stat-number">{taskStats.blocked}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon done">
                <CheckSquare size={24} />
              </div>
              <div>
                <h3>Completed</h3>
                <p className="stat-number">{taskStats.done}</p>
              </div>
            </div>
            {taskStats.overdue > 0 && (
              <div className="stat-card alert">
                <div className="stat-icon overdue">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h3>Overdue</h3>
                  <p className="stat-number">{taskStats.overdue}</p>
                </div>
              </div>
            )}
          </div>

          <div className="task-controls">
            <TaskFilters />
          </div>

          {isLoading && (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading tasks...</p>
            </div>
          )}

          {error && (
            <div className="error-state">
              <p>Failed to load tasks. Showing mock data.</p>
            </div>
          )}

          {!isLoading && (
            <div className="task-content">
              {tasks.length === 0 ? (
                <div className="empty-state">
                  <CheckSquare size={48} />
                  <h3>{user?.role === 'employee' ? 'No tasks assigned to you' : 'No tasks found'}</h3>
                  <p>{user?.role === 'employee' ? 'You don\'t have any tasks assigned to you yet.' : 'Try changing your filters or create a new task.'}</p>
                </div>
              ) : viewMode === 'board' ? (
                <TaskBoard tasks={tasks} />
              ) : (
                <div className="task-list">
                  {/* Task list view would go here */}
                  <p>List view coming soon...</p>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>

      <TaskModal 
        employees={employees || []} 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </AppShell>
  );
};

export default Tasks;
