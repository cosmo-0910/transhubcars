import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../../hooks/useAuth';
import { useAlert } from '../../context/AlertContext';
import { partsService } from '../../services/parts.service';
import { SparePart } from '../../types';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../utils/theme';
import { formatCurrency } from '../../utils/helpers';

const { width } = Dimensions.get('window');

export const ManageSparePartsScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const { showAlert } = useAlert();
  const [parts, setParts] = useState<SparePart[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectionMode, setSelectionMode] = useState(false);

  const fetchVendorParts = async () => {
    if (!user) return;
    try {
      const data = await partsService.getVendorParts(user.id);
      setParts(data);
    } catch (error) {
      console.error('Error fetching vendor parts:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchVendorParts();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchVendorParts();
  };

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
    if (newSelected.size === 0) setSelectionMode(false);
  };

  const handleLongPress = (id: string) => {
    if (!selectionMode) {
      setSelectionMode(true);
      const newSelected = new Set(selectedIds);
      newSelected.add(id);
      setSelectedIds(newSelected);
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    
    showAlert({
      title: 'Bulk Delete',
      message: `Are you sure you want to delete ${selectedIds.size} parts?`,
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete All', 
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const idsArray = Array.from(selectedIds);
              await partsService.bulkDeleteParts(idsArray);
              setParts(prev => prev.filter(p => !selectedIds.has(p.id)));
              setSelectedIds(new Set());
              setSelectionMode(false);
              showAlert({ title: 'Success', message: 'Parts deleted successfully.' });
            } catch (error) {
              showAlert({ title: 'Error', message: 'Failed to delete some parts.' });
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    });
  };

  const handleBulkUpdateStatus = (status: 'active' | 'out_of_stock') => {
    if (selectedIds.size === 0) return;
    
    showAlert({
      title: 'Update Status',
      message: `Set ${selectedIds.size} parts to ${status.replace('_', ' ')}?`,
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Update', 
          onPress: async () => {
            try {
              setLoading(true);
              const idsArray = Array.from(selectedIds);
              await partsService.bulkUpdateParts(idsArray, { status });
              setParts(prev => prev.map(p => selectedIds.has(p.id) ? { ...p, status } : p));
              setSelectedIds(new Set());
              setSelectionMode(false);
              showAlert({ title: 'Success', message: 'Inventory updated.' });
            } catch (error) {
              showAlert({ title: 'Error', message: 'Update failed.' });
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    });
  };

  const renderItem = ({ item }: { item: SparePart }) => {
    const isSelected = selectedIds.has(item.id);
    
    return (
      <TouchableOpacity 
        style={[styles.partCard, isSelected && styles.selectedCard]}
        onLongPress={() => handleLongPress(item.id)}
        onPress={() => selectionMode ? toggleSelection(item.id) : null}
        activeOpacity={0.7}
      >
        <Image 
          source={{ uri: item.image_url || 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=2072&auto=format&fit=crop' }} 
          style={styles.partImage} 
        />
        {selectionMode && (
          <View style={styles.checkboxContainer}>
            <Icon 
              name={isSelected ? "checkbox" : "square-outline"} 
              size={24} 
              color={isSelected ? COLORS.primary : COLORS.textMuted} 
            />
          </View>
        )}
        <View style={styles.partInfo}>
          <View style={styles.cardHeader}>
            <Text style={styles.partName} numberOfLines={1}>{item.name}</Text>
            <View style={[styles.statusBadge, { backgroundColor: item.status === 'active' ? '#4CAF5015' : '#75757515' }]}>
              <Text style={[styles.statusText, { color: item.status === 'active' ? '#4CAF50' : '#757575' }]}>
                {item.status.toUpperCase().replace('_', ' ')}
              </Text>
            </View>
          </View>
          
          <Text style={styles.price}>{formatCurrency(item.price)}</Text>
          <Text style={styles.metaText}>{item.category} • {item.condition}</Text>
          <Text style={styles.metaText}>Stock: {item.stock_quantity}</Text>
          
          {!selectionMode && (
            <View style={styles.actions}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => navigation.navigate('AddSparePart', { part: item })}
              >
                <Icon name="create-outline" size={18} color={COLORS.text} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => {
                  showAlert({
                    title: 'Delete Part',
                    message: 'Delete this part?',
                    buttons: [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Delete', style: 'destructive', onPress: async () => {
                        await partsService.deletePart(item.id);
                        setParts(prev => prev.filter(p => p.id !== item.id));
                      }}
                    ]
                  });
                }}
              >
                <Icon name="trash-outline" size={18} color={COLORS.error} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>
            {selectionMode ? `${selectedIds.size} Selected` : 'Spare Part Inventory'}
          </Text>
        </View>
        
        {selectionMode ? (
          <TouchableOpacity 
            onPress={() => {
              setSelectionMode(false);
              setSelectedIds(new Set());
            }}
          >
            <Text style={{ color: COLORS.primary, fontWeight: 'bold' }}>Cancel</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => navigation.navigate('AddSparePart')}
          >
            <Icon name="add" size={24} color={COLORS.background} />
          </TouchableOpacity>
        )}
      </View>

      {loading && !refreshing ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <FlatList
            data={parts}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[styles.listContent, selectionMode && { paddingBottom: 100 }]}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Icon name="construct-outline" size={64} color={COLORS.border} />
                <Text style={styles.emptyText}>Your inventory is empty.</Text>
                <TouchableOpacity 
                  style={styles.emptyButton}
                  onPress={() => navigation.navigate('AddSparePart')}
                >
                  <Text style={styles.emptyButtonText}>List Your First Part</Text>
                </TouchableOpacity>
              </View>
            }
          />

          {selectionMode && (
            <View style={styles.bulkActionBar}>
              <TouchableOpacity style={styles.bulkActionButton} onPress={handleBulkDelete}>
                <Icon name="trash-outline" size={20} color={COLORS.error} />
                <Text style={[styles.bulkActionText, { color: COLORS.error }]}>Delete</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.bulkActionButton} 
                onPress={() => handleBulkUpdateStatus('active')}
              >
                <Icon name="checkmark-circle-outline" size={20} color={COLORS.success} />
                <Text style={[styles.bulkActionText, { color: COLORS.success }]}>Activate</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.bulkActionButton} 
                onPress={() => handleBulkUpdateStatus('out_of_stock')}
              >
                <Icon name="close-circle-outline" size={20} color={COLORS.textMuted} />
                <Text style={styles.bulkActionText}>Sold Out</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    paddingTop: SPACING.xl,
    backgroundColor: COLORS.backgroundCard,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
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
    height: 120,
  },
  selectedCard: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '05',
  },
  checkboxContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
    backgroundColor: COLORS.backgroundCard,
    borderRadius: 12,
  },
  partImage: {
    width: 120,
    height: '100%',
  },
  partInfo: {
    flex: 1,
    padding: SPACING.sm,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  partName: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 8,
    fontWeight: 'bold',
  },
  price: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
    fontWeight: '600',
  },
  metaText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    bottom: SPACING.sm,
    right: SPACING.sm,
  },
  actionButton: {
    marginLeft: 12,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZES.md,
    marginTop: SPACING.md,
  },
  emptyButton: {
    marginTop: SPACING.xl,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
  },
  emptyButtonText: {
    color: COLORS.background,
    fontWeight: 'bold',
  },
  bulkActionBar: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: COLORS.backgroundCard,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  bulkActionButton: {
    alignItems: 'center',
    gap: 4,
  },
  bulkActionText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.text,
  },
});
