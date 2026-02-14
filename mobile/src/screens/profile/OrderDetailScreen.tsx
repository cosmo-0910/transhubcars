import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../utils/theme';
import Icon from 'react-native-vector-icons/Ionicons';

export const OrderDetailScreen = ({ navigation, route }: any) => {
  const { order } = route.params;

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
      case 'delivered':
        return COLORS.success;
      case 'pending':
      case 'processing':
        return COLORS.warning;
      case 'cancelled':
        return COLORS.error;
      default:
        return COLORS.textMuted;
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.statusCard}>
          <Text style={styles.statusLabel}>Order Status</Text>
          <Text style={[styles.statusValue, { color: getStatusColor(order.status) }]}>
            {order.status.toUpperCase()}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vehicle Information</Text>
          <View style={styles.carCard}>
            <Image source={{ uri: order.vehicles?.image_url }} style={styles.carImage} />
            <View style={styles.carInfo}>
              <Text style={styles.carName}>
                {order.vehicles?.year} {order.vehicles?.make} {order.vehicles?.model}
              </Text>
              <Text style={styles.carPrice}>₦{order.amount?.toLocaleString()}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Order ID</Text>
            <Text style={styles.infoValue}>#{order.id.toUpperCase()}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Order Date</Text>
            <Text style={styles.infoValue}>{new Date(order.created_at).toLocaleDateString()}</Text>
          </View>
          <View style={styles.infoRow}>
             <Text style={styles.infoLabel}>Payment Method</Text>
             <Text style={styles.infoValue}>Card Payment</Text>
          </View>
          <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.infoLabel}>Payment Status</Text>
            <Text style={styles.infoValue}>{order.status === 'Paid' ? 'Successful' : 'Pending'}</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('HelpCenter')}
        >
          <Icon name="help-circle-outline" size={20} color={COLORS.primary} />
          <Text style={styles.actionButtonText}>Need Help with this Order?</Text>
        </TouchableOpacity>
      </View>
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
  content: {
    padding: SPACING.lg,
  },
  statusCard: {
    backgroundColor: COLORS.backgroundCard,
    padding: SPACING.xl,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statusLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  statusValue: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.md,
  },
  carCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  carImage: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.md,
  },
  carInfo: {
    flex: 1,
    marginLeft: SPACING.md,
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
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  infoLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
  },
  infoValue: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontWeight: '600',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: SPACING.md,
  },
  actionButtonText: {
    marginLeft: SPACING.sm,
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
});
