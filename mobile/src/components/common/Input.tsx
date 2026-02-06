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
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  containerStyle,
  onPressIn,
  pointerEvents,
  ...props
}) => {
  return (
    <TouchableOpacity 
      activeOpacity={onPressIn ? 0.7 : 1} 
      onPress={onPressIn}
      style={[styles.container, containerStyle]}
      pointerEvents={pointerEvents}
    >
      {label && <Text style={styles.label}>{label}</Text>}
      <View pointerEvents={onPressIn ? 'none' : 'auto'}>
        <TextInput
          style={[
            styles.input,
            props.multiline && styles.multilineInput,
            error && styles.errorInput,
          ]}
          placeholderTextColor={COLORS.textMuted}
          {...props}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </TouchableOpacity>
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
  input: {
    backgroundColor: COLORS.backgroundCard,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
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
