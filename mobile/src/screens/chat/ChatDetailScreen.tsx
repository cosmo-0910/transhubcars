import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { chatService } from '../../services/chat.service';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../utils/theme';
import Icon from 'react-native-vector-icons/Ionicons';
import { formatDistanceToNow } from 'date-fns';
import type { Conversation, Message } from '../../types';

export const ChatDetailScreen = ({ route, navigation }: any) => {
  const { conversation } = route.params as { conversation: Conversation };
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  const isAdminOrVendor = profile?.role !== 'customer';
  const partner = isAdminOrVendor ? conversation.buyer : conversation.vendor;
  const partnerName = partner?.full_name || (conversation.vendor as any)?.business_name || 'User';

  useEffect(() => {
    fetchMessages();
    const subscription = chatService.subscribeToMessages(conversation.id, (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [conversation.id]);

  const fetchMessages = async () => {
    try {
      const data = await chatService.getMessages(conversation.id);
      setMessages(data);
      chatService.markAsRead(conversation.id, user!.id);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !user) return;

    try {
      const msgText = newMessage;
      setNewMessage('');
      await chatService.sendMessage({
        conversation_id: conversation.id,
        sender_id: user.id,
        text: msgText,
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isOwn = item.sender_id === user?.id;
    return (
      <View style={[styles.messageBubble, isOwn ? styles.ownMessage : styles.partnerMessage]}>
        <Text style={[styles.messageText, isOwn ? styles.ownMessageText : styles.partnerMessageText]}>
          {item.text}
        </Text>
        <Text style={styles.messageTime}>
          {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.headerPartner}>
          <Text style={styles.headerName}>{partnerName}</Text>
          {conversation.car && (
            <Text style={styles.headerCar}>{conversation.car.make} {conversation.car.model}</Text>
          )}
        </View>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message..."
          placeholderTextColor={COLORS.textMuted}
          multiline
        />
        <TouchableOpacity 
          style={[styles.sendBtn, !newMessage.trim() && styles.sendBtnDisabled]} 
          onPress={handleSend}
          disabled={!newMessage.trim()}
        >
          <Icon name="send" size={20} color={newMessage.trim() ? "black" : COLORS.textMuted} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: SPACING.md,
    paddingTop: 50,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundCard,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    padding: SPACING.sm,
  },
  headerPartner: {
    marginLeft: SPACING.md,
  },
  headerName: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  headerCar: {
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: '600',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesList: {
    padding: SPACING.md,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
  },
  ownMessage: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4,
  },
  partnerMessage: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.border,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: FONT_SIZES.sm,
  },
  ownMessageText: {
    color: 'black',
  },
  partnerMessageText: {
    color: COLORS.text,
  },
  messageTime: {
    fontSize: 8,
    color: COLORS.textMuted,
    marginTop: 4,
    textAlign: 'right',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: SPACING.md,
    paddingBottom: Platform.OS === 'ios' ? 30 : SPACING.md,
    backgroundColor: COLORS.backgroundCard,
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.xl,
    paddingHorizontal: SPACING.lg,
    paddingTop: 10,
    paddingBottom: 10,
    color: COLORS.text,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.sm,
  },
  sendBtnDisabled: {
    backgroundColor: COLORS.border,
  },
});
