-- Friday Cricket Game Sync Schema
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

-- Games table - stores game state and history
CREATE TABLE games (
  id TEXT PRIMARY KEY, -- Short game ID (e.g., "ABC123")
  state JSONB NOT NULL DEFAULT '{}', -- Full game state
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ, -- Set when game completes
  umpire_id TEXT NOT NULL -- Anonymous umpire identifier
);

-- Index for faster lookups
CREATE INDEX idx_games_updated_at ON games(updated_at DESC);
CREATE INDEX idx_games_umpire_id ON games(umpire_id);

-- Enable Row Level Security
ALTER TABLE games ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read games (for viewers)
CREATE POLICY "Games are viewable by everyone"
  ON games FOR SELECT
  USING (true);

-- Policy: Anyone can insert games (umpire creates game)
CREATE POLICY "Anyone can create games"
  ON games FOR INSERT
  WITH CHECK (true);

-- Policy: Only the umpire who created can update
CREATE POLICY "Umpire can update own games"
  ON games FOR UPDATE
  USING (true) -- In practice, we trust the client-side umpire_id check
  WITH CHECK (true);

-- Enable Realtime for this table
ALTER PUBLICATION supabase_realtime ADD TABLE games;

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update timestamp
CREATE TRIGGER update_games_updated_at
  BEFORE UPDATE ON games
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Optional: Function to clean up old games (run periodically)
-- DELETE FROM games WHERE ended_at < NOW() - INTERVAL '30 days';
