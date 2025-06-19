
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserPlus, Users, ClipboardList, ArrowLeft } from 'lucide-react';
import { CreateWorkerDialog } from './CreateWorkerDialog';
import { WorkersList } from './WorkersList';
import { useRoleBasedAccess } from '@/hooks/useRoleBasedAccess';
import { useNavigate } from 'react-router-dom';

export function AdminDashboard() {
  const [createWorkerOpen, setCreateWorkerOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { canCreateWorkers } = useRoleBasedAccess();
  const navigate = useNavigate();

  const handleWorkerCreated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleBackClick = () => {
    navigate('/');
  };

  if (!canCreateWorkers()) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">You don't have permission to access the admin dashboard.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleBackClick}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        </div>
      </div>

      <Tabs defaultValue="workers" className="space-y-6">
        <TabsList>
          <TabsTrigger value="workers" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Workers</span>
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex items-center space-x-2">
            <ClipboardList className="h-4 w-4" />
            <span>Tasks</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="workers" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>Worker Management</CardTitle>
              <Button 
                onClick={() => setCreateWorkerOpen(true)}
                className="flex items-center space-x-2"
              >
                <UserPlus className="h-4 w-4" />
                <span>Create Worker</span>
              </Button>
            </CardHeader>
            <CardContent>
              <WorkersList refreshTrigger={refreshTrigger} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Task Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Task management functionality coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <CreateWorkerDialog
        isOpen={createWorkerOpen}
        onClose={() => setCreateWorkerOpen(false)}
        onWorkerCreated={handleWorkerCreated}
      />
    </div>
  );
}
