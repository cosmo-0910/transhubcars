import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { Input } from './Input';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../../utils/theme';

interface AutocompleteInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  onSuggestionPress: (suggestion: string) => void;
  getSuggestions: (query: string) => Promise<string[]>;
  icon?: string;
  keyboardType?: 'default' | 'numeric';
}

export const AutocompleteInput: React.FC<AutocompleteInputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  onSuggestionPress,
  getSuggestions,
  icon,
  keyboardType = 'default',
}) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (value.length > 0 && focused) {
        setLoading(true);
        try {
          const results = await getSuggestions(value);
          setSuggestions(results);
          setShowSuggestions(results.length > 0);
        } catch (error) {
          console.error('Error fetching suggestions:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };

    const debounce = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounce);
  }, [value, focused]);

  return (
    <View style={styles.container}>
      <Input
        label={label}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        leftIcon={icon ? <Icon name={icon} size={20} color={COLORS.textMuted} /> : undefined}
        keyboardType={keyboardType}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          // Delay hiding suggestions to allow for onPress
          setTimeout(() => {
            setFocused(false);
            setShowSuggestions(false);
          }, 200);
        }}
      />
      
      {showSuggestions && (
        <View style={styles.suggestionsContainer}>
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.primary} style={styles.loader} />
          ) : (
            <FlatList
              data={suggestions}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.suggestionItem}
                  onPress={() => {
                    onSuggestionPress(item);
                    setShowSuggestions(false);
                  }}
                >
                  <Text style={styles.suggestionText}>{item}</Text>
                </TouchableOpacity>
              )}
              style={styles.list}
              keyboardShouldPersistTaps="always"
            />
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    zIndex: 10,
    width: '100%',
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 75, // Adjust based on Input height
    left: 0,
    right: 0,
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 100,
  },
  list: {
    paddingVertical: SPACING.xs,
  },
  suggestionItem: {
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  suggestionText: {
    color: COLORS.text,
    fontSize: FONT_SIZES.md,
  },
  loader: {
    marginVertical: SPACING.md,
  },
});
