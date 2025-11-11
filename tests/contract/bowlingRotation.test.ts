/**
 * Contract tests for bowlingRotation.ts
 * Tests the bowling rotation logic for Friday Cricket
 *
 * Requirements:
 * - 8 players → 16-over rotation (2 overs per bowler)
 * - No consecutive bowling (same bowler cannot bowl consecutive overs)
 * - Each player bowls at least once (minimum 1 over per player)
 */

import { planBowlers } from '@/services/bowlingRotation';

describe('bowlingRotation', () => {
  describe('planBowlers', () => {
    it('should create 16-over rotation for 8 players', () => {
      const players = Array.from({ length: 8 }, (_, i) => ({
        id: `${i + 1}`,
        name: `Player ${i + 1}`,
      }));

      const bowlingPlan = planBowlers(players, 16);

      expect(bowlingPlan).toHaveLength(16);
    });

    it('should ensure no consecutive bowler in rotation', () => {
      const players = Array.from({ length: 8 }, (_, i) => ({
        id: `${i + 1}`,
        name: `Player ${i + 1}`,
      }));

      const bowlingPlan = planBowlers(players, 16);

      // Check each over against next over
      for (let i = 0; i < bowlingPlan.length - 1; i++) {
        expect(bowlingPlan[i]).not.toBe(bowlingPlan[i + 1]);
      }
    });

    it('should allocate roughly equal overs to each bowler', () => {
      const players = Array.from({ length: 8 }, (_, i) => ({
        id: `${i + 1}`,
        name: `Player ${i + 1}`,
      }));

      const bowlingPlan = planBowlers(players, 16);

      // Count overs per bowler
      const oversPerBowler: Record<string, number> = {};
      bowlingPlan.forEach((bowlerId) => {
        oversPerBowler[bowlerId] = (oversPerBowler[bowlerId] || 0) + 1;
      });

      // Each bowler should have 2 overs (16 ÷ 8)
      Object.values(oversPerBowler).forEach((count) => {
        expect(count).toBe(2);
      });
    });

    it('should ensure each player bowls at least once', () => {
      const players = Array.from({ length: 10 }, (_, i) => ({
        id: `${i + 1}`,
        name: `Player ${i + 1}`,
      }));

      const bowlingPlan = planBowlers(players, 16);

      // Count unique bowlers
      const uniqueBowlers = new Set(bowlingPlan);

      // With 10 players and 16 overs, all 10 should bowl at least once
      // (6 players bowl 2 overs, 4 players bowl 1 over)
      expect(uniqueBowlers.size).toBe(10);

      // Verify no bowler is skipped
      const oversPerBowler: Record<string, number> = {};
      bowlingPlan.forEach((bowlerId) => {
        oversPerBowler[bowlerId] = (oversPerBowler[bowlerId] || 0) + 1;
      });

      players.forEach((player) => {
        expect(oversPerBowler[player.id]).toBeGreaterThanOrEqual(1);
      });
    });

    it('should handle uneven distribution when overs do not divide evenly', () => {
      const players = Array.from({ length: 7 }, (_, i) => ({
        id: `${i + 1}`,
        name: `Player ${i + 1}`,
      }));

      const bowlingPlan = planBowlers(players, 16);

      expect(bowlingPlan).toHaveLength(16);

      // Count overs per bowler
      const oversPerBowler: Record<string, number> = {};
      bowlingPlan.forEach((bowlerId) => {
        oversPerBowler[bowlerId] = (oversPerBowler[bowlerId] || 0) + 1;
      });

      // 16 ÷ 7 = 2.28 → five players get 2 overs, two players get 3 overs
      const counts = Object.values(oversPerBowler).sort();
      expect(counts).toEqual([2, 2, 2, 2, 2, 3, 3]);
    });

    it('should throw error if fewer players than overs', () => {
      const players = [
        { id: '1', name: 'Player 1' },
        { id: '2', name: 'Player 2' },
      ];

      // Can't have non-consecutive bowling with only 2 players for 16 overs
      expect(() => planBowlers(players, 16)).toThrow();
    });

    it('should handle exactly matching players to overs (e.g., 16 players for 16 overs)', () => {
      const players = Array.from({ length: 16 }, (_, i) => ({
        id: `${i + 1}`,
        name: `Player ${i + 1}`,
      }));

      const bowlingPlan = planBowlers(players, 16);

      expect(bowlingPlan).toHaveLength(16);

      // Each player bowls exactly once
      const uniqueBowlers = new Set(bowlingPlan);
      expect(uniqueBowlers.size).toBe(16);

      // No consecutive bowler
      for (let i = 0; i < bowlingPlan.length - 1; i++) {
        expect(bowlingPlan[i]).not.toBe(bowlingPlan[i + 1]);
      }
    });
  });
});
