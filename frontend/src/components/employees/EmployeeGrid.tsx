import { Employee } from '@shared/types';
import { BadgeCheck, BriefcaseBusiness, Edit3 } from 'lucide-react';

interface Props {
  employees: Employee[];
  onEditEmployee?: (employee: Employee) => void;
}

export const EmployeeGrid = ({ employees, onEditEmployee }: Props) => (
  <section className="employee-grid">
    <header>
      <div>
        <h3>Team members</h3>
        <p>Skills, roles, and current availability.</p>
      </div>
      <span>{employees.length} people</span>
    </header>
    <div className="employee-cards">
      {employees.map((employee) => (
        <article key={employee.email} className="employee-card">
          <div className="employee-header">
            <img src={employee.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(employee.name)}&background=4338ca&color=fff`} alt={employee.name} />
            <div>
              <strong>{employee.name}</strong>
              <p>{employee.role}</p>
              <small>{employee.department}</small>
            </div>
            <div className="employee-actions">
              {employee.status === 'active' && (
                <span className="status success">
                  <BadgeCheck size={14} />
                  Active
                </span>
              )}
              {employee.status === 'on-leave' && (
                <span className="status warning">
                  On Leave
                </span>
              )}
              {employee.status === 'inactive' && (
                <span className="status inactive">
                  Inactive
                </span>
              )}
              {onEditEmployee && (
                <button 
                  className="edit-button"
                  onClick={() => onEditEmployee(employee)}
                  title="Edit employee"
                >
                  <Edit3 size={14} />
                </button>
              )}
            </div>
          </div>
          <p className="employee-bio">{employee.bio || 'No bio available'}</p>
          <footer>
            <div className="skills">
              {employee.skills?.slice(0, 3).map((skill) => (
                <span key={skill}>{skill}</span>
              )) || <span className="no-skills">No skills listed</span>}
            </div>
            <div className="meta">
              <BriefcaseBusiness size={14} />
              {employee.location || 'Remote'}
            </div>
          </footer>
        </article>
      ))}
    </div>
  </section>
);

