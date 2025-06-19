
-- Add proper foreign key constraint between tasks.assignee_id and profiles.id
ALTER TABLE public.tasks 
ADD CONSTRAINT fk_tasks_assignee_profiles 
FOREIGN KEY (assignee_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Enable RLS on tasks table (if not already enabled)
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Workers can view their assigned tasks" ON public.tasks;
DROP POLICY IF EXISTS "Workers can update their assigned tasks" ON public.tasks;
DROP POLICY IF EXISTS "Admins can insert tasks" ON public.tasks;
DROP POLICY IF EXISTS "Admins can delete tasks" ON public.tasks;

-- Create a security definer function to get user role (avoiding RLS recursion)
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS app_role
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT role 
  FROM public.user_roles 
  WHERE user_id = auth.uid()
  ORDER BY 
    CASE role
      WHEN 'admin' THEN 1
      WHEN 'manager' THEN 2
      WHEN 'user' THEN 3
      WHEN 'worker' THEN 4
    END
  LIMIT 1;
$$;

-- RLS Policies for tasks table with proper role checking
-- Admins can see all tasks
CREATE POLICY "Admins can view all tasks"
  ON public.tasks
  FOR SELECT
  USING (public.get_current_user_role() = 'admin');

-- Workers can only see tasks assigned to them
CREATE POLICY "Workers can view assigned tasks"
  ON public.tasks
  FOR SELECT
  USING (
    assignee_id = auth.uid() AND 
    public.get_current_user_role() = 'worker'
  );

-- Managers can see all tasks
CREATE POLICY "Managers can view all tasks"
  ON public.tasks
  FOR SELECT
  USING (public.get_current_user_role() = 'manager');

-- Workers can update their assigned tasks
CREATE POLICY "Workers can update assigned tasks"
  ON public.tasks
  FOR UPDATE
  USING (
    assignee_id = auth.uid() AND 
    public.get_current_user_role() = 'worker'
  );

-- Admins and managers can update all tasks
CREATE POLICY "Admins and managers can update all tasks"
  ON public.tasks
  FOR UPDATE
  USING (
    public.get_current_user_role() IN ('admin', 'manager')
  );

-- Only admins can insert and delete tasks
CREATE POLICY "Admins can insert tasks"
  ON public.tasks
  FOR INSERT
  WITH CHECK (public.get_current_user_role() = 'admin');

CREATE POLICY "Admins can delete tasks"
  ON public.tasks
  FOR DELETE
  USING (public.get_current_user_role() = 'admin');
