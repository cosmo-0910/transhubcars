import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Car } from '../../types';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../utils/theme';
import { formatCurrency, getCarDisplayName } from '../../utils/helpers';
import Icon from 'react-native-vector-icons/Ionicons';

interface VehicleCardProps {
  car: Car;
  onPress: (car: Car) => void;
  horizontal?: boolean;
}

const { width } = Dimensions.get('window');

export const VehicleCard: React.FC<VehicleCardProps> = ({
  car,
  onPress,
  horizontal = false,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => onPress(car)}
      style={[
        styles.container,
        horizontal ? styles.horizontalContainer : styles.verticalContainer,
      ]}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: car.image_url || 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?q=80&w=2070&auto=format&fit=crop' }}
          style={horizontal ? styles.horizontalImage : styles.verticalImage}
          resizeMode="cover"
        />
        {car.status === 'Preorder' && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Preorder</Text>
          </View>
        )}
      </View>
      
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {getCarDisplayName(car.make, car.model, car.year)}
        </Text>
        
        <View style={styles.details}>
          <View style={styles.detailItem}>
            <Icon name="speedometer-outline" size={14} color={COLORS.textMuted} />
            <Text style={styles.detailText}>{car.mileage ? `${car.mileage}km` : 'New'}</Text>
          </View>
          <View style={styles.detailItem}>
            <Icon name="cog-outline" size={14} color={COLORS.textMuted} />
            <Text style={styles.detailText}>{car.transmission || 'Auto'}</Text>
          </View>
        </View>

        <Text style={styles.price}>{formatCurrency(car.price)}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  verticalContainer: {
    width: (width - SPACING.xl * 2 - SPACING.md) / 2, // 2-column grid
  },
  horizontalContainer: {
    width: width * 0.7,
    marginRight: SPACING.md,
  },
  imageContainer: {
    position: 'relative',
  },
  verticalImage: {
    width: '100%',
    height: 120,
  },
  horizontalImage: {
    width: '100%',
    height: 160,
  },
  badge: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  badgeText: {
    color: COLORS.background,
    fontSize: FONT_SIZES.xs,
    fontWeight: 'bold',
  },
  info: {
    padding: SPACING.sm,
  },
  name: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  details: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: SPACING.sm,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
  },
  price: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
});
