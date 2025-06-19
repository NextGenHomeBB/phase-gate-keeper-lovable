
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
          profiles!inner(full_name, email)
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

      // Transform the data to match our Task interface
      const typedTasks = (data || []).map(task => ({
        id: task.id,
        title: task.title,
        description: task.description || '',
        priority: task.priority as 'low' | 'medium' | 'high',
        status: task.status as 'pending' | 'in_progress' | 'completed',
        assignee_id: task.assignee_id,
        created_at: task.created_at,
        due_date: task.due_date,
        assigned_user: task.profiles ? {
          full_name: task.profiles.full_name || '',
          email: task.profiles.email || ''
        } : undefined
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
