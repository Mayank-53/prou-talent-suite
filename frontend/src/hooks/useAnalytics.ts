import { useQuery } from '@tanstack/react-query';
import { AnalyticsSummary } from '@shared/types';
import { mockEmployees, mockTasks } from '@shared/mockData';
import api from '../api/client';
import { buildAnalyticsFromData } from '../utils/analytics';

export const useAnalytics = () => {
  const query = useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      const { data } = await api.get<AnalyticsSummary>('/analytics/summary');
      return data;
    },
  });

  const fallback = buildAnalyticsFromData(mockTasks, mockEmployees);

  return {
    ...query,
    data: (query.data ?? fallback) as AnalyticsSummary,
    isMocked: !query.data,
  };
};

