/**
 * Settings Screen
 * App configuration: Bright Mode, Haptics, Sync
 * TODO: Implement in Phase 8 (Polish)
 */

import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

export default function SettingsScreen() {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.text, { color: colors.textSecondary }]}>
        Settings
      </Text>
      <Text style={[styles.subtext, { color: colors.textSecondary }]}>
        Coming in Phase 8 (Polish)
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
