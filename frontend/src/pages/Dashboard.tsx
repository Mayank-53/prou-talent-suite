import { AppShell } from '../components/layout/AppShell';
import { AnalyticsGrid } from '../components/analytics/AnalyticsGrid';
import { TaskFilters } from '../components/tasks/TaskFilters';
import { TaskBoard } from '../components/tasks/TaskBoard';
import { EmployeeGrid } from '../components/employees/EmployeeGrid';
import { TaskModal } from '../components/tasks/TaskModal';
import { useEmployees } from '../hooks/useEmployees';
import { useDashboardFilters } from '../hooks/useDashboardFilters';
import { useTasks } from '../hooks/useTasks';
import { useAnalytics } from '../hooks/useAnalytics';

const Dashboard = () => {
  const { data: employees } = useEmployees();
  const { filters } = useDashboardFilters();
  const tasksQuery = useTasks(filters);
  const analyticsQuery = useAnalytics();

  return (
    <AppShell>
      <section id="overview">
        <AnalyticsGrid data={analyticsQuery.data!} />
      </section>
      
      <section id="tasks" className="panel">
        <TaskFilters />
        {tasksQuery.isError && <p className="form-error">Live data unavailable, showing mock set.</p>}
        <TaskBoard tasks={tasksQuery.data ?? []} />
      </section>
      
      <section id="employees">
        <EmployeeGrid employees={employees ?? []} />
      </section>
      
      <section id="settings" style={{ padding: '2rem', background: 'white', borderRadius: '1.2rem', margin: '1rem 0' }}>
        <h2>Settings</h2>
        <p>Application settings and preferences will be available here.</p>
        <div style={{ display: 'grid', gap: '1rem', marginTop: '1.5rem' }}>
          <div style={{ padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem' }}>
            <h3>Profile Settings</h3>
            <p>Manage your account and profile information.</p>
          </div>
          <div style={{ padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem' }}>
            <h3>Notification Preferences</h3>
            <p>Configure how you receive notifications.</p>
          </div>
          <div style={{ padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem' }}>
            <h3>Team Management</h3>
            <p>Manage team members and permissions.</p>
          </div>
        </div>
      </section>
      
      <TaskModal employees={employees ?? []} />
    </AppShell>
  );
};

export default Dashboard;

