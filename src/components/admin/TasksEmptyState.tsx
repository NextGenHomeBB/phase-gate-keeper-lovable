
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

export function TasksEmptyState() {
  return (
    <Card>
      <CardContent className="text-center py-8">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-muted-foreground">No tasks found. Create your first task to get started.</p>
      </CardContent>
    </Card>
  );
}
