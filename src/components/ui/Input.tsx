import React from 'react';
import { TextInput, View, Text, StyleSheet, TextInputProps } from 'react-native';
import { COLORS, SIZES } from '../../utils/constants';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export default function Input({ label, error, style, ...props }: InputProps) {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[styles.input, error && styles.inputError, style]}
        placeholderTextColor={COLORS.TEXT}
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SIZES.SPACING_MD,
  },
  label: {
    fontSize: SIZES.FONT_SMALL, // 18pt minimum
    fontWeight: '600',
    color: COLORS.TEXT,
    marginBottom: SIZES.SPACING_XS,
  },
  input: {
    backgroundColor: COLORS.WHITE,
    borderWidth: 2,
    borderColor: COLORS.PRIMARY,
    borderRadius: SIZES.BORDER_RADIUS_MD,
    paddingHorizontal: SIZES.SPACING_MD,
    fontSize: SIZES.FONT_SMALL, // 18pt for readability
    minHeight: SIZES.TOUCH_TARGET_MIN, // 56px for easy tapping
    color: COLORS.TEXT,
  },
  inputError: {
    borderColor: COLORS.ERROR,
  },
  errorText: {
    color: COLORS.ERROR,
    fontSize: 16,
    marginTop: SIZES.SPACING_XS,
  },
});
