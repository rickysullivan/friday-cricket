/**
 * Contract Tests for Rule Engine
 * Test Friday Cricket rule validation logic
 * T059-T062
 */

import {
  validateBattingPairLimit,
  validateBowlingRotation,
  validateInningsComplete,
  validateMinimumBowlingAllocation,
} from '@/services/ruleEngine';

describe('ruleEngine - validateBattingPairLimit', () => {
  it('should return valid when pair has completed less than 4 overs', () => {
    const pair = {
      id: '1',
      player1Id: 'p1',
      player1Name: 'Player 1',
      player2Id: 'p2',
      player2Name: 'Player 2',
      oversAllocated: 4,
      oversFaced: 2,
    };

    const result = validateBattingPairLimit(pair);

    expect(result.isValid).toBe(true);
    expect(result.errorMessage).toBeUndefined();
  });

  it('should return valid when pair has completed exactly 3 overs', () => {
    const pair = {
      id: '1',
      player1Id: 'p1',
      player1Name: 'Player 1',
      player2Id: 'p2',
      player2Name: 'Player 2',
      oversAllocated: 4,
      oversFaced: 3,
    };

    const result = validateBattingPairLimit(pair);

    expect(result.isValid).toBe(true);
    expect(result.errorMessage).toBeUndefined();
  });

  it('should return invalid when pair has completed 4 overs', () => {
    const pair = {
      id: '1',
      player1Id: 'p1',
      player1Name: 'Player 1',
      player2Id: 'p2',
      player2Name: 'Player 2',
      oversAllocated: 4,
      oversFaced: 4,
    };

    const result = validateBattingPairLimit(pair);

    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toContain('4 overs');
  });

  it('should return invalid when pair exceeds 4 overs', () => {
    const pair = {
      id: '1',
      player1Id: 'p1',
      player1Name: 'Player 1',
      player2Id: 'p2',
      player2Name: 'Player 2',
      oversAllocated: 4,
      oversFaced: 5,
    };

    const result = validateBattingPairLimit(pair);

    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toBeDefined();
  });

  it('should handle pair with 0 overs faced', () => {
    const pair = {
      id: '1',
      player1Id: 'p1',
      player1Name: 'Player 1',
      player2Id: 'p2',
      player2Name: 'Player 2',
      oversAllocated: 4,
      oversFaced: 0,
    };

    const result = validateBattingPairLimit(pair);

    expect(result.isValid).toBe(true);
  });
});

describe('ruleEngine - validateBowlingRotation', () => {
  it('should return valid when different bowlers', () => {
    const result = validateBowlingRotation('bowler1', 'bowler2');

    expect(result.isValid).toBe(true);
    expect(result.errorMessage).toBeUndefined();
  });

  it('should return invalid when same bowler selected consecutively', () => {
    const result = validateBowlingRotation('bowler1', 'bowler1');

    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toContain('consecutive');
  });

  it('should return valid when no previous bowler (first over)', () => {
    const result = validateBowlingRotation('bowler1', null);

    expect(result.isValid).toBe(true);
  });

  it('should return valid when previous bowler is undefined', () => {
    const result = validateBowlingRotation('bowler1', undefined);

    expect(result.isValid).toBe(true);
  });

  it('should handle empty string bowler IDs', () => {
    const result = validateBowlingRotation('', '');

    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toContain('consecutive');
  });
});

describe('ruleEngine - validateInningsComplete', () => {
  it('should return incomplete when less than 16 overs completed', () => {
    const innings = {
      id: '1',
      oversCompleted: 10,
      oversPlanned: 16,
      wickets: 3,
    };

    const result = validateInningsComplete(innings);

    expect(result.isComplete).toBe(false);
    expect(result.reason).toBeUndefined();
  });

  it('should return complete when 16 overs completed', () => {
    const innings = {
      id: '1',
      oversCompleted: 16,
      oversPlanned: 16,
      wickets: 5,
    };

    const result = validateInningsComplete(innings);

    expect(result.isComplete).toBe(true);
    expect(result.reason).toBe('overs');
  });

  it('should return complete when 10 wickets fallen', () => {
    const innings = {
      id: '1',
      oversCompleted: 12,
      oversPlanned: 16,
      wickets: 10,
    };

    const result = validateInningsComplete(innings);

    expect(result.isComplete).toBe(true);
    expect(result.reason).toBe('wickets');
  });

  it('should return complete when more than 16 overs (edge case)', () => {
    const innings = {
      id: '1',
      oversCompleted: 17,
      oversPlanned: 16,
      wickets: 3,
    };

    const result = validateInningsComplete(innings);

    expect(result.isComplete).toBe(true);
    expect(result.reason).toBe('overs');
  });

  it('should prioritize wickets reason when both conditions met', () => {
    const innings = {
      id: '1',
      oversCompleted: 16,
      oversPlanned: 16,
      wickets: 10,
    };

    const result = validateInningsComplete(innings);

    expect(result.isComplete).toBe(true);
    expect(result.reason).toBe('wickets');
  });

  it('should handle 0 overs completed', () => {
    const innings = {
      id: '1',
      oversCompleted: 0,
      oversPlanned: 16,
      wickets: 0,
    };

    const result = validateInningsComplete(innings);

    expect(result.isComplete).toBe(false);
  });
});

describe('ruleEngine - validateMinimumBowlingAllocation', () => {
  it('should return valid when all players have at least 1 over', () => {
    const players = [
      { id: '1', name: 'Player 1' },
      { id: '2', name: 'Player 2' },
      { id: '3', name: 'Player 3' },
      { id: '4', name: 'Player 4' },
    ];

    const bowlingPlan = ['1', '2', '3', '4', '1', '2', '3', '4'];

    const result = validateMinimumBowlingAllocation(players, bowlingPlan);

    expect(result.isValid).toBe(true);
    expect(result.warnings).toHaveLength(0);
  });

  it('should return warnings for players with no overs allocated', () => {
    const players = [
      { id: '1', name: 'Player 1' },
      { id: '2', name: 'Player 2' },
      { id: '3', name: 'Player 3' },
      { id: '4', name: 'Player 4' },
    ];

    const bowlingPlan = ['1', '2', '1', '2', '1', '2', '1', '2'];

    const result = validateMinimumBowlingAllocation(players, bowlingPlan);

    expect(result.isValid).toBe(false);
    expect(result.warnings).toHaveLength(2);
    expect(result.warnings[0]).toContain('Player 3');
    expect(result.warnings[1]).toContain('Player 4');
  });

  it('should return warning for single player with no overs', () => {
    const players = [
      { id: '1', name: 'Player 1' },
      { id: '2', name: 'Player 2' },
      { id: '3', name: 'Player 3' },
    ];

    const bowlingPlan = ['1', '2', '1', '2', '1', '2'];

    const result = validateMinimumBowlingAllocation(players, bowlingPlan);

    expect(result.isValid).toBe(false);
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0]).toContain('Player 3');
    expect(result.warnings[0]).toContain('0 overs');
  });

  it('should handle empty bowling plan', () => {
    const players = [
      { id: '1', name: 'Player 1' },
      { id: '2', name: 'Player 2' },
    ];

    const bowlingPlan: string[] = [];

    const result = validateMinimumBowlingAllocation(players, bowlingPlan);

    expect(result.isValid).toBe(false);
    expect(result.warnings).toHaveLength(2);
  });

  it('should handle players with varying over counts', () => {
    const players = [
      { id: '1', name: 'Player 1' },
      { id: '2', name: 'Player 2' },
      { id: '3', name: 'Player 3' },
    ];

    // Player 1: 5 overs, Player 2: 3 overs, Player 3: 0 overs
    const bowlingPlan = ['1', '2', '1', '2', '1', '2', '1', '1'];

    const result = validateMinimumBowlingAllocation(players, bowlingPlan);

    expect(result.isValid).toBe(false);
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0]).toContain('Player 3');
  });

  it('should validate exactly 1 over per player as valid', () => {
    const players = [
      { id: '1', name: 'Player 1' },
      { id: '2', name: 'Player 2' },
    ];

    const bowlingPlan = ['1', '2'];

    const result = validateMinimumBowlingAllocation(players, bowlingPlan);

    expect(result.isValid).toBe(true);
    expect(result.warnings).toHaveLength(0);
  });
});
