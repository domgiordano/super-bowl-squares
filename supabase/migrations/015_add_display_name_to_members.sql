-- Allow user_id to be nullable and add display_name for name-only members
ALTER TABLE group_members
  ALTER COLUMN user_id DROP NOT NULL,
  ADD COLUMN display_name TEXT;

-- Add a check constraint to ensure either user_id or display_name exists
ALTER TABLE group_members
  ADD CONSTRAINT user_or_name_required
  CHECK (user_id IS NOT NULL OR display_name IS NOT NULL);

-- Update unique constraint to consider display_name as well
-- First drop the old unique constraint if it exists
ALTER TABLE group_members
  DROP CONSTRAINT IF EXISTS group_members_group_id_user_id_key;

-- Create a partial unique index for user_id members (when user_id is not null)
CREATE UNIQUE INDEX group_members_group_user_unique
  ON group_members(group_id, user_id)
  WHERE user_id IS NOT NULL;
