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
import { formatCurrency, getCarDisplayName, maskVIN } from '../../utils/helpers';
import { Button } from '../../components/common/Button';
import { InquiryModal } from '../../components/common/InquiryModal';
import Icon from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export const VehicleDetailScreen = ({ route, navigation }: any) => {
  const { car } = route.params as { car: Car };
  const [inquiryVisible, setInquiryVisible] = useState(false);
  const [inquiryType, setInquiryType] = useState<'Inspection' | 'Purchase'>('Inspection');

  const allImages = [car.image_url, ...(car.gallery_urls || [])].filter(Boolean);

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

  const SpecItem = ({ icon, label, value, fullWidth }: { icon: string, label: string, value: string | number, fullWidth?: boolean }) => (
    <View style={[styles.specItem, fullWidth && { width: '100%' }]}>
      <Icon name={icon} size={20} color={COLORS.primary} />
      <View style={{ flex: 1 }}>
        <Text style={styles.specLabel}>{label}</Text>
        <Text style={styles.specValue} numberOfLines={1}>{value}</Text>
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
              <Text style={styles.yearText}>{car.year} EDITION</Text>
              <Text style={styles.titleText}>{car.make} {car.model}</Text>
              <View style={styles.badgeRow}>
                <View style={[styles.statusBadge, { backgroundColor: car.status === 'Preorder' ? COLORS.info : COLORS.success }]}>
                  <Text style={styles.badgeText}>{car.status}</Text>
                </View>
                {!car.vendor_id ? (
                  <View style={styles.officialBadge}>
                    <Icon name="shield-checkmark" size={12} color={COLORS.primary} />
                    <Text style={styles.officialBadgeText}>OFFICIAL</Text>
                  </View>
                ) : (
                  <View style={styles.vendorBadge}>
                    <Icon name="storefront" size={12} color={COLORS.text} />
                    <Text style={styles.vendorBadgeText}>VERIFIED VENDOR</Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          <View style={styles.priceContainer}>
            <View>
              <Text style={styles.priceLabel}>RESERVE FOR</Text>
              <Text style={styles.priceText}>{formatCurrency(car.price)}</Text>
            </View>
            <Text style={styles.snText}>SN: {car.stock_number || 'N/A'}</Text>
          </View>

          {/* Key Specs */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>PRIORITY SPECIFICATIONS</Text>
            <View style={styles.specsGrid}>
              <SpecItem icon="speedometer-outline" label="MILEAGE" value={car.mileage ? `${car.mileage.toLocaleString()} KM` : 'NEW'} />
              <SpecItem icon="settings-outline" label="ENGINE" value={car.engine || 'N/A'} />
              <SpecItem icon="flash-outline" label="TRANS" value={car.transmission || 'Automatic'} />
              <SpecItem icon="water-outline" label="FUEL" value={car.fuel_type || 'Petrol'} />
              <SpecItem icon="color-palette-outline" label="EXTERIOR" value={car.exterior_color || 'N/A'} />
              <SpecItem icon="finger-print-outline" label="INTERIOR" value={car.interior_color || 'N/A'} />
              <SpecItem 
                icon="barcode-outline" 
                label="VIN REFERENCE" 
                value={maskVIN(car.vin)} 
                fullWidth 
              />
            </View>
          </View>

          {/* Features & Options */}
          {car.features && car.features.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>FEATURES & OPTIONS</Text>
              <View style={styles.featuresContainer}>
                {car.features.map((feature: string, idx: number) => {
                  const isMarketTag = [
                    'Accident Free','First Body','First Owner','Full Option / Fully Loaded',
                    'Leather Interior','Low Mileage','Neatly Used','New Shape / Facelift',
                    'No Faults','Registered','Reverse Camera','Soundproofed'
                  ].includes(feature);
                  return (
                    <View key={idx} style={[styles.featurePill, isMarketTag && styles.featurePillBlue]}>
                      <Text style={[styles.featurePillText, isMarketTag && styles.featurePillTextBlue]}>
                        {feature}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>CURATOR'S ANALYSIS</Text>
            <Text style={styles.descriptionText}>
              {car.description || 'This specimen represents a peak in automotive engineering, offering a unique blend of heritage and contemporary performance.'}
            </Text>
          </View>

          {/* Visual Asset Dossier */}
          {allImages.length > 1 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>VISUAL ASSET DOSSIER</Text>
              <View style={styles.galleryGrid}>
                {allImages.slice(1).map((url, index) => (
                  <Image key={index} source={{ uri: url }} style={styles.galleryGridImage} />
                ))}
              </View>
            </View>
          )}
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
    marginBottom: SPACING.md,
  },
  yearText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 4,
  },
  titleText: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  officialBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  officialBadgeText: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  vendorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.backgroundCard,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  vendorBadgeText: {
    color: COLORS.text,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  badgeText: {
    color: '#FFF',
    fontSize: FONT_SIZES.xs,
    fontWeight: 'bold',
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
    backgroundColor: COLORS.backgroundCard,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  priceLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    letterSpacing: 1,
    fontWeight: '700',
    marginBottom: 2,
  },
  priceText: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '800',
    color: COLORS.primary,
  },
  snText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 2,
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
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  specValue: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontWeight: '700',
  },
  descriptionText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    lineHeight: 24,
    fontStyle: 'italic',
  },
  galleryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  galleryGridImage: {
    width: (width - SPACING.lg * 2 - SPACING.sm) / 2,
    height: 120,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.backgroundCard,
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
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  featurePill: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(197,160,89,0.35)',
    backgroundColor: 'rgba(197,160,89,0.06)',
  },
  featurePillBlue: {
    borderColor: 'rgba(96,165,250,0.35)',
    backgroundColor: 'rgba(59,130,246,0.07)',
  },
  featurePillText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.primary,
    fontWeight: '600',
  },
  featurePillTextBlue: {
    color: '#93c5fd',
  },
});
