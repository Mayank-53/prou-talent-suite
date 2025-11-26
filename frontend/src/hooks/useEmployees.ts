import { useQuery } from '@tanstack/react-query';
import api from '../api/client';
import { Employee } from '@shared/types';
import { mockEmployees } from '@shared/mockData';

export const useEmployees = () => {
  const query = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const { data } = await api.get<Employee[]>('/employees');
      return data;
    },
  });

  const data = query.data && query.data.length > 0 ? query.data : mockEmployees;

  return {
    ...query,
    data,
    isMocked: !query.data,
  };
};

