
-- Restrict quote insert: name must be non-empty
DROP POLICY "anyone insert quote" ON public.quotes;
CREATE POLICY "anyone insert quote" ON public.quotes
  FOR INSERT TO anon, authenticated
  WITH CHECK (length(trim(name)) > 0 AND length(name) <= 200 AND length(coalesce(message,'')) <= 5000);

-- Revoke execute on SECURITY DEFINER functions from public/anon
REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_updated_at_column() TO service_role;
