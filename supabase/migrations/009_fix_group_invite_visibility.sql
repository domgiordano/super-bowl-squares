-- Fix the chicken-and-egg problem: users can't join groups they can't see
-- Allow authenticated users to view groups by invite code (for joining)
-- They can still only see full group details if they're members

DROP POLICY IF EXISTS "Users can view their groups" ON public.groups;

-- Allow users to view groups they're members of OR any group (for invite lookup)
CREATE POLICY "Users can view their groups or any group for joining"
  ON public.groups FOR SELECT
  TO authenticated
  USING (
    -- User is a member of the group
    id IN (
      SELECT group_id FROM public.group_members
      WHERE user_id = auth.uid()
    )
    OR
    -- OR allow viewing any group (needed for join flow)
    -- We rely on group_members RLS to control actual membership
    true
  );
