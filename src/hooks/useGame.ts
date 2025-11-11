import { useContext } from 'react';
import { GameContext } from '../context/GameContext';

/**
 * Hook to access GameContext
 * Provides active game state and database instance
 */
export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
