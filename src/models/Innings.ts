import { Model } from '@nozbe/watermelondb';
import { field, relation, children, readonly, date } from '@nozbe/watermelondb/decorators';
import type Game from './Game';
import type Over from './Over';

/**
 * Innings model
 * Represents one team's batting period (16 overs max)
 */
export default class Innings extends Model {
  static table = 'innings';
  static associations = {
    games: { type: 'belongs_to' as const, key: 'game_id' },
    overs: { type: 'has_many' as const, foreignKey: 'innings_id' },
  };

  @field('game_id') gameId!: string;
  @field('batting_team_id') battingTeamId!: string;
  @field('bowling_team_id') bowlingTeamId!: string;
  @field('innings_number') inningsNumber!: number;
  @field('overs_planned') oversPlanned!: number;
  @field('overs_completed') oversCompleted!: number;
  @field('total_runs') totalRuns!: number;
  @field('total_wickets') totalWickets!: number;
  @field('batting_pairs') battingPairsJSON!: string; // JSON string
  @field('status') status!: 'pending' | 'in_progress' | 'completed';

  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;

  @relation('games', 'game_id') game!: Game;
  @children('overs') overs!: Over[];

  // Helper to parse batting pairs JSON
  get battingPairs() {
    try {
      return JSON.parse(this.battingPairsJSON || '[]');
    } catch {
      return [];
    }
  }

  // Helper to set batting pairs
  setBattingPairs(pairs: any[]) {
    return this.update(() => {
      (this as any).battingPairsJSON = JSON.stringify(pairs);
    });
  }
}
