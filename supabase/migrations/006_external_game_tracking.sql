-- Add external game tracking for API integration
ALTER TABLE public.games
ADD COLUMN external_game_key TEXT, -- API-specific game identifier
ADD COLUMN auto_update_enabled BOOLEAN DEFAULT true, -- Enable/disable auto-updates
ADD COLUMN last_api_sync TIMESTAMPTZ; -- Last time we synced with external API

-- Index for finding games to auto-update
CREATE INDEX idx_games_auto_update ON public.games(auto_update_enabled, current_quarter)
  WHERE auto_update_enabled = true AND current_quarter IN ('Q1', 'Q2', 'Q3', 'Q4');

-- Add comment
COMMENT ON COLUMN public.games.external_game_key IS 'External API game identifier (e.g., SportsData GameKey, Sportradar game ID)';
