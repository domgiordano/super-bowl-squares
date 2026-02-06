-- Add score tracking columns to games table
ALTER TABLE public.games
ADD COLUMN home_score INTEGER DEFAULT 0,
ADD COLUMN away_score INTEGER DEFAULT 0,
ADD COLUMN current_quarter TEXT DEFAULT 'pregame', -- 'pregame', 'Q1', 'Q2', 'Q3', 'Q4', 'final'
ADD COLUMN last_score_update TIMESTAMPTZ;

-- Create quarter winners table
CREATE TABLE public.quarter_winners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES public.games(id) ON DELETE CASCADE NOT NULL,
  quarter TEXT NOT NULL, -- 'Q1', 'Q2', 'Q3', 'Q4', 'final'
  home_score INTEGER NOT NULL,
  away_score INTEGER NOT NULL,
  square_id UUID REFERENCES public.squares(id) ON DELETE SET NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(game_id, quarter)
);

-- Index for fast lookups
CREATE INDEX idx_quarter_winners_game_id ON public.quarter_winners(game_id);
CREATE INDEX idx_quarter_winners_square_id ON public.quarter_winners(square_id);

-- RLS policies for quarter_winners
ALTER TABLE public.quarter_winners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view quarter winners in their games"
  ON public.quarter_winners FOR SELECT
  USING (
    game_id IN (
      SELECT g.id FROM public.games g
      INNER JOIN public.group_members gm ON g.group_id = gm.group_id
      WHERE gm.user_id = auth.uid()
    )
  );

CREATE POLICY "Game creators can insert quarter winners"
  ON public.quarter_winners FOR INSERT
  WITH CHECK (
    game_id IN (
      SELECT id FROM public.games
      WHERE created_by = auth.uid()
    )
  );

-- Function to record quarter winner
CREATE OR REPLACE FUNCTION record_quarter_winner(
  p_game_id UUID,
  p_quarter TEXT
)
RETURNS TABLE(winner_square_id UUID, winner_user_id UUID, winner_name TEXT) AS $$
DECLARE
  v_home_score INTEGER;
  v_away_score INTEGER;
  v_home_numbers INTEGER[];
  v_away_numbers INTEGER[];
  v_home_digit INTEGER;
  v_away_digit INTEGER;
  v_home_index INTEGER;
  v_away_index INTEGER;
  v_winning_square RECORD;
BEGIN
  -- Get current game state
  SELECT home_score, away_score, home_numbers, away_numbers
  INTO v_home_score, v_away_score, v_home_numbers, v_away_numbers
  FROM public.games
  WHERE id = p_game_id;

  -- Can't record winner if numbers aren't assigned
  IF v_home_numbers IS NULL OR v_away_numbers IS NULL THEN
    RETURN;
  END IF;

  -- Get last digits
  v_home_digit := v_home_score % 10;
  v_away_digit := v_away_score % 10;

  -- Find index positions
  SELECT array_position(v_home_numbers, v_home_digit) - 1 INTO v_home_index;
  SELECT array_position(v_away_numbers, v_away_digit) - 1 INTO v_away_index;

  -- Find winning square
  SELECT s.id, s.user_id, COALESCE(p.full_name, p.email) as name
  INTO v_winning_square
  FROM public.squares s
  LEFT JOIN public.profiles p ON s.user_id = p.id
  WHERE s.game_id = p_game_id
    AND s.row = v_home_index
    AND s.col = v_away_index;

  -- Record the winner (upsert in case we're updating)
  INSERT INTO public.quarter_winners (game_id, quarter, home_score, away_score, square_id, user_id)
  VALUES (p_game_id, p_quarter, v_home_score, v_away_score, v_winning_square.id, v_winning_square.user_id)
  ON CONFLICT (game_id, quarter)
  DO UPDATE SET
    home_score = EXCLUDED.home_score,
    away_score = EXCLUDED.away_score,
    square_id = EXCLUDED.square_id,
    user_id = EXCLUDED.user_id,
    recorded_at = NOW();

  -- Return winner info
  RETURN QUERY
  SELECT v_winning_square.id, v_winning_square.user_id, v_winning_square.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
