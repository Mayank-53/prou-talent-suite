import { useState } from 'react';
import { AppShell } from '../components/layout/AppShell';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useTasks } from '../hooks/useTasks';
import { 
  User, 
  Clock, 
  CheckSquare, 
  AlertTriangle, 
  Calendar,
  FileText,
  Upload,
  CheckCircle
} from 'lucide-react';
import { Task } from '@shared/types';
import api from '../api/client';

// Task completion form interface
interface TaskCompletionForm {
  comment: string;
  remarks: string;
  files: File[];
}

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const { data: allTasks, isLoading, error, refetch } = useTasks({
    status: 'all',
    priority: 'all',
    search: ''
  });
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [completionForm, setCompletionForm] = useState<TaskCompletionForm>({
    comment: '',
    remarks: '',
    files: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);

  // Get tasks assigned to the current user
  // We'll trust the filtering done by the useTasks hook and backend
  // But we'll add some debug logging to help troubleshoot
  const myTasks = allTasks || [];
  
  // Debug logging for tasks
  console.log('Employee Dashboard - Raw tasks received:', allTasks?.length || 0);
  if (allTasks && allTasks.length > 0) {
    allTasks.forEach(task => {
      console.log(`Task: ${task.title}, Status: ${task.status}, AssignedTo:`, 
        typeof task.assignedTo === 'object' 
          ? `${task.assignedTo?.name} (${task.assignedTo?.email})` 
          : task.assignedTo
      );
    });
  } else {
    console.log('No tasks available to display');
  }
  
  // Log tasks for debugging
  console.log('Employee Dashboard - User:', user?.email, user?._id);
  console.log('Employee Dashboard - All Tasks:', allTasks?.length);
  console.log('Employee Dashboard - Filtered Tasks:', myTasks.length);

  // Group tasks by status
  const todoTasks = myTasks.filter(task => task.status === 'todo');
  const inProgressTasks = myTasks.filter(task => task.status === 'in-progress');
  // const blockedTasks = myTasks.filter(task => task.status === 'blocked'); // Uncomment if needed
  const doneTasks = myTasks.filter(task => task.status === 'done');

  // Check for overdue tasks
  const overdueTasks = myTasks.filter(task => {
    const dueDate = new Date(task.dueDate);
    return dueDate < new Date() && task.status !== 'done';
  });

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
    setCompletionForm({
      comment: '',
      remarks: '',
      files: []
    });
    setSubmitMessage(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileArray = Array.from(e.target.files);
      
      // Check file sizes and warn about large files
      const largeFiles = fileArray.filter(file => file.size > 10 * 1024 * 1024);
      if (largeFiles.length > 0) {
        console.warn(`${largeFiles.length} files exceed the 10MB limit and may not upload properly`);
        // We'll still try to upload them, but warn the user
        setSubmitMessage({
          text: `Warning: ${largeFiles.length} file(s) exceed 10MB and may take longer to upload`,
          type: 'error'
        });
      }
      
      setCompletionForm(prev => ({
        ...prev,
        files: [...prev.files, ...fileArray]
      }));
    }
  };

  const handleRemoveFile = (index: number) => {
    setCompletionForm(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }));
  };

  const handleSubmitCompletion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;
    
    setIsSubmitting(true);
    setSubmitMessage(null);
    
    try {
      // Create form data for file uploads
      const formData = new FormData();
      formData.append('comment', completionForm.comment);
      formData.append('remarks', completionForm.remarks);
      
      // Check if we have any files that are too large
      const hasLargeFiles = completionForm.files.some(file => file.size > 10 * 1024 * 1024);
      
      // If we have large files, submit without them first to ensure task completion
      if (hasLargeFiles) {
        formData.append('skipFileUpload', 'true');
        
        // Add a note about large files in the remarks
        const updatedRemarks = completionForm.remarks 
          ? `${completionForm.remarks}\n\nNote: Some files were too large to upload.` 
          : 'Note: Some files were too large to upload.';
        
        formData.set('remarks', updatedRemarks);
      } else {
        // Add files to form data if they're not too large
        completionForm.files.forEach(file => {
          formData.append('files', file);
        });
      }
      
      // Submit the task completion with files
      const submitResponse = await api.post(`/submissions/${selectedTask._id}/submit`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        // Increase timeout for large files
        timeout: 60000, // 60 seconds
      });
      
      // Always show success, even if some files failed
      setSubmitMessage({
        text: submitResponse.data.message || 'Task marked as completed successfully!',
        type: 'success'
      });
      
      // Refresh tasks
      refetch();
      
      // Close modal after a delay
      setTimeout(() => {
        handleCloseModal();
      }, 2000);
      
    } catch (error: any) {
      console.error('Task submission error:', error);
      
      // Even if there's an error with file uploads, try to mark the task as complete
      if (error.response?.status === 413 || // Payload too large
          (error.response?.data?.message && error.response?.data?.message.includes('file'))) {
        
        try {
          // Try again without files
          const formData = new FormData();
          formData.append('comment', completionForm.comment);
          formData.append('remarks', `${completionForm.remarks}\n\nNote: Files were too large to upload.`);
          formData.append('skipFileUpload', 'true');
          
          await api.post(`/submissions/${selectedTask._id}/submit`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          
          setSubmitMessage({
            text: 'Task marked as completed, but some files were too large to upload.',
            type: 'success'
          });
          
          // Refresh tasks
          refetch();
          
          // Close modal after a delay
          setTimeout(() => {
            handleCloseModal();
          }, 2000);
          
        } catch (retryError) {
          setSubmitMessage({
            text: 'Failed to complete task. Please try again with smaller files.',
            type: 'error'
          });
        }
      } else {
        setSubmitMessage({
          text: error.response?.data?.message || 'Failed to complete task',
          type: 'error'
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Check if a task is overdue
  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date() && selectedTask?.status !== 'done';
  };

  // Only employees can access this page
  if (!user || user.role === 'admin') {
    return (
      <AppShell>
        <div className="access-denied">
          <User size={64} />
          <h2>Access Denied</h2>
          <p>This dashboard is for employees only.</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="employee-dashboard">
        <motion.div 
          className="employee-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="employee-title">
            <User size={32} className="employee-icon" />
            <div>
              <h1>Welcome, {user.name}</h1>
              <p>Here's an overview of your assigned tasks and deadlines</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="employee-content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="task-stats">
            <div className="stat-card">
              <div className="stat-icon">
                <CheckSquare size={24} />
              </div>
              <div>
                <h3>Total Tasks</h3>
                <p className="stat-number">{myTasks.length}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon todo">
                <Clock size={24} />
              </div>
              <div>
                <h3>To Do</h3>
                <p className="stat-number">{todoTasks.length}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon progress">
                <CheckSquare size={24} />
              </div>
              <div>
                <h3>In Progress</h3>
                <p className="stat-number">{inProgressTasks.length}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon done">
                <CheckCircle size={24} />
              </div>
              <div>
                <h3>Completed</h3>
                <p className="stat-number">{doneTasks.length}</p>
              </div>
            </div>
            {overdueTasks.length > 0 && (
              <div className="stat-card alert">
                <div className="stat-icon overdue">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h3>Overdue</h3>
                  <p className="stat-number">{overdueTasks.length}</p>
                </div>
              </div>
            )}
          </div>

          <div className="my-tasks">
            <h2>My Assigned Tasks</h2>
            
            {isLoading && (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading your tasks...</p>
              </div>
            )}
            
            {error && (
              <div className="error-state">
                <AlertTriangle size={24} />
                <p>Failed to load tasks. Please try again later.</p>
              </div>
            )}
            
            {!isLoading && myTasks.length === 0 && (
              <div className="no-tasks">
                <CheckSquare size={48} />
                <p>You don't have any assigned tasks yet.</p>
              </div>
            )}
            
            {!isLoading && myTasks.length > 0 && (
              <div className="task-list">
                {myTasks.map(task => (
                  <div 
                    key={task._id} 
                    className={`employee-task-card ${isOverdue(task.dueDate) ? 'overdue' : ''}`}
                    onClick={() => handleTaskClick(task)}
                  >
                    <div className="task-header">
                      <h3>{task.title}</h3>
                      <span className={`task-priority ${task.priority}`}>
                        {task.priority}
                      </span>
                    </div>
                    
                    <p className="task-description">{task.description}</p>
                    
                    <div className="task-details">
                      <div className="task-meta">
                        <Calendar size={16} />
                        <span>Due: {formatDate(task.dueDate)}</span>
                        {isOverdue(task.dueDate) && (
                          <span className="overdue-tag">OVERDUE</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="task-progress">
                      <span>{task.progress}% Complete</span>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${task.progress}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="task-actions">
                      <span className={`task-status ${task.status}`}>
                        {task.status}
                      </span>
                      {task.status !== 'done' && (
                        <button className="complete-button">
                          <CheckCircle size={16} />
                          Complete Task
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Task Completion Modal */}
      {isModalOpen && selectedTask && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <motion.div
            className="modal-content task-submission-modal"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div className="modal-title">
                <CheckCircle size={24} />
                <h2>Complete Task</h2>
              </div>
              <button className="modal-close" onClick={handleCloseModal}>
                <span>&times;</span>
              </button>
            </div>

            <div className="modal-body">
              <div className="task-info">
                <h3>{selectedTask.title}</h3>
                <p>{selectedTask.description}</p>
                <div className="task-meta">
                  <Calendar size={16} />
                  <span>Due: {formatDate(selectedTask.dueDate)}</span>
                  {isOverdue(selectedTask.dueDate) && (
                    <span className="overdue-tag">OVERDUE</span>
                  )}
                </div>
              </div>

              <form onSubmit={handleSubmitCompletion}>
                <div className="form-group">
                  <label htmlFor="comment">
                    <FileText size={16} />
                    Completion Notes
                  </label>
                  <textarea
                    id="comment"
                    rows={4}
                    value={completionForm.comment}
                    onChange={(e) => setCompletionForm(prev => ({ ...prev, comment: e.target.value }))}
                    placeholder="Add any notes about the completed task..."
                    required
                  ></textarea>
                </div>

                <div className="form-group">
                  <label htmlFor="remarks">
                    <FileText size={16} />
                    Remarks/Special Instructions
                  </label>
                  <textarea
                    id="remarks"
                    rows={3}
                    value={completionForm.remarks}
                    onChange={(e) => setCompletionForm(prev => ({ ...prev, remarks: e.target.value }))}
                    placeholder="Add any special instructions or remarks..."
                  ></textarea>
                </div>

                <div className="form-group">
                  <label>
                    <Upload size={16} />
                    Attach Files (PDF, PPTX, DOCX, images) - Max 10MB per file
                  </label>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.pptx,.docx,.jpg,.jpeg,.png,.gif"
                    onChange={handleFileChange}
                  />
                  <small className="file-size-hint">Maximum file size: 10MB per file</small>
                  
                  {completionForm.files.length > 0 && (
                    <div className="file-list">
                      {completionForm.files.map((file, index) => (
                        <div key={index} className="file-item">
                          {file.name}
                          <button 
                            type="button"
                            className="file-remove"
                            onClick={() => handleRemoveFile(index)}
                          >
                            &times;
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {submitMessage && (
                  <div className={`submission-message ${submitMessage.type}`}>
                    {submitMessage.text}
                  </div>
                )}

                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="secondary-button" 
                    onClick={handleCloseModal}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="primary-button"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : 'Mark as Complete'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AppShell>
  );
};

export default EmployeeDashboard;
