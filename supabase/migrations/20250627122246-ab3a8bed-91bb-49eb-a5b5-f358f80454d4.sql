
-- Add new columns to project_materials table for manual materials
ALTER TABLE public.project_materials 
ADD COLUMN is_manual boolean NOT NULL DEFAULT false,
ADD COLUMN vat_percentage numeric DEFAULT 0;

-- Update the updated_at trigger to handle the new columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';
