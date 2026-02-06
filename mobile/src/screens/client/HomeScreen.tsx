import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { COLORS, SPACING, FONT_SIZES } from '../../utils/theme';

export const HomeScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Transhub</Text>
        <Text style={styles.subtitle}>Luxury Automotive Experience</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.text}>Welcome to Transhub Mobile!</Text>
        <Text style={styles.textSecondary}>Browse luxury vehicles and preorder your dream car.</Text>
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
    padding: SPACING.xl,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  content: {
    padding: SPACING.xl,
  },
  text: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  textSecondary: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
});
