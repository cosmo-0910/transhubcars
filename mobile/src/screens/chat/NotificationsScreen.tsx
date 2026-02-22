import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { notificationService } from '../../services/notification.service';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../utils/theme';
import Icon from 'react-native-vector-icons/Ionicons';
import { formatDistanceToNow } from 'date-fns';
import type { Notification } from '../../types';

export const NotificationsScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const data = await notificationService.getNotifications(user.id);
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    if (user) {
      const subscription = notificationService.subscribeToNotifications(user.id, (notif) => {
        setNotifications(prev => [notif, ...prev]);
      });
      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return { name: 'checkmark-circle-outline', color: '#4CAF50' };
      case 'warning': return { name: 'warning-outline', color: '#FF9800' };
      case 'error': return { name: 'alert-circle-outline', color: '#F44336' };
      default: return { name: 'information-circle-outline', color: COLORS.primary };
    }
  };

  const renderNotification = ({ item }: { item: Notification }) => {
    const icon = getIcon(item.type);
    return (
      <TouchableOpacity
        style={[styles.notifItem, !item.is_read && styles.unreadItem]}
        onPress={() => {
          if (!item.is_read) handleMarkAsRead(item.id);
          // Handle link navigation if needed
        }}
      >
        <View style={[styles.iconContainer, { backgroundColor: `${icon.color}15` }]}>
          <Icon name={icon.name} size={24} color={icon.color} />
        </View>
        <View style={styles.notifContent}>
          <Text style={[styles.notifTitle, !item.is_read && styles.unreadText]}>{item.title}</Text>
          <Text style={styles.notifBody}>{item.body}</Text>
          <Text style={styles.notifTime}>
            {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
          </Text>
        </View>
        {!item.is_read && <View style={styles.unreadDot} />}
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
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity onPress={() => notificationService.markAllAsRead(user!.id).then(fetchNotifications)}>
          <Text style={styles.markAll}>Mark all as read</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="notifications-off-outline" size={64} color={COLORS.border} />
            <Text style={styles.emptyText}>No notifications yet</Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  markAll: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  listContent: {
    paddingBottom: SPACING.xl,
  },
  notifItem: {
    flexDirection: 'row',
    padding: SPACING.lg,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    alignItems: 'flex-start',
  },
  unreadItem: {
    backgroundColor: 'rgba(212, 175, 55, 0.03)',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  notifContent: {
    flex: 1,
  },
  notifTitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    marginBottom: 4,
  },
  unreadText: {
    fontWeight: 'bold',
  },
  notifBody: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    lineHeight: 20,
  },
  notifTime: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 8,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginLeft: SPACING.sm,
    marginTop: 10,
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
