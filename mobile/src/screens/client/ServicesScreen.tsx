import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../utils/theme';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

const ServiceCard = ({ title, description, icon, color, onPress }: any) => (
  <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
    <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
      <Icon name={icon} size={32} color={color} />
    </View>
    <View style={styles.cardContent}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardDescription}>{description}</Text>
    </View>
    <Icon name="chevron-forward" size={20} color={COLORS.textMuted} />
  </TouchableOpacity>
);

export const ServicesScreen = () => {
  const navigation = useNavigation<any>();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Services</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>TRANS HUB CONCIERGE</Text>
        <Text style={styles.heroText}>Premium Automotive Services at Your Fingertips</Text>

        <View style={styles.serviceList}>
          <ServiceCard
            title="Order Spare Parts"
            description="Genuine parts for all luxury vehicle makes and models."
            icon="settings-outline"
            color={COLORS.primary}
            onPress={() => navigation.navigate('SpareParts')}
          />
          
          <ServiceCard
            title="Request Tow Truck"
            description="Rapid emergency recovery and vehicle transport services."
            icon="car-outline"
            color="#E11D48"
            onPress={() => navigation.navigate('TowTruck')}
          />

          <ServiceCard
            title="Certified Workshops"
            description="Access elite workshops certified by Transhub for superior maintenance."
            icon="construct-outline"
            color={COLORS.success}
            onPress={() => navigation.navigate('Mechanics')}
          />
        </View>

        <View style={styles.infoBox}>
          <Icon name="information-circle-outline" size={24} color={COLORS.primary} />
          <Text style={styles.infoText}>
            Every Transhub workshop is elite certified. We ensure every partner meets our rigorous standards for luxury automotive care and precision.
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
  sectionTitle: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 2,
    marginBottom: 8,
  },
  heroText: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xl,
    lineHeight: 32,
  },
  serviceList: {
    gap: SPACING.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundCard,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  infoBox: {
    marginTop: SPACING.xxl,
    flexDirection: 'row',
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    marginLeft: SPACING.sm,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  }
});
