-- Extend projects table with renovation and splitting project information
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS postal_code TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS building_year INTEGER;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS existing_building_type TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS transformation_description TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS number_of_units_after_split INTEGER;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS unit_areas JSONB; -- Array of {unit: string, go_area: number, bvo_area?: number}
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS unit_purposes JSONB; -- Array of {unit: string, purpose: 'verhuur' | 'verkoop'}
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS installation_concept JSONB; -- {heating: string, ventilation: string, electrical: string}
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS unit_access_type TEXT; -- 'gemeenschappelijke_entree' | 'eigen_opgang'
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS energy_labels JSONB; -- Array of {unit: string, current?: string, planned?: string}
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS project_manager TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS executor TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS planned_delivery_date DATE;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS special_considerations TEXT;