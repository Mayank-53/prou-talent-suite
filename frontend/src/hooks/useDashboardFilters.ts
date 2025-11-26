import { useUIStore } from '../store/uiStore';

export const useDashboardFilters = () => {
  const filters = useUIStore((state) => state.filters);
  const setFilters = useUIStore((state) => state.setFilters);
  return { filters, setFilters };
};

