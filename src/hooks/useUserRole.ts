
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'admin' | 'manager' | 'user' | 'worker';

export function useUserRole() {
  const { user } = useAuth();
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserRole() {
      if (!user) {
        setRole(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.rpc('get_user_role', {
          _user_id: user.id
        });

        if (error) {
          console.error('Error fetching user role:', error);
          setRole('user'); // Default to user role
        } else {
          setRole(data || 'user');
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
        setRole('user');
      } finally {
        setLoading(false);
      }
    }

    fetchUserRole();
  }, [user]);

  const hasRole = (requiredRole: UserRole): boolean => {
    if (!role) return false;
    
    const roleHierarchy = { admin: 4, manager: 3, user: 2, worker: 1 };
    return roleHierarchy[role] >= roleHierarchy[requiredRole];
  };

  const isAdmin = () => role === 'admin';
  const isManager = () => role === 'manager' || role === 'admin';
  const isWorker = () => role === 'worker';

  return {
    role,
    loading,
    hasRole,
    isAdmin,
    isManager,
    isWorker
  };
}
