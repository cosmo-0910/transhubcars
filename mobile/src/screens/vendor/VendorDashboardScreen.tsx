import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { carsService } from '../../services/cars.service';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../utils/theme';
import Icon from 'react-native-vector-icons/Ionicons';

export const VendorDashboardScreen = ({ navigation }: any) => {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    activeListings: 0,
    pendingApprovals: 0,
    totalSales: 0,
    inquiries: 0,
  });

  const fetchDashboardData = async () => {
    if (!user) return;
    try {
      const cars = await carsService.getVendorCars(user.id);
      setStats({
        activeListings: cars.filter(c => (c as any).approval_status === 'published').length,
        pendingApprovals: cars.filter(c => (c as any).approval_status === 'pending').length,
        totalSales: 0, // Assume 0 for now
        inquiries: 5, // Simulation
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const StatCard = ({ title, value, icon, color }: any) => (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: `${color}15` }]}>
        <Icon name={icon} size={24} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
      }
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.vendorName}>{profile?.full_name || 'Vendor'}</Text>
        </View>
        <TouchableOpacity 
          style={styles.profileBtn}
          onPress={() => navigation.navigate('Profile')}
        >
          <Icon name="person-circle-outline" size={32} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.statsGrid}>
        <StatCard 
          title="Active Listings" 
          value={stats.activeListings} 
          icon="car-outline" 
          color="#4CAF50" 
        />
        <StatCard 
          title="Pending" 
          value={stats.pendingApprovals} 
          icon="time-outline" 
          color="#FF9800" 
        />
        <StatCard 
          title="Inquiries" 
          value={stats.inquiries} 
          icon="chatbubbles-outline" 
          color="#2196F3" 
        />
        <StatCard 
          title="Total Sales" 
          value={`₦${stats.totalSales}`} 
          icon="cash-outline" 
          color={COLORS.primary} 
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsRow}>
          <TouchableOpacity 
            style={styles.actionBtn}
            onPress={() => navigation.navigate('AddVehicle')}
          >
            <Icon name="add-circle-outline" size={24} color={COLORS.primary} />
            <Text style={styles.actionText}>Add Vehicle</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionBtn}
            onPress={() => navigation.navigate('Inventory')}
          >
            <Icon name="list-outline" size={24} color={COLORS.primary} />
            <Text style={styles.actionText}>My Inventory</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <Icon name="stats-chart-outline" size={24} color={COLORS.primary} />
            <Text style={styles.actionText}>Reports</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Inquiries</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.card}>
          {[1, 2, 3].map((i) => (
            <TouchableOpacity key={i} style={styles.inquiryItem}>
              <View style={styles.inquiryLeft}>
                <View style={styles.inquiryAvatar}>
                  <Text style={styles.avatarText}>J</Text>
                </View>
                <View>
                  <Text style={styles.inquiryUser}>John Doe</Text>
                  <Text style={styles.inquiryCar}>2022 Toyota Corolla</Text>
                </View>
              </View>
              <Text style={styles.inquiryTime}>2h ago</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
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
    paddingTop: SPACING.xl,
    backgroundColor: COLORS.backgroundCard,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  welcomeText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
  },
  vendorName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  profileBtn: {
    padding: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: SPACING.md,
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: COLORS.backgroundCard,
    width: '48%',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
    alignItems: 'center',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  statValue: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  statTitle: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  section: {
    padding: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  seeAll: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionBtn: {
    backgroundColor: COLORS.backgroundCard,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    width: '31%',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 8,
    textAlign: 'center',
  },
  card: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  inquiryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  inquiryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inquiryAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  avatarText: {
    color: COLORS.text,
    fontWeight: 'bold',
  },
  inquiryUser: {
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  inquiryCar: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  inquiryTime: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
});
