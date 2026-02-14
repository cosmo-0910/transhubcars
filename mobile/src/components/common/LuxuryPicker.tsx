import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../utils/theme';
import Icon from 'react-native-vector-icons/Ionicons';

interface Option {
  label: string;
  value: any;
  icon?: string;
}

interface LuxuryPickerProps {
  visible: boolean;
  title: string;
  options: Option[];
  onSelect: (value: any) => void;
  onClose: () => void;
  selectedValue?: any;
}

export const LuxuryPicker = ({ visible, title, options, onSelect, onClose, selectedValue }: LuxuryPickerProps) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {options.map((option, index) => (
              <TouchableOpacity 
                key={index} 
                style={[
                  styles.option,
                  selectedValue === option.value && styles.selectedOption
                ]}
                onPress={() => {
                  onSelect(option.value);
                  onClose();
                }}
              >
                <View style={styles.optionLeft}>
                  {option.icon && (
                    <Icon 
                      name={option.icon} 
                      size={20} 
                      color={selectedValue === option.value ? COLORS.primary : COLORS.textMuted} 
                      style={styles.optionIcon} 
                    />
                  )}
                  <Text style={[
                    styles.optionLabel,
                    selectedValue === option.value && styles.selectedLabel
                  ]}>
                    {option.label}
                  </Text>
                </View>
                {selectedValue === option.value && (
                  <Icon name="checkmark-circle" size={20} color={COLORS.primary} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: COLORS.backgroundCard,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    paddingTop: SPACING.lg,
    maxHeight: '70%',
    paddingBottom: Platform.OS === 'ios' ? 40 : SPACING.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  list: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.md,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.xs,
  },
  selectedOption: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIcon: {
    marginRight: SPACING.md,
  },
  optionLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  selectedLabel: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
});
