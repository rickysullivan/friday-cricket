/**
 * History Screen
 * Display list of completed matches
 * TODO: Implement in Phase 5 (US3)
 */

import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

export default function HistoryScreen() {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.text, { color: colors.textSecondary }]}>
        Match History
      </Text>
      <Text style={[styles.subtext, { color: colors.textSecondary }]}>
        Coming in Phase 5 (US3)
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  text: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  subtext: {
    fontSize: 16,
  },
});
