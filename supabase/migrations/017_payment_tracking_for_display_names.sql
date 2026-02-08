-- Update user_payments table to support name-only members
ALTER TABLE user_payments
  ALTER COLUMN user_id DROP NOT NULL,
  ADD COLUMN display_name TEXT;

-- Add constraint to ensure either user_id or display_name exists
ALTER TABLE user_payments
  ADD CONSTRAINT user_or_display_name_required
  CHECK (user_id IS NOT NULL OR display_name IS NOT NULL);

-- Drop the old unique constraint
ALTER TABLE user_payments
  DROP CONSTRAINT IF EXISTS user_payments_group_id_user_id_key;

-- Create partial unique indexes for both cases
CREATE UNIQUE INDEX user_payments_group_user_unique
  ON user_payments(group_id, user_id)
  WHERE user_id IS NOT NULL;

CREATE UNIQUE INDEX user_payments_group_display_name_unique
  ON user_payments(group_id, display_name)
  WHERE display_name IS NOT NULL;

-- Update the trigger function to handle both user_id and display_name
DROP FUNCTION IF EXISTS update_user_payment_amount() CASCADE;

CREATE OR REPLACE FUNCTION update_user_payment_amount()
RETURNS TRIGGER AS $$
DECLARE
  v_buy_in DECIMAL(10,2);
  v_group_id UUID;
  v_square_count INT;
BEGIN
  -- Get group_id and buy_in_amount by joining games to groups
  SELECT gr.id, gr.buy_in_amount INTO v_group_id, v_buy_in
  FROM public.games g
  INNER JOIN public.groups gr ON g.group_id = gr.id
  WHERE g.id = NEW.game_id;

  -- Handle authenticated users (with user_id)
  IF NEW.user_id IS NOT NULL THEN
    -- Count user's squares in all games within this group
    SELECT COUNT(*) INTO v_square_count
    FROM public.squares s
    INNER JOIN public.games g ON s.game_id = g.id
    WHERE g.group_id = v_group_id
    AND s.user_id = NEW.user_id;

    -- Insert or update payment record for authenticated user
    INSERT INTO public.user_payments (group_id, user_id, display_name, amount_owed)
    VALUES (
      v_group_id,
      NEW.user_id,
      NULL,
      v_square_count * v_buy_in
    )
    ON CONFLICT (group_id, user_id) WHERE user_id IS NOT NULL
    DO UPDATE SET
      amount_owed = v_square_count * v_buy_in,
      updated_at = NOW();

  -- Handle name-only members (with display_name)
  ELSIF NEW.display_name IS NOT NULL THEN
    -- Count display_name's squares in all games within this group
    SELECT COUNT(*) INTO v_square_count
    FROM public.squares s
    INNER JOIN public.games g ON s.game_id = g.id
    WHERE g.group_id = v_group_id
    AND s.display_name = NEW.display_name;

    -- Insert or update payment record for name-only member
    INSERT INTO public.user_payments (group_id, user_id, display_name, amount_owed)
    VALUES (
      v_group_id,
      NULL,
      NEW.display_name,
      v_square_count * v_buy_in
    )
    ON CONFLICT (group_id, display_name) WHERE display_name IS NOT NULL
    DO UPDATE SET
      amount_owed = v_square_count * v_buy_in,
      updated_at = NOW();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger to fire for both user_id and display_name
DROP TRIGGER IF EXISTS update_payment_on_square_claim ON public.squares;
CREATE TRIGGER update_payment_on_square_claim
  AFTER INSERT OR UPDATE OF user_id, display_name ON public.squares
  FOR EACH ROW
  WHEN (NEW.user_id IS NOT NULL OR NEW.display_name IS NOT NULL)
  EXECUTE FUNCTION update_user_payment_amount();
