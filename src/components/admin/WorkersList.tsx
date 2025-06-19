
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, Phone, Mail } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Worker {
  id: string;
  email: string;
  full_name: string;
  must_reset_password: boolean;
  created_at: string;
  team_member?: {
    phone: string;
    role_title: string;
  };
}

interface WorkersListProps {
  refreshTrigger: number;
}

export function WorkersList({ refreshTrigger }: WorkersListProps) {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchWorkers = async () => {
    try {
      // Get all users with worker role
      const { data: workerRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'worker');

      if (rolesError) {
        console.error('Error fetching worker roles:', rolesError);
        return;
      }

      if (!workerRoles || workerRoles.length === 0) {
        setWorkers([]);
        return;
      }

      const workerIds = workerRoles.map(role => role.user_id);

      // Get profiles for these workers
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', workerIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        return;
      }

      // Get team member details
      const { data: teamMembers, error: teamError } = await supabase
        .from('team_members')
        .select('user_id, phone, role_title')
        .in('user_id', workerIds);

      if (teamError) {
        console.error('Error fetching team members:', teamError);
      }

      // Combine the data
      const workersData = profiles?.map(profile => ({
        ...profile,
        team_member: teamMembers?.find(tm => tm.user_id === profile.id)
      })) || [];

      setWorkers(workersData);
    } catch (error) {
      console.error('Unexpected error fetching workers:', error);
      toast({
        title: "Error",
        description: "Failed to fetch workers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, [refreshTrigger]);

  const handleDeleteWorker = async (workerId: string, workerName: string) => {
    if (!confirm(`Are you sure you want to delete worker ${workerName}? This action cannot be undone.`)) {
      return;
    }

    try {
      // Delete user roles first
      const { error: roleError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', workerId);

      if (roleError) {
        console.error('Error deleting user role:', roleError);
      }

      // Delete team member record
      const { error: teamError } = await supabase
        .from('team_members')
        .delete()
        .eq('user_id', workerId);

      if (teamError) {
        console.error('Error deleting team member:', teamError);
      }

      // Delete profile
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', workerId);

      if (profileError) {
        console.error('Error deleting profile:', profileError);
      }

      // Delete auth user (admin function)
      const { error: authError } = await supabase.auth.admin.deleteUser(workerId);

      if (authError) {
        console.error('Error deleting auth user:', authError);
        toast({
          title: "Error",
          description: "Failed to delete worker account",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: `Worker ${workerName} has been deleted`,
      });

      fetchWorkers(); // Refresh the list
    } catch (error) {
      console.error('Unexpected error deleting worker:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading workers...</div>;
  }

  if (workers.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">No workers found. Create your first worker to get started.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {workers.map((worker) => (
        <Card key={worker.id}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg">{worker.full_name || 'Unnamed Worker'}</CardTitle>
            <div className="flex items-center space-x-2">
              {worker.must_reset_password && (
                <Badge variant="outline" className="text-orange-600 border-orange-600">
                  Password Reset Required
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteWorker(worker.id, worker.full_name || 'Unnamed Worker')}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{worker.email}</span>
              </div>
              
              {worker.team_member?.phone && (
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{worker.team_member.phone}</span>
                </div>
              )}
              
              {worker.team_member?.role_title && (
                <div>
                  <Badge variant="secondary">{worker.team_member.role_title}</Badge>
                </div>
              )}
              
              <div className="text-sm text-muted-foreground">
                Created: {new Date(worker.created_at).toLocaleDateString()}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
