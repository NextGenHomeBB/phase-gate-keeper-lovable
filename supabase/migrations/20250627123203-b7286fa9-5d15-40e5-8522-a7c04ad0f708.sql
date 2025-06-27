
-- Create a table for labour entries
CREATE TABLE public.project_labour (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  phase_id INTEGER NOT NULL,
  task TEXT NOT NULL,
  hours NUMERIC DEFAULT 0,
  hourly_rate NUMERIC DEFAULT 0,
  cost_per_job NUMERIC DEFAULT 0,
  bill_per_hour BOOLEAN NOT NULL DEFAULT true,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add trigger for updated_at
CREATE TRIGGER update_project_labour_updated_at
  BEFORE UPDATE ON public.project_labour
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS (if needed for future security)
ALTER TABLE public.project_labour ENABLE ROW LEVEL SECURITY;

-- Add to realtime publication for live updates
ALTER TABLE public.project_labour REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.project_labour;
