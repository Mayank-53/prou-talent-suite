import { TaskPriority } from '@shared/types';

interface Props {
  data: Record<TaskPriority, number>;
}

const colors: Record<TaskPriority, string> = {
  high: '#f87171',
  medium: '#facc15',
  low: '#4ade80',
};

export const PriorityChart = ({ data }: Props) => {
  const total = Object.values(data).reduce((sum, value) => sum + value, 0) || 1;

  let cumulative = 0;
  const gradientStops = (['high', 'medium', 'low'] as TaskPriority[]).map((priority) => {
    const start = cumulative;
    cumulative += data[priority] / total;
    return `${colors[priority]} ${start}turn ${cumulative}turn`;
  });

  const gradient = `conic-gradient(${gradientStops.join(', ')})`;

  return (
    <div className="priority-chart">
      <div className="chart-ring" style={{ background: gradient }}>
        <div className="chart-overlay">
          <strong>{total}</strong>
          <span>tasks</span>
        </div>
      </div>
      <div className="priority-legend-list">
        {(['high', 'medium', 'low'] as TaskPriority[]).map((priority) => (
          <div key={priority} className="priority-legend">
            <span style={{ backgroundColor: colors[priority] }} />
            {priority} • {data[priority]}
          </div>
        ))}
      </div>
    </div>
  );
};

