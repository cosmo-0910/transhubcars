import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../utils/theme';
import { SearchBar } from '../../components/common/SearchBar';
import { AutocompleteInput } from '../../components/common/AutocompleteInput';
import { partsService, PartFilters } from '../../services/parts.service';
import { SparePart } from '../../types';
import { formatCurrency } from '../../utils/helpers';

export const SparePartsMarketplaceScreen = () => {
  const navigation = useNavigation<any>();
  const [parts, setParts] = useState<SparePart[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  const [filters, setFilters] = useState<PartFilters>({
    search: '',
    category: '',
    condition: '',
    make: '',
    model: '',
  });

  const fetchParts = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const data = await partsService.searchParts(filters);
      setParts(data);
    } catch (error) {
      console.error('Error fetching spare parts:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchParts();
  }, [fetchParts]);

  const handleFilterChange = (key: keyof PartFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const getSuggestions = (field: string) => async (query: string) => {
    if (query.length < 1) return [];
    return partsService.getFilterSuggestions(field, query);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      condition: '',
      make: '',
      model: '',
    });
  };

  const renderPartItem = ({ item }: { item: SparePart }) => (
    <TouchableOpacity 
      style={styles.partCard}
      onPress={() => navigation.navigate('SparePartDetail', { part: item })}
    >
      <Image 
        source={{ uri: item.image_url || 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=2072&auto=format&fit=crop' }} 
        style={styles.partImage} 
      />
      <View style={styles.partInfo}>
        <View style={styles.badgeContainer}>
          <View style={[styles.conditionBadge, { backgroundColor: item.condition === 'New' ? '#4CAF5020' : '#FF980020' }]}>
            <Text style={[styles.conditionText, { color: item.condition === 'New' ? '#4CAF50' : '#FF9800' }]}>
              {item.condition.toUpperCase()}
            </Text>
          </View>
          <Text style={styles.categoryBadge}>{item.category}</Text>
        </View>
        
        <Text style={styles.partName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.vehicleCompat}>Compatible: {item.vehicle_make} {item.vehicle_model} ({item.vehicle_year})</Text>
        
        <View style={styles.cardFooter}>
          <Text style={styles.price}>{formatCurrency(item.price)}</Text>
          <TouchableOpacity style={styles.orderButton}>
            <Text style={styles.orderButtonText}>BUY</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="chevron-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Spare Parts</Text>
          <TouchableOpacity onPress={() => setShowFilters(!showFilters)}>
            <Icon name={showFilters ? "close" : "options-outline"} size={24} color={showFilters ? COLORS.primary : COLORS.text} />
          </TouchableOpacity>
        </View>

        <SearchBar
          value={filters.search || ''}
          onChangeText={(text) => handleFilterChange('search', text)}
          placeholder="Search for parts (e.g. Brake Pads)..."
        />

        {showFilters && (
          <View style={styles.filtersWrapper}>
            <View style={styles.filtersRow}>
              <View style={styles.filterHalf}>
                <AutocompleteInput
                  label="Category"
                  placeholder="e.g. Engine"
                  value={filters.category || ''}
                  onChangeText={(val) => handleFilterChange('category', val)}
                  onSuggestionPress={(val) => handleFilterChange('category', val)}
                  getSuggestions={getSuggestions('category')}
                />
              </View>
              <View style={styles.filterHalf}>
                <AutocompleteInput
                  label="Condition"
                  placeholder="e.g. New"
                  value={filters.condition || ''}
                  onChangeText={(val) => handleFilterChange('condition', val)}
                  onSuggestionPress={(val) => handleFilterChange('condition', val)}
                  getSuggestions={getSuggestions('condition')}
                />
              </View>
            </View>

            <View style={styles.filtersRow}>
              <View style={styles.filterHalf}>
                <AutocompleteInput
                  label="Make"
                  placeholder="e.g. Toyota"
                  value={filters.make || ''}
                  onChangeText={(val) => handleFilterChange('make', val)}
                  onSuggestionPress={(val) => handleFilterChange('make', val)}
                  getSuggestions={getSuggestions('make')}
                />
              </View>
              <View style={styles.filterHalf}>
                <AutocompleteInput
                  label="Model"
                  placeholder="e.g. Camry"
                  value={filters.model || ''}
                  onChangeText={(val) => handleFilterChange('model', val)}
                  onSuggestionPress={(val) => handleFilterChange('model', val)}
                  getSuggestions={getSuggestions('model')}
                />
              </View>
            </View>

            <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
              <Text style={styles.clearButtonText}>Clear All Filters</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {loading && !refreshing ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={parts}
          renderItem={renderPartItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => fetchParts(true)} tintColor={COLORS.primary} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="construct-outline" size={64} color={COLORS.border} />
              <Text style={styles.emptyText}>No parts found in inventory.</Text>
              <TouchableOpacity 
                style={styles.fallbackButton}
                onPress={() => navigation.navigate('SparePartsRequest')}
              >
                <Text style={styles.fallbackButtonText}>Request Part Sourcing</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: SPACING.lg,
    paddingTop: Platform.OS === 'ios' ? 60 : SPACING.lg,
    backgroundColor: COLORS.backgroundCard,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  filtersWrapper: {
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  filtersRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  filterHalf: {
    flex: 1,
  },
  clearButton: {
    alignSelf: 'center',
    padding: SPACING.sm,
  },
  clearButtonText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  listContent: {
    padding: SPACING.lg,
  },
  partCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    height: 140,
  },
  partImage: {
    width: 120,
    height: '100%',
  },
  partInfo: {
    flex: 1,
    padding: SPACING.md,
    justifyContent: 'space-between',
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  conditionBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  conditionText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  categoryBadge: {
    fontSize: 10,
    color: COLORS.textMuted,
    backgroundColor: COLORS.backgroundLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  partName: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 2,
  },
  vehicleCompat: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  orderButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.sm,
  },
  orderButtonText: {
    color: COLORS.background,
    fontSize: 12,
    fontWeight: 'bold',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZES.md,
    marginTop: SPACING.md,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  fallbackButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  fallbackButtonText: {
    color: COLORS.background,
    fontWeight: 'bold',
  },
});
