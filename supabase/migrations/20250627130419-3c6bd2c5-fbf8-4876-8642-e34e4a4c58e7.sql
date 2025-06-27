
-- Create sub_contractors table
CREATE TABLE public.sub_contractors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  trade_specialty TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.sub_contractors ENABLE ROW LEVEL SECURITY;

-- Create policies for sub_contractors
CREATE POLICY "Users can view all sub_contractors" 
  ON public.sub_contractors 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can create sub_contractors" 
  ON public.sub_contractors 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Users can update sub_contractors" 
  ON public.sub_contractors 
  FOR UPDATE 
  USING (true);

CREATE POLICY "Users can delete sub_contractors" 
  ON public.sub_contractors 
  FOR DELETE 
  USING (true);

-- Add updated_at trigger
CREATE TRIGGER update_sub_contractors_updated_at 
  BEFORE UPDATE ON public.sub_contractors 
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add optional subcontractor_id to project_labour table
ALTER TABLE public.project_labour 
ADD COLUMN subcontractor_id UUID REFERENCES public.sub_contractors(id);
