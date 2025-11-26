import { Task } from '@shared/types';
import { useUIStore } from '../../store/uiStore';
import { TaskCard } from './TaskCard';

const columns: Task['status'][] = ['todo', 'in-progress', 'blocked', 'done'];

interface Props {
  tasks: Task[];
}

export const TaskBoard = ({ tasks }: Props) => {
  const openTaskModal = useUIStore((state) => state.openTaskModal);

  return (
    <section className="task-board">
      <header>
        <div>
          <h3>Execution board</h3>
          <p>Track work across the lifecycle. Click any card to edit.</p>
        </div>
        <button onClick={() => openTaskModal()}>Plan new task</button>
      </header>
      <div className="columns">
        {columns.map((status) => (
          <div key={status} className="column">
            <div className="column-header">
              <span>{status}</span>
              <small>
                {tasks.filter((task) => task.status === status).length} task
                {tasks.filter((task) => task.status === status).length === 1 ? '' : 's'}
              </small>
            </div>
            <div className="column-body">
              {tasks
                .filter((task) => task.status === status)
                .map((task) => (
                  <TaskCard key={task._id ?? task.title} task={task} />
                ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

