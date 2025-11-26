import { useDashboardFilters } from '../../hooks/useDashboardFilters';

export const TaskFilters = () => {
  const { filters, setFilters } = useDashboardFilters();

  return (
    <div className="task-filters">
      <input
        placeholder="Search tasks"
        value={filters.search}
        onChange={(event) => setFilters({ search: event.target.value })}
      />
      <select
        value={filters.status}
        onChange={(event) => setFilters({ status: event.target.value as typeof filters.status })}
      >
        <option value="all">All statuses</option>
        <option value="todo">To do</option>
        <option value="in-progress">In progress</option>
        <option value="blocked">Blocked</option>
        <option value="done">Done</option>
      </select>
      <select
        value={filters.priority}
        onChange={(event) => setFilters({ priority: event.target.value as typeof filters.priority })}
      >
        <option value="all">Any priority</option>
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </select>
    </div>
  );
};

