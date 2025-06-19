
import React from 'react';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Task } from '@/types/task';
import { TaskRow } from './TaskRow';

interface TasksTableProps {
  tasks: Task[];
  onDeleteTask: (taskId: string, taskTitle: string) => void;
}

export function TasksTable({ tasks, onDeleteTask }: TasksTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Assigned To</TableHead>
          <TableHead>Priority</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Due Date</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tasks.map((task) => (
          <TaskRow
            key={task.id}
            task={task}
            onDelete={onDeleteTask}
          />
        ))}
      </TableBody>
    </Table>
  );
}
