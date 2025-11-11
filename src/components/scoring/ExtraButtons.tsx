/**
 * ExtraButtons Component
 * Buttons for extras: Wide, No-Ball, Wicket
 *
 * Design requirements:
 * - Distinct colors for each button type
 * - Haptic feedback on press
 * - ≥56px touch targets
 */

import React from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useHaptics } from '@/hooks/useHaptics';

interface ExtraButtonsProps {
  onWide: () => void;
  onNoBall: () => void;
  onWicket: () => void;
  disabled?: boolean;
}

export default function ExtraButtons({
  onWide,
  onNoBall,
  onWicket,
  disabled = false,
}: ExtraButtonsProps) {
  const { colors } = useTheme();
  const { triggerHaptic } = useHaptics();

  async function handleWide() {
    if (disabled) return;
    await triggerHaptic('light');
    onWide();
  }

  async function handleNoBall() {
    if (disabled) return;
    await triggerHaptic('light');
    onNoBall();
  }

  async function handleWicket() {
    if (disabled) return;
    await triggerHaptic('heavy'); // Strong feedback for wicket
    onWicket();
  }

  return (
    <View style={styles.container}>
      <Pressable
        onPress={handleWide}
        disabled={disabled}
        style={({ pressed }) => [
          styles.button,
          {
            backgroundColor: pressed ? '#e69500' : '#FFA500', // Orange
            opacity: disabled ? 0.5 : 1,
          },
        ]}
      >
        <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>
          Wide
        </Text>
      </Pressable>

      <Pressable
        onPress={handleNoBall}
        disabled={disabled}
        style={({ pressed }) => [
          styles.button,
          {
            backgroundColor: pressed ? '#e69500' : '#FFA500', // Orange
            opacity: disabled ? 0.5 : 1,
          },
        ]}
      >
        <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>
          No Ball
        </Text>
      </Pressable>

      <Pressable
        onPress={handleWicket}
        disabled={disabled}
        style={({ pressed }) => [
          styles.button,
          {
            backgroundColor: pressed ? '#b30000' : '#FF0000', // Red
            opacity: disabled ? 0.5 : 1,
          },
        ]}
      >
        <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>
          Wicket
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    padding: 16,
  },
  button: {
    flex: 1,
    minHeight: 56,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 16,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
