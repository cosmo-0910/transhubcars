import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../utils/theme';
import { Button } from '../../components/common/Button';
import Icon from 'react-native-vector-icons/Ionicons';

export const VendorProfileScreen = () => {
  const { user, profile, signOut } = useAuth();

  const ProfileItem = ({ icon, label, value, onPress, color = COLORS.text }: any) => (
    <TouchableOpacity 
      style={styles.item} 
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.itemLeft}>
        <View style={[styles.iconContainer, { backgroundColor: `${color}10` }]}>
          <Icon name={icon} size={20} color={color} />
        </View>
        <View>
          <Text style={styles.itemLabel}>{label}</Text>
          {value && <Text style={styles.itemValue}>{value}</Text>}
        </View>
      </View>
      {onPress && <Icon name="chevron-forward" size={18} color={COLORS.textMuted} />}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.avatarLarge}>
          <Text style={styles.avatarTextLarge}>
            {profile?.full_name?.charAt(0) || 'V'}
          </Text>
        </View>
        <Text style={styles.userName}>{profile?.full_name || 'Vendor Partner'}</Text>
        <Text style={styles.userRole}>Verified Vendor</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Business Account</Text>
        <View style={styles.card}>
          <ProfileItem 
            icon="business-outline" 
            label="Business Name" 
            value={profile?.full_name} 
          />
          <ProfileItem 
            icon="mail-outline" 
            label="Email Address" 
            value={user?.email} 
          />
          <ProfileItem 
            icon="call-outline" 
            label="Phone Number" 
            value="+234 800 000 0000" 
            onPress={() => {}}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Vendor Settings</Text>
        <View style={styles.card}>
          <ProfileItem 
            icon="notifications-outline" 
            label="Push Notifications" 
            onPress={() => {}} 
          />
          <ProfileItem 
            icon="shield-checkmark-outline" 
            label="Verification Status" 
            value="Approved"
            color="#4CAF50"
          />
          <ProfileItem 
            icon="settings-outline" 
            label="Account Settings" 
            onPress={() => {}} 
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        <View style={styles.card}>
          <ProfileItem 
            icon="help-circle-outline" 
            label="Help Center" 
            onPress={() => {}} 
          />
          <ProfileItem 
            icon="chatbubble-outline" 
            label="Contact Admin" 
            onPress={() => {}} 
          />
        </View>
      </View>

      <Button 
        title="Sign Out" 
        variant="outline" 
        onPress={() => {
          Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Sign Out', style: 'destructive', onPress: signOut },
          ]);
        }} 
        style={styles.signOutButton}
        textStyle={{ color: COLORS.error }}
      />

      <Text style={styles.versionText}>Transhub v1.0.0 (Vendor)</Text>
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
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
    backgroundColor: COLORS.backgroundCard,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  avatarTextLarge: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.background,
  },
  userName: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  userRole: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    marginTop: 4,
    fontWeight: '600',
  },
  section: {
    padding: SPACING.lg,
    paddingBottom: 0,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  card: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  itemLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontWeight: '500',
  },
  itemValue: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  signOutButton: {
    margin: SPACING.lg,
    marginTop: SPACING.xxl,
    borderColor: COLORS.error,
  },
  versionText: {
    textAlign: 'center',
    color: COLORS.textMuted,
    fontSize: FONT_SIZES.xs,
    marginBottom: SPACING.lg,
  },
});
