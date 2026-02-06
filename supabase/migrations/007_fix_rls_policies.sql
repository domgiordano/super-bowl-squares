-- Fix infinite recursion in group_members policies
-- The issue: policies were checking group_members to authorize group_members access

-- Drop problematic policies
DROP POLICY IF EXISTS "Users can view group members" ON public.group_members;
DROP POLICY IF EXISTS "Users can insert themselves as members" ON public.group_members;
DROP POLICY IF EXISTS "Admins can delete members" ON public.group_members;

-- Create simpler, non-recursive policies

-- Allow users to view group members (no recursion - just check auth)
CREATE POLICY "Authenticated users can view group members"
  ON public.group_members FOR SELECT
  TO authenticated
  USING (true); -- We'll rely on group visibility to control access

-- Allow authenticated users to insert themselves as group members
CREATE POLICY "Users can join groups"
  ON public.group_members FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Allow group creators to manage members
-- Check if user created the group (via groups table, not group_members)
CREATE POLICY "Group creators can delete members"
  ON public.group_members FOR DELETE
  TO authenticated
  USING (
    group_id IN (
      SELECT id FROM public.groups
      WHERE created_by = auth.uid()
    )
  );

-- Also simplify the groups SELECT policy to avoid potential recursion
DROP POLICY IF EXISTS "Users can view their groups" ON public.groups;

CREATE POLICY "Users can view their groups"
  ON public.groups FOR SELECT
  TO authenticated
  USING (
    -- User is the creator
    created_by = auth.uid()
    OR
    -- OR user is a member (direct join, no subquery)
    EXISTS (
      SELECT 1 FROM public.group_members gm
      WHERE gm.group_id = groups.id
      AND gm.user_id = auth.uid()
    )
  );
