/**
 * Game Schema Contracts
 *
 * TypeScript type definitions for Game, Team, and Player entities.
 * These types represent the core data structures for cricket match management.
 *
 * Used by:
 * - WatermelonDB models (src/models/Game.ts, Team.ts, Player.ts)
 * - Game setup wizard (app/game/[id]/setup.tsx)
 * - Match history (app/(tabs)/history.tsx)
 *
 * Relationships:
 * - Game (1) ──── (2) Team
 * - Team (1) ──── (8+) Player
 */

/**
 * Game status lifecycle:
 * - 'setup': Initial creation, teams and players being added
 * - 'in_progress': Innings are being scored
 * - 'completed': All innings finished, match summary available
 */
export type GameStatus = 'setup' | 'in_progress' | 'completed';

/**
 * Game entity
 *
 * Represents a complete cricket match including date, venue, teams, and settings.
 * Each game has exactly two teams (team_a and team_b).
 */
export interface Game {
  id: string; // UUID
  dateISO: string; // ISO 8601 format (e.g., "2025-11-07T14:30:00Z")
  venue?: string; // Optional venue name (e.g., "Memorial Park Oval")
  team_a_id: string; // Foreign key to Team
  team_b_id: string; // Foreign key to Team
  settings_scoring_enabled: boolean; // Enable detailed scoring mode (optional for MVP)
  status: GameStatus;
  created_at: number; // Unix timestamp (milliseconds)
  updated_at: number; // Unix timestamp (milliseconds)
}

/**
 * Input type for creating a new game
 * Excludes auto-generated fields (id, created_at, updated_at)
 */
export interface CreateGameInput {
  dateISO: string;
  venue?: string;
  settings_scoring_enabled?: boolean; // Defaults to true
}

/**
 * Team entity
 *
 * Represents a cricket team with a name and list of players.
 * Each game has exactly two teams.
 */
export interface Team {
  id: string; // UUID
  name: string; // 1-50 characters, must be unique within game
  game_id: string; // Foreign key to Game
  created_at: number; // Unix timestamp (milliseconds)
  updated_at: number; // Unix timestamp (milliseconds)
}

/**
 * Input type for creating a new team
 * Excludes auto-generated fields
 */
export interface CreateTeamInput {
  name: string; // Must be 1-50 characters
  game_id: string;
}

/**
 * Player entity
 *
 * Represents an individual player on a team.
 * Player names must be unique within each team.
 */
export interface Player {
  id: string; // UUID
  name: string; // 1-30 characters, unique within team
  team_id: string; // Foreign key to Team
  position: number; // 0-indexed position in team list (for display order)
  created_at: number; // Unix timestamp (milliseconds)
  updated_at: number; // Unix timestamp (milliseconds)
}

/**
 * Input type for creating a new player
 * Excludes auto-generated fields
 */
export interface CreatePlayerInput {
  name: string; // Must be 1-30 characters, unique within team
  team_id: string;
  position: number; // 0-indexed
}

/**
 * Batting pair allocation
 *
 * Represents two players batting together with their over allocation.
 * Used in the Innings entity's batting_pairs JSON field.
 */
export interface BattingPair {
  player1_id: string; // Foreign key to Player
  player2_id: string; // Foreign key to Player
  overs_planned: number; // Default: 4 (Friday Cricket rule)
  overs_completed: number; // Computed from Over records
}

/**
 * Bowling allocation
 *
 * Represents a player's bowling allocation.
 * Used for tracking bowling rotation and ensuring minimum 1 over per player.
 */
export interface BowlingAllocation {
  player_id: string; // Foreign key to Player
  overs_allocated: number; // Minimum: 1 (Friday Cricket rule)
  overs_completed: number; // Computed from Over records
}

/**
 * Game with teams (joined data)
 *
 * Represents a game with its associated teams populated.
 * Used for display in match history and game setup wizard.
 */
export interface GameWithTeams extends Game {
  team_a: Team;
  team_b: Team;
}

/**
 * Team with players (joined data)
 *
 * Represents a team with its players populated.
 * Used for team management and display.
 */
export interface TeamWithPlayers extends Team {
  players: Player[];
}

/**
 * Match history entry (summary view)
 *
 * Lightweight representation of a game for history list display.
 */
export interface MatchHistoryEntry {
  id: string;
  dateISO: string;
  venue?: string;
  team_a_name: string;
  team_b_name: string;
  team_a_score?: string; // Format: "123/4" (runs/wickets)
  team_b_score?: string; // Format: "120/6"
  result?: string; // e.g., "Team A won by 3 runs", "Tie", "In Progress"
  status: GameStatus;
}
