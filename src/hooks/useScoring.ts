/**
 * useScoring Hook
 * Manages scoring operations with autosave and undo functionality
 *
 * Features:
 * - Record runs, wickets, extras
 * - Autosave after each event (<50ms target)
 * - Undo last event (soft delete)
 * - Advance over logic
 * - Haptic feedback
 */

import { useState, useCallback } from 'react';
import { useHaptics } from './useHaptics';
import { database } from '@/models/database';
import OverEvent from '@/models/OverEvent';
import Over from '@/models/Over';
import Innings from '@/models/Innings';
import { isOverComplete, getNextBowler } from '@/services/scoringEngine';

interface ScoringState {
  currentOverId: string | null;
  currentInningsId: string | null;
  events: OverEvent[];
  loading: boolean;
  error: string | null;
}

export interface UseScoring {
  // State
  currentOverId: string | null;
  currentInningsId: string | null;
  events: OverEvent[];
  loading: boolean;
  error: string | null;

  // Actions
  recordRun: (runs: number) => Promise<void>;
  recordWicket: () => Promise<void>;
  recordExtra: (type: 'wide' | 'noball', runs?: number) => Promise<void>;
  undoLastEvent: () => Promise<void>;
  advanceOver: (nextBowlerId: string) => Promise<void>;

  // Helpers
  isCurrentOverComplete: () => boolean;
  getValidBallsInOver: () => number;
}

export function useScoring(gameId: string): UseScoring {
  const { triggerHaptic } = useHaptics();
  const [state, setState] = useState<ScoringState>({
    currentOverId: null,
    currentInningsId: null,
    events: [],
    loading: false,
    error: null,
  });

  /**
   * Records a run scored
   * @param runs Number of runs (0-6)
   */
  const recordRun = useCallback(async (runs: number) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      // TODO: Re-enable when WatermelonDB is configured
      // const startTime = Date.now();

      // await database.write(async () => {
      //   const over = await database.get<Over>('overs').find(state.currentOverId!);
      //
      //   await database.get<OverEvent>('over_events').create((event) => {
      //     event.eventType = 'run';
      //     event.runs = runs;
      //     event.isWide = false;
      //     event.isNoBall = false;
      //     event.isWicket = false;
      //     event.over.set(over);
      //   });
      // });

      // const elapsed = Date.now() - startTime;
      // if (elapsed > 50) {
      //   console.warn(`[Scoring] Autosave took ${elapsed}ms (target <50ms)`);
      // }

      // Trigger haptic feedback
      await triggerHaptic('medium');

      setState((prev) => ({ ...prev, loading: false }));
    } catch (error) {
      console.error('[Scoring] Error recording run:', error);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: 'Failed to record run'
      }));
      await triggerHaptic('heavy'); // Error feedback
    }
  }, [state.currentOverId, triggerHaptic]);

  /**
   * Records a wicket
   */
  const recordWicket = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      // TODO: Re-enable when WatermelonDB is configured
      // await database.write(async () => {
      //   const over = await database.get<Over>('overs').find(state.currentOverId!);
      //
      //   await database.get<OverEvent>('over_events').create((event) => {
      //     event.eventType = 'wicket';
      //     event.runs = 0;
      //     event.isWide = false;
      //     event.isNoBall = false;
      //     event.isWicket = true;
      //     event.over.set(over);
      //   });
      // });

      // Trigger strong haptic for wicket
      await triggerHaptic('heavy');

      setState((prev) => ({ ...prev, loading: false }));
    } catch (error) {
      console.error('[Scoring] Error recording wicket:', error);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: 'Failed to record wicket'
      }));
    }
  }, [state.currentOverId, triggerHaptic]);

  /**
   * Records an extra (wide or no-ball)
   * @param type 'wide' or 'noball'
   * @param runs Extra runs scored (default 1)
   */
  const recordExtra = useCallback(async (
    type: 'wide' | 'noball',
    runs: number = 1
  ) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      // TODO: Re-enable when WatermelonDB is configured
      // await database.write(async () => {
      //   const over = await database.get<Over>('overs').find(state.currentOverId!);
      //
      //   await database.get<OverEvent>('over_events').create((event) => {
      //     event.eventType = 'extra';
      //     event.runs = runs;
      //     event.isWide = type === 'wide';
      //     event.isNoBall = type === 'noball';
      //     event.isWicket = false;
      //     event.over.set(over);
      //   });
      // });

      await triggerHaptic('light');

      setState((prev) => ({ ...prev, loading: false }));
    } catch (error) {
      console.error('[Scoring] Error recording extra:', error);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: 'Failed to record extra'
      }));
    }
  }, [state.currentOverId, triggerHaptic]);

  /**
   * Undoes the last scoring event
   * Soft deletes the most recent event and recomputes totals
   */
  const undoLastEvent = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      // TODO: Re-enable when WatermelonDB is configured
      // await database.write(async () => {
      //   const over = await database.get<Over>('overs').find(state.currentOverId!);
      //   const events = await over.events.fetch();
      //
      //   if (events.length === 0) {
      //     throw new Error('No events to undo');
      //   }
      //
      //   // Sort by createdAt to find most recent
      //   const sortedEvents = events.sort((a, b) =>
      //     b.createdAt.getTime() - a.createdAt.getTime()
      //   );
      //
      //   const lastEvent = sortedEvents[0];
      //   await lastEvent.markAsDeleted();
      //
      //   // Recompute totals would happen here
      //   // For now, totals are calculated on-the-fly from remaining events
      // });

      await triggerHaptic('light');

      setState((prev) => ({ ...prev, loading: false }));
    } catch (error) {
      console.error('[Scoring] Error undoing event:', error);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to undo'
      }));
      await triggerHaptic('heavy');
    }
  }, [state.currentOverId, triggerHaptic]);

  /**
   * Advances to the next over
   * Creates a new Over record with the next bowler
   * @param nextBowlerId ID of the bowler for the next over
   */
  const advanceOver = useCallback(async (nextBowlerId: string) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      // TODO: Re-enable when WatermelonDB is configured
      // await database.write(async () => {
      //   const innings = await database.get<Innings>('innings').find(state.currentInningsId!);
      //   const currentOver = await database.get<Over>('overs').find(state.currentOverId!);
      //
      //   // Create new over
      //   const newOver = await database.get<Over>('overs').create((over) => {
      //     over.overNumber = currentOver.overNumber + 1;
      //     over.bowlerId = nextBowlerId;
      //     over.innings.set(innings);
      //   });
      //
      //   setState((prev) => ({
      //     ...prev,
      //     currentOverId: newOver.id,
      //     events: [],
      //   }));
      // });

      await triggerHaptic('medium');

      setState((prev) => ({ ...prev, loading: false }));
    } catch (error) {
      console.error('[Scoring] Error advancing over:', error);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: 'Failed to advance over'
      }));
    }
  }, [state.currentInningsId, state.currentOverId, triggerHaptic]);

  /**
   * Checks if the current over is complete (6 valid balls)
   */
  const isCurrentOverComplete = useCallback(() => {
    // TODO: Re-enable when WatermelonDB is configured
    // const events = state.events.map((e) => ({
    //   eventType: e.eventType,
    //   runs: e.runs,
    //   isWide: e.isWide,
    //   isNoBall: e.isNoBall,
    //   isWicket: e.isWicket,
    // }));
    // return isOverComplete(events);

    return false; // Placeholder
  }, [state.events]);

  /**
   * Gets the count of valid balls in the current over
   */
  const getValidBallsInOver = useCallback(() => {
    return state.events.filter((e) => !e.isWide && !e.isNoBall).length;
  }, [state.events]);

  return {
    // State
    currentOverId: state.currentOverId,
    currentInningsId: state.currentInningsId,
    events: state.events,
    loading: state.loading,
    error: state.error,

    // Actions
    recordRun,
    recordWicket,
    recordExtra,
    undoLastEvent,
    advanceOver,

    // Helpers
    isCurrentOverComplete,
    getValidBallsInOver,
  };
}
