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
import { partsService } from '../../services/parts.service';
import { vendorService } from '../../services/vendor.service';
import { chatService } from '../../services/chat.service';
import { notificationService } from '../../services/notification.service';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../utils/theme';
import Icon from 'react-native-vector-icons/Ionicons';
import { Conversation } from '../../types';
import { formatDistanceToNow } from 'date-fns';

export const VendorDashboardScreen = ({ navigation }: any) => {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    activeListings: 0,
    pendingApprovals: 0,
    totalSales: 0,
    totalEarnings: 0,
    inquiries: 0,
  });
  const [conversations, setConversations] = useState<Conversation[]>([]);

  const fetchDashboardData = async () => {
    if (!user || !profile) return;
    try {
      const convs = await chatService.getConversations(user.id);
      setConversations(convs.slice(0, 5));

      const vendorStats = await vendorService.getVendorStats(user.id, profile.vendor_type);

      setStats({
        activeListings: vendorStats.activeListings,
        pendingApprovals: vendorStats.pendingApprovals,
        totalSales: vendorStats.totalSales,
        totalEarnings: vendorStats.totalEarnings,
        inquiries: convs.length,
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
          title={profile?.vendor_type === 'parts' ? "Active Parts" : "Active Listings"} 
          value={stats.activeListings} 
          icon={profile?.vendor_type === 'parts' ? "construct-outline" : "car-outline"} 
          color="#4CAF50" 
        />
        <StatCard 
          title={profile?.vendor_type === 'parts' ? "Out of Stock" : "Pending"} 
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
        <TouchableOpacity 
          style={{ width: '48%' }} 
          onPress={() => navigation.navigate('Financials')}
        >
          <StatCard 
            title="Total Earnings" 
            value={`₦${stats.totalEarnings?.toLocaleString()}`} 
            icon="cash-outline" 
            color={COLORS.primary} 
            isClickable
          />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsRow}>
          {profile?.vendor_type !== 'parts' && (
            <TouchableOpacity 
              style={styles.actionBtn}
              onPress={() => navigation.navigate('AddVehicle')}
            >
              <Icon name="car-outline" size={24} color={COLORS.primary} />
              <Text style={styles.actionText}>Add Car</Text>
            </TouchableOpacity>
          )}
          
          {profile?.vendor_type !== 'car' && (
            <TouchableOpacity 
              style={styles.actionBtn}
              onPress={() => navigation.navigate('AddSparePart')}
            >
              <Icon name="construct-outline" size={24} color={COLORS.primary} />
              <Text style={styles.actionText}>Add Part</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity 
            style={styles.actionBtn}
            onPress={() => navigation.navigate('Inventory')}
          >
            <Icon name="list-outline" size={24} color={COLORS.primary} />
            <Text style={styles.actionText}>Inventory</Text>
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
          {conversations.length === 0 ? (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <Text style={{ color: COLORS.textMuted }}>No active inquiries</Text>
            </View>
          ) : (
            conversations.map((conv) => (
              <TouchableOpacity 
                key={conv.id} 
                style={styles.inquiryItem}
                onPress={() => navigation.navigate('Chat', { conversation: conv })}
              >
                <View style={styles.inquiryLeft}>
                  <View style={styles.inquiryAvatar}>
                    <Text style={styles.avatarText}>
                      {(conv.buyer?.full_name || 'U').charAt(0)}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.inquiryUser}>{conv.buyer?.full_name || 'Buyer'}</Text>
                    <Text style={styles.inquiryCar}>{conv.car ? `${conv.car.year} ${conv.car.make} ${conv.car.model}` : 'General Inquiry'}</Text>
                  </View>
                </View>
                <Text style={styles.inquiryTime}>
                  {formatDistanceToNow(new Date(conv.updated_at), { addSuffix: true })}
                </Text>
              </TouchableOpacity>
            ))
          )}
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
