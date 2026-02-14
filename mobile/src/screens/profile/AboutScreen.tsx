import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Linking, Platform } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../utils/theme';
import Icon from 'react-native-vector-icons/Ionicons';

export const AboutScreen = ({ navigation }: any) => {
  const handleLink = (url: string) => {
    Linking.openURL(url).catch((err) => console.error("Couldn't load page", err));
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About Transhub</Text>
      </View>

      <View style={styles.logoSection}>
        <Image 
          source={require('../../assets/logo.png')} 
          style={styles.logo} 
          resizeMode="contain"
        />
        <Text style={styles.appName}>Transhub Cars</Text>
        <Text style={styles.version}>Version 1.0.0 (Build 1)</Text>
      </View>

      <View style={styles.contentSection}>
        <Text style={styles.description}>
          Transhub is Nigeria's premier automotive marketplace, connecting buyers with trusted vendors for high-quality new and used vehicles. Our mission is to provide a transparent, secure, and seamless car buying and selling experience.
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Company Info</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Website</Text>
            <TouchableOpacity onPress={() => handleLink('https://transhub.com')}>
              <Text style={styles.infoValue}>www.transhub.com</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>support@transhub.com</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Location</Text>
            <Text style={styles.infoValue}>Lagos, Nigeria</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Legal</Text>
          <TouchableOpacity style={styles.menuItem} onPress={() => handleLink('https://transhub.com/terms')}>
            <Icon name="document-text-outline" size={20} color={COLORS.primary} />
            <Text style={styles.menuText}>Terms of Service</Text>
            <Icon name="chevron-forward" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => handleLink('https://transhub.com/privacy')}>
            <Icon name="shield-outline" size={20} color={COLORS.primary} />
            <Text style={styles.menuText}>Privacy Policy</Text>
            <Icon name="chevron-forward" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => handleLink('https://transhub.com/licenses')}>
            <Icon name="ribbon-outline" size={20} color={COLORS.primary} />
            <Text style={styles.menuText}>Licenses</Text>
            <Icon name="chevron-forward" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        <Text style={styles.copyright}>
          &copy; {new Date().getFullYear()} Transhub Automotive Ltd. All rights reserved.
        </Text>
      </View>

      <View style={{ height: 40 }} />
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
  logoSection: {
    alignItems: 'center',
    padding: SPACING.xxl,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: SPACING.md,
  },
  appName: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4,
  },
  version: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
  },
  contentSection: {
    padding: SPACING.lg,
  },
  description: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    lineHeight: 24,
    marginBottom: SPACING.xl,
    textAlign: 'center',
  },
  card: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  infoLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  infoValue: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
    fontWeight: '600',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  menuText: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    marginLeft: SPACING.md,
  },
  copyright: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.lg,
  },
});
