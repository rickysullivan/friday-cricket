/**
 * Contract tests for scoringEngine.ts
 * Tests the core scoring calculations for Friday Cricket
 *
 * Requirements:
 * - Calculate total runs from all over events
 * - Count wickets correctly
 * - Determine over completion (6 valid balls)
 * - Handle extras (wide, no-ball) that don't count as valid balls
 */

import {
  calculateTotalRuns,
  calculateWickets,
  isOverComplete,
  getNextBowler,
} from '@/services/scoringEngine';

describe('scoringEngine', () => {
  describe('calculateTotalRuns', () => {
    it('should calculate total runs from multiple over events', () => {
      const events = [
        { eventType: 'run', runs: 1, isWide: false, isNoBall: false },
        { eventType: 'run', runs: 4, isWide: false, isNoBall: false },
        { eventType: 'run', runs: 6, isWide: false, isNoBall: false },
        { eventType: 'run', runs: 2, isWide: false, isNoBall: false },
      ];

      const total = calculateTotalRuns(events);

      expect(total).toBe(13); // 1 + 4 + 6 + 2
    });

    it('should include wide and no-ball extras in run total', () => {
      const events = [
        { eventType: 'run', runs: 1, isWide: false, isNoBall: false },
        { eventType: 'extra', runs: 1, isWide: true, isNoBall: false },
        { eventType: 'extra', runs: 1, isWide: false, isNoBall: true },
        { eventType: 'run', runs: 4, isWide: false, isNoBall: false },
      ];

      const total = calculateTotalRuns(events);

      expect(total).toBe(7); // 1 + 1 (wide) + 1 (no-ball) + 4
    });

    it('should return 0 for empty events array', () => {
      const events: any[] = [];

      const total = calculateTotalRuns(events);

      expect(total).toBe(0);
    });

    it('should handle dot balls (0 runs)', () => {
      const events = [
        { eventType: 'run', runs: 0, isWide: false, isNoBall: false },
        { eventType: 'run', runs: 0, isWide: false, isNoBall: false },
        { eventType: 'run', runs: 1, isWide: false, isNoBall: false },
      ];

      const total = calculateTotalRuns(events);

      expect(total).toBe(1);
    });
  });

  describe('calculateWickets', () => {
    it('should count wicket events correctly', () => {
      const events = [
        { eventType: 'run', runs: 1, isWicket: false },
        { eventType: 'wicket', runs: 0, isWicket: true },
        { eventType: 'run', runs: 4, isWicket: false },
        { eventType: 'wicket', runs: 0, isWicket: true },
        { eventType: 'run', runs: 2, isWicket: false },
      ];

      const wickets = calculateWickets(events);

      expect(wickets).toBe(2);
    });

    it('should return 0 for no wickets', () => {
      const events = [
        { eventType: 'run', runs: 1, isWicket: false },
        { eventType: 'run', runs: 4, isWicket: false },
        { eventType: 'run', runs: 6, isWicket: false },
      ];

      const wickets = calculateWickets(events);

      expect(wickets).toBe(0);
    });

    it('should handle empty events array', () => {
      const events: any[] = [];

      const wickets = calculateWickets(events);

      expect(wickets).toBe(0);
    });
  });

  describe('isOverComplete', () => {
    it('should return true when 6 valid balls have been bowled', () => {
      const events = [
        { eventType: 'run', runs: 1, isWide: false, isNoBall: false },
        { eventType: 'run', runs: 4, isWide: false, isNoBall: false },
        { eventType: 'run', runs: 0, isWide: false, isNoBall: false },
        { eventType: 'run', runs: 6, isWide: false, isNoBall: false },
        { eventType: 'run', runs: 2, isWide: false, isNoBall: false },
        { eventType: 'run', runs: 1, isWide: false, isNoBall: false },
      ];

      const isComplete = isOverComplete(events);

      expect(isComplete).toBe(true);
    });

    it('should return false when fewer than 6 valid balls', () => {
      const events = [
        { eventType: 'run', runs: 1, isWide: false, isNoBall: false },
        { eventType: 'run', runs: 4, isWide: false, isNoBall: false },
        { eventType: 'run', runs: 0, isWide: false, isNoBall: false },
      ];

      const isComplete = isOverComplete(events);

      expect(isComplete).toBe(false);
    });

    it('should not count wides and no-balls as valid balls', () => {
      const events = [
        { eventType: 'run', runs: 1, isWide: false, isNoBall: false },
        { eventType: 'extra', runs: 1, isWide: true, isNoBall: false }, // Not a valid ball
        { eventType: 'run', runs: 4, isWide: false, isNoBall: false },
        { eventType: 'extra', runs: 1, isWide: false, isNoBall: true }, // Not a valid ball
        { eventType: 'run', runs: 0, isWide: false, isNoBall: false },
        { eventType: 'run', runs: 6, isWide: false, isNoBall: false },
        { eventType: 'run', runs: 2, isWide: false, isNoBall: false },
        { eventType: 'run', runs: 1, isWide: false, isNoBall: false },
      ];

      const isComplete = isOverComplete(events);

      expect(isComplete).toBe(true); // 6 valid balls despite 8 total events
    });

    it('should return false for empty events', () => {
      const events: any[] = [];

      const isComplete = isOverComplete(events);

      expect(isComplete).toBe(false);
    });
  });

  describe('getNextBowler', () => {
    it('should return next bowler from bowling rotation', () => {
      const bowlingPlan = ['player-1', 'player-2', 'player-3', 'player-4'];
      const currentOverIndex = 0;

      const nextBowler = getNextBowler(bowlingPlan, currentOverIndex);

      expect(nextBowler).toBe('player-2');
    });

    it('should handle last over in rotation', () => {
      const bowlingPlan = ['player-1', 'player-2', 'player-3', 'player-4'];
      const currentOverIndex = 3; // Last over (0-indexed)

      const nextBowler = getNextBowler(bowlingPlan, currentOverIndex);

      expect(nextBowler).toBeUndefined(); // No more overs
    });

    it('should return first bowler when starting match', () => {
      const bowlingPlan = ['player-1', 'player-2', 'player-3', 'player-4'];
      const currentOverIndex = -1; // Before first over

      const nextBowler = getNextBowler(bowlingPlan, currentOverIndex);

      expect(nextBowler).toBe('player-1');
    });
  });
});
