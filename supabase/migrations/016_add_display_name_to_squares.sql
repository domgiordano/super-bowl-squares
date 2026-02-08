-- Add display_name to squares for name-only member assignments
ALTER TABLE squares
  ADD COLUMN display_name TEXT;

-- Add a check constraint to ensure either user_id or display_name exists when square is claimed
ALTER TABLE squares
  ADD CONSTRAINT user_or_display_name_check
  CHECK (
    (user_id IS NULL AND display_name IS NULL) OR  -- unclaimed
    (user_id IS NOT NULL AND display_name IS NULL) OR  -- claimed by authenticated user
    (user_id IS NULL AND display_name IS NOT NULL)  -- claimed by name-only member
  );
