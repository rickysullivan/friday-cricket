/**
 * Game Stack Navigation Layout
 * Stack navigation for game flow: setup → scoring → summary
 */

import { Stack } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';

export default function GameLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
          borderBottomWidth: 2,
          borderBottomColor: colors.border,
        },
        headerTitleStyle: {
          fontSize: 20,
          fontWeight: 'bold',
          color: colors.text,
        },
        headerTintColor: colors.text,
        headerBackTitle: 'Back',
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen
        name="[id]/setup"
        options={{
          title: 'Game Setup',
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name="[id]/scoring"
        options={{
          title: 'Scoring',
          presentation: 'card',
          // Prevent going back during active game
          headerBackVisible: false,
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="[id]/summary"
        options={{
          title: 'Match Summary',
          presentation: 'card',
          // Prevent going back to scoring after match ends
          headerBackVisible: false,
          gestureEnabled: false,
        }}
      />
    </Stack>
  );
}
