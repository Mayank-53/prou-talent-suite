import { useState } from 'react';
import { AppShell } from '../components/layout/AppShell';
import { AnalyticsGrid } from '../components/analytics/AnalyticsGrid';
import { useAnalytics } from '../hooks/useAnalytics';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { Shield, UserPlus, Users, CheckSquare, Plus } from 'lucide-react';
import api from '../api/client';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { data: analytics } = useAnalytics();
  const [activeTab, setActiveTab] = useState<'overview' | 'admins'>('overview');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminEmails, setAdminEmails] = useState<{_id: string, email: string, name: string}[]>([]);
  const [message, setMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load admin emails when the admin tab is selected
  const loadAdminEmails = async () => {
    try {
      const { data } = await api.get('/admin');
      setAdminEmails(data);
    } catch (error) {
      console.error('Failed to load admin emails', error);
      setMessage({
        text: 'Failed to load admin emails. Please try again.',
        type: 'error'
      });
    }
  };

  const handleTabChange = (tab: 'overview' | 'admins') => {
    setActiveTab(tab);
    if (tab === 'admins') {
      loadAdminEmails();
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminEmail.trim()) return;
    
    setIsLoading(true);
    setMessage(null);
    
    try {
      await api.post('/admin', { email: adminEmail });
      setMessage({
        text: `Admin email ${adminEmail} added successfully`,
        type: 'success'
      });
      setAdminEmail('');
      loadAdminEmails(); // Refresh the list
    } catch (error: any) {
      setMessage({
        text: error.response?.data?.message || 'Failed to add admin email',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveAdmin = async (id: string, email: string) => {
    // Don't allow removing the default admin
    if (email === 'mayankkishor53@gmail.com') {
      setMessage({
        text: 'Cannot remove the default admin account',
        type: 'error'
      });
      return;
    }

    setIsLoading(true);
    setMessage(null);
    
    try {
      await api.delete(`/admin/${id}`);
      setMessage({
        text: `Admin ${email} removed successfully`,
        type: 'success'
      });
      loadAdminEmails(); // Refresh the list
    } catch (error: any) {
      setMessage({
        text: error.response?.data?.message || 'Failed to remove admin',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Only admins can access this page
  if (!user || user.role !== 'admin') {
    return (
      <AppShell>
        <div className="access-denied">
          <Shield size={64} />
          <h2>Access Denied</h2>
          <p>You don't have permission to access the admin dashboard.</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="admin-dashboard">
        <motion.div 
          className="admin-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="admin-title">
            <Shield size={32} className="admin-icon" />
            <div>
              <h1>Admin Dashboard</h1>
              <p>Manage your organization, employees, and tasks</p>
            </div>
          </div>
          <div className="admin-actions">
            <button 
              className={`admin-toggle ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => handleTabChange('overview')}
            >
              <CheckSquare size={20} />
              Overview
            </button>
            <button 
              className={`admin-toggle ${activeTab === 'admins' ? 'active' : ''}`}
              onClick={() => handleTabChange('admins')}
            >
              <Shield size={20} />
              Admin Management
            </button>
          </div>
        </motion.div>

        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {analytics && <AnalyticsGrid data={analytics} />}
            
            <div className="admin-panel">
              <div className="admin-panel-header">
                <h2>Quick Actions</h2>
              </div>
              <div className="admin-panel-content">
                <div className="admin-actions-grid">
                  <div className="admin-action-card">
                    <Users size={24} />
                    <h3>Manage Employees</h3>
                    <p>Add, edit, or remove employees from your organization.</p>
                    <a href="/employees" className="admin-action-link">
                      <UserPlus size={16} />
                      Go to Employees
                    </a>
                  </div>
                  <div className="admin-action-card">
                    <CheckSquare size={24} />
                    <h3>Manage Tasks</h3>
                    <p>Create, assign, and track tasks across your team.</p>
                    <a href="/tasks" className="admin-action-link">
                      <Plus size={16} />
                      Go to Tasks
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'admins' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="admin-panel"
          >
            <div className="admin-panel-content">
              <div className="admin-section">
                <h3><Shield size={20} /> Admin Management</h3>
                <p>Add or remove admin access for email addresses. New admins will need to sign up with the provided email.</p>
                
                <div className="admin-management">
                  <form onSubmit={handleAddAdmin} className="add-admin-form">
                    <div className="form-group">
                      <input 
                        type="email" 
                        placeholder="Enter email address" 
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        required
                      />
                      <button 
                        type="submit" 
                        className="primary-button"
                        disabled={isLoading}
                      >
                        {isLoading ? 'Adding...' : 'Add Admin'}
                      </button>
                    </div>
                  </form>

                  {message && (
                    <div className={`admin-message ${message.type}`}>
                      {message.text}
                    </div>
                  )}

                  <div className="admin-list">
                    <h4>Current Admins</h4>
                    <div className="admin-table">
                      <table>
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {adminEmails.map((admin) => (
                            <tr key={admin._id}>
                              <td>{admin.name}</td>
                              <td>{admin.email}</td>
                              <td>
                                <button 
                                  className="admin-remove-button"
                                  onClick={() => handleRemoveAdmin(admin._id, admin.email)}
                                  disabled={admin.email === 'mayankkishor53@gmail.com' || isLoading}
                                >
                                  Remove
                                </button>
                              </td>
                            </tr>
                          ))}
                          {adminEmails.length === 0 && (
                            <tr>
                              <td colSpan={3}>No admins found</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </AppShell>
  );
};

export default AdminDashboard;
