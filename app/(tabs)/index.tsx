/**
 * Home Screen
 * Main entry point with actions: New Game, Resume Last Game, View History
 */

import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { useGame } from '@/hooks/useGame';
import Button from '@/components/ui/Button';
import { useEffect, useState } from 'react';

export default function HomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { getLastActiveGame } = useGame();
  const [hasActiveGame, setHasActiveGame] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for active game on mount
    checkForActiveGame();
  }, []);

  async function checkForActiveGame() {
    try {
      const activeGame = await getLastActiveGame();
      setHasActiveGame(!!activeGame);
    } catch (error) {
      console.error('[Home] Error checking for active game:', error);
      setHasActiveGame(false);
    } finally {
      setLoading(false);
    }
  }

  function handleNewGame() {
    // Create new game and navigate to setup
    router.push('/game/new/setup');
  }

  async function handleResumeGame() {
    try {
      const activeGame = await getLastActiveGame();
      if (activeGame) {
        router.push(`/game/${activeGame.id}/scoring`);
      }
    } catch (error) {
      console.error('[Home] Error resuming game:', error);
    }
  }

  function handleViewHistory() {
    router.push('/(tabs)/history');
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          Friday Cricket
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Cricket Game Tracker
        </Text>
      </View>

      <View style={styles.actions}>
        <Button
          title="New Game"
          onPress={handleNewGame}
          variant="primary"
          size="large"
          style={styles.actionButton}
        />

        {hasActiveGame && !loading && (
          <Button
            title="Resume Last Game"
            onPress={handleResumeGame}
            variant="secondary"
            size="large"
            style={styles.actionButton}
          />
        )}

        <Button
          title="View History"
          onPress={handleViewHistory}
          variant="outline"
          size="large"
          style={styles.actionButton}
        />
      </View>

      <View style={styles.info}>
        <Text style={[styles.infoText, { color: colors.textSecondary }]}>
          Outdoor-optimized for bright sunlight
        </Text>
        <Text style={[styles.infoText, { color: colors.textSecondary }]}>
          Offline-first • Autosave • Touch-friendly
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '500',
  },
  actions: {
    width: '100%',
    maxWidth: 400,
    gap: 16,
  },
  actionButton: {
    width: '100%',
  },
  info: {
    marginTop: 48,
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    textAlign: 'center',
  },
});
