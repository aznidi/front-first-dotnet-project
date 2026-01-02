import { useAuth as useAuthContext } from '@/contexts';

export const useAuth = () => {
  const auth = useAuthContext();
  
  const isAdmin = () => {
    return auth.user?.roles?.includes('ADMIN') ?? false;
  };

  const hasRole = (role: string) => {
    return auth.user?.roles?.includes(role) ?? false;
  };

  return {
    ...auth,
    isAdmin: isAdmin(),
    hasRole,
  };
};
