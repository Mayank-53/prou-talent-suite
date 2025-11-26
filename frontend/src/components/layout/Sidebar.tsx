import { Briefcase, LayoutDashboard, Settings, Shield, CheckSquare, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

// Admin navigation items
const adminNavItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Briefcase, label: 'Employees', path: '/employees' },
  { icon: Shield, label: 'Tasks', path: '/tasks' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

// Employee navigation items
const employeeNavItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: CheckSquare, label: 'My Tasks', path: '/tasks' },
  { icon: User, label: 'Profile', path: '/settings' },
];

export const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const handleNavClick = (path: string) => {
    navigate(path);
  };

  // Determine which nav items to show based on user role
  const navItems = user?.role === 'admin' || user?.role === 'manager' 
    ? adminNavItems 
    : employeeNavItems;

  return (
    <aside className="sidebar">
      <div className="brand">
        <span>PROU</span>
        <small>Talent Suite</small>
      </div>
      <nav>
        {navItems.map((item) => (
          <button 
            key={item.label} 
            className={location.pathname === item.path ? 'active' : ''}
            onClick={() => handleNavClick(item.path)}
          >
            <item.icon size={18} />
            {item.label}
          </button>
        ))}
      </nav>
      <div className="user-role">
        {user?.role === 'admin' && <span className="role admin">Admin</span>}
        {user?.role === 'manager' && <span className="role manager">Manager</span>}
        {user?.role === 'employee' && <span className="role employee">Employee</span>}
      </div>
    </aside>
  );
};

