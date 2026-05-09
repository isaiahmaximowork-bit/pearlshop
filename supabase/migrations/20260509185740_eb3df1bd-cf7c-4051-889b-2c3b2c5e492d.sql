-- Create a table for application logs
CREATE TABLE IF NOT EXISTS public.app_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  level TEXT NOT NULL, -- 'error', 'warn', 'info'
  message TEXT NOT NULL,
  context TEXT, -- e.g. 'ErrorBoundary', 'Studio', 'Auth'
  metadata JSONB DEFAULT '{}'::jsonb,
  user_id UUID REFERENCES auth.users(id),
  user_agent TEXT,
  url TEXT
);

-- Enable RLS
ALTER TABLE public.app_logs ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert logs (anonymous error reporting)
CREATE POLICY "Anyone can insert logs" 
ON public.app_logs 
FOR INSERT 
WITH CHECK (true);

-- Only admins can view logs (using the service role or a specific admin check)
-- For now, let's allow the authenticated user to see their own logs if they want, 
-- but strictly speaking, this is for developer debugging via Supabase dashboard.
CREATE POLICY "Admins can view all logs"
ON public.app_logs
FOR SELECT
USING (auth.jwt() ->> 'email' = 'isaiahmaximowork@gmail.com');

-- Function to delete logs older than 30 days
CREATE OR REPLACE FUNCTION delete_old_app_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM public.app_logs WHERE created_at < now() - interval '30 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
