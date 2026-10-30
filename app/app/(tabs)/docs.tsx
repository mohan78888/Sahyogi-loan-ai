import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';

import { Theme } from '../../src/theme/theme';
import { Card } from '../../src/components/Card';
import { Chip, ChipVariant } from '../../src/components/Chip';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { SectionTitle } from '../../src/components/SectionTitle';
import { formatRupee } from '../../src/utils/finance';
import { useFinance } from '../../src/context/FinanceContext';
import { ManualEntrySheet } from '../../src/components/ManualEntrySheet';
import { DocumentCompletenessChart } from '../../src/components/charts';

export default function DocumentsScreen() {
  const {
    documents: docList,
    inputs,
    addDocument,
    confirmDocument,
    uploadingDoc,
  } = useFinance();

  const [manualSheetVisible, setManualSheetVisible] = useState(false);
  const [readError, setReadError] = useState<string | null>(null);

  // Derive review fields from active documents or inputs
  const activeDoc = docList.find((d) => d.status === 'needs_review') || docList[0];
  const reviewFields = [
    {
      label: 'Monthly income',
      value: activeDoc?.extractedFields?.income ?? inputs.income ?? 50000,
      status: activeDoc?.status === 'confirmed' ? ('Looks clear' as const) : ('Please check' as const),
    },
    {
      label: 'Existing EMI',
      value: activeDoc?.extractedFields?.existingEmi ?? inputs.existingEmi ?? 10000,
      status: activeDoc?.status === 'confirmed' ? ('Looks clear' as const) : ('Please check' as const),
    },
    {
      label: 'Average monthly expenses',
      value: activeDoc?.extractedFields?.expenses ?? inputs.expenses ?? 20000,
      status: activeDoc?.status === 'confirmed' ? ('Looks clear' as const) : ('Please check' as const),
    },
  ];

  const allConfirmed = docList.length > 0 && docList.every((d) => d.status === 'confirmed');

  // Pick PDF Document
  const handleChooseFile = async () => {
    setReadError(null);
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/*'],
        copyToCacheDirectory: true,
      });

      if (!res.canceled && res.assets && res.assets.length > 0) {
        const file = res.assets[0];

        // 1. Validate PDF extension / mimeType
        const isPdf =
          file.name.toLowerCase().endsWith('.pdf') ||
          (file.mimeType && file.mimeType.includes('pdf'));

        if (!isPdf) {
          Alert.alert(
            'PDF Only',
            'Please select a valid PDF file. Images and other formats are not supported for document verification.'
          );
          return;
        }

        // 2. Validate File Size (max 10 MB)
        const fileSizeMB = (file.size ?? 0) / (1024 * 1024);
        if (fileSizeMB > 10) {
          Alert.alert(
            'File Too Large',
            `The selected file is ${fileSizeMB.toFixed(1)} MB. Please choose a PDF file up to 10 MB in size.`
          );
          return;
        }

        // 3. Process with backend or fallback
        const processed = await addDocument({
          uri: file.uri,
          name: file.name,
          mimeType: file.mimeType || 'application/pdf',
          file: (file as any).file,
        });

        Alert.alert(
          'Document Processed',
          `${file.name} uploaded and parsed. Please verify the extracted values below before confirming.`
        );
      }
    } catch (err: any) {
      console.error('File pick error', err);
      setReadError('Could not read this file. You can enter your figures manually instead.');
    }
  };

  const handleConfirmAll = async () => {
    await confirmDocument(activeDoc?.id, {
      income: reviewFields[0].value,
      existingEmi: reviewFields[1].value,
      expenses: reviewFields[2].value,
    });

    Alert.alert(
      'Values Confirmed',
      'Extracted values confirmed! Your financial snapshot, ML repayment patterns, and AI advisor report have been updated.'
    );
  };

  const mapStatusToChip = (status: 'processing' | 'needs_review' | 'confirmed'): ChipVariant => {
    if (status === 'confirmed') return 'Confirmed';
    if (status === 'needs_review') return 'Needs review';
    return 'Processing';
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Title Header */}
        <SectionTitle
          title="Documents"
          subtitle="Upload PDFs. You confirm every extracted value before it is used."
        />

        {/* Document Completeness Progress Chart */}
        <DocumentCompletenessChart
          confirmedCount={docList.filter((d) => d.status === 'confirmed').length}
          totalTarget={5}
          style={styles.completenessChart}
        />

        {/* Dashed Upload Card */}
        <Card variant="dashed" style={styles.uploadCard}>
          <View style={styles.uploadIconBadge}>
            <Feather name="upload" size={20} color={Theme.colors.primary} />
          </View>
          <Text style={styles.uploadTitle}>Upload a PDF</Text>
          <Text style={styles.uploadSubtitle}>Salary slip, bank statement or EMI statement</Text>
          <Text style={styles.uploadMeta}>PDF only · up to 10 MB · stored privately</Text>
          
          <PrimaryButton
            title="Choose file"
            onPress={handleChooseFile}
            loading={uploadingDoc}
            style={styles.chooseFileBtn}
          />
        </Card>

        {/* Read Error Banner with Manual Fallback (Acceptance Rule: Never leave user stuck) */}
        {readError ? (
          <View style={styles.errorNoticeCard}>
            <View style={styles.errorNoticeHeader}>
              <Feather name="alert-circle" size={16} color={Theme.colors.danger} />
              <Text style={styles.errorNoticeTitle}>Could not read this file</Text>
            </View>
            <Text style={styles.errorNoticeBody}>{readError}</Text>
            <TouchableOpacity
              style={styles.manualFallbackBtn}
              onPress={() => setManualSheetVisible(true)}
            >
              <Feather name="edit-2" size={14} color={Theme.colors.primary} />
              <Text style={styles.manualFallbackBtnText}>Enter manually instead →</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Processing status list */}
        <Text style={styles.sectionHeader}>Processing status</Text>
        
        {docList.length === 0 ? (
          <View style={styles.emptyDocListCard}>
            <Feather name="file-text" size={24} color="#94A3B8" />
            <Text style={styles.emptyDocListTitle}>No documents uploaded yet</Text>
            <Text style={styles.emptyDocListSubtitle}>
              Upload a salary slip, bank statement, or EMI schedule to extract your figures.
            </Text>
          </View>
        ) : (
          <View style={styles.docList}>
            {docList.map((doc) => (
              <Card key={doc.id} style={styles.docItemCard}>
                <View style={styles.docItemLeft}>
                  <View style={styles.docIconBox}>
                    <Feather name="file-text" size={20} color={Theme.colors.mutedText} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.docItemName} numberOfLines={1}>{doc.name}</Text>
                    <Text style={styles.docItemDetail}>{doc.detail}</Text>
                  </View>
                </View>
                <Chip label={mapStatusToChip(doc.status)} variant={mapStatusToChip(doc.status)} />
              </Card>
            ))}
          </View>
        )}

        {/* Review Card (Appears when at least 1 doc uploaded or data present) */}
        {docList.length > 0 ? (
          <Card style={styles.reviewCard}>
            <Text style={styles.reviewCardTitle}>Review: {activeDoc?.name || 'Extracted figures'}</Text>

            <View style={styles.reviewRowsList}>
              {reviewFields.map((field, index) => (
                <View key={index} style={styles.reviewFieldRow}>
                  <View>
                    <Text style={styles.reviewFieldLabel}>{field.label}</Text>
                    <Text style={styles.reviewFieldValue}>{formatRupee(field.value)}</Text>
                  </View>
                  <Chip label={field.status} variant={field.status} />
                </View>
              ))}
            </View>

            {/* Action Buttons */}
            <View style={styles.reviewBtnRow}>
              <PrimaryButton
                title="Edit values"
                variant="outline"
                onPress={() => setManualSheetVisible(true)}
                style={styles.reviewActionBtn}
              />
              <PrimaryButton
                title={allConfirmed ? 'Confirmed' : 'Confirm all'}
                variant="primary"
                disabled={allConfirmed}
                onPress={handleConfirmAll}
                style={styles.reviewActionBtn}
              />
            </View>
          </Card>
        ) : null}

        {/* Trust & Honest Disclosure */}
        <Text style={styles.disclaimerText}>
          Reading a document does not prove it is genuine. Extracted figures are not bank-verified until officially audited by a lender. Files are processed in private memory and not permanently retained.
        </Text>

        <Text style={[styles.disclaimerText, { marginTop: 4 }]}>
          Informational assessment only. Not a lender decision.
        </Text>
      </ScrollView>

      {/* Manual Entry Sheet */}
      <ManualEntrySheet
        visible={manualSheetVisible}
        onClose={() => setManualSheetVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.md,
    paddingBottom: Theme.spacing.xxl,
  },
  completenessChart: {
    marginBottom: Theme.spacing.lg,
  },
  uploadCard: {
    paddingVertical: Theme.spacing.xxl,
    paddingHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.xl,
    backgroundColor: Theme.colors.card,
  },
  uploadIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: Theme.colors.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Theme.spacing.sm,
  },
  uploadTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Theme.colors.text,
    marginBottom: 4,
  },
  uploadSubtitle: {
    fontSize: 13,
    color: Theme.colors.mutedText,
    textAlign: 'center',
    marginBottom: 4,
  },
  uploadMeta: {
    fontSize: 12,
    color: Theme.colors.mutedText,
    marginBottom: Theme.spacing.lg,
  },
  chooseFileBtn: {
    width: '100%',
    maxWidth: 220,
  },
  errorNoticeCard: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 14,
    padding: 14,
    marginBottom: Theme.spacing.lg,
  },
  errorNoticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  errorNoticeTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Theme.colors.danger,
  },
  errorNoticeBody: {
    fontSize: 12,
    color: '#991B1B',
    lineHeight: 16,
    marginBottom: 8,
  },
  manualFallbackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  manualFallbackBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Theme.colors.primary,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: Theme.colors.text,
    marginBottom: Theme.spacing.md,
  },
  emptyDocListCard: {
    backgroundColor: Theme.colors.card,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: Theme.spacing.xl,
    gap: 6,
  },
  emptyDocListTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Theme.colors.text,
    marginTop: 4,
  },
  emptyDocListSubtitle: {
    fontSize: 12,
    color: Theme.colors.mutedText,
    textAlign: 'center',
    lineHeight: 16,
  },
  docList: {
    gap: Theme.spacing.sm,
    marginBottom: Theme.spacing.xl,
  },
  docItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Theme.spacing.md,
  },
  docItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
    flex: 1,
    marginRight: 8,
  },
  docIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: Theme.colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  docItemName: {
    fontSize: 14,
    fontWeight: '700',
    color: Theme.colors.text,
  },
  docItemDetail: {
    fontSize: 12,
    color: Theme.colors.mutedText,
    marginTop: 2,
  },
  reviewCard: {
    marginBottom: Theme.spacing.lg,
  },
  reviewCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Theme.colors.text,
    marginBottom: Theme.spacing.lg,
  },
  reviewRowsList: {
    gap: Theme.spacing.lg,
    marginBottom: Theme.spacing.xl,
  },
  reviewFieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewFieldLabel: {
    fontSize: 13,
    color: Theme.colors.mutedText,
    marginBottom: 2,
  },
  reviewFieldValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Theme.colors.text,
  },
  reviewBtnRow: {
    flexDirection: 'row',
    gap: Theme.spacing.md,
  },
  reviewActionBtn: {
    flex: 1,
  },
  disclaimerText: {
    fontSize: 11,
    color: Theme.colors.mutedText,
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: Theme.spacing.md,
  },
});
