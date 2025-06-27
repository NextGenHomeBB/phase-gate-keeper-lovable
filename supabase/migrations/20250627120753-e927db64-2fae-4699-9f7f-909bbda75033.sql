
-- Add color field to project_phases table to store custom phase colors
ALTER TABLE public.project_phases 
ADD COLUMN color_index integer DEFAULT NULL;

-- Add comment to explain the color_index field
COMMENT ON COLUMN public.project_phases.color_index IS 'Index of the custom color selected for this phase (0-14), NULL means use default color based on phase position';
