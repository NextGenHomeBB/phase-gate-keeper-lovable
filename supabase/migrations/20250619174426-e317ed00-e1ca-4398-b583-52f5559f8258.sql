
-- Create a table to store checklist items for project phases
CREATE TABLE public.project_checklist_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  phase_id INTEGER NOT NULL,
  item_id TEXT NOT NULL,
  description TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  required BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(project_id, phase_id, item_id)
);

-- Add foreign key constraint to projects table
ALTER TABLE public.project_checklist_items 
ADD CONSTRAINT fk_project_checklist_items_project 
FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;

-- Enable Row Level Security
ALTER TABLE public.project_checklist_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (assuming users can access projects they're associated with)
CREATE POLICY "Users can view checklist items for their projects"
ON public.project_checklist_items
FOR SELECT
USING (true); -- You may want to restrict this based on project access

CREATE POLICY "Users can insert checklist items for their projects"
ON public.project_checklist_items
FOR INSERT
WITH CHECK (true); -- You may want to restrict this based on project access

CREATE POLICY "Users can update checklist items for their projects"
ON public.project_checklist_items
FOR UPDATE
USING (true); -- You may want to restrict this based on project access

CREATE POLICY "Users can delete checklist items for their projects"
ON public.project_checklist_items
FOR DELETE
USING (true); -- You may want to restrict this based on project access

-- Create trigger to update the updated_at column
CREATE TRIGGER update_project_checklist_items_updated_at
BEFORE UPDATE ON public.project_checklist_items
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
