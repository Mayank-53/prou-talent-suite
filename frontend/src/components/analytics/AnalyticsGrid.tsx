import { AnalyticsSummary } from '@shared/types';
import { Activity, Clock3, Users } from 'lucide-react';
import { PriorityChart } from '../charts/PriorityChart';

interface Props {
  data: AnalyticsSummary;
}

export const AnalyticsGrid = ({ data }: Props) => (
  <section className="analytics-grid">
    <article>
      <Users size={18} />
      <div>
        <p>Total employees</p>
        <strong>{data.totalEmployees}</strong>
        <small>{data.activeEmployees} active</small>
      </div>
    </article>
    <article>
      <Activity size={18} />
      <div>
        <p>Completed tasks</p>
        <strong>{data.completedTasks}</strong>
        <small>{data.totalTasks} total</small>
      </div>
    </article>
    <article>
      <Clock3 size={18} />
      <div>
        <p>Overdue</p>
        <strong>{data.overdueTasks}</strong>
        <small>Needs attention</small>
      </div>
    </article>
    <article className="priority-card">
      <h4>Priority mix</h4>
      <PriorityChart data={data.priorityBreakdown} />
    </article>
  </section>
);

