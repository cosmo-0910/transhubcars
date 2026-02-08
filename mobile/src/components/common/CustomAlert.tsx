import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../utils/theme';

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
  buttons?: {
    text: string;
    onPress?: () => void;
    style?: 'default' | 'cancel' | 'destructive';
  }[];
}

export const CustomAlert = ({ visible, title, message, onClose, buttons }: CustomAlertProps) => {
  const handleButtonPress = (onPress?: () => void) => {
    if (onPress) {
      onPress();
    }
    onClose();
  };

  const defaultButtons = [
    { text: 'OK', onPress: onClose, style: 'default' }
  ];

  const actionButtons = buttons && buttons.length > 0 ? buttons : defaultButtons;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.alertContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          
          <View style={styles.buttonContainer}>
            {actionButtons.map((btn, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.button,
                  btn.style === 'cancel' && styles.cancelButton,
                  btn.style === 'destructive' && styles.destructiveButton,
                ]}
                onPress={() => handleButtonPress(btn.onPress)}
              >
                <Text
                  style={[
                    styles.buttonText,
                    btn.style === 'cancel' && styles.cancelButtonText,
                    btn.style === 'destructive' && styles.destructiveButtonText,
                  ]}
                >
                  {btn.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertContainer: {
    width: Dimensions.get('window').width * 0.8,
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  message: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '100%',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  button: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.primary,
    minWidth: 80,
    alignItems: 'center',
  },
  buttonText: {
    color: COLORS.background,
    fontWeight: '600',
    fontSize: FONT_SIZES.md,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cancelButtonText: {
    color: COLORS.text,
  },
  destructiveButton: {
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  destructiveButtonText: {
    color: COLORS.error,
  },
});
