-- Add policy to allow group creators to delete their groups
CREATE POLICY "Group creators can delete groups"
  ON public.groups FOR DELETE
  USING (created_by = auth.uid());
