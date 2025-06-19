
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, Phone, Mail } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

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
    console.log('Fetching workers...');
    try {
      setLoading(true);
      
      // Get all users with worker role
      const { data: workerRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'worker');

      console.log('Worker roles:', workerRoles, 'Error:', rolesError);

      if (rolesError) {
        console.error('Error fetching worker roles:', rolesError);
        toast({
          title: "Error",
          description: "Failed to fetch worker roles",
          variant: "destructive",
        });
        return;
      }

      if (!workerRoles || workerRoles.length === 0) {
        console.log('No workers found');
        setWorkers([]);
        return;
      }

      const workerIds = workerRoles.map(role => role.user_id);
      console.log('Worker IDs:', workerIds);

      // Get profiles for these workers
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', workerIds);

      console.log('Profiles:', profiles, 'Error:', profilesError);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        toast({
          title: "Error",
          description: "Failed to fetch worker profiles",
          variant: "destructive",
        });
        return;
      }

      // Get team member details
      const { data: teamMembers, error: teamError } = await supabase
        .from('team_members')
        .select('user_id, phone, role_title')
        .in('user_id', workerIds);

      console.log('Team members:', teamMembers, 'Error:', teamError);

      if (teamError) {
        console.error('Error fetching team members:', teamError);
      }

      // Combine the data
      const workersData = profiles?.map(profile => ({
        ...profile,
        team_member: teamMembers?.find(tm => tm.user_id === profile.id)
      })) || [];

      console.log('Final workers data:', workersData);
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
      // Call the edge function to delete the worker
      const { data, error } = await supabase.functions.invoke('delete-worker', {
        body: { workerId }
      });

      if (error) {
        console.error('Function error:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to delete worker",
          variant: "destructive",
        });
        return;
      }

      if (data.error) {
        toast({
          title: "Error",
          description: data.error,
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
    <Card>
      <CardHeader>
        <CardTitle>Workers ({workers.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {workers.map((worker) => (
              <TableRow key={worker.id}>
                <TableCell className="font-medium">
                  {worker.full_name || 'Unnamed Worker'}
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{worker.email}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {worker.team_member?.role_title && (
                    <Badge variant="secondary">{worker.team_member.role_title}</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {worker.team_member?.phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{worker.team_member.phone}</span>
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {worker.must_reset_password && (
                    <Badge variant="outline" className="text-orange-600 border-orange-600">
                      Password Reset Required
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(worker.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteWorker(worker.id, worker.full_name || 'Unnamed Worker')}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
