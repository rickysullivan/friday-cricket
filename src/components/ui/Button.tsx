import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { COLORS, SIZES } from '../../utils/constants';

interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: 'primary' | 'success' | 'error' | 'warning';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export default function Button({
  onPress,
  title,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  textStyle,
  accessibilityLabel,
  accessibilityHint,
}: ButtonProps) {
  const handlePress = () => {
    // Haptic feedback for outdoor tactile confirmation
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  const buttonStyle = [
    styles.button,
    variant === 'success' && styles.successButton,
    variant === 'error' && styles.errorButton,
    variant === 'warning' && styles.warningButton,
    disabled && styles.disabledButton,
    style,
  ];

  const buttonTextStyle = [styles.buttonText, textStyle];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={handlePress}
      disabled={disabled || loading}
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint}
      accessibilityRole="button"
    >
      {loading ? (
        <ActivityIndicator color={COLORS.TEXT_INVERSE} />
      ) : (
        <Text style={buttonTextStyle}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.PRIMARY,
    minHeight: SIZES.TOUCH_TARGET_MIN, // 56px minimum for outdoor use
    paddingHorizontal: SIZES.SPACING_LG,
    borderRadius: SIZES.BORDER_RADIUS_MD,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.PRIMARY,
  },
  successButton: {
    backgroundColor: COLORS.SUCCESS,
    borderColor: COLORS.SUCCESS,
  },
  errorButton: {
    backgroundColor: COLORS.ERROR,
    borderColor: COLORS.ERROR,
  },
  warningButton: {
    backgroundColor: COLORS.WARNING,
    borderColor: COLORS.WARNING,
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    color: COLORS.TEXT_INVERSE,
    fontSize: 20, // 20pt for outdoor readability
    fontWeight: '600',
    textAlign: 'center',
  },
});
