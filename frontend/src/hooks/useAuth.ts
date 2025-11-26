import { useAuthContext } from '../providers/AuthProvider';

export const useAuth = () => {
  const context = useAuthContext();
  return {
    ...context,
    isAuthenticated: !!context.token,
  };
};

