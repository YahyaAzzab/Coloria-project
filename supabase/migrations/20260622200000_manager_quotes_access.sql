-- Allow the manager account to read and update quotes
-- The manager is identified by their fixed email address

-- Add RLS policy: manager can SELECT quotes
CREATE POLICY "manager_can_read_quotes"
  ON public.quotes
  FOR SELECT
  USING (
    auth.email() = 'dakarlom662@gmail.com'
  );

-- Add RLS policy: manager can UPDATE quote status
CREATE POLICY "manager_can_update_quote_status"
  ON public.quotes
  FOR UPDATE
  USING (
    auth.email() = 'dakarlom662@gmail.com'
  );
