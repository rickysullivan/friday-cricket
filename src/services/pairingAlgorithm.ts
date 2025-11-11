/**
 * Pairing Algorithm for Friday Cricket
 * Generates batting pairs from a list of players
 *
 * Rules:
 * - Minimum 8 players required
 * - Players paired sequentially (1-2, 3-4, 5-6, 7-8)
 * - Odd player count: last player wraps around to pair with first
 * - Total overs (16) distributed evenly across pairs
 * - Each pair gets equal or nearly equal overs
 */

export interface BattingPair {
  player1Id: string;
  player2Id: string;
  oversAllocated: number;
}

interface Player {
  id: string;
  name: string;
}

/**
 * Creates batting pairs from a list of players
 * @param players Array of players (minimum 8 required)
 * @returns Array of batting pairs with overs allocated
 * @throws Error if fewer than 8 players provided
 */
export function makePairs(players: Player[]): BattingPair[] {
  if (players.length < 8) {
    throw new Error('Minimum 8 players required');
  }

  const pairs: BattingPair[] = [];
  const totalOvers = 16;

  // Calculate number of pairs
  // Even player count: pairs = players / 2
  // Odd player count: pairs = (players + 1) / 2 (last player wraps to first)
  const pairCount = Math.ceil(players.length / 2);

  // Calculate base overs per pair and remainder
  const baseOvers = Math.floor(totalOvers / pairCount);
  const remainderOvers = totalOvers % pairCount;

  // Create pairs
  for (let i = 0; i < pairCount; i++) {
    const player1Index = i * 2;
    const player2Index = i * 2 + 1;

    let player1Id: string;
    let player2Id: string;

    if (player2Index < players.length) {
      // Normal pairing
      player1Id = players[player1Index].id;
      player2Id = players[player2Index].id;
    } else {
      // Odd player count - wrap around to first player
      player1Id = players[player1Index].id;
      player2Id = players[0].id;
    }

    // Distribute remainder overs to first pairs
    // If remainder is 1 and we have 5 pairs: first pair gets +1 over
    // If remainder is 2 and we have 5 pairs: first 2 pairs get +1 over each
    const extraOver = i < remainderOvers ? 1 : 0;
    const oversAllocated = baseOvers + extraOver;

    pairs.push({
      player1Id,
      player2Id,
      oversAllocated,
    });
  }

  return pairs;
}

/**
 * Validates a batting pair configuration
 * @param pairs Array of batting pairs
 * @returns Validation result with any errors
 */
export function validatePairs(pairs: BattingPair[]): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check minimum pair count
  if (pairs.length < 4) {
    errors.push('Minimum 4 batting pairs required');
  }

  // Check total overs
  const totalOvers = pairs.reduce((sum, pair) => sum + pair.oversAllocated, 0);
  if (totalOvers > 16) {
    errors.push(`Total overs (${totalOvers}) exceeds maximum of 16`);
  }

  // Check for duplicate player IDs
  const playerIds = new Set<string>();
  pairs.forEach((pair) => {
    if (playerIds.has(pair.player1Id)) {
      errors.push(`Player ${pair.player1Id} appears in multiple pairs`);
    }
    if (playerIds.has(pair.player2Id) && pair.player1Id !== pair.player2Id) {
      errors.push(`Player ${pair.player2Id} appears in multiple pairs`);
    }
    playerIds.add(pair.player1Id);
    if (pair.player1Id !== pair.player2Id) {
      playerIds.add(pair.player2Id);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}
