-- Fix RLS policies that use 'true' for proper user-based restrictions

-- Update project_phases policies to use proper user restrictions
DROP POLICY IF EXISTS "Users can view project phases" ON project_phases;
DROP POLICY IF EXISTS "Users can insert project phases" ON project_phases;
DROP POLICY IF EXISTS "Users can update project phases" ON project_phases;
DROP POLICY IF EXISTS "Users can delete project phases" ON project_phases;

CREATE POLICY "Users can view project phases for accessible projects" 
ON project_phases 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM projects p 
  WHERE p.id = project_phases.project_id
));

CREATE POLICY "Authenticated users can insert project phases" 
ON project_phases 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL AND EXISTS (
  SELECT 1 FROM projects p 
  WHERE p.id = project_phases.project_id
));

CREATE POLICY "Authenticated users can update project phases" 
ON project_phases 
FOR UPDATE 
USING (auth.uid() IS NOT NULL AND EXISTS (
  SELECT 1 FROM projects p 
  WHERE p.id = project_phases.project_id
));

CREATE POLICY "Authenticated users can delete project phases" 
ON project_phases 
FOR DELETE 
USING (auth.uid() IS NOT NULL AND EXISTS (
  SELECT 1 FROM projects p 
  WHERE p.id = project_phases.project_id
));

-- Update project_checklist_items policies for proper user restrictions
DROP POLICY IF EXISTS "Users can view checklist items for their projects" ON project_checklist_items;
DROP POLICY IF EXISTS "Users can insert checklist items for their projects" ON project_checklist_items;
DROP POLICY IF EXISTS "Users can update checklist items for their projects" ON project_checklist_items;
DROP POLICY IF EXISTS "Users can delete checklist items for their projects" ON project_checklist_items;

CREATE POLICY "Users can view checklist items for accessible projects" 
ON project_checklist_items 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM projects p 
  WHERE p.id = project_checklist_items.project_id
));

CREATE POLICY "Authenticated users can insert checklist items" 
ON project_checklist_items 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL AND EXISTS (
  SELECT 1 FROM projects p 
  WHERE p.id = project_checklist_items.project_id
));

CREATE POLICY "Authenticated users can update checklist items" 
ON project_checklist_items 
FOR UPDATE 
USING (auth.uid() IS NOT NULL AND EXISTS (
  SELECT 1 FROM projects p 
  WHERE p.id = project_checklist_items.project_id
));

CREATE POLICY "Authenticated users can delete checklist items" 
ON project_checklist_items 
FOR DELETE 
USING (auth.uid() IS NOT NULL AND EXISTS (
  SELECT 1 FROM projects p 
  WHERE p.id = project_checklist_items.project_id
));

-- Update sub_contractors policies to require authentication
DROP POLICY IF EXISTS "Users can view all sub_contractors" ON sub_contractors;
DROP POLICY IF EXISTS "Users can create sub_contractors" ON sub_contractors;
DROP POLICY IF EXISTS "Users can update sub_contractors" ON sub_contractors;
DROP POLICY IF EXISTS "Users can delete sub_contractors" ON sub_contractors;

CREATE POLICY "Authenticated users can view sub_contractors" 
ON sub_contractors 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create sub_contractors" 
ON sub_contractors 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update sub_contractors" 
ON sub_contractors 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete sub_contractors" 
ON sub_contractors 
FOR DELETE 
USING (auth.uid() IS NOT NULL);

-- Add RLS policies for project_labour table (currently has none)
CREATE POLICY "Users can view labour for accessible projects" 
ON project_labour 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM projects p 
  WHERE p.id = project_labour.project_id
));

CREATE POLICY "Authenticated users can insert project labour" 
ON project_labour 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL AND EXISTS (
  SELECT 1 FROM projects p 
  WHERE p.id = project_labour.project_id
));

CREATE POLICY "Authenticated users can update project labour" 
ON project_labour 
FOR UPDATE 
USING (auth.uid() IS NOT NULL AND EXISTS (
  SELECT 1 FROM projects p 
  WHERE p.id = project_labour.project_id
));

CREATE POLICY "Authenticated users can delete project labour" 
ON project_labour 
FOR DELETE 
USING (auth.uid() IS NOT NULL AND EXISTS (
  SELECT 1 FROM projects p 
  WHERE p.id = project_labour.project_id
));