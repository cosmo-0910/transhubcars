import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Platform, ActivityIndicator } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../utils/theme';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../../hooks/useAuth';
import { carsService } from '../../services/cars.service';
import { Car } from '../../types';

export const FavoritesScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const cars = await carsService.getFavoriteCars(user.id);
      setFavorites(cars);
    } catch (error) {
      console.error('[Favorites] Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (carId: string) => {
    if (!user) return;
    try {
      await carsService.toggleFavorite(user.id, carId);
      setFavorites(prev => prev.filter(car => car.id !== carId));
    } catch (error) {
      console.error('[Favorites] Remove error:', error);
    }
  };

  const renderItem = ({ item }: { item: Car }) => (
    <TouchableOpacity 
      style={styles.carCard}
      onPress={() => navigation.navigate('VehicleDetail', { car: item })}
    >
      <Image source={{ uri: item.image_url }} style={styles.carImage} />
      <View style={styles.carInfo}>
        <Text style={styles.carName}>{item.year} {item.make} {item.model}</Text>
        <Text style={styles.carPrice}>₦{item.price?.toLocaleString()}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{item.status}</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.removeButton} onPress={() => handleRemove(item.id)}>
        <Icon name="heart" size={20} color={COLORS.error} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Favorites</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : favorites.length > 0 ? (
        <FlatList
          data={favorites}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconContainer}>
            <Icon name="heart-outline" size={60} color={COLORS.textMuted} />
          </View>
          <Text style={styles.emptyTitle}>No Favorites Yet</Text>
          <Text style={styles.emptySub}>Save vehicles you're interested in to view them later.</Text>
          <TouchableOpacity 
            style={styles.browseButton}
            onPress={() => navigation.navigate('Inventory')}
          >
            <Text style={styles.browseButtonText}>Browse Inventory</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
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
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: SPACING.lg,
  },
  carCard: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  carImage: {
    width: 100,
    height: 100,
  },
  carInfo: {
    flex: 1,
    padding: SPACING.md,
    justifyContent: 'center',
  },
  carName: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  carPrice: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  badge: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  removeButton: {
    padding: SPACING.md,
    justifyContent: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xxl,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.backgroundCard,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  emptySub: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: SPACING.xxl,
  },
  browseButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xxl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  browseButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.background,
  },
});
