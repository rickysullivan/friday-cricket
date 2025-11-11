/**
 * UndoButton Component
 * Always-visible button for undoing the last scoring event
 *
 * Design requirements:
 * - 48px × 120px (wider for thumb reach)
 * - Strong haptic feedback on press
 * - Always visible (not hidden/disabled unless no events)
 * - Outdoor-optimized styling
 */

import React from 'react';
import { StyleSheet, Pressable, Text } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useHaptics } from '@/hooks/useHaptics';

interface UndoButtonProps {
  onUndo: () => void;
  disabled?: boolean;
}

export default function UndoButton({ onUndo, disabled = false }: UndoButtonProps) {
  const { colors } = useTheme();
  const { triggerHaptic } = useHaptics();

  async function handlePress() {
    if (disabled) return;
    await triggerHaptic('medium');
    onUndo();
  }

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: pressed
            ? colors.secondaryDark
            : colors.secondary,
          borderColor: colors.border,
          opacity: disabled ? 0.3 : 1,
        },
      ]}
    >
      <Text style={[styles.buttonText, { color: colors.buttonText }]}>
        Undo
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 120,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 2,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
