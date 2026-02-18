import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Platform } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../utils/theme';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAlert } from '../../context/AlertContext';
import { useNavigation } from '@react-navigation/native';
import { partsService } from '../../services/parts.service';
import { useAuth } from '../../hooks/useAuth';

export const SparePartsScreen = () => {
  const navigation = useNavigation<any>();
  const { profile } = useAuth();
  const { showAlert } = useAlert();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    part_name: '',
    vehicle_make: '',
    vehicle_model: '',
    vehicle_year: '',
    quantity: '1',
    description: '',
  });

  const handleSubmit = async () => {
    if (!form.part_name || !form.vehicle_make || !form.vehicle_model) {
      showAlert({ title: 'Error', message: 'Please fill in all required fields.', buttons: [{ text: 'OK', style: 'destructive' }] });
      return;
    }

    setLoading(true);
    try {
      await partsService.submitOrder({
        user_id: profile?.id || 'guest',
        part_name: form.part_name,
        vehicle_make: form.vehicle_make,
        vehicle_model: form.vehicle_model,
        vehicle_year: form.vehicle_year,
        quantity: parseInt(form.quantity),
        description: form.description,
      });

      showAlert({
        title: 'Order Published',
        message: 'Your spare part order has been submitted! Our elite sourcing team will contact you soon.',
        buttons: [{ text: 'OK', onPress: () => navigation.goBack() }]
      });
    } catch (error) {
      console.error('Error submitting part order:', error);
      showAlert({ title: 'Error', message: 'Failed to submit order. Please try again.', buttons: [{ text: 'OK', style: 'destructive' }] });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Spare Parts</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.introText}>
          Tell us which part you need and for which vehicle. We specialize in genuine parts for luxury brands.
        </Text>

        <View style={styles.form}>
          <Input
            label="Part Name (e.g. Brake Pads, Spark Plugs)"
            placeholder="What part are you looking for?"
            value={form.part_name}
            onChangeText={(text) => setForm({ ...form, part_name: text })}
          />

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: SPACING.md }}>
              <Input
                label="Vehicle Make"
                placeholder="e.g. Mercedes"
                value={form.vehicle_make}
                onChangeText={(text) => setForm({ ...form, vehicle_make: text })}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Input
                label="Vehicle Model"
                placeholder="e.g. G63"
                value={form.vehicle_model}
                onChangeText={(text) => setForm({ ...form, vehicle_model: text })}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: SPACING.md }}>
              <Input
                label="Vehicle Year"
                placeholder="e.g. 2022"
                keyboardType="numeric"
                value={form.vehicle_year}
                onChangeText={(text) => setForm({ ...form, vehicle_year: text })}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Input
                label="Quantity"
                placeholder="1"
                keyboardType="numeric"
                value={form.quantity}
                onChangeText={(text) => setForm({ ...form, quantity: text })}
              />
            </View>
          </View>

          <Input
            label="Additional Details (Optional)"
            placeholder="VIN number or specific variations..."
            multiline
            numberOfLines={4}
            value={form.description}
            onChangeText={(text) => setForm({ ...form, description: text })}
          />

          <Button
            title={loading ? 'Submitting...' : 'Place Order Request'}
            onPress={handleSubmit}
            loading={loading}
            style={styles.submitBtn}
          />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    paddingTop: Platform.OS === 'ios' ? 60 : SPACING.lg,
    backgroundColor: COLORS.backgroundCard,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    marginRight: SPACING.md,
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  content: {
    padding: SPACING.lg,
  },
  introText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
    lineHeight: 22,
  },
  form: {
    gap: SPACING.sm,
  },
  row: {
    flexDirection: 'row',
  },
  submitBtn: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.xxl,
  },
});
