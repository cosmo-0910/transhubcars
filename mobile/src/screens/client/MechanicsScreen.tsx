import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Platform, Switch } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../utils/theme';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { mechanicService } from '../../services/mechanic.service';
import { Mechanic } from '../../types';

const MechanicCard = ({ mechanic }: { mechanic: Mechanic }) => (
  <View style={styles.card}>
    <Image source={{ uri: mechanic.image_url }} style={styles.mechanicImage} />
    <View style={styles.cardInfo}>
      <View style={styles.cardHeader}>
        <Text style={styles.mechanicName}>{mechanic.name}</Text>
        {mechanic.is_approved && (
          <View style={styles.approvedBadge}>
            <Icon name="checkmark-seal" size={16} color={COLORS.primary} />
            <Text style={styles.approvedText}>Certified</Text>
          </View>
        )}
      </View>
      <Text style={styles.specialty}>{mechanic.specialty}</Text>
      <View style={styles.locationContainer}>
        <Icon name="location-outline" size={14} color={COLORS.textMuted} />
        <Text style={styles.location}>{mechanic.location}</Text>
      </View>
      <View style={styles.ratingContainer}>
        <Icon name="star" size={16} color="#FBBF24" />
        <Text style={styles.rating}>{mechanic.rating.toFixed(1)}</Text>
      </View>
    </View>
    <TouchableOpacity style={styles.contactBtn}>
      <Icon name="call" size={20} color={COLORS.background} />
    </TouchableOpacity>
  </View>
);

export const MechanicsScreen = () => {
  const navigation = useNavigation<any>();
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [loading, setLoading] = useState(true);
  const [onlyApproved, setOnlyApproved] = useState(true);

  useEffect(() => {
    fetchMechanics();
  }, [onlyApproved]);

  const fetchMechanics = async () => {
    setLoading(true);
    try {
      const data = await mechanicService.getMechanics({ onlyApproved });
      setMechanics(data);
    } catch (error) {
      console.error('Error fetching mechanics:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Certified Workshops</Text>
      </View>

      <View style={styles.filterSection}>
        <View style={styles.filterLeft}>
          <Text style={styles.filterTitle}>Transhub Certified</Text>
          <Text style={styles.filterSub}>Show only verified elite workshops</Text>
        </View>
        <Switch
          value={onlyApproved}
          onValueChange={setOnlyApproved}
          trackColor={{ false: COLORS.border, true: COLORS.primary }}
          thumbColor={Platform.OS === 'ios' ? undefined : COLORS.background}
        />
      </View>

      <FlatList
        data={mechanics}
        renderItem={({ item }) => <MechanicCard mechanic={item} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="construct-outline" size={64} color={COLORS.border} />
            <Text style={styles.emptyText}>No certified workshops found matching your criteria.</Text>
          </View>
        }
      />
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
  filterSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    backgroundColor: COLORS.backgroundCard,
    marginBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterLeft: {
    flex: 1,
  },
  filterTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  filterSub: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  listContent: {
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    padding: SPACING.md,
    alignItems: 'center',
  },
  mechanicImage: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.md,
  },
  cardInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  mechanicName: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.text,
    marginRight: 8,
  },
  approvedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  approvedText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primary,
    marginLeft: 2,
    textTransform: 'uppercase',
  },
  specialty: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  location: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.text,
    marginLeft: 4,
  },
  contactBtn: {
    backgroundColor: COLORS.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
  },
  emptyText: {
    marginTop: SPACING.lg,
    color: COLORS.textMuted,
    textAlign: 'center',
    paddingHorizontal: 40,
  }
});
