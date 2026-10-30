import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Config } from '../../constants/Config';
import { AnalysisService } from '../../services/analysisService';

export default function ProfileScreen() {
  const [dataConsent, setDataConsent] = useState(true);
  const [incognitoMode, setIncognitoMode] = useState(false);

  const handleClearData = () => {
    Alert.alert(
      'Clear Local Data',
      'Are you sure you want to clear your cached analyses and temporary records?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => {
            AnalysisService.clearRecentAnalyses();
            Alert.alert('Success', 'All local cached data has been removed.');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Header title="Profile & Privacy" subtitle="Data safety and regulatory transparency" />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* User Card */}
        <Card style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={32} color={Colors.textPrimary} />
          </View>
          <View style={styles.profileDetails}>
            <Text style={styles.profileName}>Borrower User</Text>
            <Text style={styles.profileSub}>Independent Financial Borrower</Text>
            <View style={styles.privacyBadge}>
              <Ionicons name="shield-checkmark" size={14} color={Colors.success} />
              <Text style={styles.privacyBadgeText}>Local Privacy First</Text>
            </View>
          </View>
        </Card>

        {/* Data Privacy & Consent */}
        <Text style={styles.sectionHeading}>Data Protection & Consent</Text>
        <Card style={styles.settingsCard}>
          <View style={styles.switchRow}>
            <View style={styles.switchTextGroup}>
              <Text style={styles.settingTitle}>Consent for In-Memory AI Audit</Text>
              <Text style={styles.settingDesc}>
                Allows the app to evaluate financial ratios locally. No data is stored on remote servers or sold to credit bureaus.
              </Text>
            </View>
            <Switch
              value={dataConsent}
              onValueChange={setDataConsent}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={[styles.switchRow, styles.borderTop]}>
            <View style={styles.switchTextGroup}>
              <Text style={styles.settingTitle}>Incognito Calculation Mode</Text>
              <Text style={styles.settingDesc}>
                Immediately wipe analysis inputs upon leaving the results screen.
              </Text>
            </View>
            <Switch
              value={incognitoMode}
              onValueChange={setIncognitoMode}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <TouchableOpacity
            style={[styles.actionRow, styles.borderTop]}
            onPress={handleClearData}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={20} color={Colors.error} />
            <Text style={styles.deleteDataText}>Clear All Cached History & Sessions</Text>
          </TouchableOpacity>
        </Card>

        {/* Regulatory Boundaries & Trust */}
        <Text style={styles.sectionHeading}>Regulatory Disclosures</Text>
        <Card style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="information-circle-outline" size={20} color={Colors.textSecondary} style={styles.infoIcon} />
            <Text style={styles.infoText}>
              <Text style={styles.boldText}>Not a Lender or Broker: </Text>
              Sahyogi Loan AI does not issue loans, credit cards, or financial products. We do not charge commission for loan placement.
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="shield-outline" size={20} color={Colors.textSecondary} style={styles.infoIcon} />
            <Text style={styles.infoText}>
              <Text style={styles.boldText}>No Bureau Scraping: </Text>
              We never perform hard credit bureau inquiries on CIBIL, Experian, or Equifax. Your credit score is never impacted by using this app.
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="lock-closed-outline" size={20} color={Colors.textSecondary} style={styles.infoIcon} />
            <Text style={styles.infoText}>
              <Text style={styles.boldText}>Zero Storage Architecture: </Text>
              All income and EMI metrics are processed transiently in memory for diagnostic calculation.
            </Text>
          </View>
        </Card>

        {/* App Info */}
        <Text style={styles.sectionHeading}>App Version & Support</Text>
        <Card style={styles.appInfoCard}>
          <View style={styles.appInfoRow}>
            <Text style={styles.appInfoLabel}>App Name</Text>
            <Text style={styles.appInfoVal}>{Config.appName}</Text>
          </View>
          <View style={styles.appInfoRow}>
            <Text style={styles.appInfoLabel}>Version</Text>
            <Text style={styles.appInfoVal}>{Config.version}</Text>
          </View>
          <View style={styles.appInfoRow}>
            <Text style={styles.appInfoLabel}>Backend Host</Text>
            <Text style={styles.appInfoVal}>{Config.apiBaseUrl}</Text>
          </View>
          <View style={styles.appInfoRow}>
            <Text style={styles.appInfoLabel}>Support & Feedback</Text>
            <Text style={styles.appInfoVal}>{Config.supportEmail}</Text>
          </View>
        </Card>
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
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    marginBottom: 10,
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primaryLight,
    borderWidth: 1.5,
    borderColor: Colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  profileDetails: {
    flex: 1,
  },
  profileName: {
    ...Typography.h2,
    color: Colors.textPrimary,
  },
  profileSub: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  privacyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.successLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  privacyBadgeText: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: '700',
    color: Colors.success,
    marginLeft: 4,
  },
  sectionHeading: {
    ...Typography.h3,
    color: Colors.textPrimary,
    marginTop: 20,
    marginBottom: 10,
  },
  settingsCard: {
    padding: 16,
    marginBottom: 10,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  switchTextGroup: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  settingDesc: {
    ...Typography.caption,
    color: Colors.textSecondary,
    lineHeight: 16,
    marginTop: 4,
  },
  borderTop: {
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  deleteDataText: {
    ...Typography.body,
    color: Colors.error,
    fontWeight: '600',
    marginLeft: 10,
  },
  infoCard: {
    backgroundColor: '#FAFAFA',
    padding: 16,
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 8,
  },
  infoIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  infoText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    lineHeight: 20,
    flex: 1,
  },
  boldText: {
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  appInfoCard: {
    padding: 16,
    marginBottom: 20,
  },
  appInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  appInfoLabel: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  appInfoVal: {
    ...Typography.bodySmall,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
});

