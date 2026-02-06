-- Revert the too-permissive policy and create a proper solution
DROP POLICY IF EXISTS "Users can view their groups or any group for joining" ON public.groups;

-- Only show groups the user is actually a member of
CREATE POLICY "Users can view their groups"
  ON public.groups FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT group_id FROM public.group_members
      WHERE user_id = auth.uid()
    )
  );

-- Create a function to look up groups by invite code (bypasses RLS for join flow)
CREATE OR REPLACE FUNCTION public.get_group_by_invite_code(code TEXT)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  created_by UUID,
  invite_code TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    g.id,
    g.name,
    g.description,
    g.created_by,
    g.invite_code,
    g.created_at,
    g.updated_at
  FROM public.groups g
  WHERE LOWER(g.invite_code) = LOWER(code);
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_group_by_invite_code(TEXT) TO authenticated;
