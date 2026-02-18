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
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../../hooks/useAuth';
import { useAlert } from '../../context/AlertContext';
import { partsService } from '../../services/parts.service';
import { SparePart } from '../../types';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../utils/theme';
import { formatCurrency } from '../../utils/helpers';

export const ManageSparePartsScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const { showAlert } = useAlert();
  const [parts, setParts] = useState<SparePart[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  const handleDeletePart = (partId: string) => {
    showAlert({
      title: 'Delete Part',
      message: 'Are you sure you want to remove this spare part from your inventory?',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await partsService.deletePart(partId);
              setParts(prev => prev.filter(p => p.id !== partId));
              showAlert({ title: 'Success', message: 'Part deleted from inventory.' });
            } catch (error) {
              showAlert({ title: 'Error', message: 'Failed to delete part.', buttons: [{ text: 'OK', style: 'destructive' }] });
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    });
  };

  const renderItem = ({ item }: { item: SparePart }) => (
    <View style={styles.partCard}>
      <Image 
        source={{ uri: item.image_url || 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=2072&auto=format&fit=crop' }} 
        style={styles.partImage} 
      />
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
        
        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('AddSparePart', { part: item })}
          >
            <Icon name="create-outline" size={18} color={COLORS.text} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleDeletePart(item.id)}
          >
            <Icon name="trash-outline" size={18} color={COLORS.error} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Spare Part Inventory</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => navigation.navigate('AddSparePart')}
        >
          <Icon name="add" size={24} color={COLORS.background} />
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={parts}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
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
});
