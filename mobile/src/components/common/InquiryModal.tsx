import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../utils/theme';
import { Input } from './Input';
import { Button } from './Button';
import { Car } from '../../types';
import { carsService } from '../../services/cars.service';
import Icon from 'react-native-vector-icons/Ionicons';

interface InquiryModalProps {
  visible: boolean;
  onClose: () => void;
  car: Car;
  type: 'Inspection' | 'Purchase';
}

export const InquiryModal: React.FC<InquiryModalProps> = ({
  visible,
  onClose,
  car,
  type,
}) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const handleSubmit = async () => {
    if (!form.name || !form.email) {
      Alert.alert('Error', 'Please provide at least your name and email.');
      return;
    }

    setLoading(true);
    try {
      await carsService.submitInquiry({
        carId: car.id,
        type,
        customerName: form.name,
        customerEmail: form.email,
        customerPhone: form.phone,
        message: form.message,
      });
      
      Alert.alert(
        'Success',
        `Your ${type.toLowerCase()} request for the ${car.year} ${car.make} ${car.model} has been submitted! We'll contact you soon.`,
        [{ text: 'Great', onPress: onClose }]
      );
      
      setForm({ name: '', email: '', phone: '', message: '' });
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      Alert.alert('Error', 'Failed to submit inquiry. Please try again or contact support.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.title}>{type} Inquiry</Text>
              <TouchableOpacity onPress={onClose}>
                <Icon name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.carInfo}>
                <Text style={styles.carName}>{car.year} {car.make} {car.model}</Text>
                <Text style={styles.carRef}>Ref: {car.id.substring(0, 8).toUpperCase()}</Text>
              </View>

              <Input
                label="Full Name"
                placeholder="Enter your name"
                value={form.name}
                onChangeText={(text) => setForm({ ...form, name: text })}
              />
              <Input
                label="Email Address"
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                value={form.email}
                onChangeText={(text) => setForm({ ...form, email: text })}
              />
              <Input
                label="Phone Number"
                placeholder="Enter your phone"
                keyboardType="phone-pad"
                value={form.phone}
                onChangeText={(text) => setForm({ ...form, phone: text })}
              />
              <Input
                label="Message (Optional)"
                placeholder="Anything else you'd like to tell us?"
                multiline
                numberOfLines={4}
                value={form.message}
                onChangeText={(text) => setForm({ ...form, message: text })}
              />

              <Button
                title={loading ? 'Submitting...' : `Submit ${type} Request`}
                onPress={handleSubmit}
                loading={loading}
                style={styles.submitBtn}
              />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

// Add TouchableOpacity to imports
import { TouchableOpacity } from 'react-native';

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  keyboardView: {
    width: '100%',
  },
  content: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  carInfo: {
    backgroundColor: COLORS.backgroundCard,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  carName: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  carRef: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  submitBtn: {
    marginTop: SPACING.md,
    marginBottom: SPACING.xl,
  },
});
