
export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
  assignee_id: string;
  created_at: string;
  due_date: string;
  assigned_user?: {
    full_name: string;
    email: string;
  };
}
