-- Create a team_member_roles table to store multiple roles per team member
CREATE TABLE public.team_member_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_member_id UUID NOT NULL,
  role_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(team_member_id, role_name)
);

-- Enable Row Level Security
ALTER TABLE public.team_member_roles ENABLE ROW LEVEL SECURITY;

-- Create policies for team_member_roles
CREATE POLICY "Users can view all team member roles" 
ON public.team_member_roles 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage team member roles" 
ON public.team_member_roles 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add foreign key constraint
ALTER TABLE public.team_member_roles 
ADD CONSTRAINT fk_team_member_roles_team_member 
FOREIGN KEY (team_member_id) REFERENCES public.team_members(id) ON DELETE CASCADE;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_team_member_roles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_team_member_roles_updated_at
BEFORE UPDATE ON public.team_member_roles
FOR EACH ROW
EXECUTE FUNCTION public.update_team_member_roles_updated_at();