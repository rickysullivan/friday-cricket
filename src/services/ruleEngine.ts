/**
 * Rule Engine
 * Validates Friday Cricket rules and constraints
 * T063-T067
 */

export interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

export interface InningsCompleteResult {
  isComplete: boolean;
  reason?: 'overs' | 'wickets';
}

export interface MinimumBowlingAllocationResult {
  isValid: boolean;
  warnings: string[];
}

export interface BattingPair {
  id: string;
  player1Id: string;
  player1Name: string;
  player2Id: string;
  player2Name: string;
  oversAllocated: number;
  oversFaced: number;
}

export interface Innings {
  id: string;
  oversCompleted: number;
  oversPlanned: number;
  wickets: number;
}

export interface Player {
  id: string;
  name: string;
}

/**
 * T064: Validate batting pair limit (max 4 overs)
 * Returns invalid if pair has faced 4 or more overs
 */
export function validateBattingPairLimit(pair: BattingPair): ValidationResult {
  if (pair.oversFaced >= pair.oversAllocated) {
    return {
      isValid: false,
      errorMessage: `This batting pair has completed their allocated ${pair.oversAllocated} overs and cannot bat further.`,
    };
  }

  return {
    isValid: true,
  };
}

/**
 * T065: Validate bowling rotation (no consecutive overs by same bowler)
 * Returns invalid if current bowler is same as previous bowler
 */
export function validateBowlingRotation(
  currentBowlerId: string | null | undefined,
  previousBowlerId: string | null | undefined
): ValidationResult {
  // First over - no previous bowler to validate against (null or undefined only, not empty string)
  if (previousBowlerId === null || previousBowlerId === undefined) {
    return {
      isValid: true,
    };
  }

  // Same bowler selected consecutively (including empty strings matching empty strings)
  if (currentBowlerId === previousBowlerId) {
    return {
      isValid: false,
      errorMessage:
        'A bowler cannot bowl consecutive overs. Please select a different bowler.',
    };
  }

  return {
    isValid: true,
  };
}

/**
 * T066: Validate innings complete (16 overs or 10 wickets)
 * Returns complete with reason when innings ending conditions met
 */
export function validateInningsComplete(innings: Innings): InningsCompleteResult {
  // Check wickets first (higher priority)
  if (innings.wickets >= 10) {
    return {
      isComplete: true,
      reason: 'wickets',
    };
  }

  // Check overs completed
  if (innings.oversCompleted >= innings.oversPlanned) {
    return {
      isComplete: true,
      reason: 'overs',
    };
  }

  return {
    isComplete: false,
  };
}

/**
 * T067: Validate minimum bowling allocation (each player ≥1 over)
 * Returns warnings for players with <1 over allocated in bowling plan
 */
export function validateMinimumBowlingAllocation(
  players: Player[],
  bowlingPlan: string[]
): MinimumBowlingAllocationResult {
  const warnings: string[] = [];

  // Count overs for each player
  const overCounts = new Map<string, number>();
  for (const playerId of bowlingPlan) {
    overCounts.set(playerId, (overCounts.get(playerId) || 0) + 1);
  }

  // Check each player has at least 1 over
  for (const player of players) {
    const overs = overCounts.get(player.id) || 0;
    if (overs === 0) {
      warnings.push(`${player.name} has 0 overs allocated (minimum 1 over required)`);
    }
  }

  return {
    isValid: warnings.length === 0,
    warnings,
  };
}
