
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTasks } from '@/hooks/useTasks';
import { TasksTable } from './TasksTable';
import { TasksEmptyState } from './TasksEmptyState';

interface TasksListProps {
  refreshTrigger: number;
}

export function TasksList({ refreshTrigger }: TasksListProps) {
  const { tasks, loading, deleteTask } = useTasks(refreshTrigger);

  if (loading) {
    return <div className="text-center py-4">Loading tasks...</div>;
  }

  if (tasks.length === 0) {
    return <TasksEmptyState />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tasks ({tasks.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <TasksTable tasks={tasks} onDeleteTask={deleteTask} />
      </CardContent>
    </Card>
  );
}
