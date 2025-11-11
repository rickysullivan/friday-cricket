import * as Haptics from 'expo-haptics';

type HapticIntensity = 'light' | 'medium' | 'heavy';

/**
 * Custom hook for haptic feedback with configurable intensity
 * Constitution: Strong haptics for outdoor tactile confirmation
 */
export function useHaptics() {
  const trigger = (intensity: HapticIntensity = 'medium') => {
    const style =
      intensity === 'light'
        ? Haptics.ImpactFeedbackStyle.Light
        : intensity === 'heavy'
        ? Haptics.ImpactFeedbackStyle.Heavy
        : Haptics.ImpactFeedbackStyle.Medium;

    Haptics.impactAsync(style);
  };

  return { trigger };
}
