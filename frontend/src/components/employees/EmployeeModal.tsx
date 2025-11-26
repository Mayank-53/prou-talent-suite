import { useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Phone, MapPin, Briefcase, FileText } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { ImageUpload } from '../common/ImageUpload';
import api from '../../api/client';
import type { Employee } from '@shared/types';

interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEmployeeCreated: (employee: Employee) => void;
  employee?: Employee | null;
}

export const EmployeeModal = ({ isOpen, onClose, onEmployeeCreated, employee }: EmployeeModalProps) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: employee?.name || '',
    email: employee?.email || '',
    role: employee?.role || 'employee' as 'admin' | 'manager' | 'employee',
    department: employee?.department || '',
    phone: employee?.phone || '',
    location: employee?.location || '',
    bio: employee?.bio || '',
    skills: employee?.skills?.join(', ') || '',
    status: employee?.status || 'active' as 'active' | 'on-leave' | 'inactive',
    avatarUrl: employee?.avatarUrl || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Validate required fields
      if (!formData.name.trim()) {
        throw new Error('Name is required');
      }
      if (!formData.email.trim()) {
        throw new Error('Email is required');
      }
      if (!formData.department.trim()) {
        throw new Error('Department is required');
      }

      const employeeData = {
        ...formData,
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        department: formData.department.trim(),
        skills: formData.skills.split(',').map(skill => skill.trim()).filter(Boolean),
      };

      console.log('Submitting employee data:', employeeData);

      const response = employee
        ? await api.put(`/employees/${employee._id}`, employeeData)
        : await api.post('/employees', employeeData);

      console.log('Employee creation response:', response.data);
      onEmployeeCreated(response.data);
      onClose();
      resetForm();
    } catch (err: any) {
      console.error('Employee creation error:', err);
      
      if (err.response?.data?.errors) {
        // Handle Zod validation errors
        const errorMessages = err.response.data.errors.map((e: any) => e.message).join(', ');
        setError(`Validation error: ${errorMessages}`);
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Failed to save employee. Please check your connection and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      role: 'employee',
      department: '',
      phone: '',
      location: '',
      bio: '',
      skills: '',
      status: 'active',
      avatarUrl: '',
    });
    setError('');
  };

  const handleClose = () => {
    onClose();
    if (!employee) resetForm();
  };

  if (!user || (user.role !== 'admin' && user.role !== 'manager')) {
    return null;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="modal-overlay" onClick={handleClose}>
          <motion.div
            className="modal-content employee-modal"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div className="modal-title">
                <User size={24} />
                <h2>{employee ? 'Edit Employee' : 'Add New Employee'}</h2>
              </div>
              <button className="modal-close" onClick={handleClose}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-body">
              {error && (
                <motion.div 
                  className="form-error"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {error}
                </motion.div>
              )}

              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="name">
                    <User size={16} />
                    Full Name *
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter full name"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">
                    <Mail size={16} />
                    Email Address *
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter email address"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="role">
                    <Briefcase size={16} />
                    Role *
                  </label>
                  <select
                    id="role"
                    name="role"
                    required
                    value={formData.role}
                    onChange={handleChange}
                  >
                    <option value="employee">Employee</option>
                    <option value="manager">Manager</option>
                    {user.role === 'admin' && <option value="admin">Admin</option>}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="department">
                    <Briefcase size={16} />
                    Department *
                  </label>
                  <input
                    id="department"
                    name="department"
                    type="text"
                    required
                    value={formData.department}
                    onChange={handleChange}
                    placeholder="e.g., Engineering, Marketing"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">
                    <Phone size={16} />
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="location">
                    <MapPin size={16} />
                    Location
                  </label>
                  <input
                    id="location"
                    name="location"
                    type="text"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="City, State/Country"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="status">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="active">Active</option>
                    <option value="on-leave">On Leave</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>
                    Profile Photo
                  </label>
                  <ImageUpload
                    currentImage={formData.avatarUrl}
                    onImageUploaded={(url) => setFormData(prev => ({ ...prev, avatarUrl: url }))}
                    className="employee-avatar-upload"
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="skills">
                    Skills (comma-separated)
                  </label>
                  <input
                    id="skills"
                    name="skills"
                    type="text"
                    value={formData.skills}
                    onChange={handleChange}
                    placeholder="JavaScript, React, Node.js, MongoDB"
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="bio">
                    <FileText size={16} />
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Brief description about the employee..."
                    rows={3}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button 
                  type="button" 
                  className="secondary-button" 
                  onClick={handleClose}
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="primary-button"
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : (employee ? 'Update Employee' : 'Add Employee')}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
