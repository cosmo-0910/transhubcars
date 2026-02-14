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
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { AutocompleteInput } from '../../components/common/AutocompleteInput';
import { partsService } from '../../services/parts.service';
import { useAuth } from '../../hooks/useAuth';
import { SparePart } from '../../types';

export const AddSparePartScreen = ({ route, navigation }: any) => {
  const { user } = useAuth();
  const editPart = route.params?.part as SparePart;
  const [loading, setLoading] = useState(false);
  
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

  const handleSubmit = async () => {
    if (!form.name || !form.category || !form.price || !form.vehicle_make) {
      Alert.alert('Error', 'Please fill in all required fields.');
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
        Alert.alert('Success', 'Inventory updated successfully.');
      } else {
        await partsService.addPart(partData);
        Alert.alert('Success', 'Spare part added to inventory.');
      }
      navigation.goBack();
    } catch (error) {
      console.error('Error saving part:', error);
      Alert.alert('Error', 'Failed to save part. Please try again.');
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
});
