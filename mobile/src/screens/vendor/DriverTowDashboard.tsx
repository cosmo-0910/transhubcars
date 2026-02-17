import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Switch, ScrollView } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../utils/theme';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { towService } from '../../services/tow.service';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/common/Button';
import { TRANSHUB_MAP_STYLE } from '../../utils/mapTheme';

export const DriverTowDashboard = () => {
  const navigation = useNavigation<any>();
  const { user, profile } = useAuth();
  const [isOnline, setIsOnline] = useState(profile?.is_online || false);
  const [currentRequest, setCurrentRequest] = useState<any>(null);
  const [location, setLocation] = useState({
    latitude: 6.5244,
    longitude: 3.3792,
  });

  useEffect(() => {
    let subscription: any;
    if (isOnline) {
      // Subscribe to searching requests
      subscription = towService.subscribeToNearbyRequests((payload: any) => {
        // In a real app, you'd check distance here. For demo, show any searching request.
        if (payload.status === 'Searching') {
          setCurrentRequest(payload);
        }
      });

      // Start location updates
      const interval = setInterval(() => {
        updateLocation();
      }, 10000); // Every 10 seconds
      
      return () => {
        clearInterval(interval);
        if (subscription) subscription.unsubscribe();
      };
    }
  }, [isOnline]);

  const updateLocation = async () => {
    if (!user) return;
    try {
      // In a real app, use Geolocation.getCurrentPosition
      const newLat = location.latitude + (Math.random() - 0.5) * 0.001;
      const newLong = location.longitude + (Math.random() - 0.5) * 0.001;
      
      setLocation({ latitude: newLat, longitude: newLong });
      await towService.updateDriverLocation(user.id, newLat, newLong);
    } catch (error) {
      console.error('Error updating location:', error);
    }
  };

  const toggleOnline = async (value: boolean) => {
    setIsOnline(value);
    if (user) {
      try {
        await towService.setDriverOnlineStatus(user.id, value);
      } catch (error) {
        console.error('Error toggling online status:', error);
        Alert.alert('Error', 'Failed to update status.');
      }
    }
  };

  const handleAcceptRequest = () => {
    Alert.alert('Request Accepted', 'Navigate to pickup location.');
    // Update status in real app
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Tow Dashboard</Text>
          <Text style={styles.statusText}>{isOnline ? 'Active & Online' : 'Currently Offline'}</Text>
        </View>
        <Switch
          value={isOnline}
          onValueChange={toggleOnline}
          trackColor={{ false: COLORS.border, true: COLORS.success }}
          thumbColor="#FFF"
        />
      </View>

      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={{
          ...location,
          latitudeDelta: 0.0122,
          longitudeDelta: 0.0121,
        }}
        customMapStyle={TRANSHUB_MAP_STYLE}
      >
        <Marker coordinate={location} title="You">
          <View style={styles.driverMarker}>
            <Icon name="car" size={24} color={COLORS.primary} />
          </View>
        </Marker>
      </MapView>

      <View style={styles.bottomSheet}>
        {currentRequest ? (
          <View style={styles.requestCard}>
            <View style={styles.requestHeader}>
              <Text style={styles.requestTitle}>New Tow Request!</Text>
              <Text style={styles.distanceText}>nearby</Text>
            </View>
            <Text style={styles.requestDetails}>Pickup: {currentRequest.pickup_address}</Text>
            <Text style={styles.vehicleText}>Vehicle: {currentRequest.vehicle_type}</Text>
            <View style={styles.actionButtons}>
              <Button
                title="Reject"
                onPress={() => setCurrentRequest(null)}
                variant="outline"
                style={styles.actionBtn}
              />
              <Button
                title="Accept"
                onPress={handleAcceptRequest}
                variant="primary"
                style={styles.actionBtn}
              />
            </View>
          </View>
        ) : (
          <View style={styles.placeholderCard}>
            <Icon name="pulse" size={48} color={isOnline ? COLORS.primary : COLORS.textMuted} />
            <Text style={styles.placeholderText}>
              {isOnline ? 'Waiting for incoming requests...' : 'Go online to start receiving tow requests'}
            </Text>
          </View>
        )}
      </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    paddingTop: 60,
    backgroundColor: COLORS.backgroundCard,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  statusText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  map: {
    flex: 1,
  },
  bottomSheet: {
    backgroundColor: COLORS.backgroundCard,
    padding: SPACING.lg,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  requestCard: {
    gap: SPACING.md,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  requestTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  distanceText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  requestDetails: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontWeight: '500',
  },
  vehicleText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.md,
  },
  actionBtn: {
    flex: 1,
  },
  placeholderCard: {
    alignItems: 'center',
    padding: SPACING.xl,
    gap: SPACING.md,
  },
  placeholderText: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.sm,
  },
  driverMarker: {
    backgroundColor: COLORS.backgroundCard,
    padding: 6,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.primary,
  }
});
