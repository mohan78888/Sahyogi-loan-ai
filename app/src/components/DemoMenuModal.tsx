import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Theme } from '../theme/theme';
import { useFinance } from '../context/FinanceContext';

interface DemoMenuModalProps {
  visible: boolean;
  onClose: () => void;
}

export const DemoMenuModal: React.FC<DemoMenuModalProps> = ({ visible, onClose }) => {
  const { source, loadDemo, resetToFresh } = useFinance();

  const handleLoadDemo = async () => {
    await loadDemo();
    onClose();
    Alert.alert(
      'Demo Profile Loaded',
      'Loaded sample profile (₹60,000 income, ₹25,000 expenses, ₹16,500 EMI). All tabs now display verified demo scenarios.'
    );
  };

  const handleResetToFresh = () => {
    Alert.alert(
      'Reset to Fresh State',
      'Are you sure you want to clear all entered financial numbers and documents? The app will return to the initial state.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset All',
          style: 'destructive',
          onPress: async () => {
            await resetToFresh();
            onClose();
          },
        },
      ]
    );
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose}>
        <View style={styles.dialogCard}>
          {/* Header */}
          <View style={styles.dialogHeader}>
            <View style={styles.titleRow}>
              <Feather name="database" size={18} color={Theme.colors.primary} />
              <Text style={styles.dialogTitle}>Evaluation Mode</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Feather name="x" size={16} color={Theme.colors.mutedText} />
            </TouchableOpacity>
          </View>

          <Text style={styles.dialogSubtitle}>
            Currently using: <Text style={styles.sourceHighlight}>{source === 'demo' ? 'Demo profile' : source === 'none' ? 'Fresh (No data)' : 'Custom inputs'}</Text>
          </Text>

          {/* Action 1: Load Demo */}
          <TouchableOpacity
            style={styles.actionItem}
            activeOpacity={0.7}
            onPress={handleLoadDemo}
          >
            <View style={[styles.actionIconWrap, { backgroundColor: Theme.colors.primaryTint }]}>
              <Feather name="play" size={16} color={Theme.colors.primary} />
            </View>
            <View style={styles.actionTextGroup}>
              <Text style={styles.actionTitle}>Load demo profile (₹60k)</Text>
              <Text style={styles.actionDesc}>
                Populates all 7 screens in 1 click for instant presentation.
              </Text>
            </View>
          </TouchableOpacity>

          {/* Action 2: Reset to Fresh */}
          <TouchableOpacity
            style={[styles.actionItem, styles.actionBorderTop]}
            activeOpacity={0.7}
            onPress={handleResetToFresh}
          >
            <View style={[styles.actionIconWrap, { backgroundColor: '#FEE2E2' }]}>
              <Feather name="trash-2" size={16} color={Theme.colors.danger} />
            </View>
            <View style={styles.actionTextGroup}>
              <Text style={[styles.actionTitle, { color: Theme.colors.danger }]}>
                Reset to fresh state
              </Text>
              <Text style={styles.actionDesc}>
                Wipes all stored records to test the initial onboarding experience.
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 27, 45, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  dialogCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
  },
  dialogHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dialogTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Theme.colors.text,
  },
  closeBtn: {
    padding: 4,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  dialogSubtitle: {
    fontSize: 12,
    color: Theme.colors.mutedText,
    marginBottom: 16,
  },
  sourceHighlight: {
    fontWeight: '700',
    color: Theme.colors.primary,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  actionBorderTop: {
    borderTopWidth: 1,
    borderTopColor: Theme.colors.borderLight,
    marginTop: 4,
  },
  actionIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTextGroup: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Theme.colors.text,
  },
  actionDesc: {
    fontSize: 11,
    color: Theme.colors.mutedText,
    marginTop: 2,
    lineHeight: 15,
  },
});

export default DemoMenuModal;

