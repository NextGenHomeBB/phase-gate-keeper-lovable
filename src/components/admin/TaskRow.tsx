
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import { Trash2, Calendar, User } from 'lucide-react';
import { Task } from '@/types/task';
import { getPriorityColor, getStatusColor } from '@/utils/taskUtils';

interface TaskRowProps {
  task: Task;
  onDelete: (taskId: string, taskTitle: string) => void;
}

export function TaskRow({ task, onDelete }: TaskRowProps) {
  return (
    <TableRow>
      <TableCell className="font-medium">
        <div>
          <div className="font-semibold">{task.title}</div>
          {task.description && (
            <div className="text-sm text-muted-foreground mt-1">
              {task.description.length > 50 
                ? `${task.description.substring(0, 50)}...`
                : task.description
              }
            </div>
          )}
        </div>
      </TableCell>
      <TableCell>
        {task.assigned_user && (
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="font-medium">{task.assigned_user.full_name}</div>
              <div className="text-sm text-muted-foreground">{task.assigned_user.email}</div>
            </div>
          </div>
        )}
      </TableCell>
      <TableCell>
        <Badge variant="outline" className={getPriorityColor(task.priority)}>
          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className={getStatusColor(task.status)}>
          {task.status.replace('_', ' ').charAt(0).toUpperCase() + task.status.replace('_', ' ').slice(1)}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{new Date(task.due_date).toLocaleDateString()}</span>
        </div>
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {new Date(task.created_at).toLocaleDateString()}
      </TableCell>
      <TableCell className="text-right">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(task.id, task.title)}
          className="text-red-600 hover:text-red-700"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
}
