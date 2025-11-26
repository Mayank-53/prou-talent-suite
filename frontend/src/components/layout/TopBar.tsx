import { Bell, LogOut, Plus } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useUIStore } from '../../store/uiStore';

export const TopBar = () => {
  const { user, logout } = useAuth();
  const openTaskModal = useUIStore((state) => state.openTaskModal);

  return (
    <header className="topbar">
      <div className="topbar-left">
        <h2>Team Health</h2>
        <p>Monitor employees, priorities, and blockers in one place.</p>
      </div>
      <div className="topbar-actions">
        <button className="ghost" onClick={() => openTaskModal()}>
          <Plus size={16} />
          New task
        </button>
        <button className="icon">
          <Bell size={16} />
        </button>
        <div className="user-chip">
          <span>{user?.name ?? 'Guest'}</span>
          <small>{user?.role ?? 'viewer'}</small>
        </div>
        <button className="icon" onClick={logout} title="Sign out">
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
};

