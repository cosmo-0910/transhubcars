import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../utils/theme';
import { SparePart } from '../../types';
import { formatCurrency } from '../../utils/helpers';
import { Button } from '../../components/common/Button';

export const SparePartDetailScreen = ({ route, navigation }: any) => {
  const { part } = route.params as { part: SparePart };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
            <Image 
                source={{ uri: part.image_url || 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=2072&auto=format&fit=crop' }} 
                style={styles.image} 
            />
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Icon name="chevron-back" size={24} color="white" />
            </TouchableOpacity>
        </View>

        <View style={styles.content}>
            <View style={styles.metaRow}>
                <View style={styles.conditionBadge}>
                    <Text style={styles.conditionText}>{part.condition.toUpperCase()}</Text>
                </View>
                <Text style={styles.categoryText}>{part.category}</Text>
            </View>

            <Text style={styles.title}>{part.name}</Text>
            <Text style={styles.price}>{formatCurrency(part.price)}</Text>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Vehicle Compatibility</Text>
                <View style={styles.compatCard}>
                    <View style={styles.compatItem}>
                        <Text style={styles.compatLabel}>Make</Text>
                        <Text style={styles.compatValue}>{part.vehicle_make}</Text>
                    </View>
                    <View style={styles.compatItem}>
                        <Text style={styles.compatLabel}>Model</Text>
                        <Text style={styles.compatValue}>{part.vehicle_model}</Text>
                    </View>
                    <View style={styles.compatItem}>
                        <Text style={styles.compatLabel}>Year</Text>
                        <Text style={styles.compatValue}>{part.vehicle_year}</Text>
                    </View>
                </View>
            </View>

            {part.description && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Description</Text>
                    <Text style={styles.description}>{part.description}</Text>
                </View>
            )}

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Availability</Text>
                <View style={styles.stockRow}>
                    <Icon name="checkmark-circle" size={20} color={COLORS.success} />
                    <Text style={styles.stockText}>{part.stock_quantity} units available in stock</Text>
                </View>
            </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button 
            title="Add to Cart"
            onPress={() => Alert.alert('Coming Soon', 'Cart functionality is being integrated.')}
            style={styles.cartBtn}
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
  header: {
    height: 300,
    width: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: SPACING.lg,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: COLORS.background,
    marginTop: -30,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: SPACING.sm,
  },
  conditionBadge: {
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  conditionText: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: 'bold',
  },
  categoryText: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.xl,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  compatCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.backgroundCard,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  compatItem: {
    flex: 1,
    alignItems: 'center',
  },
  compatLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  compatValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  description: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  stockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stockText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  footer: {
    padding: SPACING.lg,
    paddingBottom: Platform.OS === 'ios' ? 40 : SPACING.lg,
    backgroundColor: COLORS.backgroundCard,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  cartBtn: {
    width: '100%',
  }
});
