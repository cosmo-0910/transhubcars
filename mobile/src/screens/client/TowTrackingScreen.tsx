import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../utils/theme';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAlert } from '../../context/AlertContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import { towService } from '../../services/tow.service';
import { TRANSHUB_MAP_STYLE } from '../../utils/mapTheme';
import { Button } from '../../components/common/Button';
import { TowRequest, Profile } from '../../types';
import { supabase } from '../../services/supabase';

export const TowTrackingScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { showAlert } = useAlert();
  const { requestId } = route.params;

  const [request, setRequest] = useState<TowRequest | null>(null);
  const [driver, setDriver] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInitialData();

    // Subscribe to request updates
    const subscription = towService.subscribeToRequest(requestId, (updated) => {
      setRequest(updated);
      if (updated.status === 'Completed') {
        showAlert({ 
          title: 'Mission Completed', 
          message: 'Your tow service has been completed successfully.', 
          buttons: [{ text: 'OK', onPress: () => navigation.navigate('Home') }] 
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [requestId]);

  useEffect(() => {
    if (request?.driver_id) {
      // Subscribe to driver location updates
      const driverSubscription = supabase
        .channel(`driver_location_${request.driver_id}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'profiles',
            filter: `id=eq.${request.driver_id}`,
          },
          (payload) => {
            setDriver(payload.new as Profile);
          }
        )
        .subscribe();

      fetchDriverData(request.driver_id);

      return () => {
        driverSubscription.unsubscribe();
      };
    }
  }, [request?.driver_id]);

  const fetchInitialData = async () => {
    try {
      const { data, error } = await supabase
        .from('tow_requests')
        .select('*')
        .eq('id', requestId)
        .single();

      if (error) throw error;
      setRequest(data as TowRequest);
    } catch (error) {
      console.error('Error fetching request:', error);
      showAlert({ title: 'Error', message: 'Failed to load tracking data.', buttons: [{ text: 'OK', style: 'destructive' }] });
    } finally {
      setLoading(false);
    }
  };

  const fetchDriverData = async (driverId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', driverId)
        .single();

      if (error) throw error;
      setDriver(data as Profile);
    } catch (error) {
      console.error('Error fetching driver:', error);
    }
  };

  const handleCancelRequest = async () => {
    showAlert({
      title: 'Abort Mission',
      message: 'Are you sure you want to cancel this tow recovery request?',
      buttons: [
        { text: 'Negative', style: 'cancel' },
        {
          text: 'Abort Request',
          style: 'destructive',
          onPress: async () => {
            try {
              await towService.cancelTowRequest(requestId);
              navigation.goBack();
            } catch (error) {
              showAlert({ title: 'Error', message: 'Failed to cancel request.', buttons: [{ text: 'OK', style: 'destructive' }] });
            }
          }
        }
      ]
    });
  };

  if (loading || !request) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Connecting to recovery team...</Text>
      </View>
    );
  }

  const driverLocation = driver?.last_lat && driver?.last_long 
    ? { latitude: Number(driver.last_lat), longitude: Number(driver.last_long) }
    : null;

  const pickupLocation = request.pickup_lat && request.pickup_long
    ? { latitude: Number(request.pickup_lat), longitude: Number(request.pickup_long) }
    : { latitude: 6.5244, longitude: 3.3792 }; // Fallback

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Live Tracking</Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusBadgeText}>{request.status}</Text>
        </View>
      </View>

      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={{
          ...(driverLocation || pickupLocation),
          latitudeDelta: 0.015,
          longitudeDelta: 0.015,
        }}
        customMapStyle={TRANSHUB_MAP_STYLE}
      >
        <Marker coordinate={pickupLocation} title="Your Location">
          <View style={styles.clientMarker}>
            <Icon name="person" size={20} color="#FFF" />
          </View>
        </Marker>

        {driverLocation && (
          <Marker coordinate={driverLocation} title="Tow Truck">
            <View style={styles.driverMarker}>
              <Icon name="car" size={24} color={COLORS.primary} />
            </View>
          </Marker>
        )}
      </MapView>

      <View style={styles.bottomSheet}>
        {request.status === 'Searching' ? (
          <View style={styles.searchingCard}>
            <Icon name="search-outline" size={48} color={COLORS.primary} />
            <Text style={styles.cardTitle}>Searching for Nearby Trucks</Text>
            <Text style={styles.cardSub}>We are notifying available recovery teams in your area...</Text>
            <Button
              title="Cancel Request"
              onPress={handleCancelRequest}
              variant="outline"
              style={styles.cancelBtn}
            />
          </View>
        ) : (
          <View style={styles.driverInfoCard}>
            <View style={styles.driverHeader}>
              <View style={styles.driverMeta}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{driver?.full_name?.charAt(0) || 'D'}</Text>
                </View>
                <View>
                  <Text style={styles.driverName}>{driver?.full_name || 'Recovery Specialist'}</Text>
                  <Text style={styles.driverStatus}>
                    {request.status === 'En Route' ? 'Coming to you' : 
                     request.status === 'At Pickup' ? 'At your location' : 
                     'Towing your vehicle'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity style={styles.callButton}>
                <Icon name="call" size={20} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.tripMeta}>
              <View style={styles.metaItem}>
                <Icon name="time-outline" size={18} color={COLORS.textMuted} />
                <Text style={styles.metaText}>ETA: 8-12 mins</Text>
              </View>
              <View style={styles.metaItem}>
                <Icon name="shield-checkmark-outline" size={18} color={COLORS.success} />
                <Text style={styles.metaText}>Verified Driver</Text>
              </View>
            </View>

            {request.status === 'En Route' && (
              <Button
                title="Cancel Request"
                onPress={handleCancelRequest}
                variant="outline"
                style={styles.cancelBtn}
              />
            )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    color: COLORS.textMuted,
    marginTop: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    paddingTop: Platform.OS === 'ios' ? 60 : SPACING.lg,
    backgroundColor: COLORS.backgroundCard,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    zIndex: 10,
  },
  backButton: {
    marginRight: SPACING.md,
  },
  headerTitle: {
    flex: 1,
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  statusBadge: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  statusBadgeText: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  map: {
    flex: 1,
  },
  clientMarker: {
    backgroundColor: COLORS.primary,
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  driverMarker: {
    backgroundColor: COLORS.backgroundCard,
    padding: 6,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.primary,
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
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
  },
  searchingCard: {
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.lg,
  },
  cardTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
  },
  cardSub: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  driverInfoCard: {
    gap: SPACING.lg,
  },
  driverHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  driverMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#000',
    fontSize: 20,
    fontWeight: 'bold',
  },
  driverName: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  driverStatus: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.primary,
    fontWeight: '600',
  },
  callButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tripMeta: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  metaText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontWeight: '500',
  },
  cancelBtn: {
    marginTop: SPACING.sm,
  }
});
