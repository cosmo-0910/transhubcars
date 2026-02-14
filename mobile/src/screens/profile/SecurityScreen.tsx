import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Platform } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../utils/theme';
import { authService } from '../../services/auth.service';
import Icon from 'react-native-vector-icons/Ionicons';
import { Button } from '../../components/common/Button';

export const SecurityScreen = ({ navigation }: any) => {
  const [loading, setLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all password fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters long');
      return;
    }

    try {
      setLoading(true);
      await authService.updatePassword(newPassword);
      Alert.alert('Success', 'Password updated successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      console.error('[Security] Update error:', error);
      Alert.alert('Error', error.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOutAll = async () => {
    Alert.alert(
      'Sign Out All Devices',
      'Are you sure you want to sign out from all other devices? You will remain signed in on this device.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out All', 
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await authService.signOutAllDevices();
              Alert.alert('Success', 'Signed out from all other sessions.');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to sign out from other devices');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleShowTrustedDevices = () => {
    Alert.alert('Trusted Devices', 'This feature is currently being integrated with your secure hardware. Coming soon.');
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Security Settings</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.infoBox}>
          <Icon name="shield-checkmark" size={24} color={COLORS.primary} />
          <Text style={styles.infoText}>
            Keep your account secure by using a strong password. We recommend a mix of letters, numbers, and symbols.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Change Password</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Current Password</Text>
            <View style={styles.inputContainer}>
              <Icon name="lock-closed-outline" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Enter current password"
                placeholderTextColor={COLORS.textMuted}
                secureTextEntry={!showCurrent}
              />
              <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)}>
                <Icon name={showCurrent ? "eye-off-outline" : "eye-outline"} size={20} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>New Password</Text>
            <View style={styles.inputContainer}>
              <Icon name="key-outline" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Enter new password"
                placeholderTextColor={COLORS.textMuted}
                secureTextEntry={!showNew}
              />
              <TouchableOpacity onPress={() => setShowNew(!showNew)}>
                <Icon name={showNew ? "eye-off-outline" : "eye-outline"} size={20} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm New Password</Text>
            <View style={styles.inputContainer}>
              <Icon name="checkmark-circle-outline" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm new password"
                placeholderTextColor={COLORS.textMuted}
                secureTextEntry={!showNew}
              />
            </View>
          </View>

          <Button
            title="Update Password"
            onPress={handleChangePassword}
            loading={loading}
            style={styles.button}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Login Activity</Text>
          <TouchableOpacity style={styles.menuItem} onPress={handleShowTrustedDevices}>
            <Icon name="phone-portrait-outline" size={20} color={COLORS.textSecondary} />
            <Text style={styles.menuText}>Trusted Devices</Text>
            <Icon name="chevron-forward" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={handleSignOutAll}>
            <Icon name="log-out-outline" size={20} color={COLORS.error} />
            <Text style={[styles.menuText, { color: COLORS.error }]}>Sign out from all other devices</Text>
            <Icon name="chevron-forward" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
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
  infoBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.xl,
    alignItems: 'center',
  },
  infoText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginLeft: SPACING.md,
    lineHeight: 20,
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
    marginBottom: SPACING.xl,
  },
  inputGroup: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
  },
  inputIcon: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  button: {
    marginTop: SPACING.lg,
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
});
