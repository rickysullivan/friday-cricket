import { Model } from '@nozbe/watermelondb';
import { field, relation, readonly, date } from '@nozbe/watermelondb/decorators';
import type Over from './Over';

export type EventType = 'run' | 'wicket' | 'wide' | 'noball' | 'badball_freehit';

/**
 * OverEvent model
 * Represents a single delivery or extra (runs, wicket, wide, no-ball, bad ball)
 */
export default class OverEvent extends Model {
  static table = 'over_events';
  static associations = {
    overs: { type: 'belongs_to' as const, key: 'over_id' },
  };

  @field('over_id') overId!: string;
  @field('sequence') sequence!: number;
  @field('event_type') eventType!: EventType;
  @field('runs') runs!: number;
  @field('is_valid_ball') isValidBall!: boolean;

  @readonly @date('created_at') createdAt!: Date;

  @relation('overs', 'over_id') over!: Over;
}
