
-- First, add "worker" to the app_role enum (this needs to be in its own transaction)
ALTER TYPE public.app_role ADD VALUE 'worker';
