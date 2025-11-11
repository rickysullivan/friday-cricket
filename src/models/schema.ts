import { appSchema, tableSchema } from '@nozbe/watermelondb';

/**
 * WatermelonDB Schema for Friday Cricket Game Tracker
 * Version 1 - Initial schema
 *
 * Based on data-model.md specification
 */
export const schema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'games',
      columns: [
        { name: 'date_iso', type: 'string', isIndexed: true },
        { name: 'venue', type: 'string', isOptional: true },
        { name: 'team_a_id', type: 'string', isIndexed: true },
        { name: 'team_b_id', type: 'string', isIndexed: true },
        { name: 'settings_scoring_enabled', type: 'boolean' },
        { name: 'status', type: 'string', isIndexed: true }, // 'setup', 'in_progress', 'completed'
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'teams',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'game_id', type: 'string', isIndexed: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'players',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'team_id', type: 'string', isIndexed: true },
        { name: 'position', type: 'number' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'innings',
      columns: [
        { name: 'game_id', type: 'string', isIndexed: true },
        { name: 'batting_team_id', type: 'string' },
        { name: 'bowling_team_id', type: 'string' },
        { name: 'innings_number', type: 'number' },
        { name: 'overs_planned', type: 'number' },
        { name: 'overs_completed', type: 'number' },
        { name: 'total_runs', type: 'number' },
        { name: 'total_wickets', type: 'number' },
        { name: 'batting_pairs', type: 'string' }, // JSON string
        { name: 'status', type: 'string' }, // 'pending', 'in_progress', 'completed'
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'overs',
      columns: [
        { name: 'innings_id', type: 'string', isIndexed: true },
        { name: 'over_number', type: 'number', isIndexed: true },
        { name: 'bowler_id', type: 'string' },
        { name: 'balls_bowled', type: 'number' },
        { name: 'valid_balls', type: 'number' },
        { name: 'runs_scored', type: 'number' },
        { name: 'wickets_taken', type: 'number' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'over_events',
      columns: [
        { name: 'over_id', type: 'string', isIndexed: true },
        { name: 'sequence', type: 'number' },
        { name: 'event_type', type: 'string' }, // 'run', 'wicket', 'wide', 'noball', 'badball_freehit'
        { name: 'runs', type: 'number' },
        { name: 'is_valid_ball', type: 'boolean' },
        { name: 'created_at', type: 'number', isIndexed: true },
      ],
    }),
  ],
});
