import { Model } from '@nozbe/watermelondb';
import { field, relation, children, readonly, date } from '@nozbe/watermelondb/decorators';
import type Game from './Game';
import type Player from './Player';

/**
 * Team model
 * Represents a cricket team with a name and roster of players
 */
export default class Team extends Model {
  static table = 'teams';
  static associations = {
    games: { type: 'belongs_to' as const, key: 'game_id' },
    players: { type: 'has_many' as const, foreignKey: 'team_id' },
  };

  @field('name') name!: string;
  @field('game_id') gameId!: string;

  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;

  @relation('games', 'game_id') game!: Game;
  @children('players') players!: Player[];
}
