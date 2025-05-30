
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useRoleBasedAccess } from '@/hooks/useRoleBasedAccess';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireRole?: 'admin' | 'manager' | 'user';
  fallbackPath?: string;
}

export function ProtectedRoute({ 
  children, 
  requireRole, 
  fallbackPath = '/auth' 
}: ProtectedRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const { requiresAuthentication, requiresRole, loading: roleLoading } = useRoleBasedAccess();

  // Show loading while checking authentication or roles
  if (authLoading || (requireRole && roleLoading)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Redirect to auth if not authenticated
  if (requiresAuthentication()) {
    return <Navigate to={fallbackPath} replace />;
  }

  // Check role requirements
  if (requireRole && requiresRole(requireRole)) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Alert className="max-w-md">
          <AlertDescription>
            You don't have permission to access this page. Required role: {requireRole}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
}
