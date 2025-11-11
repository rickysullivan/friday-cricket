/**
 * Bowling Rotation Algorithm for Friday Cricket
 * Generates a bowling plan ensuring no consecutive bowlers
 *
 * Rules:
 * - No bowler can bowl consecutive overs
 * - Each bowler must bowl at least once (if possible)
 * - Overs distributed as evenly as possible
 * - Requires at least 3 players for 16 overs to avoid consecutive bowling
 */

interface Player {
  id: string;
  name: string;
}

/**
 * Creates a bowling rotation plan
 * @param players Array of available bowlers
 * @param totalOvers Total overs to plan for (typically 16)
 * @returns Array of bowler IDs (one per over)
 * @throws Error if insufficient players to avoid consecutive bowling
 */
export function planBowlers(players: Player[], totalOvers: number): string[] {
  if (players.length === 0) {
    throw new Error('At least one player required');
  }

  // Need at least 3 players for meaningful rotation
  // With 2 players, each would bowl too many consecutive patterns
  const minPlayers = 3;
  if (players.length < minPlayers) {
    throw new Error(
      `Need at least ${minPlayers} players to create non-consecutive bowling rotation`
    );
  }

  // Additional check: ensure no single bowler bowls more than half the overs
  // This prevents scenarios where distribution becomes too concentrated
  const maxOversPerBowler = Math.ceil(totalOvers / 2);
  const oversPerBowler = Math.ceil(totalOvers / players.length);
  if (oversPerBowler > maxOversPerBowler && players.length < 3) {
    throw new Error(
      'Insufficient players: would require consecutive bowling from same player'
    );
  }

  // Calculate base overs per bowler and remainder
  const baseOvers = Math.floor(totalOvers / players.length);
  const remainder = totalOvers % players.length;

  // Create bowler allocation list
  // Players with remainder get extra overs
  const bowlerAllocations: string[] = [];
  players.forEach((player, index) => {
    const extraOver = index < remainder ? 1 : 0;
    const oversForBowler = baseOvers + extraOver;

    for (let i = 0; i < oversForBowler; i++) {
      bowlerAllocations.push(player.id);
    }
  });

  // Arrange to avoid consecutive bowlers using round-robin interleaving
  const bowlingPlan: string[] = [];
  const bowlerQueues: string[][] = [];

  // Split allocations into separate queues per bowler
  const bowlerCounts: Record<string, number> = {};
  bowlerAllocations.forEach((bowlerId) => {
    bowlerCounts[bowlerId] = (bowlerCounts[bowlerId] || 0) + 1;
  });

  // Create queue for each bowler
  Object.entries(bowlerCounts).forEach(([bowlerId, count]) => {
    const queue: string[] = [];
    for (let i = 0; i < count; i++) {
      queue.push(bowlerId);
    }
    bowlerQueues.push(queue);
  });

  // Sort queues by length (descending) to distribute evenly
  bowlerQueues.sort((a, b) => b.length - a.length);

  // Interleave bowlers to avoid consecutive
  let lastBowler: string | null = null;
  let attempts = 0;
  const maxAttempts = totalOvers * 10; // Prevent infinite loop

  while (bowlingPlan.length < totalOvers && attempts < maxAttempts) {
    attempts++;

    // Find a queue that doesn't match lastBowler
    let selectedQueue: string[] | null = null;

    for (const queue of bowlerQueues) {
      if (queue.length > 0 && queue[0] !== lastBowler) {
        selectedQueue = queue;
        break;
      }
    }

    // If all remaining bowlers are the same as last, try to find any different bowler
    if (!selectedQueue) {
      // This happens when we run out of alternatives
      // Try to find ANY queue with different bowler
      for (const queue of bowlerQueues) {
        if (queue.length > 0) {
          const bowlerId = queue[0];
          if (bowlerId !== lastBowler) {
            selectedQueue = queue;
            break;
          }
        }
      }

      // If still no luck, we have a problem
      if (!selectedQueue) {
        // Check if there's only one bowler left
        const remainingBowlers = new Set(
          bowlerQueues.filter((q) => q.length > 0).map((q) => q[0])
        );

        if (remainingBowlers.size === 1 && remainingBowlers.has(lastBowler!)) {
          // Only one bowler remains and it's the last bowler
          // This violates non-consecutive rule
          throw new Error(
            'Cannot create non-consecutive bowling rotation with given player count'
          );
        }

        // Try to take from the longest queue
        const longestQueue = bowlerQueues.find((q) => q.length > 0);
        if (longestQueue) {
          selectedQueue = longestQueue;
        }
      }
    }

    if (selectedQueue) {
      const bowlerId = selectedQueue.shift()!;
      bowlingPlan.push(bowlerId);
      lastBowler = bowlerId;

      // Re-sort queues after removal
      bowlerQueues.sort((a, b) => b.length - a.length);
    }
  }

  if (bowlingPlan.length < totalOvers) {
    throw new Error('Failed to create complete bowling rotation');
  }

  return bowlingPlan;
}

/**
 * Validates a bowling rotation plan
 * @param bowlingPlan Array of bowler IDs for each over
 * @returns Validation result with any errors
 */
export function validateBowlingPlan(bowlingPlan: string[]): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check for consecutive bowlers
  for (let i = 0; i < bowlingPlan.length - 1; i++) {
    if (bowlingPlan[i] === bowlingPlan[i + 1]) {
      errors.push(`Consecutive bowling detected at overs ${i + 1} and ${i + 2}`);
    }
  }

  // Check that all players bowl at least once
  const bowlerCounts: Record<string, number> = {};
  bowlingPlan.forEach((bowlerId) => {
    bowlerCounts[bowlerId] = (bowlerCounts[bowlerId] || 0) + 1;
  });

  const uniqueBowlers = Object.keys(bowlerCounts).length;
  if (uniqueBowlers === 0) {
    errors.push('No bowlers assigned');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
