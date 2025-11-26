import { FormEvent, useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Employee, Task, TaskPriority, TaskStatus } from '@shared/types';
import api from '../../api/client';
import { useUIStore } from '../../store/uiStore';

interface Props {
  employees: Employee[];
  isOpen?: boolean;
  onClose?: () => void;
}

const makeDefaultTask = (): Partial<Task> => ({
  title: '',
  description: '',
  assignedTo: '',
  priority: 'medium',
  status: 'todo',
  dueDate: new Date().toISOString().slice(0, 10),
});

export const TaskModal = ({ employees, isOpen, onClose }: Props) => {
  const { isTaskModalOpen: storeIsOpen, editingTask, closeTaskModal: storeClose } = useUIStore();
  
  // Use either the props or the store values
  const modalOpen = isOpen !== undefined ? isOpen : storeIsOpen;
  const handleClose = onClose || storeClose;
  const [formState, setFormState] = useState(makeDefaultTask());
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (editingTask) {
      setFormState({
        title: editingTask.title,
        description: editingTask.description,
        assignedTo: typeof editingTask.assignedTo === 'string' ? editingTask.assignedTo : editingTask.assignedTo?._id ?? '',
        priority: editingTask.priority,
        status: editingTask.status,
        dueDate: editingTask.dueDate.slice(0, 10),
      });
    } else {
      setFormState(makeDefaultTask());
    }
    setError(null);
  }, [editingTask]);

  const mutation = useMutation({
    mutationFn: async (payload: Partial<Task>) => {
      if (editingTask?._id) {
        await api.put(`/tasks/${editingTask._id}`, payload);
      } else {
        await api.post('/tasks', payload);
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['tasks'] });
      handleClose();
    },
    onError: (err: unknown) => {
      setError(err instanceof Error ? err.message : 'Unable to save task');
    },
  });

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    const payload: Partial<Task> = {
      title: formState.title?.trim(),
      description: formState.description?.trim(),
      assignedTo: formState.assignedTo,
      priority: formState.priority,
      status: formState.status,
      dueDate: formState.dueDate ? new Date(formState.dueDate).toISOString() : undefined,
    };

    mutation.mutate(payload);
  };

  if (!modalOpen) return null;

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div className="modal" onClick={(event) => event.stopPropagation()}>
        <header>
          <h4>{editingTask ? 'Update task' : 'Create task'}</h4>
          <button onClick={handleClose} aria-label="Close task modal">
            x
          </button>
        </header>
        <form onSubmit={handleSubmit}>
          <label>
            Title
            <input
              value={formState.title}
              onChange={(event) => setFormState((prev) => ({ ...prev, title: event.target.value }))}
              required
            />
          </label>
          <label>
            Description
            <textarea
              value={formState.description}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, description: event.target.value }))
              }
              required
            />
          </label>
          <label>
            Assignee
            <select
              value={formState.assignedTo as string}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, assignedTo: event.target.value }))
              }
              required
            >
              <option value="">Select employee</option>
              {employees.map((employee) => (
                <option key={employee.email} value={employee._id ?? employee.email}>
                  {employee.name}
                </option>
              ))}
            </select>
          </label>
          <div className="row">
            <label>
              Priority
              <select
                value={formState.priority as TaskPriority}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, priority: event.target.value as TaskPriority }))
                }
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </label>
            <label>
              Status
              <select
                value={formState.status as TaskStatus}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, status: event.target.value as TaskStatus }))
                }
              >
                <option value="todo">To do</option>
                <option value="in-progress">In progress</option>
                <option value="blocked">Blocked</option>
                <option value="done">Done</option>
              </select>
            </label>
            <label>
              Due date
              <input
                type="date"
                value={formState.dueDate}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, dueDate: event.target.value }))
                }
                required
              />
            </label>
          </div>
          {error && <p className="form-error">{error}</p>}
          <button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving...' : editingTask ? 'Update task' : 'Create task'}
          </button>
        </form>
      </div>
    </div>
  );
};

