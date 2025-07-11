
-- Add admin role for effendi@live.nl
-- First, let's find the user ID for this email and add the admin role
INSERT INTO public.user_roles (user_id, role)
SELECT au.id, 'admin'::app_role
FROM auth.users au
WHERE au.email = 'effendi@live.nl'
AND NOT EXISTS (
  SELECT 1 FROM public.user_roles ur 
  WHERE ur.user_id = au.id AND ur.role = 'admin'::app_role
);
