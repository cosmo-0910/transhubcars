import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, Platform } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../utils/theme';
import Icon from 'react-native-vector-icons/Ionicons';
import { Button } from '../../components/common/Button';
import { launchImageLibrary } from 'react-native-image-picker';
import { authService } from '../../services/auth.service';
import { Alert } from 'react-native';

export const ProfileScreen = () => {
  const { user, profile, signOut, refreshProfile } = useAuth();

  const handleUpdateProfileImage = async () => {
    try {
      // Request permissions first
      if (Platform.OS === 'android') {
        const { PermissionsAndroid } = require('react-native');
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission',
            message: 'Transhub needs access to your photos to update your profile picture.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Permission Denied', 'Storage permission is required to select photos.');
          return;
        }
      }

      const result = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 1,
        quality: 0.8,
      });

      if (result.assets && result.assets[0]) {
        const asset = result.assets[0];
        if (asset.uri && asset.type && asset.fileName && user) {
          console.log('[ClientProfile] Starting image upload...');
          await authService.uploadProfileImage(user.id, {
            uri: asset.uri,
            type: asset.type,
            name: asset.fileName,
          });
          await refreshProfile();
          Alert.alert('Success', 'Profile picture updated successfully!');
        } else {
          Alert.alert('Error', 'Invalid image selected. Please try again.');
        }
      }
    } catch (error: any) {
      console.error('[ClientProfile] Error updating profile image:', error);
      
      let errorMessage = 'Failed to update profile picture. ';
      if (error.message?.includes('Storage')) {
        errorMessage += 'Storage issue detected. Please check your connection and try again.';
      } else if (error.message?.includes('fetch')) {
        errorMessage += 'Could not read the image file. Please try a different image.';
      } else {
        errorMessage += error.message || 'Please try again or contact support.';
      }
      
      Alert.alert('Upload Error', errorMessage);
    }
  };

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
        <TouchableOpacity style={styles.avatarContainer} onPress={handleUpdateProfileImage}>
          {profile?.avatar_url ? (
            <Image 
              source={{ uri: profile.avatar_url }} 
              style={styles.avatarImage} 
            />
          ) : (
            <Text style={styles.avatarText}>
              {profile?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
            </Text>
          )}
          <View style={styles.editIconContainer}>
            <Icon name="camera" size={12} color={COLORS.background} />
          </View>
        </TouchableOpacity>
        <Text style={styles.userName}>{profile?.full_name || 'Guest User'}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{profile?.role?.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Settings</Text>
        <View style={styles.card}>
          <ProfileItem 
            icon="person-outline" 
            label="Edit Profile" 
            onPress={() => {}} 
          />
          <ProfileItem 
            icon="notifications-outline" 
            label="Notifications" 
            onPress={() => {}} 
          />
          <ProfileItem 
            icon="shield-checkmark-outline" 
            label="Security" 
            onPress={() => {}} 
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Activity</Text>
        <View style={styles.card}>
          <ProfileItem 
            icon="cart-outline" 
            label="My Orders" 
            onPress={() => {}} 
          />
          <ProfileItem 
            icon="chatbubble-outline" 
            label="My Inquiries" 
            onPress={() => {}} 
          />
          <ProfileItem 
            icon="heart-outline" 
            label="Favorites" 
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
            icon="information-circle-outline" 
            label="About Transhub" 
            onPress={() => {}} 
          />
        </View>
      </View>

      <View style={styles.footer}>
        <Button 
          title="Sign Out" 
          variant="outline" 
          onPress={signOut} 
          style={styles.signOutButton}
          textStyle={{ color: COLORS.error }}
        />
        <Text style={styles.versionText}>Version 1.0.0 (Build 1)</Text>
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
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
    backgroundColor: COLORS.backgroundCard,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  avatarText: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.background,
  },
  userName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  roleBadge: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  roleText: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
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
    marginLeft: SPACING.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
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
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: '500',
  },
  itemValue: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  footer: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  signOutButton: {
    width: '100%',
    borderColor: COLORS.error,
  },
  versionText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: SPACING.lg,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.background,
  },
});
