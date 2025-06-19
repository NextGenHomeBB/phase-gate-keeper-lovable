
-- First, let's add the checklist_item_id column without the foreign key constraint for now
ALTER TABLE project_materials 
ADD COLUMN checklist_item_id text;

-- Create an index for better performance when querying materials by checklist item
CREATE INDEX idx_project_materials_checklist_item_id ON project_materials(checklist_item_id);

-- Note: We're not adding a foreign key constraint since item_id in project_checklist_items 
-- is not unique (it's a custom identifier, not the primary key)
-- The relationship will be maintained through application logic
