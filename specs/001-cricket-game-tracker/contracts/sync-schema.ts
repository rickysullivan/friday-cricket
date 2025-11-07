/**
 * Sync Schema Contracts
 *
 * TypeScript type definitions for Yjs CRDT document structure and Supabase sync.
 * These types define how game state is synchronized across multiple devices.
 *
 * Used by:
 * - Yjs provider (src/sync/yjs/provider.ts, gameDoc.ts)
 * - Supabase sync (src/sync/supabase/sync.ts)
 * - Sync context (src/context/SyncContext.tsx)
 *
 * Architecture:
 * - WatermelonDB: Local storage for Game, Team, Player (metadata)
 * - Yjs CRDT: Conflict-free sync for OverEvent (scoring events)
 * - Supabase: Cloud persistence for both metadata and Yjs snapshots
 */

import { OverEventType } from './innings-schema';

/**
 * Yjs Document Structure
 *
 * Each game has a Yjs document with the following top-level maps:
 * - metadata: Game settings, team names, player names (rarely changes)
 * - events: Scoring events as append-only Y.Array (CRDT for concurrent scoring)
 * - state: Current scoring state (over number, bowler, batting pair)
 */

/**
 * Yjs Game Metadata
 *
 * Game metadata stored in Y.Map at root["metadata"]
 * This data changes rarely, uses last-write-wins for conflict resolution.
 */
export interface YjsGameMetadata {
  game_id: string; // UUID, links to WatermelonDB Game
  dateISO: string;
  venue?: string;
  team_a_id: string;
  team_a_name: string;
  team_b_id: string;
  team_b_name: string;
  overs_planned: number;
  status: 'setup' | 'in_progress' | 'completed';
  last_modified_at: number; // Unix timestamp (for last-write-wins)
  last_modified_by: string; // Device ID or user ID
}

/**
 * Yjs Scoring Event
 *
 * Individual scoring event stored in Y.Array at root["events"]
 * This is append-only, provides conflict-free concurrent scoring.
 */
export interface YjsScoringEvent {
  id: string; // UUID (generated client-side)
  innings_number: 1 | 2;
  over_number: number; // 1-16
  sequence: number; // 0-indexed within over
  event_type: OverEventType;
  runs: number; // 0-6
  is_valid_ball: boolean;
  bowler_id: string;
  batting_pair_player1_id: string;
  batting_pair_player2_id: string;
  created_at: number; // Unix timestamp (milliseconds)
  device_id: string; // Which device created this event
  is_deleted: boolean; // Tombstone flag for undo (soft delete)
}

/**
 * Yjs Current State
 *
 * Current scoring state stored in Y.Map at root["state"]
 * Updated frequently during scoring, uses last-write-wins.
 */
export interface YjsCurrentState {
  current_innings_number: 1 | 2;
  current_over_number: number; // 1-16
  current_bowler_id: string;
  current_batting_pair_player1_id: string;
  current_batting_pair_player2_id: string;
  last_modified_at: number; // Unix timestamp (for last-write-wins)
  last_modified_by: string; // Device ID
}

/**
 * Yjs Document Root
 *
 * Top-level structure of a Yjs document for a game.
 * This is the shape of the Y.Doc used by the Yjs provider.
 */
export interface YjsGameDocument {
  metadata: YjsGameMetadata;
  events: YjsScoringEvent[]; // Stored as Y.Array, represented as array here
  state: YjsCurrentState;
}

/**
 * Sync provider status
 *
 * Tracks connection and synchronization state across devices.
 */
export type SyncStatus =
  | 'disconnected' // No network, offline only
  | 'connecting' // Attempting to connect to sync server
  | 'connected' // Connected, syncing in real-time
  | 'syncing' // Actively sending/receiving updates
  | 'synced' // All local changes pushed, all remote changes received
  | 'error'; // Sync error occurred

/**
 * Sync conflict resolution strategy
 *
 * Defines how conflicts are resolved for different data types.
 */
export type ConflictResolutionStrategy =
  | 'last_write_wins' // Use timestamp to pick most recent (for metadata, state)
  | 'crdt' // Use Yjs CRDT merge (for events array)
  | 'manual'; // Require user intervention (not used in MVP)

/**
 * Supabase sync payload (push)
 *
 * Data sent from local WatermelonDB to Supabase during sync push.
 */
export interface SupabaseSyncPushPayload {
  lastPulledAt: number | null; // Last time we pulled from server (for delta sync)
  changes: {
    games: { created: any[]; updated: any[]; deleted: string[] };
    teams: { created: any[]; updated: any[]; deleted: string[] };
    players: { created: any[]; updated: any[]; deleted: string[] };
    innings: { created: any[]; updated: any[]; deleted: string[] };
    overs: { created: any[]; updated: any[]; deleted: string[] };
    over_events: { created: any[]; updated: any[]; deleted: string[] };
    yjs_documents: { created: any[]; updated: any[]; deleted: string[] }; // Yjs snapshots
  };
}

/**
 * Supabase sync payload (pull)
 *
 * Data received from Supabase during sync pull.
 */
export interface SupabaseSyncPullPayload {
  changes: {
    games: { created: any[]; updated: any[]; deleted: string[] };
    teams: { created: any[]; updated: any[]; deleted: string[] };
    players: { created: any[]; updated: any[]; deleted: string[] };
    innings: { created: any[]; updated: any[]; deleted: string[] };
    overs: { created: any[]; updated: any[]; deleted: string[] };
    over_events: { created: any[]; updated: any[]; deleted: string[] };
    yjs_documents: { created: any[]; updated: any[]; deleted: string[] };
  };
  timestamp: number; // Server timestamp for next pull
}

/**
 * Yjs snapshot (for Supabase persistence)
 *
 * Periodically saved snapshot of Yjs document for cloud backup.
 */
export interface YjsSnapshot {
  id: string; // UUID
  game_id: string; // Foreign key to Game
  snapshot_data: Uint8Array; // Binary Yjs state vector
  created_at: number; // Unix timestamp (milliseconds)
}

/**
 * Yjs update (incremental change)
 *
 * Individual update to be applied to Yjs document.
 * Used for real-time sync over WebSocket.
 */
export interface YjsUpdate {
  game_id: string;
  update_data: Uint8Array; // Binary Yjs update
  created_at: number; // Unix timestamp (milliseconds)
  device_id: string;
}

/**
 * Device registration
 *
 * Tracks devices participating in multi-device scoring.
 */
export interface SyncDevice {
  device_id: string; // UUID generated on first launch
  device_name: string; // e.g., "Dad's iPhone", "Coach's Android"
  last_seen_at: number; // Unix timestamp (for presence detection)
  is_active: boolean; // Currently connected to sync
}

/**
 * Sync configuration
 *
 * User preferences for sync behavior.
 */
export interface SyncConfig {
  enabled: boolean; // Enable cloud sync (default: false for MVP)
  auto_sync: boolean; // Automatically sync when network available (default: true)
  sync_interval_ms: number; // Polling interval for pull (default: 5000ms)
  use_websocket: boolean; // Use WebSocket for real-time sync (default: false, future feature)
  conflict_resolution: ConflictResolutionStrategy; // Default: 'crdt' for events, 'last_write_wins' for metadata
}

/**
 * Sync event (for observability)
 *
 * Emitted by sync providers for monitoring and debugging.
 */
export interface SyncEvent {
  type:
    | 'push_started'
    | 'push_completed'
    | 'push_failed'
    | 'pull_started'
    | 'pull_completed'
    | 'pull_failed'
    | 'conflict_detected'
    | 'conflict_resolved'
    | 'connection_established'
    | 'connection_lost';
  timestamp: number; // Unix timestamp (milliseconds)
  game_id?: string; // If event is game-specific
  error_message?: string; // If event is an error
  details?: any; // Additional context (e.g., number of events synced)
}

/**
 * Sync statistics (for UI display)
 *
 * Summary of sync activity for user visibility.
 */
export interface SyncStats {
  last_sync_at: number | null; // Unix timestamp of last successful sync
  pending_changes: number; // Number of local changes not yet pushed
  status: SyncStatus;
  active_devices: number; // Number of devices currently scoring this game
  total_events_synced: number; // Lifetime count of events synced
  sync_errors: number; // Count of sync failures (for debugging)
}
