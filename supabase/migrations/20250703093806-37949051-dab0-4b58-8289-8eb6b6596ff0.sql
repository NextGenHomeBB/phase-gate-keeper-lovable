-- Add date and duration fields to project_phases table
ALTER TABLE public.project_phases 
ADD COLUMN start_date DATE,
ADD COLUMN end_date DATE,
ADD COLUMN actual_start_date DATE,
ADD COLUMN actual_end_date DATE,
ADD COLUMN estimated_duration_days INTEGER;

-- Create function to automatically calculate duration when dates are updated
CREATE OR REPLACE FUNCTION calculate_phase_duration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.start_date IS NOT NULL AND NEW.end_date IS NOT NULL THEN
    NEW.estimated_duration_days = NEW.end_date - NEW.start_date + 1;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically calculate duration
CREATE TRIGGER trigger_calculate_phase_duration
  BEFORE INSERT OR UPDATE ON public.project_phases
  FOR EACH ROW
  EXECUTE FUNCTION calculate_phase_duration();