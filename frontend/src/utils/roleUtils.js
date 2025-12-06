import { ROLES, ROLE_ROUTES } from './constants/roles';
import { PERMISSIONS, hasPermission } from './constants/permissions';

export const getRoleRoute = (role) => {
  return ROLE_ROUTES[role] || '/login';
};

export const canAccessRoute = (userRole, requiredRoles) => {
  return requiredRoles.includes(userRole);
};

export const canPerformAction = (userRole, action) => {
  return hasPermission(userRole, action);
};

export const isAdmin = (role) => role === ROLES.ADMIN;
export const isFaculty = (role) => role === ROLES.FACULTY;
export const isStudent = (role) => role === ROLES.STUDENT;

export const getRoleColor = (role) => {
  const colors = {
    [ROLES.ADMIN]: 'red',
    [ROLES.FACULTY]: 'blue',
    [ROLES.STUDENT]: 'green'
  };
  return colors[role] || 'gray';
};

export const getRoleIcon = (role) => {
  const icons = {
    [ROLES.ADMIN]: 'FiShield',
    [ROLES.FACULTY]: 'FiBook',
    [ROLES.STUDENT]: 'FiUser'
  };
  return icons[role] || 'FiUser';
};
