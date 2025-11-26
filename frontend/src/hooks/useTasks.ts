import { useQuery } from '@tanstack/react-query';
import api from '../api/client';
import { Task } from '@shared/types';
import { mockTasks } from '@shared/mockData';
import { TaskFilters } from '../types/dashboard';

const buildParams = (filters: TaskFilters) => {
  const params = new URLSearchParams();
  if (filters.status !== 'all') params.append('status', filters.status);
  if (filters.priority !== 'all') params.append('priority', filters.priority);
  if (filters.search) params.append('search', filters.search);
  return params.toString();
};

import { useAuth } from './useAuth';

export const useTasks = (filters: TaskFilters) => {
  const { user } = useAuth();
  
  const query = useQuery({
    queryKey: ['tasks', filters, user?._id],
    queryFn: async () => {
      const queryString = buildParams(filters);
      const url = queryString ? `/tasks?${queryString}` : '/tasks';
      const { data } = await api.get<Task[]>(url);
      return data;
    },
  });

  // Filter mock tasks based on filters
  const filteredMock = mockTasks.filter((task) => {
    const matchesStatus = filters.status === 'all' || task.status === filters.status;
    const matchesPriority = filters.priority === 'all' || task.priority === filters.priority;
    const matchesSearch =
      !filters.search ||
      task.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      task.description.toLowerCase().includes(filters.search.toLowerCase());
    return matchesStatus && matchesPriority && matchesSearch;
  });

  // Use real data if available, otherwise use mock data
  let data = query.data && query.data.length > 0 ? query.data : filteredMock;
  
  // For employee role, filter tasks to only show those assigned to the current user
  if (user?.role === 'employee' && user?._id) {
    console.log('Filtering tasks for employee:', user.email, user._id);
    console.log('Available tasks before filtering:', data.length);
    
    // If we're using real data from the API, we should trust the backend filtering
    // The backend already filters tasks for employees
    if (query.data && query.data.length > 0) {
      console.log('Using backend-filtered tasks for employee');
      data = query.data;
    } else {
      // For mock data or if backend filtering somehow failed, do client-side filtering
      data = data.filter(task => {
        // Debug the task assignedTo field
        console.log('Task:', task.title, 'AssignedTo:', task.assignedTo);
        
        // Case 1: assignedTo is an object with email
        if (typeof task.assignedTo === 'object' && task.assignedTo?.email) {
          const match = task.assignedTo.email === user.email;
          console.log('Matching by email:', task.assignedTo.email, user.email, match);
          return match;
        } 
        // Case 2: assignedTo is an object with _id
        else if (typeof task.assignedTo === 'object' && task.assignedTo?._id && user._id) {
          // Try both string and direct comparison
          const match = (
            task.assignedTo._id === user._id || 
            task.assignedTo._id.toString() === user._id.toString()
          );
          console.log('Matching by _id (object):', task.assignedTo._id, user._id, match);
          return match;
        }
        // Case 3: assignedTo is a string matching user ID
        else if (typeof task.assignedTo === 'string' && user._id) {
          // Try both exact match and string comparison
          const exactMatch = task.assignedTo === user._id;
          const stringMatch = task.assignedTo.toString() === user._id.toString();
          console.log('Matching by string ID:', task.assignedTo, user._id, exactMatch || stringMatch);
          return exactMatch || stringMatch;
        }
        
        // Case 4: assignedTo is a string matching user email (for mock data)
        else if (typeof task.assignedTo === 'string' && user.email) {
          const emailMatch = task.assignedTo === user.email;
          console.log('Matching by email string:', task.assignedTo, user.email, emailMatch);
          return emailMatch;
        }
        
        return false;
      });
    }
    
    console.log('Filtered tasks after filtering:', data.length);
  }

  return {
    ...query,
    data,
    isMocked: !query.data,
  };
};

