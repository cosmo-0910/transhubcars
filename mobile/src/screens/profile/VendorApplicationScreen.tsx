import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../utils/theme';
import { useAuth } from '../../hooks/useAuth';
import { useAlert } from '../../context/AlertContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { supabase } from '../../services/supabase';

const VENDOR_TYPES: { label: string; value: 'car' | 'parts'; icon: string; description: string; instantApproval: boolean }[] = [
  {
    label: 'Car Seller',
    value: 'car',
    icon: 'car-outline',
    description: 'Buy & sell new or used vehicles',
    instantApproval: false,
  },
  {
    label: 'Car Parts Dealer',
    value: 'parts',
    icon: 'construct-outline',
    description: 'Supply automotive spare parts — instant approval',
    instantApproval: true,
  },
];

export const VendorApplicationScreen = ({ navigation }: any) => {
  const { user, profile, refreshProfile } = useAuth();
  const { showAlert } = useAlert();
  const [loading, setLoading] = useState(false);
  const [vendorType, setVendorType] = useState<'car' | 'parts'>('car');

  const [form, setForm] = useState({
    business_name: profile?.business_name || '',
    contact_phone: '',
    business_address: '',
    business_description: '',
    years_in_business: '',
    cac_number: '',
  });

  const update = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

  const alreadyApplied = profile?.vendor_status === 'pending';
  const alreadyApproved = profile?.vendor_status === 'approved';

  const isPartsVendor = vendorType === 'parts';

  const handleSubmit = async () => {
    if (!form.business_name || !form.contact_phone || !form.business_address) {
      showAlert({ title: 'Missing Info', message: 'Please fill in all required fields.', buttons: [{ text: 'OK' }] });
      return;
    }

    setLoading(true);
    try {
      // Car parts vendors are auto-approved; car sellers go through admin review
      const updates: any = {
        vendor_type: vendorType,
        business_name: form.business_name,
        business_details: {
          contact_phone: form.contact_phone,
          address: form.business_address,
          description: form.business_description,
          years_in_business: form.years_in_business,
          cac_number: form.cac_number,
        },
      };

      if (isPartsVendor) {
        updates.vendor_status = 'approved';
        updates.role = 'vendor';
      } else {
        updates.vendor_status = 'pending';
      }

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user?.id);

      if (error) throw error;

      await refreshProfile();

      if (isPartsVendor) {
        showAlert({
          title: 'Welcome, Parts Dealer! 🔧',
          message: 'Your account has been instantly activated as a Car Parts Dealer. You can now start listing spare parts.',
          buttons: [{ text: 'Start Selling', onPress: () => navigation.goBack() }],
        });
      } else {
        showAlert({
          title: 'Application Submitted! 🚀',
          message: "Your vendor application has been sent for review. We'll notify you once it's processed, usually within 24–48 hours.",
          buttons: [{ text: 'Got it', onPress: () => navigation.goBack() }],
        });
      }
    } catch (err: any) {
      console.error('[VendorApplication] Error:', err);
      showAlert({ title: 'Error', message: err.message || 'Failed to submit application. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Become a Vendor</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero banner */}
        <View style={styles.heroBanner}>
          <View style={styles.heroIcon}>
            <Icon name="storefront-outline" size={36} color={COLORS.primary} />
          </View>
          <Text style={styles.heroTitle}>Start Selling on Transhub</Text>
          <Text style={styles.heroSubtitle}>
            Join trusted vendors reaching thousands of buyers across Nigeria.
          </Text>
        </View>

        {alreadyApproved ? (
          <View style={styles.statusCard}>
            <Icon name="checkmark-circle" size={40} color={COLORS.success} />
            <Text style={styles.statusTitle}>You're Already a Vendor!</Text>
            <Text style={styles.statusMsg}>Your vendor account is active. Use the Vendor Dashboard to manage your listings.</Text>
          </View>
        ) : alreadyApplied ? (
          <View style={styles.statusCard}>
            <Icon name="time-outline" size={40} color={COLORS.primary} />
            <Text style={styles.statusTitle}>Application Under Review</Text>
            <Text style={styles.statusMsg}>Your car seller application is being reviewed by our team. We'll notify you within 24–48 hours.</Text>
          </View>
        ) : (
          <>
            {/* Benefits */}
            <View style={styles.benefitsRow}>
              {[
                { icon: 'cash-outline', label: 'Earn More' },
                { icon: 'people-outline', label: 'Wide Reach' },
                { icon: 'shield-checkmark-outline', label: 'Trusted Platform' },
              ].map(b => (
                <View key={b.label} style={styles.benefitItem}>
                  <Icon name={b.icon as any} size={22} color={COLORS.primary} />
                  <Text style={styles.benefitLabel}>{b.label}</Text>
                </View>
              ))}
            </View>

            {/* Vendor Type Selection */}
            <Text style={styles.sectionLabel}>What will you sell?</Text>
            <View style={styles.typeRow}>
              {VENDOR_TYPES.map(type => {
                const active = vendorType === type.value;
                return (
                  <TouchableOpacity
                    key={type.value}
                    style={[styles.typeCard, active && styles.typeCardActive]}
                    onPress={() => setVendorType(type.value)}
                  >
                    <View style={[styles.typeIconWrap, active && styles.typeIconWrapActive]}>
                      <Icon name={type.icon as any} size={24} color={active ? COLORS.primary : COLORS.textMuted} />
                    </View>
                    <Text style={[styles.typeLabel, active && styles.typeLabelActive]}>{type.label}</Text>
                    <Text style={styles.typeDesc} numberOfLines={2}>{type.description}</Text>
                    {type.instantApproval && (
                      <View style={styles.instantBadge}>
                        <Icon name="flash" size={10} color="#1a1a1a" />
                        <Text style={styles.instantBadgeText}>Instant</Text>
                      </View>
                    )}
                    {active && (
                      <View style={styles.checkBadge}>
                        <Icon name="checkmark-circle" size={18} color={COLORS.primary} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Instant approval notice for parts */}
            {isPartsVendor && (
              <View style={styles.instantNotice}>
                <Icon name="flash-outline" size={16} color={COLORS.primary} />
                <Text style={styles.instantNoticeText}>
                  Car Parts Dealers are <Text style={{ color: COLORS.primary, fontWeight: '700' }}>instantly approved</Text> — no waiting period. You can start listing parts right away.
                </Text>
              </View>
            )}

            <Text style={styles.sectionLabel}>Business Information</Text>
            <Input
              label="Business / Store Name *"
              placeholder="e.g. Lagos Auto Parts Hub"
              value={form.business_name}
              onChangeText={val => update('business_name', val)}
            />
            <Input
              label="Phone Number *"
              placeholder="+234 800 000 0000"
              keyboardType="phone-pad"
              value={form.contact_phone}
              onChangeText={val => update('contact_phone', val)}
            />
            <Input
              label="Business Address *"
              placeholder="e.g. 14 Bode Thomas St, Surulere, Lagos"
              value={form.business_address}
              onChangeText={val => update('business_address', val)}
            />
            <Input
              label="Years in Business"
              placeholder="e.g. 5"
              keyboardType="numeric"
              value={form.years_in_business}
              onChangeText={val => update('years_in_business', val)}
            />
            <Input
              label="CAC Registration Number (optional)"
              placeholder="e.g. RC1234567"
              value={form.cac_number}
              onChangeText={val => update('cac_number', val)}
            />
            <Input
              label="Brief Description"
              placeholder="Tell us about your business..."
              multiline
              numberOfLines={4}
              value={form.business_description}
              onChangeText={val => update('business_description', val)}
            />

            <View style={styles.disclaimer}>
              <Icon name="information-circle-outline" size={16} color={COLORS.textMuted} />
              <Text style={styles.disclaimerText}>
                {isPartsVendor
                  ? 'By applying, you confirm you are a legitimate spare parts supplier and agree to our Vendor Terms & Conditions.'
                  : 'Car seller applications are reviewed within 24–48 hours. By applying, you agree to our Vendor Terms & Conditions.'}
              </Text>
            </View>

            <Button
              title={loading ? 'Submitting...' : isPartsVendor ? 'Activate Parts Account' : 'Submit Application'}
              onPress={handleSubmit}
              loading={loading}
              style={{ marginTop: SPACING.md }}
            />
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
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
  backBtn: { marginRight: SPACING.md },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  content: {
    padding: SPACING.lg,
  },
  heroBanner: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  heroIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(197, 160, 89, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(197, 160, 89, 0.3)',
  },
  heroTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  statusCard: {
    alignItems: 'center',
    backgroundColor: COLORS.backgroundCard,
    padding: SPACING.xxl,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statusTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  statusMsg: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  benefitsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.xl,
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  benefitItem: { alignItems: 'center' },
  benefitLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '700',
    marginTop: 6,
  },
  sectionLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
  },
  typeRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  typeCard: {
    flex: 1,
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    alignItems: 'center',
    position: 'relative',
  },
  typeCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(197, 160, 89, 0.06)',
  },
  typeIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  typeIconWrapActive: {
    backgroundColor: 'rgba(197, 160, 89, 0.15)',
  },
  typeLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: 4,
  },
  typeLabelActive: {
    color: COLORS.primary,
  },
  typeDesc: {
    fontSize: 10,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 14,
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  instantBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: SPACING.sm,
  },
  instantBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#1a1a1a',
  },
  instantNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(197, 160, 89, 0.08)',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(197, 160, 89, 0.25)',
    gap: SPACING.sm,
  },
  instantNoticeText: {
    flex: 1,
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    lineHeight: 18,
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginTop: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.sm,
  },
  disclaimerText: {
    flex: 1,
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    lineHeight: 18,
  },
});
