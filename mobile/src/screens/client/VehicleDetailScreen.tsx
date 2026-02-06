import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  TouchableOpacity,
  Linking,
  Share,
  Alert,
} from 'react-native';
import { Car } from '../../types';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../utils/theme';
import { formatCurrency, getCarDisplayName } from '../../utils/helpers';
import { Button } from '../../components/common/Button';
import { InquiryModal } from '../../components/common/InquiryModal';
import Icon from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export const VehicleDetailScreen = ({ route, navigation }: any) => {
  const { car } = route.params as { car: Car };
  const [inquiryVisible, setInquiryVisible] = useState(false);
  const [inquiryType, setInquiryType] = useState<'Inspection' | 'Purchase'>('Inspection');

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this ${getCarDisplayName(car.make, car.model, car.year)} on Transhub! ${formatCurrency(car.price)}`,
        url: 'https://transhub.cars', // Fallback URL
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleAction = (type: 'Inspection' | 'Purchase') => {
    setInquiryType(type);
    setInquiryVisible(true);
  };

  const SpecItem = ({ icon, label, value }: { icon: string, label: string, value: string | number }) => (
    <View style={styles.specItem}>
      <Icon name={icon} size={20} color={COLORS.primary} />
      <View>
        <Text style={styles.specLabel}>{label}</Text>
        <Text style={styles.specValue}>{value}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Gallery */}
        <View style={styles.gallery}>
          <Image
            source={{ uri: car.image_url || 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?q=80&w=2070&auto=format&fit=crop' }}
            style={styles.heroImage}
          />
          <SafeAreaView style={styles.headerButtons}>
            <TouchableOpacity 
              style={styles.circleButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="chevron-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.circleButton}
              onPress={handleShare}
            >
              <Icon name="share-outline" size={24} color="#FFF" />
            </TouchableOpacity>
          </SafeAreaView>
        </View>

        <View style={styles.content}>
          <View style={styles.titleSection}>
            <View>
              <Text style={styles.yearText}>{car.year}</Text>
              <Text style={styles.titleText}>{car.make} {car.model}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: car.status === 'Preorder' ? COLORS.info : COLORS.success }]}>
              <Text style={styles.badgeText}>{car.status}</Text>
            </View>
          </View>

          <Text style={styles.priceText}>{formatCurrency(car.price)}</Text>

          {/* Key Specs */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Specifications</Text>
            <View style={styles.specsGrid}>
              <SpecItem icon="speedometer-outline" label="Mileage" value={car.mileage ? `${car.mileage}km` : 'New'} />
              <SpecItem icon="cog-outline" label="Transmission" value={car.transmission || 'Automatic'} />
              <SpecItem icon="color-fill-outline" label="Fuel" value={car.fuel_type || 'Petrol'} />
              <SpecItem icon="color-palette-outline" label="Exterior" value={car.exterior_color || 'N/A'} />
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.descriptionText}>
              {car.description || 'No description provided for this luxury vehicle.'}
            </Text>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Sticky Bottom Actions */}
      <View style={styles.bottomBar}>
        <Button 
          title="Request Inspection" 
          variant="outline" 
          style={styles.actionButton}
          onPress={() => handleAction('Inspection')}
        />
        <Button 
          title="I'm Interested" 
          style={styles.actionButton}
          onPress={() => handleAction('Purchase')}
        />
      </View>

      <InquiryModal
        visible={inquiryVisible}
        onClose={() => setInquiryVisible(false)}
        car={car}
        type={inquiryType}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  gallery: {
    height: 350,
    width: '100%',
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  headerButtons: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
  },
  circleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: SPACING.lg,
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  yearText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
    fontWeight: '600',
  },
  titleText: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  badgeText: {
    color: '#FFF',
    fontSize: FONT_SIZES.xs,
    fontWeight: 'bold',
  },
  priceText: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.xl,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  specsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    width: (width - SPACING.lg * 2 - SPACING.md) / 2,
    backgroundColor: COLORS.backgroundCard,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  specLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
  },
  specValue: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontWeight: '600',
  },
  descriptionText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.background,
    padding: SPACING.lg,
    paddingBottom: 40,
    flexDirection: 'row',
    gap: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  actionButton: {
    flex: 1,
  },
});
