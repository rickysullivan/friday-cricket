import React, { createContext, useState, useContext, ReactNode } from 'react';
// TODO: Re-enable when WatermelonDB is configured
// import { database } from '../models/database';
import type Game from '../models/Game';

interface GameContextType {
  activeGame: Game | null;
  setActiveGame: (game: Game | null) => void;
  getLastActiveGame: () => Promise<Game | null>;
  // database: typeof database;
}

export const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [activeGame, setActiveGame] = useState<Game | null>(null);

  /**
   * Gets the most recent in-progress game
   * TODO: Re-enable when WatermelonDB is configured
   */
  async function getLastActiveGame(): Promise<Game | null> {
    try {
      // TODO: Re-enable when WatermelonDB is configured
      // const games = await database
      //   .get<Game>('games')
      //   .query(Q.where('status', 'in_progress'), Q.sortBy('updated_at', Q.desc), Q.take(1))
      //   .fetch();
      //
      // return games.length > 0 ? games[0] : null;

      return null; // Placeholder
    } catch (error) {
      console.error('[GameContext] Error getting last active game:', error);
      return null;
    }
  }

  return (
    <GameContext.Provider value={{ activeGame, setActiveGame, getLastActiveGame }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
