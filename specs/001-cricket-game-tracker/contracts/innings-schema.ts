/**
 * Innings Schema Contracts
 *
 * TypeScript type definitions for Innings, Over, and OverEvent entities.
 * These types represent the scoring layer of the cricket match.
 *
 * Used by:
 * - WatermelonDB models (src/models/Innings.ts, Over.ts, OverEvent.ts)
 * - Scoring screen (app/game/[id]/scoring.tsx)
 * - Rule engine (src/services/ruleEngine.ts)
 * - Scoring engine (src/services/scoringEngine.ts)
 *
 * Relationships:
 * - Game (1) ──── (1-2) Innings
 * - Innings (1) ──── (16) Over
 * - Over (1) ──── (6+) OverEvent
 */

import { BattingPair } from './game-schema';

/**
 * Innings status lifecycle:
 * - 'pending': Innings not yet started (waiting for previous innings to complete)
 * - 'in_progress': Currently being scored
 * - 'completed': All overs finished or innings closed early
 */
export type InningsStatus = 'pending' | 'in_progress' | 'completed';

/**
 * Innings entity
 *
 * Represents one team's batting period including batting team, bowling team,
 * planned overs, and batting pair allocations.
 */
export interface Innings {
  id: string; // UUID
  game_id: string; // Foreign key to Game
  batting_team_id: string; // Foreign key to Team
  bowling_team_id: string; // Foreign key to Team
  innings_number: 1 | 2; // First or second innings
  overs_planned: number; // Default: 16 (Friday Cricket rule)
  overs_completed: number; // Computed from Over records (0-16)
  total_runs: number; // Computed from OverEvent records
  total_wickets: number; // Computed from OverEvent records (wicket events)
  batting_pairs: string; // JSON serialized BattingPair[] array
  status: InningsStatus;
  created_at: number; // Unix timestamp (milliseconds)
  updated_at: number; // Unix timestamp (milliseconds)
}

/**
 * Input type for creating a new innings
 * Excludes auto-generated and computed fields
 */
export interface CreateInningsInput {
  game_id: string;
  batting_team_id: string;
  bowling_team_id: string;
  innings_number: 1 | 2;
  overs_planned?: number; // Defaults to 16
  batting_pairs: BattingPair[]; // Will be JSON serialized
}

/**
 * Over entity
 *
 * Represents a set of 6 valid deliveries bowled by one bowler.
 * An over may contain more than 6 events due to wides and no-balls.
 */
export interface Over {
  id: string; // UUID
  innings_id: string; // Foreign key to Innings
  over_number: number; // 1-16 (or overs_planned)
  bowler_id: string; // Foreign key to Player
  balls_bowled: number; // Total events (including wides/no-balls)
  valid_balls: number; // 0-6 (excludes wides/no-balls)
  runs_scored: number; // Computed from OverEvent records
  wickets_taken: number; // Computed from OverEvent records
  created_at: number; // Unix timestamp (milliseconds)
  updated_at: number; // Unix timestamp (milliseconds)
}

/**
 * Input type for creating a new over
 * Excludes auto-generated and computed fields
 */
export interface CreateOverInput {
  innings_id: string;
  over_number: number; // 1-indexed
  bowler_id: string;
}

/**
 * Over event type enumeration
 *
 * Represents the different types of scoring events that can occur during a delivery.
 */
export type OverEventType =
  | 'run' // Valid delivery resulting in 0-6 runs
  | 'wicket' // Valid delivery resulting in a wicket (tracked as count only)
  | 'wide' // Wide delivery (extra run, does not count as valid ball)
  | 'noball' // No-ball delivery (extra run, does not count as valid ball)
  | 'badball_freehit'; // Bad ball (Friday Cricket rule) resulting in tee free hit

/**
 * OverEvent entity
 *
 * Represents a single delivery or extra during an over.
 * This is the atomic unit of cricket scoring.
 */
export interface OverEvent {
  id: string; // UUID
  over_id: string; // Foreign key to Over
  sequence: number; // 0-indexed sequence within the over (for ordering)
  event_type: OverEventType;
  runs: number; // 0-6 for runs, 1 for wide/noball, 0+ for badball_freehit result
  is_valid_ball: boolean; // false for wide/noball, true for all others
  created_at: number; // Unix timestamp (milliseconds) - used for undo (most recent)
}

/**
 * Input type for creating a new over event
 * Excludes auto-generated fields
 */
export interface CreateOverEventInput {
  over_id: string;
  sequence: number; // Auto-incremented by system
  event_type: OverEventType;
  runs: number; // 0-6
  is_valid_ball: boolean; // Auto-determined from event_type
}

/**
 * Innings with overs (joined data)
 *
 * Represents an innings with all its overs populated.
 * Used for match summary and detailed statistics.
 */
export interface InningsWithOvers extends Innings {
  overs: Over[];
}

/**
 * Over with events (joined data)
 *
 * Represents an over with all its events populated.
 * Used for over-by-over display and analysis.
 */
export interface OverWithEvents extends Over {
  events: OverEvent[];
}

/**
 * Innings summary (computed statistics)
 *
 * Aggregated statistics for display in match summary.
 */
export interface InningsSummary {
  innings_id: string;
  batting_team_name: string;
  bowling_team_name: string;
  total_runs: number;
  total_wickets: number;
  overs_completed: number;
  overs_planned: number;
  run_rate: number; // Runs per over (total_runs / overs_completed)
  extras: number; // Total wides + no-balls + bad balls
  batting_pairs: BattingPairSummary[];
}

/**
 * Batting pair summary (computed statistics)
 *
 * Statistics for a single batting pair's performance.
 */
export interface BattingPairSummary {
  player1_name: string;
  player2_name: string;
  overs_faced: number;
  runs_scored: number;
  wickets_lost: number;
}

/**
 * Bowling summary (computed statistics)
 *
 * Statistics for a single bowler's performance.
 */
export interface BowlingSummary {
  player_id: string;
  player_name: string;
  overs_bowled: number;
  runs_conceded: number;
  wickets_taken: number;
  economy_rate: number; // Runs per over (runs_conceded / overs_bowled)
}

/**
 * Current scoring state (live view)
 *
 * Real-time state during active scoring, used by scoring screen.
 */
export interface CurrentScoringState {
  innings_id: string;
  current_over_number: number;
  current_over_id: string;
  current_bowler_id: string;
  current_bowler_name: string;
  current_batting_pair: {
    player1_id: string;
    player1_name: string;
    player2_id: string;
    player2_name: string;
  };
  balls_bowled: number; // Total events in current over
  valid_balls: number; // 0-6 (valid deliveries)
  runs_this_over: number;
  total_runs: number;
  total_wickets: number;
  overs_completed: number;
  overs_remaining: number;
}
