
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserPlus, Users, ClipboardList, ArrowLeft, Plus, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CreateWorkerDialog } from './CreateWorkerDialog';
import { CreateTaskDialog } from './CreateTaskDialog';
import { WorkersList } from './WorkersList';
import { TasksList } from './TasksList';
import { useRoleBasedAccess } from '@/hooks/useRoleBasedAccess';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export function AdminDashboard() {
  const [createWorkerOpen, setCreateWorkerOpen] = useState(false);
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { canCreateWorkers, canManageTasks, loading: roleLoading } = useRoleBasedAccess();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const handleWorkerCreated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleTaskCreated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleBackClick = () => {
    navigate('/');
  };

  // Show loading while checking authentication or roles
  if (authLoading || roleLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Check if user is authenticated
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You must be logged in to access the admin dashboard. Please <a href="/auth" className="underline">sign in</a> first.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Check permissions
  if (!canCreateWorkers() && !canManageTasks()) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You don't have permission to access the admin dashboard. Required role: admin
          </AlertDescription>
        </Alert>
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
          {canCreateWorkers() && (
            <TabsTrigger value="workers" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Workers</span>
            </TabsTrigger>
          )}
          {canManageTasks() && (
            <TabsTrigger value="tasks" className="flex items-center space-x-2">
              <ClipboardList className="h-4 w-4" />
              <span>Tasks</span>
            </TabsTrigger>
          )}
        </TabsList>

        {canCreateWorkers() && (
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
        )}

        {canManageTasks() && (
          <TabsContent value="tasks" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle>Task Management</CardTitle>
                <Button 
                  onClick={() => setCreateTaskOpen(true)}
                  className="flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create Task</span>
                </Button>
              </CardHeader>
              <CardContent>
                <TasksList refreshTrigger={refreshTrigger} />
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {canCreateWorkers() && (
        <CreateWorkerDialog
          isOpen={createWorkerOpen}
          onClose={() => setCreateWorkerOpen(false)}
          onWorkerCreated={handleWorkerCreated}
        />
      )}

      {canManageTasks() && (
        <CreateTaskDialog
          isOpen={createTaskOpen}
          onClose={() => setCreateTaskOpen(false)}
          onTaskCreated={handleTaskCreated}
        />
      )}
    </div>
  );
}
