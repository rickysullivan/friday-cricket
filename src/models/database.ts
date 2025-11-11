import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import { schema } from './schema';
import Game from './Game';
import Team from './Team';
import Player from './Player';
import Innings from './Innings';
import Over from './Over';
import OverEvent from './OverEvent';

/**
 * WatermelonDB database instance
 * SQLite-based offline-first storage for Friday Cricket
 */

const adapter = new SQLiteAdapter({
  schema,
  // Enable JSI for React Native new architecture (0.70+)
  jsi: true,
});

export const database = new Database({
  adapter,
  modelClasses: [Game, Team, Player, Innings, Over, OverEvent],
});
