import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Image,
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { carsService } from '../../services/cars.service';
import { Car } from '../../types';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../utils/theme';
import { Button } from '../../components/common/Button';
import { VehicleCard } from '../../components/common/VehicleCard';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

export const HomeScreen = () => {
  const { profile } = useAuth();
  const navigation = useNavigation<any>();
  const [featuredCars, setFeaturedCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedCars();
  }, []);

  const fetchFeaturedCars = async () => {
    try {
      // For now, just fetch latest approved cars as "featured"
      const cars = await carsService.searchCars({ limit: 5 });
      setFeaturedCars(cars);
    } catch (error) {
      console.error('Error fetching featured cars:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header / Hero */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.userName}>{profile?.full_name || 'Guest'}</Text>
          </View>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <Icon name="person-circle-outline" size={32} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.heroCard}>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1621135802920-133df287f89c?q=80&w=2070&auto=format&fit=crop' }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={styles.heroOverlay}>
            <Text style={styles.heroTitle}>Find Your Dream Luxury Car</Text>
            <Text style={styles.heroSubtitle}>Exclusive inventory & bespoke preorders</Text>
            <Button 
              title="Explore Inventory" 
              size="sm" 
              onPress={() => navigation.navigate('Inventory')} 
              style={styles.heroButton}
            />
          </View>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={styles.actionItem}
              onPress={() => navigation.navigate('Inventory')}
            >
              <View style={[styles.actionIcon, { backgroundColor: 'rgba(212, 175, 55, 0.1)' }]}>
                <Icon name="car-sport" size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.actionLabel}>Buy Car</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionItem}
              onPress={() => { /* Navigate to Preorder modal or screen */ }}
            >
              <View style={[styles.actionIcon, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                <Icon name="document-text" size={24} color={COLORS.info} />
              </View>
              <Text style={styles.actionLabel}>Preorder</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionItem}
              onPress={() => { /* Services info */ }}
            >
              <View style={[styles.actionIcon, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                <Icon name="shield-checkmark" size={24} color={COLORS.success} />
              </View>
              <Text style={styles.actionLabel}>Services</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Featured Vehicles */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Vehicles</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Inventory')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator color={COLORS.primary} style={{ margin: SPACING.xl }} />
          ) : (
            <FlatList
              data={featuredCars}
              renderItem={({ item }) => (
                <VehicleCard 
                  car={item} 
                  onPress={(car) => navigation.navigate('VehicleDetail', { car })}
                  horizontal={true}
                />
              )}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.featuredList}
            />
          )}
        </View>
      </View>
      
      {/* Bottom Spacer */}
      <View style={{ height: 100 }} />
    </ScrollView>
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
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  welcomeText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  userName: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  profileButton: {
    padding: 4,
  },
  heroCard: {
    height: 200,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: COLORS.backgroundCard,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: SPACING.lg,
    justifyContent: 'center',
  },
  heroTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: '#EEE',
    marginBottom: SPACING.md,
  },
  heroButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.lg,
  },
  content: {
    padding: SPACING.lg,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  seeAll: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionItem: {
    alignItems: 'center',
    flex: 1,
  },
  actionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text,
    fontWeight: '600',
  },
  featuredList: {
    paddingRight: SPACING.xl,
  },
});
