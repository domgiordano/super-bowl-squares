-- Add payment tracking fields to groups table
ALTER TABLE public.groups ADD COLUMN IF NOT EXISTS buy_in_amount DECIMAL(10,2) DEFAULT 0;
ALTER TABLE public.groups ADD COLUMN IF NOT EXISTS payout_q1 DECIMAL(5,2) DEFAULT 25;
ALTER TABLE public.groups ADD COLUMN IF NOT EXISTS payout_q2 DECIMAL(5,2) DEFAULT 25;
ALTER TABLE public.groups ADD COLUMN IF NOT EXISTS payout_q3 DECIMAL(5,2) DEFAULT 25;
ALTER TABLE public.groups ADD COLUMN IF NOT EXISTS payout_final DECIMAL(5,2) DEFAULT 25;

-- Create user_payments table to track who paid
CREATE TABLE IF NOT EXISTS public.user_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount_owed DECIMAL(10,2) NOT NULL DEFAULT 0,
  amount_paid DECIMAL(10,2) NOT NULL DEFAULT 0,
  is_paid BOOLEAN GENERATED ALWAYS AS (amount_paid >= amount_owed) STORED,
  last_payment_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- Enable RLS
ALTER TABLE public.user_payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_payments
CREATE POLICY "Users can view payments in their groups"
  ON public.user_payments FOR SELECT
  TO authenticated
  USING (
    group_id IN (
      SELECT group_id FROM public.group_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Group admins can update payments"
  ON public.user_payments FOR UPDATE
  TO authenticated
  USING (
    group_id IN (
      SELECT group_id FROM public.group_members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "System can insert/update payments"
  ON public.user_payments FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Function to update user payment amounts when squares are claimed/released
CREATE OR REPLACE FUNCTION update_user_payment_amount()
RETURNS TRIGGER AS $$
BEGIN
  -- Get the group's buy-in amount
  DECLARE
    v_buy_in DECIMAL(10,2);
    v_group_id UUID;
    v_square_count INT;
  BEGIN
    -- Get group_id from the square
    SELECT game_id INTO v_group_id FROM public.games WHERE id = NEW.game_id;
    SELECT buy_in_amount INTO v_buy_in FROM public.groups WHERE id = (SELECT group_id FROM public.games WHERE id = NEW.game_id);

    -- Count user's squares in this group
    SELECT COUNT(*) INTO v_square_count
    FROM public.squares s
    INNER JOIN public.games g ON s.game_id = g.id
    WHERE g.group_id = (SELECT group_id FROM public.games WHERE id = NEW.game_id)
    AND s.user_id = NEW.user_id;

    -- Insert or update payment record
    INSERT INTO public.user_payments (group_id, user_id, amount_owed)
    VALUES (
      (SELECT group_id FROM public.games WHERE id = NEW.game_id),
      NEW.user_id,
      v_square_count * v_buy_in
    )
    ON CONFLICT (group_id, user_id)
    DO UPDATE SET
      amount_owed = v_square_count * v_buy_in,
      updated_at = NOW();

    RETURN NEW;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update payments when squares change
DROP TRIGGER IF EXISTS update_payment_on_square_claim ON public.squares;
CREATE TRIGGER update_payment_on_square_claim
  AFTER INSERT OR UPDATE OF user_id ON public.squares
  FOR EACH ROW
  WHEN (NEW.user_id IS NOT NULL)
  EXECUTE FUNCTION update_user_payment_amount();

-- Remove max_squares_per_user constraint (set to high number)
ALTER TABLE public.games ALTER COLUMN max_squares_per_user SET DEFAULT 100;
