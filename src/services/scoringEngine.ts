/**
 * Scoring Engine for Friday Cricket
 * Core calculations for runs, wickets, and over completion
 *
 * Rules:
 * - 6 valid balls complete an over
 * - Wides and no-balls are extras that don't count as valid balls
 * - All runs (including extras) count toward total score
 * - Wickets are tracked separately from runs
 */

export interface ScoringEvent {
  eventType: 'run' | 'wicket' | 'extra';
  runs: number;
  isWide: boolean;
  isNoBall: boolean;
  isWicket?: boolean;
}

/**
 * Calculates total runs from a list of scoring events
 * Includes all runs: regular runs, wides, no-balls, etc.
 * @param events Array of scoring events
 * @returns Total runs scored
 */
export function calculateTotalRuns(events: ScoringEvent[]): number {
  return events.reduce((total, event) => total + event.runs, 0);
}

/**
 * Counts wickets from a list of scoring events
 * @param events Array of scoring events
 * @returns Number of wickets fallen
 */
export function calculateWickets(events: ScoringEvent[]): number {
  return events.filter((event) => event.isWicket === true).length;
}

/**
 * Determines if an over is complete
 * An over is complete when 6 valid balls have been bowled
 * Wides and no-balls do NOT count as valid balls
 * @param events Array of scoring events for the current over
 * @returns True if over is complete (6 valid balls), false otherwise
 */
export function isOverComplete(events: ScoringEvent[]): boolean {
  const validBalls = events.filter(
    (event) => !event.isWide && !event.isNoBall
  ).length;

  return validBalls >= 6;
}

/**
 * Gets the next bowler from the bowling rotation
 * @param bowlingPlan Array of bowler IDs for each over
 * @param currentOverIndex Index of current over (0-based)
 * @returns Bowler ID for next over, or undefined if no more overs
 */
export function getNextBowler(
  bowlingPlan: string[],
  currentOverIndex: number
): string | undefined {
  const nextIndex = currentOverIndex + 1;

  if (nextIndex >= bowlingPlan.length) {
    return undefined; // No more overs
  }

  return bowlingPlan[nextIndex];
}

/**
 * Calculates the current over number from innings start
 * @param completedOvers Number of completed overs
 * @param currentOverBalls Number of valid balls in current over
 * @returns Over number as string (e.g., "5.3" for 5 overs + 3 balls)
 */
export function calculateCurrentOver(
  completedOvers: number,
  currentOverBalls: number
): string {
  if (currentOverBalls === 0) {
    return `${completedOvers}.0`;
  }
  return `${completedOvers}.${currentOverBalls}`;
}

/**
 * Calculates run rate (runs per over)
 * @param runs Total runs scored
 * @param overs Number of overs bowled (can be fractional, e.g., 5.3)
 * @returns Run rate rounded to 2 decimal places
 */
export function calculateRunRate(runs: number, overs: number): number {
  if (overs === 0) {
    return 0;
  }
  return Math.round((runs / overs) * 100) / 100;
}

/**
 * Calculates strike rate for a batter
 * @param runs Runs scored by batter
 * @param ballsFaced Number of balls faced
 * @returns Strike rate (runs per 100 balls) rounded to 2 decimal places
 */
export function calculateStrikeRate(
  runs: number,
  ballsFaced: number
): number {
  if (ballsFaced === 0) {
    return 0;
  }
  return Math.round((runs / ballsFaced) * 100 * 100) / 100;
}

/**
 * Determines if innings should auto-close
 * Innings closes when:
 * - All planned overs completed
 * - All batters dismissed (max 10 wickets in cricket)
 * @param completedOvers Number of overs completed
 * @param plannedOvers Total overs planned for innings
 * @param wickets Number of wickets fallen
 * @returns True if innings should close
 */
export function shouldCloseInnings(
  completedOvers: number,
  plannedOvers: number,
  wickets: number
): boolean {
  return completedOvers >= plannedOvers || wickets >= 10;
}

/**
 * Calculates the result of a match
 * @param teamARuns Team A's total runs
 * @param teamBRuns Team B's total runs
 * @param teamAWickets Team A's wickets
 * @param teamBWickets Team B's wickets
 * @returns Result string (e.g., "Team A wins by 25 runs", "Match tied")
 */
export function calculateMatchResult(
  teamARuns: number,
  teamBRuns: number,
  teamAWickets: number,
  teamBWickets: number
): string {
  if (teamARuns > teamBRuns) {
    const margin = teamARuns - teamBRuns;
    return `Team A wins by ${margin} runs`;
  } else if (teamBRuns > teamARuns) {
    const margin = teamBRuns - teamARuns;
    const wicketsRemaining = 10 - teamBWickets;
    return `Team B wins by ${wicketsRemaining} wickets`;
  } else {
    // Tie-breaker: Runs ÷ Wickets = Average
    const teamAAverage = teamAWickets > 0 ? teamARuns / teamAWickets : teamARuns;
    const teamBAverage = teamBWickets > 0 ? teamBRuns / teamBWickets : teamBRuns;

    if (teamAAverage > teamBAverage) {
      return 'Team A wins on average';
    } else if (teamBAverage > teamAAverage) {
      return 'Team B wins on average';
    } else {
      return 'Match tied';
    }
  }
}
