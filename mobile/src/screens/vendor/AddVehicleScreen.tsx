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
import { useAlert } from '../../context/AlertContext';
import { carsService } from '../../services/cars.service';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../utils/theme';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { LuxuryPicker } from '../../components/common/LuxuryPicker';
import Icon from 'react-native-vector-icons/Ionicons';
import { launchImageLibrary } from 'react-native-image-picker';
import { checkMediaPermissions } from '../../utils/permissions';
import { vendorService } from '../../services/vendor.service';
import { formatCurrency } from '../../utils/helpers';

const STANDARD_FEATURES = [
  'Air Conditioning', 'Alloy Wheels', 'AM/FM Radio', 'Android Auto / Apple CarPlay',
  'Anti-Lock Brakes', 'Armrests', 'Blind Spot Monitor', 'CD Player',
  'Cruise Control', 'Cup Holders', 'DVD Player', 'Electric Mirrors',
  'Electric Windows', 'Fog Lights', 'Front Fog Lamps', 'Heated Seats',
  'Keyless Entry / Start', 'Leather Seats / Upholstery', 'LED Headlights',
  'Navigation System', 'Parking Sensors', 'Power Steering', 'Rear Camera',
  'Roof Rack', 'Sunroof / Moonroof', 'Touchscreen', 'Traction Control',
  'USB / AUX Port', 'Xenon Lights',
];

const NIGERIAN_MARKET_TAGS = [
  'Accident Free', 'First Body', 'First Owner', 'Full Option / Fully Loaded',
  'Leather Interior', 'Low Mileage', 'Neatly Used', 'New Shape / Facelift',
  'No Faults', 'Registered', 'Reverse Camera', 'Soundproofed',
];

export const AddVehicleScreen = ({ navigation, route }: any) => {
  const { user, profile } = useAuth();
  const { showAlert } = useAlert();
  const editCar = route.params?.car;
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [financeSettings, setFinanceSettings] = useState<any>(null);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(editCar?.features || []);
  
  const [form, setForm] = useState({
    make: editCar?.make || '',
    model: editCar?.model || '',
    year: editCar?.year?.toString() || '',
    price: editCar?.price?.toString() || '',
    mileage: editCar?.mileage?.toString() || '',
    transmission: editCar?.transmission || 'Automatic',
    fuel_type: editCar?.fuel_type || 'Petrol',
    exterior_color: editCar?.exterior_color || '',
    interior_color: editCar?.interior_color || '',
    description: editCar?.description || '',
    status: (editCar?.status || 'Readily Available') as 'Readily Available' | 'Preorder',
    images: (editCar?.gallery_urls || []) as string[],
  });

  React.useEffect(() => {
    const fetchSettings = async () => {
      const settings = await vendorService.getPlatformFinanceSettings();
      setFinanceSettings(settings);
    };
    fetchSettings();
  }, []);

  const calculateFees = () => {
    const price = parseFloat(form.price) || 0;
    const commissionPct = financeSettings?.car_listing_commission_pct || 2.5;
    const fee = (price * commissionPct) / 100;
    const payout = price - fee;
    return { fee, payout, pct: commissionPct };
  };


  const [pickerConfig, setPickerConfig] = useState({
    visible: false,
    title: '',
    options: [] as any[],
    onSelect: (val: any) => {},
    selectedValue: null as any,
  });

  const updateForm = (key: string, value: any) => {
    setForm({ ...form, [key]: value });
  };

  const toggleFeature = (f: string) =>
    setSelectedFeatures(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]);

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!form.make || !form.model || !form.price) {
      showAlert({ title: 'Error', message: 'Please fill in the required fields (Make, Model, Price)' });
      return;
    }

    setLoading(true);
    try {
      const carData = {
        ...form,
        year: parseInt(form.year),
        price: parseFloat(form.price),
        mileage: parseInt(form.mileage),
        features: selectedFeatures,
        vendor_id: user?.id,
        approval_status: 'pending' as const,
      };

      if (editCar) {
        await carsService.updateCar(editCar.id, carData as any);
        showAlert({
          title: 'Success',
          message: 'Vehicle listing has been updated.',
          buttons: [{ text: 'Awesome', onPress: () => navigation.goBack() }]
        });
      } else {
        await carsService.addCar(carData as any);
        showAlert({
          title: 'Success',
          message: 'Vehicle listing has been submitted for approval.',
          buttons: [{ text: 'Awesome', onPress: () => navigation.navigate('Inventory') }]
        });
      }
    } catch (error) {
      console.error('Error saving car:', error);
      showAlert({ title: 'Error', message: 'Failed to save listing. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleImagePick = async () => {
    try {
      const hasPermission = await checkMediaPermissions();
      if (!hasPermission) return;
      const result = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 10 - form.images.length,
        quality: 0.8,
      });

      if (result.assets && result.assets.length > 0) {
        setLoading(true);
        const newImages = [...form.images];
        
        for (const asset of result.assets) {
          if (asset.uri && asset.type && asset.fileName) {
            const url = await carsService.uploadCarImage({
              uri: asset.uri,
              type: asset.type,
              name: asset.fileName,
            }, user?.id || 'unknown', profile?.business_name || profile?.full_name || 'vendor');
            newImages.push(url);
          }
        }
        
        updateForm('images', newImages);
        setLoading(false);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      setLoading(false);
      showAlert({ title: 'Error', message: 'Failed to pick images' });
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
      <LuxuryPicker
        visible={pickerConfig.visible}
        title={pickerConfig.title}
        options={pickerConfig.options}
        selectedValue={pickerConfig.selectedValue}
        onSelect={pickerConfig.onSelect}
        onClose={() => setPickerConfig(prev => ({ ...prev, visible: false }))}
      />
      <View style={styles.header}>
        <Text style={styles.title}>{editCar ? 'Edit Vehicle' : 'Post New Vehicle'}</Text>
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

            {form.price ? (
              <View style={styles.feeBreakdown}>
                <View style={styles.feeRow}>
                  <Text style={styles.feeLabel}>Platform Fee ({calculateFees().pct}%)</Text>
                  <Text style={styles.feeValue}>- {formatCurrency(calculateFees().fee)}</Text>
                </View>
                <View style={[styles.feeRow, styles.payoutRow]}>
                  <Text style={styles.payoutLabel}>Your Payout</Text>
                  <Text style={styles.payoutValue}>{formatCurrency(calculateFees().payout)}</Text>
                </View>
              </View>
            ) : null}

            <Input
              label="Status"
              placeholder="Select status"
              value={form.status}
              // In real app, use a picker
              onPressIn={() => {
                setPickerConfig({
                  visible: true,
                  title: 'Select Status',
                  selectedValue: form.status,
                  options: [
                    { label: 'Readily Available', value: 'Readily Available', icon: 'car-outline' },
                    { label: 'Preorder', value: 'Preorder', icon: 'time-outline' },
                  ],
                  onSelect: (val) => updateForm('status', val),
                });
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
                  setPickerConfig({
                    visible: true,
                    title: 'Transmission',
                    selectedValue: form.transmission,
                    options: [
                      { label: 'Automatic', value: 'Automatic' },
                      { label: 'Manual', value: 'Manual' },
                      { label: 'Semi-Auto', value: 'Semi-Auto' },
                    ],
                    onSelect: (val) => updateForm('transmission', val),
                  });
                }}
              />
              <Input
                label="Fuel Type"
                containerStyle={{ flex: 1 }}
                value={form.fuel_type}
                onPressIn={() => {
                  setPickerConfig({
                    visible: true,
                    title: 'Fuel Type',
                    selectedValue: form.fuel_type,
                    options: [
                      { label: 'Petrol', value: 'Petrol' },
                      { label: 'Diesel', value: 'Diesel' },
                      { label: 'Hybrid', value: 'Hybrid' },
                      { label: 'Electric', value: 'Electric' },
                    ],
                    onSelect: (val) => updateForm('fuel_type', val),
                  });
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

            {/* Features & Options */}
            <Text style={styles.sectionLabel}>Features & Options</Text>
            <Text style={styles.sectionSublabel}>STANDARD FEATURES</Text>
            <View style={styles.tagsContainer}>
              {STANDARD_FEATURES.map(f => {
                const active = selectedFeatures.includes(f);
                return (
                  <TouchableOpacity
                    key={f}
                    onPress={() => toggleFeature(f)}
                    style={[styles.featureTag, active && styles.featureTagActive]}
                  >
                    {active && <Icon name="checkmark" size={11} color={COLORS.primary} style={{ marginRight: 4 }} />}
                    <Text style={[styles.featureTagText, active && styles.featureTagTextActive]}>{f}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={[styles.sectionSublabel, { marginTop: SPACING.lg }]}>MARKET CONDITION TAGS</Text>
            <View style={styles.tagsContainer}>
              {NIGERIAN_MARKET_TAGS.map(f => {
                const active = selectedFeatures.includes(f);
                return (
                  <TouchableOpacity
                    key={f}
                    onPress={() => toggleFeature(f)}
                    style={[styles.featureTag, active && styles.featureTagBlueActive]}
                  >
                    {active && <Icon name="checkmark" size={11} color="#60a5fa" style={{ marginRight: 4 }} />}
                    <Text style={[styles.featureTagText, active && styles.featureTagTextBlue]}>{f}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {selectedFeatures.length > 0 && (
              <Text style={styles.featureCount}>{selectedFeatures.length} feature{selectedFeatures.length !== 1 ? 's' : ''} selected</Text>
            )}
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
              <Text style={styles.label}>Photos ({form.images.length}/10)</Text>
              
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageList}>
                {form.images.map((img, index) => (
                  <View key={index} style={styles.imagePreview}>
                    <Image source={{ uri: img }} style={styles.previewImage} />
                    <TouchableOpacity 
                      style={styles.removeImage}
                      onPress={() => {
                        const newImages = [...form.images];
                        newImages.splice(index, 1);
                        updateForm('images', newImages);
                      }}
                    >
                      <Icon name="close-circle" size={24} color={COLORS.error} />
                    </TouchableOpacity>
                  </View>
                ))}
                
                {form.images.length < 10 && (
                  <TouchableOpacity style={styles.photoBox} onPress={handleImagePick}>
                    <Icon name="camera-outline" size={32} color={COLORS.textMuted} />
                    <Text style={styles.photoText}>Add</Text>
                  </TouchableOpacity>
                )}
              </ScrollView>
              <Text style={styles.photoHint}>First image is the cover.</Text>
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
    width: 100,
    height: 100,
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  photoText: {
    color: COLORS.textMuted,
    marginTop: 4,
    fontSize: FONT_SIZES.xs,
  },
  imageList: {
    flexDirection: 'row',
  },
  imagePreview: {
    width: 100,
    height: 100,
    marginRight: SPACING.md,
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: BORDER_RADIUS.md,
  },
  removeImage: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: COLORS.background,
    borderRadius: 12,
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
  feeBreakdown: {
    backgroundColor: COLORS.backgroundCard,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginTop: -SPACING.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  feeLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  feeValue: {
    fontSize: 10,
    color: COLORS.error,
    fontWeight: '700',
  },
  payoutRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginBottom: 0,
  },
  payoutLabel: {
    fontSize: 12,
    color: COLORS.text,
    fontWeight: '800',
  },
  payoutValue: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '800',
  },
  sectionLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: SPACING.xl,
    marginBottom: SPACING.sm,
  },
  sectionSublabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  featureTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.backgroundCard,
  },
  featureTagActive: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(197, 160, 89, 0.1)',
  },
  featureTagBlueActive: {
    borderColor: 'rgba(96,165,250,0.5)',
    backgroundColor: 'rgba(59,130,246,0.08)',
  },
  featureTagText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  featureTagTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  featureTagTextBlue: {
    color: '#93c5fd',
    fontWeight: '700',
  },
  featureCount: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.primary,
    marginTop: SPACING.sm,
    fontWeight: '600',
  },
});
