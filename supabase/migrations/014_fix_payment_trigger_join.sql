-- Fix the payment trigger function - need to join to groups table to get buy_in_amount
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

  -- Count user's squares in all games within this group
  SELECT COUNT(*) INTO v_square_count
  FROM public.squares s
  INNER JOIN public.games g ON s.game_id = g.id
  WHERE g.group_id = v_group_id
  AND s.user_id = NEW.user_id;

  -- Insert or update payment record
  INSERT INTO public.user_payments (group_id, user_id, amount_owed)
  VALUES (
    v_group_id,
    NEW.user_id,
    v_square_count * v_buy_in
  )
  ON CONFLICT (group_id, user_id)
  DO UPDATE SET
    amount_owed = v_square_count * v_buy_in,
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS update_payment_on_square_claim ON public.squares;
CREATE TRIGGER update_payment_on_square_claim
  AFTER INSERT OR UPDATE OF user_id ON public.squares
  FOR EACH ROW
  WHEN (NEW.user_id IS NOT NULL)
  EXECUTE FUNCTION update_user_payment_amount();
