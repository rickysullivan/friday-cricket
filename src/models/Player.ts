import { Model } from '@nozbe/watermelondb';
import { field, relation, readonly, date } from '@nozbe/watermelondb/decorators';
import type Team from './Team';

/**
 * Player model
 * Represents an individual player on a team
 */
export default class Player extends Model {
  static table = 'players';
  static associations = {
    teams: { type: 'belongs_to' as const, key: 'team_id' },
  };

  @field('name') name!: string;
  @field('team_id') teamId!: string;
  @field('position') position!: number;

  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;

  @relation('teams', 'team_id') team!: Team;
}
