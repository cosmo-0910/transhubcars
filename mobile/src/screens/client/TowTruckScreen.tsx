import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../utils/theme';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAlert } from '../../context/AlertContext';
import { useNavigation } from '@react-navigation/native';
import { towService } from '../../services/tow.service';
import { useAuth } from '../../hooks/useAuth';

export const TowTruckScreen = () => {
  const navigation = useNavigation<any>();
  const { profile } = useAuth();
  const { showAlert } = useAlert();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    pickup_address: '',
    destination_address: '',
    vehicle_type: '',
    notes: '',
  });

  const handleSubmit = async () => {
    if (!form.pickup_address || !form.vehicle_type) {
      showAlert({ title: 'Error', message: 'Please provide pickup address and vehicle type.', buttons: [{ text: 'OK', style: 'destructive' }] });
      return;
    }

    setLoading(true);
    try {
      const request = await towService.requestTow({
        user_id: profile?.id || 'guest',
        pickup_address: form.pickup_address,
        destination_address: form.destination_address,
        vehicle_type: form.vehicle_type,
        notes: form.notes,
      });

      showAlert({
        title: 'Recovery Requested',
        message: 'We are searching for the nearest tow truck in your vicinity. You will be redirected to live tracking.',
        buttons: [{ text: 'Affirmative', onPress: () => navigation.replace('TowTracking', { requestId: request.id }) }]
      });
    } catch (error) {
      console.error('Error requesting tow:', error);
      showAlert({ title: 'System Error', message: 'Failed to send request. Please try again.', buttons: [{ text: 'OK', style: 'destructive' }] });
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
        <Text style={styles.headerTitle}>Request Tow Truck</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.emergencyBanner}>
          <Icon name="warning-outline" size={24} color="#FFF" />
          <Text style={styles.emergencyText}>Emergency Roadside Assistance</Text>
        </View>

        <TouchableOpacity 
          style={styles.mapPrompt} 
          onPress={() => navigation.navigate('TowTruckMap')}
        >
          <View style={styles.mapPromptLeft}>
            <View style={styles.mapIconContainer}>
              <Icon name="map-outline" size={24} color={COLORS.primary} />
            </View>
            <View>
              <Text style={styles.mapPromptTitle}>Use Map Selector</Text>
              <Text style={styles.mapPromptSub}>Pin your exact location for faster recovery</Text>
            </View>
          </View>
          <Icon name="chevron-forward" size={20} color={COLORS.textMuted} />
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.line} />
          <Text style={styles.dividerText}>OR ENTER MANUALLY</Text>
          <View style={styles.line} />
        </View>

        <View style={styles.form}>
          <Input
            label="Pickup Location"
            placeholder="Where are you currently?"
            value={form.pickup_address}
            onChangeText={(text) => setForm({ ...form, pickup_address: text })}
            leftIcon={<Icon name="location-outline" size={20} color={COLORS.textMuted} />}
          />

          <Input
            label="Destination (Optional)"
            placeholder="Where should we take the vehicle?"
            value={form.destination_address}
            onChangeText={(text) => setForm({ ...form, destination_address: text })}
            leftIcon={<Icon name="navigate-outline" size={20} color={COLORS.textMuted} />}
          />

          <Input
            label="Vehicle Type"
            placeholder="e.g. SUV, Luxury Sedan, Sports Car"
            value={form.vehicle_type}
            onChangeText={(text) => setForm({ ...form, vehicle_type: text })}
            leftIcon={<Icon name="car-sport-outline" size={20} color={COLORS.textMuted} />}
          />

          <Input
            label="Additional Notes"
            placeholder="Describe the issue or any specific requirements..."
            multiline
            numberOfLines={3}
            value={form.notes}
            onChangeText={(text) => setForm({ ...form, notes: text })}
          />

          <View style={styles.vicinityCard}>
            <Icon name="pulse-outline" size={20} color={COLORS.primary} />
            <Text style={styles.vicinityText}>We prioritize tow trucks within 5km of your location for fastest response.</Text>
          </View>

          <Button
            title={loading ? 'Searching...' : 'Request Rapid Recovery'}
            onPress={handleSubmit}
            loading={loading}
            style={styles.submitBtn}
            variant="primary" // Red secondary or something? The theme has primary as gold.
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
  emergencyBanner: {
    backgroundColor: '#E11D48',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xl,
    gap: SPACING.sm,
  },
  emergencyText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: FONT_SIZES.md,
  },
  form: {
    gap: SPACING.sm,
  },
  vicinityCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  vicinityText: {
    flex: 1,
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  submitBtn: {
    marginBottom: SPACING.xxl,
  },
  mapPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.backgroundCard,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.primary,
    marginBottom: SPACING.xl,
    elevation: 2,
  },
  mapPromptLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  mapIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPromptTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  mapPromptSub: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    gap: SPACING.md,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.textMuted,
    letterSpacing: 1,
  },
});
