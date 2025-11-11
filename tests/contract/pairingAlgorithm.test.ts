/**
 * Contract tests for pairingAlgorithm.ts
 * Tests the batting pair generation logic for Friday Cricket
 *
 * Requirements:
 * - 8 players → 4 batting pairs
 * - Each pair gets 4 overs
 * - Odd players → wraparound pairing (last player pairs with first)
 */

import { makePairs, BattingPair } from '@/services/pairingAlgorithm';

describe('pairingAlgorithm', () => {
  describe('makePairs', () => {
    it('should create 4 pairs from 8 players', () => {
      const players = [
        { id: '1', name: 'Player 1' },
        { id: '2', name: 'Player 2' },
        { id: '3', name: 'Player 3' },
        { id: '4', name: 'Player 4' },
        { id: '5', name: 'Player 5' },
        { id: '6', name: 'Player 6' },
        { id: '7', name: 'Player 7' },
        { id: '8', name: 'Player 8' },
      ];

      const pairs = makePairs(players);

      expect(pairs).toHaveLength(4);
      expect(pairs[0]).toEqual({
        player1Id: '1',
        player2Id: '2',
        oversAllocated: 4,
      });
      expect(pairs[1]).toEqual({
        player1Id: '3',
        player2Id: '4',
        oversAllocated: 4,
      });
      expect(pairs[2]).toEqual({
        player1Id: '5',
        player2Id: '6',
        oversAllocated: 4,
      });
      expect(pairs[3]).toEqual({
        player1Id: '7',
        player2Id: '8',
        oversAllocated: 4,
      });
    });

    it('should allocate 4 overs to each pair for 16-over match', () => {
      const players = [
        { id: '1', name: 'Player 1' },
        { id: '2', name: 'Player 2' },
        { id: '3', name: 'Player 3' },
        { id: '4', name: 'Player 4' },
        { id: '5', name: 'Player 5' },
        { id: '6', name: 'Player 6' },
        { id: '7', name: 'Player 7' },
        { id: '8', name: 'Player 8' },
      ];

      const pairs = makePairs(players);

      pairs.forEach((pair) => {
        expect(pair.oversAllocated).toBe(4);
      });

      // Total overs = 16
      const totalOvers = pairs.reduce((sum, pair) => sum + pair.oversAllocated, 0);
      expect(totalOvers).toBe(16);
    });

    it('should handle odd number of players with wraparound pairing', () => {
      const players = [
        { id: '1', name: 'Player 1' },
        { id: '2', name: 'Player 2' },
        { id: '3', name: 'Player 3' },
        { id: '4', name: 'Player 4' },
        { id: '5', name: 'Player 5' },
        { id: '6', name: 'Player 6' },
        { id: '7', name: 'Player 7' },
        { id: '8', name: 'Player 8' },
        { id: '9', name: 'Player 9' },
      ];

      const pairs = makePairs(players);

      expect(pairs).toHaveLength(5);

      // Last pair should wrap around to first player
      expect(pairs[4]).toEqual({
        player1Id: '9',
        player2Id: '1',
        oversAllocated: 3, // 16 overs ÷ 5 pairs = 3.2, rounded down
      });
    });

    it('should distribute overs as evenly as possible with odd player count', () => {
      const players = Array.from({ length: 9 }, (_, i) => ({
        id: `${i + 1}`,
        name: `Player ${i + 1}`,
      }));

      const pairs = makePairs(players);

      const totalOvers = pairs.reduce((sum, pair) => sum + pair.oversAllocated, 0);
      expect(totalOvers).toBeLessThanOrEqual(16);

      // With 9 players (5 pairs): 16 ÷ 5 = 3.2 → four pairs get 3 overs, one pair gets 4
      const oversDistribution = pairs.map((p) => p.oversAllocated).sort();
      expect(oversDistribution).toEqual([3, 3, 3, 3, 4]);
    });

    it('should throw error if less than 8 players provided', () => {
      const players = [
        { id: '1', name: 'Player 1' },
        { id: '2', name: 'Player 2' },
        { id: '3', name: 'Player 3' },
      ];

      expect(() => makePairs(players)).toThrow('Minimum 8 players required');
    });
  });
});
