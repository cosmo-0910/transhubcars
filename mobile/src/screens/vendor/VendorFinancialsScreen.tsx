import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../../hooks/useAuth';
import { vendorService } from '../../services/vendor.service';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../utils/theme';
import { formatCurrency } from '../../utils/helpers';

const { width } = Dimensions.get('window');

export const VendorFinancialsScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [earningsHistory, setEarningsHistory] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalEarnings: 0,
    withdrawableBalance: 0,
    pendingPayouts: 0,
  });

  const fetchFinancialData = async () => {
    if (!user) return;
    try {
      // For now, we fetch stats and placeholder history
      const vendorStats = await vendorService.getVendorStats(user.id, 'both');
      setStats({
        totalEarnings: vendorStats.totalEarnings,
        withdrawableBalance: vendorStats.totalEarnings * 0.9, // Placeholder calculation
        pendingPayouts: 0,
      });

      const history = await vendorService.getEarningsHistory(user.id);
      setEarningsHistory(history);
    } catch (error) {
      console.error('Error fetching financial data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFinancialData();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchFinancialData();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Financials</Text>
      </View>

      <ScrollView 
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      >
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Withdrawable Balance</Text>
          <Text style={styles.balanceValue}>{formatCurrency(stats.withdrawableBalance)}</Text>
          <TouchableOpacity style={styles.payoutButton}>
            <Text style={styles.payoutButtonText}>Request Payout</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.miniStatCard}>
            <Text style={styles.miniStatLabel}>Total Earnings</Text>
            <Text style={styles.miniStatValue}>{formatCurrency(stats.totalEarnings)}</Text>
          </View>
          <View style={styles.miniStatCard}>
            <Text style={styles.miniStatLabel}>Pending</Text>
            <Text style={styles.miniStatValue}>{formatCurrency(stats.pendingPayouts)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Earnings History</Text>
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.primary} style={{ marginTop: 20 }} />
          ) : earningsHistory.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="receipt-outline" size={48} color={COLORS.border} />
              <Text style={styles.emptyText}>No transaction history yet.</Text>
            </View>
          ) : (
            earningsHistory.map((item, index) => (
              <View key={index} style={styles.historyItem}>
                <View>
                  <Text style={styles.historyTitle}>{item.description}</Text>
                  <Text style={styles.historyDate}>{item.date}</Text>
                </View>
                <Text style={styles.historyAmount}>{formatCurrency(item.amount)}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
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
    paddingTop: 60,
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
  content: {
    padding: SPACING.lg,
  },
  balanceCard: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    marginBottom: 8,
  },
  balanceValue: {
    color: '#FFF',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: SPACING.xl,
  },
  payoutButton: {
    backgroundColor: '#FFF',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  payoutButtonText: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: FONT_SIZES.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xl,
  },
  miniStatCard: {
    backgroundColor: COLORS.backgroundCard,
    width: '48%',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  miniStatLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 4,
  },
  miniStatValue: {
    color: COLORS.text,
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
  },
  section: {
    marginTop: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  emptyState: {
    alignItems: 'center',
    padding: SPACING.xxl,
  },
  emptyText: {
    color: COLORS.textMuted,
    marginTop: SPACING.md,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  historyTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  historyDate: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  historyAmount: {
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
    color: COLORS.success,
  },
});
