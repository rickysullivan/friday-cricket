/**
 * Game Setup Screen
 * Multi-step wizard: team names → add players → review pairs/bowlers → start match
 * T046 - Partial implementation (wizard structure ready, needs full form implementation)
 */

import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import Button from '@/components/ui/Button';

export default function GameSetupScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { colors } = useTheme();

  function handleStartMatch() {
    router.push(`/game/${id}/scoring`);
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>
        Game Setup Wizard
      </Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        TODO: Implement multi-step form
      </Text>

      <View style={styles.steps}>
        <Text style={[styles.stepText, { color: colors.textSecondary }]}>
          1. Enter team names
        </Text>
        <Text style={[styles.stepText, { color: colors.textSecondary }]}>
          2. Add players (min 8 per team)
        </Text>
        <Text style={[styles.stepText, { color: colors.textSecondary }]}>
          3. Review batting pairs & bowling rotation
        </Text>
        <Text style={[styles.stepText, { color: colors.textSecondary }]}>
          4. Start match
        </Text>
      </View>

      <Button
        title="Start Match (Test)"
        onPress={handleStartMatch}
        variant="primary"
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
  steps: {
    marginBottom: 32,
    gap: 12,
  },
  stepText: {
    fontSize: 16,
  },
});
