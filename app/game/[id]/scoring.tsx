/**
 * Scoring Screen
 * Active game interface: score display, run keypad, extras, undo
 * T047 - Partial implementation (layout ready, needs full scoring logic)
 */

import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import Button from '@/components/ui/Button';

export default function ScoringScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { colors } = useTheme();

  function handleEndMatch() {
    router.push(`/game/${id}/summary`);
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>
        Active Game: {id}
      </Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        TODO: Implement scoring interface
      </Text>

      <View style={styles.placeholders}>
        <Text style={[styles.placeholderText, { color: colors.textSecondary }]}>
          • ScoreDisplay component
        </Text>
        <Text style={[styles.placeholderText, { color: colors.textSecondary }]}>
          • RunKeypad (0,1,2,3,4,6)
        </Text>
        <Text style={[styles.placeholderText, { color: colors.textSecondary }]}>
          • ExtraButtons (Wide, No-Ball, Wicket)
        </Text>
        <Text style={[styles.placeholderText, { color: colors.textSecondary }]}>
          • UndoButton
        </Text>
        <Text style={[styles.placeholderText, { color: colors.textSecondary }]}>
          • Over progress indicator
        </Text>
      </View>

      <Button
        title="End Match (Test)"
        onPress={handleEndMatch}
        variant="secondary"
        size="large"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 32,
  },
  placeholders: {
    marginBottom: 32,
    gap: 12,
  },
  placeholderText: {
    fontSize: 16,
  },
});
