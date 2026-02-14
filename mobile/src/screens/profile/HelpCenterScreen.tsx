import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, LayoutAnimation, Linking } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../utils/theme';
import Icon from 'react-native-vector-icons/Ionicons';

const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  return (
    <View style={styles.faqItem}>
      <TouchableOpacity style={styles.faqHeader} onPress={toggleExpand}>
        <Text style={styles.question}>{question}</Text>
        <Icon name={expanded ? "chevron-up" : "chevron-down"} size={20} color={COLORS.textMuted} />
      </TouchableOpacity>
      {expanded && (
        <View style={styles.answerContainer}>
          <Text style={styles.answer}>{answer}</Text>
        </View>
      )}
    </View>
  );
};

export const HelpCenterScreen = ({ navigation }: any) => {
  const faqs = [
    {
      category: "Account & Registration",
      items: [
        { question: "How do I create an account?", answer: "Download the app, go to the Sign Up screen, fill in your details, and verify your email." },
        { question: "Can I be both a buyer and a vendor?", answer: "Yes! Every standard account can apply to become a vendor from the profile section." },
      ]
    },
    {
      category: "Buying and Selling",
      items: [
        { question: "How do I contact a vendor?", answer: "On any vehicle detail page, click the 'Chat' or 'Call' button to connect directly with the seller." },
        { question: "Is price negotiation allowed?", answer: "Negotiations are between you and the vendor. We recommend inspecting vehicles before final payment." },
      ]
    },
    {
      category: "Safety & Security",
      items: [
        { question: "Are vehicles inspected?", answer: "While we verify our vendors, we always recommend a physical inspection or using a professional mechanic before buying." },
        { question: "How do I report a suspicious listing?", answer: "Use the 'Report' button on the listing page or contact our support team immediately." },
      ]
    }
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help Center</Text>
      </View>

      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Icon name="search-outline" size={20} color={COLORS.textMuted} />
          <Text style={styles.searchPlaceholder}>Search for help...</Text>
        </View>
      </View>

      <View style={styles.content}>
        {faqs.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.category}</Text>
            <View style={styles.card}>
              {section.items.map((item, i) => (
                <FAQItem key={i} question={item.question} answer={item.answer} />
              ))}
            </View>
          </View>
        ))}

        <View style={styles.contactCard}>
          <Text style={styles.contactTitle}>Still need help?</Text>
          <Text style={styles.contactSub}>Our support team is available 24/7</Text>
          <TouchableOpacity 
            style={styles.contactButton} 
            onPress={() => Linking.openURL('mailto:support@transhub.com')}
          >
            <Icon name="chatbubble-ellipses-outline" size={20} color={COLORS.background} />
            <Text style={styles.contactButtonText}>Contact Support</Text>
          </TouchableOpacity>
        </View>
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
  searchSection: {
    padding: SPACING.lg,
    backgroundColor: COLORS.backgroundCard,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchPlaceholder: {
    marginLeft: SPACING.sm,
    color: COLORS.textMuted,
    fontSize: FONT_SIZES.md,
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
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  question: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: '600',
    paddingRight: SPACING.md,
  },
  answerContainer: {
    padding: SPACING.lg,
    paddingTop: 0,
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
  },
  answer: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  contactCard: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  contactTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.background,
    marginBottom: 4,
  },
  contactSub: {
    fontSize: FONT_SIZES.sm,
    color: 'rgba(0,0,0,0.6)',
    marginBottom: SPACING.lg,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
  },
  contactButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginLeft: SPACING.sm,
  },
});
