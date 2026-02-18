import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
  Alert,
  Platform,
} from 'react-native';
import { partsService } from '../../services/parts.service';
import { useAuth } from '../../hooks/useAuth';
import { useAlert } from '../../context/AlertContext';
import { carsService } from '../../services/cars.service';
import { Car } from '../../types';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../utils/theme';
import { formatCurrency, getCarDisplayName } from '../../utils/helpers';
import Icon from 'react-native-vector-icons/Ionicons';

export const ManageInventoryScreen = ({ navigation }: any) => {
  const { user, profile } = useAuth();
  const { showAlert } = useAlert();
  const [inventoryType, setInventoryType] = useState<'cars' | 'parts'>(
    profile?.vendor_type === 'parts' ? 'parts' : 'cars'
  );
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchVendorCars = async () => {
    if (!user) return;
    try {
      const data = await carsService.getVendorCars(user.id);
      setCars(data);
    } catch (error) {
      console.error('Error fetching vendor cars:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchVendorCars();
  }, [user]);

  const handleDeleteCar = async (carId: string) => {
    showAlert({
      title: 'Delete Listing',
      message: 'Are you sure you want to delete this vehicle listing? This action cannot be undone.',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await carsService.deleteCar(carId);
              setCars(prev => prev.filter(car => car.id !== carId));
              showAlert({ title: 'Success', message: 'Vehicle listing deleted.' });
            } catch (error) {
              showAlert({ title: 'Error', message: 'Failed to delete listing.', buttons: [{ text: 'OK', style: 'destructive' }] });
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    });
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchVendorCars();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return '#4CAF50';
      case 'pending': return '#FF9800';
      case 'rejected': return COLORS.error;
      default: return COLORS.textMuted;
    }
  };

  const renderItem = ({ item }: { item: Car }) => (
    <TouchableOpacity 
      style={styles.carCard}
      onPress={() => navigation.navigate('VehicleDetail', { car: item })}
    >
      <Image 
        source={{ uri: item.image_url || 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?q=80&w=2070&auto=format&fit=crop' }} 
        style={styles.carImage} 
      />
      <View style={styles.carInfo}>
        <View style={styles.cardHeader}>
          <Text style={styles.carName} numberOfLines={1}>
            {getCarDisplayName(item.make, item.model, item.year)}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor((item as any).approval_status)}15` }]}>
            <Text style={[styles.statusText, { color: getStatusColor((item as any).approval_status) }]}>
              {(item as any).approval_status?.toUpperCase() || 'UNKNOWN'}
            </Text>
          </View>
        </View>
        
        <Text style={styles.price}>{formatCurrency(item.price)}</Text>
        
        <View style={styles.cardFooter}>
          <Text style={styles.carMeta}>{item.status}</Text>
          <View style={styles.actions}>
            <TouchableOpacity 
              style={styles.actionIcon}
              onPress={() => navigation.navigate('AddVehicle', { car: item })}
            >
              <Icon name="create-outline" size={18} color={COLORS.text} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionIcon}
              onPress={() => handleDeleteCar(item.id)}
            >
              <Icon name="trash-outline" size={18} color={COLORS.error} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Inventory</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => navigation.navigate(inventoryType === 'cars' ? 'AddVehicle' : 'AddSparePart')}
        >
          <Icon name="add" size={24} color={COLORS.background} />
        </TouchableOpacity>
      </View>

      {profile?.vendor_type === 'both' && (
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, inventoryType === 'cars' && styles.activeTab]}
            onPress={() => setInventoryType('cars')}
          >
            <Text style={[styles.tabText, inventoryType === 'cars' && styles.activeTabText]}>Vehicles</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, inventoryType === 'parts' && styles.activeTab]}
            onPress={() => setInventoryType('parts')}
          >
            <Text style={[styles.tabText, inventoryType === 'parts' && styles.activeTabText]}>Spare Parts</Text>
          </TouchableOpacity>
        </View>
      )}

      {inventoryType === 'parts' ? (
        <VendorPartsList navigation={navigation} />
      ) : loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={cars}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="car-outline" size={64} color={COLORS.border} />
              <Text style={styles.emptyText}>You haven't posted any vehicles yet.</Text>
              <TouchableOpacity 
                style={styles.emptyButton}
                onPress={() => navigation.navigate('AddVehicle')}
              >
                <Text style={styles.emptyButtonText}>Post Your First Car</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </View>
  );
};

const VendorPartsList = ({ navigation }: any) => {
  const { user } = useAuth();
  const [parts, setParts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchParts = async () => {
    if (!user) return;
    try {
      const data = await partsService.getVendorParts(user.id);
      setParts(data);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchParts(); }, [user]);

  const renderPart = ({ item }: any) => (
    <View style={styles.carCard}>
      <Image source={{ uri: item.image_url }} style={styles.carImage} />
      <View style={styles.carInfo}>
        <View style={styles.cardHeader}>
          <Text style={styles.carName} numberOfLines={1}>{item.name}</Text>
          <View style={[styles.statusBadge, { backgroundColor: '#4CAF5015' }]}>
            <Text style={[styles.statusText, { color: '#4CAF50' }]}>{item.status.toUpperCase()}</Text>
          </View>
        </View>
        <Text style={styles.price}>{formatCurrency(item.price)}</Text>
        <View style={styles.cardFooter}>
          <Text style={styles.carMeta}>{item.category} • {item.condition}</Text>
          <View style={styles.actions}>
            <TouchableOpacity onPress={() => navigation.navigate('AddSparePart', { part: item })}>
              <Icon name="create-outline" size={18} color={COLORS.text} style={styles.actionIcon} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  if (loading && !refreshing) return <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />;

  return (
    <FlatList
      data={parts}
      renderItem={renderPart}
      keyExtractor={item => item.id}
      contentContainerStyle={styles.listContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchParts(); }} />}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No spare parts listed yet.</Text>
        </View>
      }
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    paddingTop: Platform.OS === 'ios' ? 60 : SPACING.lg,
    backgroundColor: COLORS.backgroundCard,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.backgroundCard,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tab: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  activeTabText: {
    color: COLORS.background,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: SPACING.lg,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  carCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    height: 110,
  },
  carImage: {
    width: 110,
    height: '100%',
  },
  carInfo: {
    flex: 1,
    padding: SPACING.sm,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  carName: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 8,
    fontWeight: 'bold',
  },
  price: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  carMeta: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIcon: {
    marginLeft: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZES.md,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  emptyButton: {
    marginTop: SPACING.xl,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
  },
  emptyButtonText: {
    color: COLORS.background,
    fontWeight: 'bold',
    fontSize: FONT_SIZES.md,
  },
});
