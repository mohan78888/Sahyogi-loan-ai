import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import { SchemeService } from '../services/schemeService';
import { Scheme } from '../types/loan';

const CATEGORIES = [
  { label: 'All', value: '' },
  { label: 'Student', value: 'student' },
  { label: 'Farmer', value: 'farmer' },
  { label: 'Business', value: 'business' },
  { label: 'Personal', value: 'personal' },
];

export default function SchemesScreen() {
  const router = useRouter();
  const [selectedCat, setSelectedCat] = useState('');
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSchemes(selectedCat);
  }, [selectedCat]);

  const loadSchemes = async (cat?: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await SchemeService.getSchemes(cat || undefined);
      setSchemes(data.schemes);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch schemes');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenSource = (url: string) => {
    if (url) {
      Linking.openURL(url).catch(() => {});
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Header
        title="Government Schemes"
        subtitle="Subsidized loans and interest waivers"
        showBack
        onBack={() => router.back()}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Category Filters */}
        <View style={styles.catRow}>
          {CATEGORIES.map((cat) => {
            const active = selectedCat === cat.value;
            return (
              <TouchableOpacity
                key={cat.label}
                style={[styles.catPill, active && styles.catPillActive]}
                onPress={() => setSelectedCat(cat.value)}
                activeOpacity={0.7}
              >
                <Text style={[styles.catPillText, active && styles.catPillTextActive]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={Colors.primaryDark} />
            <Text style={styles.loadingText}>Fetching government schemes catalog...</Text>
          </View>
        ) : error ? (
          <Card style={styles.errorCard}>
            <Ionicons name="alert-circle" size={24} color={Colors.error} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={() => loadSchemes(selectedCat)} style={styles.retryBtn}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </Card>
        ) : schemes.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>No schemes found for this category</Text>
          </View>
        ) : (
          schemes.map((scheme) => (
            <Card key={scheme.id} style={styles.schemeCard}>
              <View style={styles.schemeTop}>
                <View style={styles.titleArea}>
                  <Text style={styles.schemeName}>{scheme.name}</Text>
                  <Text style={styles.schemeCategory}>{scheme.category.toUpperCase()} LOAN</Text>
                </View>
                {scheme.sample && <Badge label="Sample" status="info" />}
              </View>

              <View style={styles.metricRow}>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Max Amount</Text>
                  <Text style={styles.metricValue}>
                    ₹{(scheme.max_amount / 100000).toFixed(1)} Lakh
                  </Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Typical Rate</Text>
                  <Text style={styles.metricValue}>{scheme.rate_pct}% p.a.</Text>
                </View>
              </View>

              <View style={styles.subsidyBox}>
                <Ionicons name="gift-outline" size={16} color="#B45309" style={styles.giftIcon} />
                <Text style={styles.subsidyText}>{scheme.subsidy_summary}</Text>
              </View>

              <Text style={styles.eligibilityLabel}>Eligibility:</Text>
              <Text style={styles.eligibilityText}>{scheme.eligibility}</Text>

              {scheme.source_url ? (
                <TouchableOpacity
                  style={styles.sourceBtn}
                  onPress={() => handleOpenSource(scheme.source_url)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.sourceBtnText}>Official Portal Details</Text>
                  <Ionicons name="open-outline" size={14} color="#92400E" />
                </TouchableOpacity>
              ) : null}
            </Card>
          ))
        )}

        <DisclaimerBanner text="Scheme criteria and interest subsidies change periodically under ministry notifications. Verify on official portals like JanSamarth." />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 8,
  },
  catRow: {
    flexDirection: 'row',
    marginVertical: 12,
    gap: 8,
  },
  catPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  catPillActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primaryDark,
  },
  catPillText: {
    ...Typography.caption,
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  catPillTextActive: {
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  loadingBox: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: 10,
  },
  errorCard: {
    padding: 20,
    alignItems: 'center',
    marginVertical: 20,
  },
  errorText: {
    ...Typography.bodySmall,
    color: Colors.error,
    marginTop: 8,
    textAlign: 'center',
  },
  retryBtn: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.primaryLight,
    borderRadius: 8,
  },
  retryText: {
    ...Typography.caption,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  emptyBox: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  schemeCard: {
    padding: 16,
    marginBottom: 12,
  },
  schemeTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  titleArea: {
    flex: 1,
    marginRight: 8,
  },
  schemeName: {
    ...Typography.h3,
    color: Colors.textPrimary,
  },
  schemeCategory: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textMuted,
    marginTop: 2,
    letterSpacing: 0.5,
  },
  metricRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceSecondary,
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
  },
  metricItem: {
    flex: 1,
  },
  metricLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  metricValue: {
    ...Typography.h3,
    color: Colors.textPrimary,
    marginTop: 2,
  },
  subsidyBox: {
    flexDirection: 'row',
    backgroundColor: Colors.primaryLight,
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  giftIcon: {
    marginTop: 2,
    marginRight: 6,
  },
  subsidyText: {
    ...Typography.bodySmall,
    color: '#854D0E',
    flex: 1,
    fontWeight: '500',
  },
  eligibilityLabel: {
    ...Typography.caption,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  eligibilityText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: 12,
  },
  sourceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  sourceBtnText: {
    ...Typography.caption,
    fontWeight: '700',
    color: '#92400E',
    marginRight: 6,
  },
});

