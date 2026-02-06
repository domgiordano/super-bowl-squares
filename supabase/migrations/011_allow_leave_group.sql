-- Allow users to remove themselves from groups (leave group functionality)
CREATE POLICY "Users can remove themselves from groups"
  ON public.group_members FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());
