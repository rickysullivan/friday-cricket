// import { useEffect } from 'react'; // TODO: Re-enable when WatermelonDB is configured
import { Stack } from 'expo-router';
import { ThemeProvider } from '../src/context/ThemeContext';
import { GameProvider } from '../src/context/GameContext';
import { SyncProvider } from '../src/context/SyncContext';
// import { database } from '../src/models/database'; // TODO: Re-enable when WatermelonDB is configured

/**
 * Root layout with context providers
 * Wraps the entire app with Theme, Game, and Sync contexts
 *
 * Initializes WatermelonDB on app startup
 */
export default function RootLayout() {
  // TODO: Re-enable WatermelonDB once JSI setup is complete
  // useEffect(() => {
  //   // Initialize WatermelonDB database on app mount
  //   async function initializeDatabase() {
  //     try {
  //       await database.write(async () => {
  //         // Database is now initialized and ready to use
  //         console.log('[Database] WatermelonDB initialized successfully');
  //       });
  //     } catch (error) {
  //       console.error('[Database] Failed to initialize:', error);
  //     }
  //   }
  //
  //   initializeDatabase();
  // }, []);

  return (
    <ThemeProvider>
      <GameProvider>
        <SyncProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="game" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" options={{ title: 'Not Found' }} />
          </Stack>
        </SyncProvider>
      </GameProvider>
    </ThemeProvider>
  );
}
