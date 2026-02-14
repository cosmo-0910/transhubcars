import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, Platform, Alert, ActivityIndicator } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../utils/theme';
import Icon from 'react-native-vector-icons/Ionicons';

export const NotificationSettingsScreen = ({ navigation }: any) => {
  const [settings, setSettings] = useState({
    push: true,
    email: true,
    newListings: true,
    priceDrops: false,
    inquiryResponses: true,
  });

  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      Alert.alert('Success', 'Notification settings saved successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save settings.');
    } finally {
      setLoading(false);
    }
  };

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const SettingItem = ({ icon, label, description, value, onToggle }: any) => (
    <View style={styles.settingItem}>
      <View style={styles.settingLeft}>
        <View style={styles.iconContainer}>
          <Icon name={icon} size={22} color={COLORS.primary} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.label}>{label}</Text>
          {description && <Text style={styles.description}>{description}</Text>}
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: COLORS.border, true: COLORS.primary + '80' }}
        thumbColor={value ? COLORS.primary : '#f4f3f4'}
      />
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notification Settings</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>General Notifications</Text>
          <View style={styles.card}>
            <SettingItem
              icon="notifications-outline"
              label="Push Notifications"
              description="Receive alerts on your mobile device"
              value={settings.push}
              onToggle={() => toggleSetting('push')}
            />
            <SettingItem
              icon="mail-outline"
              label="Email Notifications"
              description="Receive updates via your email address"
              value={settings.email}
              onToggle={() => toggleSetting('email')}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Marketplace Alerts</Text>
          <View style={styles.card}>
            <SettingItem
              icon="car-outline"
              label="New Listings"
              description="Notify me when new vehicles match my interests"
              value={settings.newListings}
              onToggle={() => toggleSetting('newListings')}
            />
            <SettingItem
              icon="trending-down-outline"
              label="Price Drops"
              description="Alert me when a vehicle I viewed is discounted"
              value={settings.priceDrops}
              onToggle={() => toggleSetting('priceDrops')}
            />
            <SettingItem
              icon="chatbubble-outline"
              label="Inquiry Responses"
              description="Notify me when a vendor replies to my message"
              value={settings.inquiryResponses}
              onToggle={() => toggleSetting('inquiryResponses')}
            />
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.saveButton, loading && styles.disabledButton]} 
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.background} />
          ) : (
            <Text style={styles.saveButtonText}>Save Preferences</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.footerText}>
          You can change these settings at any time. Some critical account notifications will always be sent via email.
        </Text>
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
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.sm,
    marginLeft: SPACING.xs,
  },
  card: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  settingLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  description: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  footerText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.xl,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.xl,
    marginBottom: SPACING.md,
  },
  saveButtonText: {
    color: COLORS.background,
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.7,
  },
});
