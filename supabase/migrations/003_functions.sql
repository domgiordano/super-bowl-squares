-- Function to initialize game squares (create 100 squares)
CREATE OR REPLACE FUNCTION initialize_game_squares(p_game_id UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO public.squares (game_id, row, col)
  SELECT p_game_id, row, col
  FROM generate_series(0, 9) AS row
  CROSS JOIN generate_series(0, 9) AS col;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to randomize numbers for both teams
CREATE OR REPLACE FUNCTION randomize_game_numbers(p_game_id UUID)
RETURNS void AS $$
DECLARE
  shuffled_numbers INTEGER[];
BEGIN
  -- Generate shuffled array of 0-9
  SELECT ARRAY_AGG(num ORDER BY random())
  INTO shuffled_numbers
  FROM generate_series(0, 9) AS num;

  UPDATE public.games
  SET
    home_numbers = shuffled_numbers,
    away_numbers = (
      SELECT ARRAY_AGG(num ORDER BY random())
      FROM generate_series(0, 9) AS num
    ),
    numbers_assigned_at = NOW(),
    status = 'locked'
  WHERE id = p_game_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to claim a square with optimistic locking
CREATE OR REPLACE FUNCTION claim_square(
  p_square_id UUID,
  p_user_id UUID,
  p_game_id UUID,
  p_expected_version INTEGER
)
RETURNS TABLE(success BOOLEAN, message TEXT, new_version INTEGER) AS $$
DECLARE
  v_current_version INTEGER;
  v_current_user_id UUID;
  v_game_status TEXT;
  v_user_square_count INTEGER;
  v_max_squares INTEGER;
BEGIN
  -- Get current square state
  SELECT version, user_id INTO v_current_version, v_current_user_id
  FROM public.squares
  WHERE id = p_square_id
  FOR UPDATE;

  -- Check version for optimistic locking
  IF v_current_version != p_expected_version THEN
    RETURN QUERY SELECT false, 'Square has been modified by another user', v_current_version;
    RETURN;
  END IF;

  -- Check if already claimed
  IF v_current_user_id IS NOT NULL THEN
    RETURN QUERY SELECT false, 'Square is already claimed', v_current_version;
    RETURN;
  END IF;

  -- Check game status
  SELECT status, max_squares_per_user INTO v_game_status, v_max_squares
  FROM public.games
  WHERE id = p_game_id;

  IF v_game_status != 'open' THEN
    RETURN QUERY SELECT false, 'Game is not open for square selection', v_current_version;
    RETURN;
  END IF;

  -- Check user's square limit
  SELECT COUNT(*) INTO v_user_square_count
  FROM public.squares
  WHERE game_id = p_game_id AND user_id = p_user_id;

  IF v_user_square_count >= v_max_squares THEN
    RETURN QUERY SELECT false, 'You have reached the maximum number of squares', v_current_version;
    RETURN;
  END IF;

  -- Claim the square
  UPDATE public.squares
  SET
    user_id = p_user_id,
    claimed_at = NOW(),
    version = version + 1
  WHERE id = p_square_id;

  RETURN QUERY SELECT true, 'Square claimed successfully', v_current_version + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
