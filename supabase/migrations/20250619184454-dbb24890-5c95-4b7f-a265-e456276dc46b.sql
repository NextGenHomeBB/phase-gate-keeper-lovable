
-- Add must_reset_password column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN must_reset_password boolean NOT NULL DEFAULT false;

-- Create tasks table with worker assignment capabilities
CREATE TABLE public.tasks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  assignee_id uuid REFERENCES auth.users(id),
  created_by uuid REFERENCES auth.users(id) NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  priority text NOT NULL DEFAULT 'medium',
  due_date timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create created_users_log table for audit trail
CREATE TABLE public.created_users_log (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id uuid REFERENCES auth.users(id) NOT NULL,
  email text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.created_users_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tasks table
-- Workers can only SELECT/UPDATE their assigned tasks
CREATE POLICY "Workers can view their assigned tasks"
  ON public.tasks
  FOR SELECT
  USING (
    -- Admins can see all tasks
    (SELECT role FROM public.user_roles WHERE user_id = auth.uid()) = 'admin' OR
    -- Workers can only see tasks assigned to them
    (assignee_id = auth.uid() AND (SELECT role FROM public.user_roles WHERE user_id = auth.uid()) = 'worker')
  );

CREATE POLICY "Workers can update their assigned tasks"
  ON public.tasks
  FOR UPDATE
  USING (
    -- Admins can update all tasks
    (SELECT role FROM public.user_roles WHERE user_id = auth.uid()) = 'admin' OR
    -- Workers can only update tasks assigned to them
    (assignee_id = auth.uid() AND (SELECT role FROM public.user_roles WHERE user_id = auth.uid()) = 'worker')
  );

-- Admins can insert and delete tasks
CREATE POLICY "Admins can insert tasks"
  ON public.tasks
  FOR INSERT
  WITH CHECK ((SELECT role FROM public.user_roles WHERE user_id = auth.uid()) = 'admin');

CREATE POLICY "Admins can delete tasks"
  ON public.tasks
  FOR DELETE
  USING ((SELECT role FROM public.user_roles WHERE user_id = auth.uid()) = 'admin');

-- RLS Policies for created_users_log table
-- Only admins can view and insert into the log
CREATE POLICY "Admins can view user creation log"
  ON public.created_users_log
  FOR SELECT
  USING ((SELECT role FROM public.user_roles WHERE user_id = auth.uid()) = 'admin');

CREATE POLICY "Admins can insert into user creation log"
  ON public.created_users_log
  FOR INSERT
  WITH CHECK ((SELECT role FROM public.user_roles WHERE user_id = auth.uid()) = 'admin');

-- Create updated_at trigger for tasks table
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
