import React, { createContext, useState, useContext, ReactNode } from 'react';
import { COLORS } from '../utils/constants';

type ThemeMode = 'normal' | 'bright';

interface ThemeContextType {
  mode: ThemeMode;
  toggleMode: () => void;
  colors: typeof COLORS;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('normal');

  const toggleMode = () => {
    setMode((prev) => (prev === 'normal' ? 'bright' : 'normal'));
  };

  // In bright mode, we use even higher contrast (no grays at all)
  const colors = mode === 'bright'
    ? COLORS // Already optimized for outdoor use
    : COLORS;

  return (
    <ThemeContext.Provider value={{ mode, toggleMode, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
