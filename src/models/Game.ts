import { Model } from '@nozbe/watermelondb';
import { field, relation, children, readonly, date } from '@nozbe/watermelondb/decorators';
import type Team from './Team';
import type Innings from './Innings';

/**
 * Game model
 * Represents a complete cricket match with two teams
 */
export default class Game extends Model {
  static table = 'games';
  static associations = {
    teams: { type: 'has_many' as const, foreignKey: 'game_id' },
    innings: { type: 'has_many' as const, foreignKey: 'game_id' },
  };

  @field('date_iso') dateISO!: string;
  @field('venue') venue!: string | null;
  @field('team_a_id') teamAId!: string;
  @field('team_b_id') teamBId!: string;
  @field('settings_scoring_enabled') settingsScoringEnabled!: boolean;
  @field('status') status!: 'setup' | 'in_progress' | 'completed';

  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;

  @children('teams') teams!: Team[];
  @children('innings') innings!: Innings[];

  // Helper methods for accessing teams
  get teamA() {
    return this.collections.get<Team>('teams').findAndObserve(this.teamAId);
  }

  get teamB() {
    return this.collections.get<Team>('teams').findAndObserve(this.teamBId);
  }
}
