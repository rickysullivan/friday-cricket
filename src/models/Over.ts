import { Model, Q } from '@nozbe/watermelondb';
import { field, relation, children, readonly, date } from '@nozbe/watermelondb/decorators';
import type Innings from './Innings';
import type OverEvent from './OverEvent';

/**
 * Over model
 * Represents a set of 6 deliveries by one bowler
 */
export default class Over extends Model {
  static table = 'overs';
  static associations = {
    innings: { type: 'belongs_to' as const, key: 'innings_id' },
    over_events: { type: 'has_many' as const, foreignKey: 'over_id' },
  };

  @field('innings_id') inningsId!: string;
  @field('over_number') overNumber!: number;
  @field('bowler_id') bowlerId!: string;
  @field('balls_bowled') ballsBowled!: number;
  @field('valid_balls') validBalls!: number;
  @field('runs_scored') runsScored!: number;
  @field('wickets_taken') wicketsTaken!: number;

  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;

  @relation('innings', 'innings_id') innings!: Innings;
  @children('over_events') events!: OverEvent[];

  // Computed: is over complete?
  get isComplete() {
    return this.validBalls >= 6;
  }

  // Computed: economy rate
  get economyRate() {
    if (this.validBalls === 0) return 0;
    return (this.runsScored / this.validBalls) * 6;
  }
}
