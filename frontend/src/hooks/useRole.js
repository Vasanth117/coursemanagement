import { useAuth } from './useAuth';

export const useRole = () => {
  const { user } = useAuth();

  const hasRole = (role) => user?.role === role;
  const hasAnyRole = (roles) => roles.includes(user?.role);
  const isAdmin = () => user?.role === 'admin';
  const isFaculty = () => user?.role === 'faculty';
  const isStudent = () => user?.role === 'student';

  return { hasRole, hasAnyRole, isAdmin, isFaculty, isStudent, role: user?.role };
};
