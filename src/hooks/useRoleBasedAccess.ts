
import { useUserRole } from './useUserRole';
import { useAuth } from '@/contexts/AuthContext';

export function useRoleBasedAccess() {
  const { user } = useAuth();
  const { role, loading, isAdmin, isManager, isWorker } = useUserRole();

  const canManageTeam = () => {
    return isAdmin() || isManager();
  };

  const canManageProjects = () => {
    return isAdmin() || isManager();
  };

  const canDeleteProjects = () => {
    return isAdmin();
  };

  const canViewReports = () => {
    return isAdmin() || isManager();
  };

  const canManageUsers = () => {
    return isAdmin();
  };

  const canCreateWorkers = () => {
    return isAdmin();
  };

  const canManageTasks = () => {
    return isAdmin();
  };

  const canAccessProject = (projectCreatedBy: string, isTeamMember: boolean = false) => {
    if (!user) return false;
    if (isAdmin()) return true;
    if (user.id === projectCreatedBy) return true;
    return isTeamMember;
  };

  const canEditProject = (projectCreatedBy: string) => {
    if (!user) return false;
    if (isAdmin()) return true;
    return user.id === projectCreatedBy;
  };

  const canUploadFiles = (projectCreatedBy: string, isTeamMember: boolean = false) => {
    if (!user) return false;
    if (isAdmin()) return true;
    if (user.id === projectCreatedBy) return true;
    return isTeamMember;
  };

  const canDeleteFile = (fileUploadedBy: string, projectCreatedBy: string) => {
    if (!user) return false;
    if (isAdmin()) return true;
    if (user.id === fileUploadedBy) return true;
    return user.id === projectCreatedBy;
  };

  const requiresAuthentication = () => {
    return !user;
  };

  const requiresRole = (requiredRole: 'admin' | 'manager' | 'user' | 'worker') => {
    if (loading) return true; // Still loading
    if (!role) return true; // No role assigned
    
    const roleHierarchy = { admin: 4, manager: 3, user: 2, worker: 1 };
    return roleHierarchy[role] < roleHierarchy[requiredRole];
  };

  return {
    canManageTeam,
    canManageProjects,
    canDeleteProjects,
    canViewReports,
    canManageUsers,
    canCreateWorkers,
    canManageTasks,
    canAccessProject,
    canEditProject,
    canUploadFiles,
    canDeleteFile,
    requiresAuthentication,
    requiresRole,
    role,
    loading,
    isAdmin: isAdmin(),
    isManager: isManager(),
    isWorker: isWorker()
  };
}
