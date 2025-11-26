import { useState, useEffect, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'framer-motion';
import { UserPlus, Mail, Lock, User, Briefcase, AlertTriangle } from 'lucide-react';
import api from '../api/client';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'employee' as 'admin' | 'manager' | 'employee',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [contactAdmin, setContactAdmin] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();
  
  // Check email authorization when role changes or email changes
  useEffect(() => {
    const checkEmailAuthorization = async () => {
      if (!formData.email || !formData.email.includes('@')) return;
      
      setEmailError(null);
      setContactAdmin(false);
      
      if (formData.role === 'admin') {
        try {
          const { data } = await api.get(`/admin/check-email?email=${formData.email}`);
          if (!data.isAuthorized) {
            setEmailError('This email is not authorized for admin signup');
            setContactAdmin(true);
          }
        } catch (error) {
          console.error('Failed to check email authorization', error);
        }
      }
      
      // For employees, we'll let the signup API handle the validation
      // since we need to check if a placeholder account exists
    };
    
    const timer = setTimeout(checkEmailAuthorization, 500);
    return () => clearTimeout(timer);
  }, [formData.email, formData.role]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Don't allow submission if there's an email error
    if (emailError) {
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    try {
      await signup({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });
      navigate('/');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Signup failed';
      setError(errorMessage);
      
      // Check if we need to show contact admin message
      if (err.response?.data?.contactAdmin) {
        setContactAdmin(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="auth-container">
      <div className="auth-grid">
        <motion.div 
          className="auth-hero"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="auth-hero-content">
            <h1>Join PROU Talent Suite</h1>
            <p>Create your account to start managing your team and projects efficiently.</p>
            <ul>
              <li>✨ Intuitive task management</li>
              <li>📊 Real-time analytics dashboard</li>
              <li>👥 Team collaboration tools</li>
              <li>🚀 Professional workflow management</li>
            </ul>
          </div>
        </motion.div>

        <motion.div 
          className="auth-form-container"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="auth-form-wrapper">
            <div className="auth-header">
              <UserPlus size={32} className="auth-icon" />
              <h2>Create Account</h2>
              <p>Fill in your details to get started</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              {error && (
                <motion.div 
                  className="form-error"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {error}
                </motion.div>
              )}

              <div className="form-group">
                <label htmlFor="name">
                  <User size={18} />
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">
                  <Mail size={18} />
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                />
              </div>

              <div className="form-group">
                <label htmlFor="role">
                  <Briefcase size={18} />
                  Role
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                >
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="password">
                  <Lock size={18} />
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password (min 6 characters)"
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">
                  <Lock size={18} />
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                />
              </div>
              
              {error && <div className="auth-error">{error}</div>}
              
              {emailError && (
                <div className="auth-warning">
                  <AlertTriangle size={18} />
                  {emailError}
                </div>
              )}
              
              {contactAdmin && (
                <div className="contact-admin">
                  <p>
                    Please contact the administrator at{' '}
                    <a 
                      href={`mailto:mayankkishor53@gmail.com?subject=Request%20for%20account%20access&body=Hello,%0A%0AI%20would%20like%20to%20request%20access%20to%20the%20system%20for%20email:%20${encodeURIComponent(formData.email)}.%0A%0AThank%20you.`}
                      className="admin-email-link"
                    >
                      mayankkishor53@gmail.com
                    </a>
                  </p>
                </div>
              )}

              <button 
                type="submit" 
                className="auth-button"
                disabled={isLoading || !!emailError}
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <div className="auth-footer">
              <p>
                Already have an account?{' '}
                <Link to="/login" className="auth-link">
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Signup;
