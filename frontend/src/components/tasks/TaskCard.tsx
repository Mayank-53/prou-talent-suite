import { Task } from '@shared/types';
import { CalendarDays, UserCircle } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';

interface Props {
  task: Task;
}

export const TaskCard = ({ task }: Props) => {
  const openTaskModal = useUIStore((state) => state.openTaskModal);
  const assignedName = typeof task.assignedTo === 'string' ? task.assignedTo : task.assignedTo?.name;

  return (
    <button className="task-card" onClick={() => openTaskModal(task)}>
      <header>
        <span className={`pill ${task.priority}`}>{task.priority}</span>
        <span className={`status ${task.status}`}>{task.status}</span>
      </header>
      <h4>{task.title}</h4>
      <p>{task.description}</p>
      <footer>
        <span>
          <CalendarDays size={14} />
          {new Date(task.dueDate).toLocaleDateString()}
        </span>
        <span>
          <UserCircle size={14} />
          {assignedName}
        </span>
      </footer>
    </button>
  );
};

