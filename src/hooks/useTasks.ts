
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Task } from '@/types/task';

export function useTasks(refreshTrigger: number) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTasks = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          assigned_user:profiles!tasks_assignee_id_fkey(full_name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tasks:', error);
        toast({
          title: "Error",
          description: "Failed to fetch tasks",
          variant: "destructive",
        });
        return;
      }

      // Type cast and filter the data to match our Task interface
      const typedTasks = (data || [])
        .filter(task => task.assigned_user && !('error' in task.assigned_user))
        .map(task => ({
          ...task,
          priority: task.priority as 'low' | 'medium' | 'high',
          status: task.status as 'pending' | 'in_progress' | 'completed',
          assigned_user: task.assigned_user as { full_name: string; email: string }
        }));

      setTasks(typedTasks);
    } catch (error) {
      console.error('Unexpected error fetching tasks:', error);
      toast({
        title: "Error",
        description: "Failed to fetch tasks",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async (taskId: string, taskTitle: string) => {
    if (!confirm(`Are you sure you want to delete task "${taskTitle}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) {
        console.error('Error deleting task:', error);
        toast({
          title: "Error",
          description: "Failed to delete task",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: `Task "${taskTitle}" has been deleted`,
      });

      fetchTasks();
    } catch (error) {
      console.error('Unexpected error deleting task:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [refreshTrigger]);

  return {
    tasks,
    loading,
    deleteTask
  };
}
