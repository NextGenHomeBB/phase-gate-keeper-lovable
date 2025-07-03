-- Add category start dates column to projects table
ALTER TABLE public.projects 
ADD COLUMN category_start_dates JSONB DEFAULT NULL;

-- Add a comment to describe the structure
COMMENT ON COLUMN public.projects.category_start_dates IS 'JSON object storing start dates for construction categories: {"inbouwmaterialen": "2024-01-15", "vloeren": "2024-01-20", etc.}';