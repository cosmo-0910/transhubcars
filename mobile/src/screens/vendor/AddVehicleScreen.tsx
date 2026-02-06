import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { carsService } from '../../services/cars.service';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../utils/theme';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import Icon from 'react-native-vector-icons/Ionicons';

export const AddVehicleScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  
  const [form, setForm] = useState({
    make: '',
    model: '',
    year: '',
    price: '',
    mileage: '',
    transmission: 'Automatic',
    fuel_type: 'Petrol',
    exterior_color: '',
    interior_color: '',
    description: '',
    status: 'Readily Available' as 'Readily Available' | 'Preorder',
  });

  const updateForm = (key: string, value: any) => {
    setForm({ ...form, [key]: value });
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!form.make || !form.model || !form.price) {
      Alert.alert('Error', 'Please fill in the required fields (Make, Model, Price)');
      return;
    }

    setLoading(true);
    try {
      const carData = {
        ...form,
        year: parseInt(form.year),
        price: parseFloat(form.price),
        mileage: parseInt(form.mileage),
        vendor_id: user?.id,
        approval_status: 'pending' as const,
      };

      await carsService.addCar(carData as any);
      
      Alert.alert(
        'Success',
        'Vehicle listing has been submitted for approval.',
        [{ text: 'Awesome', onPress: () => navigation.navigate('Inventory') }]
      );
    } catch (error) {
      console.error('Error creating car:', error);
      Alert.alert('Error', 'Failed to create listing. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const ProgressBar = () => (
    <View style={styles.progressContainer}>
      <View style={[styles.progressLine, { width: `${(step / 3) * 100}%` }]} />
      <View style={styles.stepIndicators}>
        {[1, 2, 3].map((s) => (
          <View 
            key={s} 
            style={[
              styles.stepDot, 
              step >= s && styles.stepDotActive,
              step === s && styles.stepDotCurrent
            ]}
          >
            <Text style={[styles.stepText, step >= s && styles.stepTextActive]}>{s}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Post New Vehicle</Text>
        <ProgressBar />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {step === 1 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Basic Information</Text>
            <Input
              label="Make *"
              placeholder="e.g. Toyota"
              value={form.make}
              onChangeText={(text) => updateForm('make', text)}
            />
            <Input
              label="Model *"
              placeholder="e.g. Camry"
              value={form.model}
              onChangeText={(text) => updateForm('model', text)}
            />
            <View style={styles.row}>
              <Input
                label="Year"
                placeholder="2024"
                keyboardType="numeric"
                containerStyle={{ flex: 1, marginRight: SPACING.md }}
                value={form.year}
                onChangeText={(text) => updateForm('year', text)}
              />
              <Input
                label="Price (₦) *"
                placeholder="0.00"
                keyboardType="numeric"
                containerStyle={{ flex: 1 }}
                value={form.price}
                onChangeText={(text) => updateForm('price', text)}
              />
            </View>
            <Input
              label="Status"
              placeholder="Select status"
              value={form.status}
              // In real app, use a picker
              onPressIn={() => {
                Alert.alert('Status', 'Select vehicle status', [
                  { text: 'Readily Available', onPress: () => updateForm('status', 'Readily Available') },
                  { text: 'Preorder', onPress: () => updateForm('status', 'Preorder') },
                ]);
              }}
            />
          </View>
        )}

        {step === 2 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Technical Details</Text>
            <Input
              label="Mileage (km)"
              placeholder="0"
              keyboardType="numeric"
              value={form.mileage}
              onChangeText={(text) => updateForm('mileage', text)}
            />
            <View style={styles.row}>
              <Input
                label="Transmission"
                containerStyle={{ flex: 1, marginRight: SPACING.md }}
                value={form.transmission}
                onPressIn={() => {
                  Alert.alert('Transmission', 'Select transmission type', [
                    { text: 'Automatic', onPress: () => updateForm('transmission', 'Automatic') },
                    { text: 'Manual', onPress: () => updateForm('transmission', 'Manual') },
                    { text: 'Semi-Auto', onPress: () => updateForm('transmission', 'Semi-Auto') },
                  ]);
                }}
              />
              <Input
                label="Fuel Type"
                containerStyle={{ flex: 1 }}
                value={form.fuel_type}
                onPressIn={() => {
                  Alert.alert('Fuel Type', 'Select fuel type', [
                    { text: 'Petrol', onPress: () => updateForm('fuel_type', 'Petrol') },
                    { text: 'Diesel', onPress: () => updateForm('fuel_type', 'Diesel') },
                    { text: 'Hybrid', onPress: () => updateForm('fuel_type', 'Hybrid') },
                    { text: 'Electric', onPress: () => updateForm('fuel_type', 'Electric') },
                  ]);
                }}
              />
            </View>
            <View style={styles.row}>
              <Input
                label="Exterior Color"
                placeholder="e.g. Black"
                containerStyle={{ flex: 1, marginRight: SPACING.md }}
                value={form.exterior_color}
                onChangeText={(text) => updateForm('exterior_color', text)}
              />
              <Input
                label="Interior Color"
                placeholder="e.g. Tan"
                containerStyle={{ flex: 1 }}
                value={form.interior_color}
                onChangeText={(text) => updateForm('interior_color', text)}
              />
            </View>
          </View>
        )}

        {step === 3 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Final Touches</Text>
            <Input
              label="Description"
              placeholder="Tell us more about the car..."
              multiline
              numberOfLines={6}
              value={form.description}
              onChangeText={(text) => updateForm('description', text)}
            />
            
            <View style={styles.photoUploadContainer}>
              <Text style={styles.label}>Photos</Text>
              <TouchableOpacity style={styles.photoBox}>
                <Icon name="camera-outline" size={32} color={COLORS.textMuted} />
                <Text style={styles.photoText}>Add Photos</Text>
              </TouchableOpacity>
              <Text style={styles.photoHint}>Maximum 10 images. First one is the cover.</Text>
            </View>
          </View>
        )}

        <View style={styles.buttonContainer}>
          {step > 1 && (
            <Button
              title="Back"
              variant="secondary"
              onPress={handleBack}
              style={{ flex: 1, marginRight: SPACING.md }}
            />
          )}
          {step < 3 ? (
            <Button
              title="Next"
              onPress={handleNext}
              style={{ flex: 2 }}
            />
          ) : (
            <Button
              title={loading ? "Submitting..." : "Post Vehicle"}
              onPress={handleSubmit}
              loading={loading}
              style={{ flex: 2 }}
            />
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: SPACING.lg,
    paddingTop: SPACING.xl,
    backgroundColor: COLORS.backgroundCard,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  progressContainer: {
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    position: 'relative',
    marginTop: 20,
    marginBottom: 10,
  },
  progressLine: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  stepIndicators: {
    position: 'absolute',
    top: -12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 0,
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.backgroundLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepDotActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  stepDotCurrent: {
    borderWidth: 2,
    borderColor: '#FFF',
  },
  stepText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.textMuted,
  },
  stepTextActive: {
    color: COLORS.background,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: 40,
  },
  stepContainer: {
  },
  stepTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xl,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    marginBottom: SPACING.sm,
    fontWeight: '600',
  },
  photoUploadContainer: {
    marginTop: SPACING.md,
  },
  photoBox: {
    height: 150,
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoText: {
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
    fontSize: FONT_SIZES.sm,
  },
  photoHint: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
    fontStyle: 'italic',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: SPACING.xxl,
  },
});
