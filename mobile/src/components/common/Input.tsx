import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
  StyleProp,
  ViewStyle,
  TouchableOpacity,
} from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../utils/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
  onPressIn?: () => void;
  pointerEvents?: 'box-none' | 'none' | 'box-only' | 'auto';
  leftIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  containerStyle,
  onPressIn,
  pointerEvents,
  leftIcon,
  ...props
}) => {
  return (
    <View style={[styles.container, containerStyle]} pointerEvents={pointerEvents}>
      <TouchableOpacity 
        activeOpacity={onPressIn ? 0.7 : 1} 
        onPress={onPressIn}
      >
        {label && <Text style={styles.label}>{label}</Text>}
        <View style={[
          styles.inputWrapper,
          error && styles.errorInput,
        ]} pointerEvents={onPressIn ? 'none' : 'auto'}>
          {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
          <TextInput
            style={[
              styles.input,
              props.multiline && styles.multilineInput,
            ]}
            placeholderTextColor={COLORS.textMuted}
            {...props}
          />
        </View>
        {error && <Text style={styles.errorText}>{error}</Text>}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    marginBottom: SPACING.xs,
    fontWeight: '600',
  },
  inputWrapper: {
    backgroundColor: COLORS.backgroundCard,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  leftIcon: {
    paddingLeft: SPACING.md,
  },
  input: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    height: 48,
    color: COLORS.text,
    fontSize: FONT_SIZES.md,
  },
  multilineInput: {
    height: 120,
    paddingTop: SPACING.sm,
    textAlignVertical: 'top',
  },
  errorInput: {
    borderColor: COLORS.error,
  },
  errorText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.error,
    marginTop: 4,
  },
});
