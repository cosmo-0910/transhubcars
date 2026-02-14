import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../utils/theme';
import Icon from 'react-native-vector-icons/Ionicons';

export const InquiryDetailScreen = ({ navigation, route }: any) => {
  const { inquiry } = route.params;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Inquiry Details</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.typeCard}>
           <View style={styles.typeBadge}>
             <Text style={styles.typeText}>{inquiry.type.toUpperCase()}</Text>
           </View>
           <Text style={styles.date}>{new Date(inquiry.created_at).toLocaleDateString()}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vehicle Interested</Text>
          <View style={styles.card}>
            <Text style={styles.carName}>{inquiry.car_name || 'Generic Inquiry'}</Text>
            {inquiry.car_id && (
                <TouchableOpacity 
                   style={styles.viewCarButton}
                   onPress={() => navigation.navigate('Inventory')}
                >
                   <Text style= {styles.viewCarText}>View Inventory</Text>
                </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Message</Text>
          <View style={styles.card}>
            <Text style={styles.messageText}>
              {inquiry.message || 'No specific message provided.'}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Inquiry Status</Text>
          <View style={styles.statusRow}>
              <View style={[styles.statusIndicator, { backgroundColor: inquiry.status === 'New' ? COLORS.info : COLORS.success }]} />
              <Text style={styles.statusText}>{inquiry.status}</Text>
          </View>
          <Text style={styles.statusHelp}>
             {inquiry.status === 'New' 
               ? 'Our specialists are currently reviewing your request. We will contact you shortly.' 
               : 'A specialist has reviewed your inquiry and should have contacted you via email or phone.'}
          </Text>
        </View>
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
  typeCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  typeBadge: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  typeText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  date: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
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
  card: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  carName: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  viewCarButton: {
    marginTop: SPACING.md,
    alignSelf: 'flex-start',
  },
  viewCarText: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: FONT_SIZES.sm,
  },
  messageText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  statusHelp: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    lineHeight: 20,
  },
});
