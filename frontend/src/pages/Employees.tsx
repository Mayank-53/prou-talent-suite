import { useState } from 'react';
import { AppShell } from '../components/layout/AppShell';
import { EmployeeGrid } from '../components/employees/EmployeeGrid';
import { EmployeeModal } from '../components/employees/EmployeeModal';
import { useEmployees } from '../hooks/useEmployees';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, Users } from 'lucide-react';
import type { Employee } from '@shared/types';
import { Navigate } from 'react-router-dom';

const Employees = () => {
  const { user } = useAuth();
  const { data: employees, isLoading, error, refetch } = useEmployees();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  
  // Restrict access for employees - redirect to dashboard
  if (user?.role === 'employee') {
    return <Navigate to="/" replace />;
  }

  const filteredEmployees = employees?.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = filterDepartment === 'all' || employee.department === filterDepartment;
    const matchesStatus = filterStatus === 'all' || employee.status === filterStatus;
    
    return matchesSearch && matchesDepartment && matchesStatus;
  }) || [];

  const departments = employees ? [...new Set(employees.map(emp => emp.department).filter(Boolean))] : [];

  const handleAddEmployee = () => {
    setSelectedEmployee(null);
    setIsModalOpen(true);
  };

  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsModalOpen(true);
  };

  const handleEmployeeCreated = () => {
    refetch();
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEmployee(null);
  };

  return (
    <AppShell>
      <div className="page-container">
        <motion.div 
          className="page-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="page-title">
            <Users size={32} className="page-icon" />
            <div>
              <h1>Team Members</h1>
              <p>Manage your team and employee information</p>
            </div>
          </div>
          <button className="primary-button" onClick={handleAddEmployee}>
            <Plus size={20} />
            Add Employee
          </button>
        </motion.div>

        <motion.div 
          className="page-content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="filters-section">
            <div className="search-box">
              <Search size={20} />
              <input
                type="text"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="filter-controls">
              <div className="filter-group">
                <Filter size={16} />
                <select
                  value={filterDepartment}
                  onChange={(e) => setFilterDepartment(e.target.value)}
                >
                  <option value="all">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              
              <div className="filter-group">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="on-leave">On Leave</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          <div className="stats-cards">
            <div className="stat-card">
              <h3>Total Employees</h3>
              <p className="stat-number">{employees?.length || 0}</p>
            </div>
            <div className="stat-card">
              <h3>Active</h3>
              <p className="stat-number active">{employees?.filter(emp => emp.status === 'active').length || 0}</p>
            </div>
            <div className="stat-card">
              <h3>On Leave</h3>
              <p className="stat-number warning">{employees?.filter(emp => emp.status === 'on-leave').length || 0}</p>
            </div>
            <div className="stat-card">
              <h3>Departments</h3>
              <p className="stat-number">{departments.length}</p>
            </div>
          </div>

          {isLoading && (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading employees...</p>
            </div>
          )}

          {error && (
            <div className="error-state">
              <p>Failed to load employees. Showing mock data.</p>
            </div>
          )}

          {!isLoading && (
            <EmployeeGrid employees={filteredEmployees} onEditEmployee={handleEditEmployee} />
          )}
        </motion.div>
      </div>

      <EmployeeModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onEmployeeCreated={handleEmployeeCreated}
        employee={selectedEmployee}
      />
    </AppShell>
  );
};

export default Employees;
