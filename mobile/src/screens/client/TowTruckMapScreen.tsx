import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Alert, Dimensions, PermissionsAndroid } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../utils/theme';
import { useAlert } from '../../context/AlertContext';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { towService } from '../../services/tow.service';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { TRANSHUB_MAP_STYLE } from '../../utils/mapTheme';

const { width, height } = Dimensions.get('window');

export const TowTruckMapScreen = () => {
  const navigation = useNavigation<any>();
  const mapRef = useRef<MapView>(null);
  const { profile } = useAuth();
  const { showAlert } = useAlert();
  const [loading, setLoading] = useState(false);
  const [region, setRegion] = useState({
    latitude: 6.5244, // Default to Lagos
    longitude: 3.3792,
    latitudeDelta: 0.0122,
    longitudeDelta: 0.0121,
  });
  const [pickupLocation, setPickupLocation] = useState<any>(null);
  const [address, setAddress] = useState('');
  const [nearbyDrivers, setNearbyDrivers] = useState<any[]>([]);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  useEffect(() => {
    fetchNearbyDrivers();
  }, [region]);

  const requestLocationPermission = async () => {
    if (Platform.OS === 'ios') {
      const auth = await Geolocation.requestAuthorization('whenInUse');
      if (auth === 'granted') {
        getCurrentLocation();
      }
    } else {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'Transhub needs access to your location to find nearby tow trucks.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        getCurrentLocation();
      }
    }
  };

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const newRegion = {
          ...region,
          latitude,
          longitude,
        };
        setRegion(newRegion);
        setPickupLocation({ latitude, longitude });
        setLoading(true);
        const addr = await towService.reverseGeocode(latitude, longitude);
        setAddress(addr);
        setLoading(false);
        mapRef.current?.animateToRegion(newRegion, 1000);
      },
      (error) => {
        console.error('Geolocation Error:', error);
        showAlert({ title: 'Error', message: 'Failed to get your current location.', buttons: [{ text: 'OK', style: 'destructive' }] });
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const fetchNearbyDrivers = async () => {
    try {
      const drivers = await towService.getNearbyTowTrucks(region.latitude, region.longitude);
      setNearbyDrivers(drivers);
    } catch (error) {
      console.error('Error fetching nearby drivers:', error);
    }
  };

  const handleMapPress = async (e: any) => {
    const coords = e.nativeEvent.coordinate;
    setPickupLocation(coords);
    setAddress('Fetching address...');
    const addr = await towService.reverseGeocode(coords.latitude, coords.longitude);
    setAddress(addr);
  };

  const handleRequestTow = async () => {
    if (!pickupLocation && !address) {
      showAlert({ title: 'Error', message: 'Please select a pickup location or enter an address.', buttons: [{ text: 'OK', style: 'destructive' }] });
      return;
    }

    setLoading(true);
    try {
      const request = await towService.requestTow({
        user_id: profile?.id || '',
        pickup_address: address || `Lat: ${pickupLocation?.latitude}, Long: ${pickupLocation?.longitude}`,
        pickup_lat: pickupLocation?.latitude,
        pickup_long: pickupLocation?.longitude,
        destination_address: '',
        vehicle_type: 'Luxury Sedan',
      });

      showAlert({ 
        title: 'Success', 
        message: 'Tow request sent! Searching for nearest driver.',
        buttons: [{ text: 'OK', onPress: () => navigation.replace('TowTracking', { requestId: request.id }) }]
      });
    } catch (error) {
      console.error('Error requesting tow:', error);
      showAlert({ title: 'Error', message: 'Failed to send request.', buttons: [{ text: 'OK', style: 'destructive' }] });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={region}
        onRegionChangeComplete={setRegion}
        onPress={handleMapPress}
        customMapStyle={TRANSHUB_MAP_STYLE}
      >
        {pickupLocation && (
          <Marker
            coordinate={pickupLocation}
            title="Pickup point"
            pinColor={COLORS.primary}
          />
        )}
        {nearbyDrivers.map((driver) => (
          <Marker
            key={driver.id}
            coordinate={{ latitude: driver.last_lat, longitude: driver.last_long }}
            title={driver.full_name}
          >
            <View style={styles.driverMarker}>
              <Icon name="car" size={24} color={COLORS.primary} />
            </View>
          </Marker>
        ))}
      </MapView>

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pickup Location</Text>
      </View>

      <View style={styles.searchContainer}>
        <Input
          placeholder="Type pickup address..."
          value={address}
          onChangeText={setAddress}
          leftIcon={<Icon name="search-outline" size={20} color={COLORS.textMuted} />}
          containerStyle={styles.searchInput}
        />
        <TouchableOpacity style={styles.locateBtn} onPress={getCurrentLocation}>
          <Icon name="locate" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.bottomSheet}>
        <View style={styles.pickupInfo}>
          <Icon name="location" size={24} color={COLORS.primary} />
          <Text style={styles.pickupText} numberOfLines={2}>
            {address || 'Tap on map or type address'}
          </Text>
        </View>
        <Button
          title={loading ? 'Searching...' : 'Confirm Tow Request'}
          onPress={handleRequestTow}
          loading={loading}
          variant="primary"
          style={styles.requestButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  map: {
    width: width,
    height: height,
  },
  header: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundCard,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  backButton: {
    marginRight: SPACING.md,
  },
  headerTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.backgroundCard,
    padding: SPACING.lg,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  pickupInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
  },
  pickupText: {
    flex: 1,
    marginLeft: SPACING.md,
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
  },
  requestButton: {
    height: 56,
  },
  driverMarker: {
    backgroundColor: COLORS.backgroundCard,
    padding: 6,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  searchContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 120 : 80,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    marginBottom: 0,
  },
  locateBtn: {
    width: 48,
    height: 48,
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});
