-- Set search path and restrict access for the cleanup function
ALTER FUNCTION public.delete_old_app_logs() SET search_path = public;
REVOKE EXECUTE ON FUNCTION public.delete_old_app_logs() FROM public;
REVOKE EXECUTE ON FUNCTION public.delete_old_app_logs() FROM anon;
REVOKE EXECUTE ON FUNCTION public.delete_old_app_logs() FROM authenticated;

-- Ensure the select policy is as tight as possible
DROP POLICY IF EXISTS "Admins can view all logs" ON public.app_logs;
CREATE POLICY "Admins can view all logs"
ON public.app_logs
FOR SELECT
USING (auth.jwt() ->> 'email' = 'isaiahmaximowork@gmail.com');
