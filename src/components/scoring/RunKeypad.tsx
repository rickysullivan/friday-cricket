/**
 * RunKeypad Component
 * Buttons for scoring runs: 0, 1, 2, 3, 4, 6
 *
 * Design requirements:
 * - 64px × 64px buttons (outdoor-friendly touch targets)
 * - 20pt font size (high contrast)
 * - Haptic feedback on press
 * - Grid layout (3x2)
 */

import React from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useHaptics } from '@/hooks/useHaptics';

interface RunKeypadProps {
  onRunScored: (runs: number) => void;
  disabled?: boolean;
}

const RUN_OPTIONS = [0, 1, 2, 3, 4, 6];

export default function RunKeypad({ onRunScored, disabled = false }: RunKeypadProps) {
  const { colors } = useTheme();
  const { triggerHaptic } = useHaptics();

  async function handlePress(runs: number) {
    if (disabled) return;

    await triggerHaptic('medium');
    onRunScored(runs);
  }

  return (
    <View style={styles.container}>
      {RUN_OPTIONS.map((runs) => (
        <Pressable
          key={runs}
          onPress={() => handlePress(runs)}
          disabled={disabled}
          style={({ pressed }) => [
            styles.button,
            {
              backgroundColor: pressed
                ? colors.primaryDark
                : colors.primary,
              borderColor: colors.border,
              opacity: disabled ? 0.5 : 1,
            },
          ]}
        >
          <Text style={[styles.buttonText, { color: colors.buttonText }]}>
            {runs}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    padding: 16,
  },
  button: {
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 2,
  },
  buttonText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});
