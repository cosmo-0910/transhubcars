import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../utils/theme';
import { useAlert } from '../../context/AlertContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { AutocompleteInput } from '../../components/common/AutocompleteInput';
import { partsService } from '../../services/parts.service';
import { vendorService } from '../../services/vendor.service';
import { useAuth } from '../../hooks/useAuth';
import { SparePart } from '../../types';
import { formatCurrency } from '../../utils/helpers';

export const AddSparePartScreen = ({ route, navigation }: any) => {
  const { user } = useAuth();
  const { showAlert } = useAlert();
  const editPart = route.params?.part as SparePart;
  const [loading, setLoading] = useState(false);
  const [financeSettings, setFinanceSettings] = useState<any>(null);
  
  const [form, setForm] = useState({
    name: editPart?.name || '',
    category: editPart?.category || '',
    condition: editPart?.condition || 'New',
    vehicle_make: editPart?.vehicle_make || '',
    vehicle_model: editPart?.vehicle_model || '',
    vehicle_year: editPart?.vehicle_year?.toString() || '',
    price: editPart?.price?.toString() || '',
    stock_quantity: editPart?.stock_quantity?.toString() || '1',
    description: editPart?.description || '',
    image_url: editPart?.image_url || '',
  });

  useEffect(() => {
    const fetchSettings = async () => {
      const settings = await vendorService.getPlatformFinanceSettings();
      setFinanceSettings(settings);
    };
    fetchSettings();
  }, []);

  const calculateFees = () => {
    const price = parseFloat(form.price) || 0;
    const commissionPct = financeSettings?.parts_sale_commission_pct || 10.0;
    const fee = (price * commissionPct) / 100;
    const payout = price - fee;
    return { fee, payout, pct: commissionPct };
  };

  const handleSubmit = async () => {
    if (!form.name || !form.category || !form.price || !form.vehicle_make) {
      showAlert({ title: 'Error', message: 'Please fill in all required fields.', buttons: [{ text: 'OK', style: 'destructive' }] });
      return;
    }

    setLoading(true);
    try {
      const partData = {
        vendor_id: user?.id || '',
        name: form.name,
        category: form.category,
        condition: form.condition as any,
        vehicle_make: form.vehicle_make,
        vehicle_model: form.vehicle_model,
        vehicle_year: parseInt(form.vehicle_year) || 0,
        price: parseFloat(form.price) || 0,
        stock_quantity: parseInt(form.stock_quantity) || 1,
        description: form.description,
        image_url: form.image_url,
        status: 'active' as any,
      };

      if (editPart) {
        await partsService.updatePart(editPart.id, partData);
        showAlert({ title: 'Success', message: 'Inventory updated successfully.' });
      } else {
        await partsService.addPart(partData);
        showAlert({ title: 'Success', message: 'Spare part added to inventory.' });
      }
      navigation.goBack();
    } catch (error) {
      console.error('Error saving part:', error);
      showAlert({ title: 'Error', message: 'Failed to save part. Please try again.', buttons: [{ text: 'OK', style: 'destructive' }] });
    } finally {
      setLoading(false);
    }
  };

  const getSuggestions = (field: string) => async (query: string) => {
    if (query.length < 1) return [];
    return partsService.getFilterSuggestions(field, query);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{editPart ? 'Edit Part' : 'Add New Part'}</Text>
      </View>

      <View style={styles.form}>
        <Input
          label="Part Name *"
          placeholder="e.g. BMW M5 Front Bumper"
          value={form.name}
          onChangeText={(val) => setForm({ ...form, name: val })}
        />

        <AutocompleteInput
          label="Category *"
          placeholder="e.g. Body"
          value={form.category}
          onChangeText={(val) => setForm({ ...form, category: val })}
          onSuggestionPress={(val) => setForm({ ...form, category: val })}
          getSuggestions={getSuggestions('category')}
        />

        <View style={styles.row}>
          <View style={styles.flex1}>
            <AutocompleteInput
              label="Make *"
              placeholder="e.g. BMW"
              value={form.vehicle_make}
              onChangeText={(val) => setForm({ ...form, vehicle_make: val })}
              onSuggestionPress={(val) => setForm({ ...form, vehicle_make: val })}
              getSuggestions={getSuggestions('make')}
            />
          </View>
          <View style={[styles.flex1, { marginLeft: SPACING.md }]}>
             <AutocompleteInput
              label="Model"
              placeholder="e.g. M5"
              value={form.vehicle_model}
              onChangeText={(val) => setForm({ ...form, vehicle_model: val })}
              onSuggestionPress={(val) => setForm({ ...form, vehicle_model: val })}
              getSuggestions={getSuggestions('model')}
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.flex1}>
            <Input
              label="Year"
              placeholder="e.g. 2022"
              keyboardType="numeric"
              value={form.vehicle_year}
              onChangeText={(val) => setForm({ ...form, vehicle_year: val })}
            />
          </View>
          <View style={[styles.flex1, { marginLeft: SPACING.md }]}>
             <Input
              label="Price *"
              placeholder="0.00"
              keyboardType="numeric"
              value={form.price}
              onChangeText={(val) => setForm({ ...form, price: val })}
            />
          </View>
        </View>

        {form.price ? (
          <View style={styles.feeBreakdown}>
            <View style={styles.feeRow}>
              <Text style={styles.feeLabel}>Platform Fee ({calculateFees().pct}%)</Text>
              <Text style={styles.feeValue}>- {formatCurrency(calculateFees().fee)}</Text>
            </View>
            <View style={[styles.feeRow, styles.payoutRow]}>
              <Text style={styles.payoutLabel}>Your Payout</Text>
              <Text style={styles.payoutValue}>{formatCurrency(calculateFees().payout)}</Text>
            </View>
          </View>
        ) : null}

        <Input
          label="Description"
          placeholder="Detailed description of the part..."
          multiline
          numberOfLines={4}
          value={form.description}
          onChangeText={(val) => setForm({ ...form, description: val })}
        />

        <Input
          label="Image URL"
          placeholder="https://..."
          value={form.image_url}
          onChangeText={(val) => setForm({ ...form, image_url: val })}
        />

        <Button
          title={loading ? 'Saving...' : (editPart ? 'Update Listing' : 'Publish Listing')}
          onPress={handleSubmit}
          loading={loading}
          style={styles.submitBtn}
        />
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
  form: {
    padding: SPACING.lg,
    paddingBottom: 40,
  },
  row: {
    flexDirection: 'row',
    zIndex: 10,
  },
  flex1: {
    flex: 1,
  },
  submitBtn: {
    marginTop: SPACING.xl,
  },
  feeBreakdown: {
    backgroundColor: COLORS.backgroundCard,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  feeLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  feeValue: {
    fontSize: 10,
    color: COLORS.error,
    fontWeight: '700',
  },
  payoutRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginBottom: 0,
  },
  payoutLabel: {
    fontSize: 12,
    color: COLORS.text,
    fontWeight: '800',
  },
  payoutValue: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '800',
  },
});
