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
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { chatService } from '../../services/chat.service';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../utils/theme';
import Icon from 'react-native-vector-icons/Ionicons';
import { formatDistanceToNow } from 'date-fns';
import type { Conversation } from '../../types';

export const MessagesScreen = ({ navigation }: any) => {
  const { user, profile } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchConversations = async () => {
    if (!user) return;
    try {
      const data = await chatService.getConversations(user.id);
      setConversations(data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchConversations();
  };

  const renderConversation = ({ item }: { item: Conversation }) => {
    const isAdminOrVendor = profile?.role !== 'customer';
    const partner = isAdminOrVendor ? item.buyer : item.vendor;
    const partnerName = partner?.full_name || (item.vendor as any)?.business_name || 'User';

    return (
      <TouchableOpacity
        style={styles.convItem}
        onPress={() => navigation.navigate('ChatDetail', { conversation: item })}
      >
        <View style={styles.avatarContainer}>
          {partner?.avatar_url ? (
            <Image source={{ uri: partner.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={styles.placeholderAvatar}>
              <Text style={styles.avatarText}>{partnerName.charAt(0)}</Text>
            </View>
          )}
          {item.car?.image_url && (
            <Image source={{ uri: item.car.image_url }} style={styles.carBadge} />
          )}
        </View>

        <View style={{ flex: 1, marginLeft: SPACING.md }}>
          <View style={styles.convHeader}>
            <Text style={styles.convName} numberOfLines={1}>{partnerName}</Text>
            <Text style={styles.convTime}>
              {formatDistanceToNow(new Date(item.updated_at), { addSuffix: true })}
            </Text>
          </View>
          <Text style={styles.carInfo} numberOfLines={1}>
            {item.car ? `${item.car.make} ${item.car.model}` : 'General Inquiry'}
          </Text>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.last_message || 'No messages yet'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
      </View>

      <FlatList
        data={conversations}
        renderItem={renderConversation}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="chatbubbles-outline" size={64} color={COLORS.border} />
            <Text style={styles.emptyText}>No conversations yet</Text>
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
    padding: SPACING.lg,
    paddingTop: 60,
    backgroundColor: COLORS.backgroundCard,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  listContent: {
    padding: SPACING.md,
  },
  convItem: {
    flexDirection: 'row',
    padding: SPACING.md,
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  placeholderAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  carBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.backgroundCard,
  },
  convHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  convName: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
  },
  convTime: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  carInfo: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
  },
  emptyContainer: {
    padding: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.textMuted,
  },
});
