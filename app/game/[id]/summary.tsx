/**
 * Match Summary Screen
 * Final scores, statistics, actions (Export, Duplicate, Share)
 * Part of Phase 5 (US3) - Post-MVP
 */

import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import Button from '@/components/ui/Button';

export default function SummaryScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { colors } = useTheme();

  function handleBackToHome() {
    router.push('/(tabs)');
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>
        Match Summary
      </Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Game ID: {id}
      </Text>

      <View style={styles.placeholders}>
        <Text style={[styles.placeholderText, { color: colors.textSecondary }]}>
          TODO (Phase 5 - US3):
        </Text>
        <Text style={[styles.placeholderText, { color: colors.textSecondary }]}>
          • Team totals & result
        </Text>
        <Text style={[styles.placeholderText, { color: colors.textSecondary }]}>
          • Batting pair statistics
        </Text>
        <Text style={[styles.placeholderText, { color: colors.textSecondary }]}>
          • Bowling statistics
        </Text>
        <Text style={[styles.placeholderText, { color: colors.textSecondary }]}>
          • Export PDF/CSV buttons
        </Text>
        <Text style={[styles.placeholderText, { color: colors.textSecondary }]}>
          • Duplicate game button
        </Text>
      </View>

      <Button
        title="Back to Home"
        onPress={handleBackToHome}
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
  placeholders: {
    marginBottom: 32,
    gap: 12,
  },
  placeholderText: {
    fontSize: 16,
  },
});
