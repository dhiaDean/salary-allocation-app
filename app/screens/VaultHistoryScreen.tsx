import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDatabase } from '../../db/DatabaseContext';

const MONTH_NAMES = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

type Filter = 'all' | string; // 'all' | '2026' | '2025' etc.

const VaultHistoryScreen: React.FC = () => {
  const { isReady, vaultEntries, vaultBalance, addManualVaultTx } = useDatabase();
  const [activeFilter, setActiveFilter] = useState<Filter>('all');

  // Vault transaction modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [txType, setTxType] = useState<'deposit' | 'withdrawal'>('deposit');
  const [amountInput, setAmountInput] = useState('');
  const [noteInput, setNoteInput] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isReady) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ActivityIndicator size="large" color="#19e65e" style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  // Build dynamic year filter list from entries
  const years = Array.from(
    new Set(
      vaultEntries
        .map((e) => {
          if (e.year > 0) return String(e.year);
          return String(new Date(e.created_at).getFullYear());
        })
    )
  ).sort((a, b) => Number(b) - Number(a));
  const filters = ['all', ...years];

  const filtered = activeFilter === 'all'
    ? vaultEntries
    : vaultEntries.filter((e) => {
        const entryYear = e.year > 0 ? String(e.year) : String(new Date(e.created_at).getFullYear());
        return entryYear === activeFilter;
      });

  const handleCreateVaultTx = async () => {
    const parsed = parseFloat(amountInput.replace(/[^0-9.]/g, ''));
    if (isNaN(parsed) || parsed <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid positive amount.');
      return;
    }
    setLoading(true);
    try {
      await addManualVaultTx(parsed, txType, noteInput.trim() || undefined);
      setAmountInput('');
      setNoteInput('');
      setModalVisible(false);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to save transaction.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#112116" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Vault History</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroGlow} />
          <Text style={styles.heroLabel}>Total Accumulated Savings</Text>
          <Text style={styles.heroAmount}>
            ${vaultBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
          <View style={styles.growthBadge}>
            <MaterialIcons name="savings" size={16} color="#19e65e" />
            <Text style={styles.growthText}>{vaultEntries.length} transaction{vaultEntries.length !== 1 ? 's' : ''}</Text>
          </View>
        </View>

        {/* Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersRow}>
          {filters.map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filterChip, f === activeFilter && styles.filterChipActive]}
              onPress={() => setActiveFilter(f)}
            >
              <Text style={[styles.filterText, f === activeFilter && styles.filterTextActive]}>
                {f === 'all' ? 'All Time' : f}
              </Text>
              {f === 'all' && (
                <MaterialIcons name="expand-more" size={18} color={f === activeFilter ? '#112116' : '#FFFFFF'} />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Recent Activity */}
        <View style={styles.activitySection}>
          <View style={styles.activityHeader}>
            <Text style={styles.activityTitle}>Recent Activity</Text>
            <TouchableOpacity 
              style={styles.addTxBtn} 
              onPress={() => setModalVisible(true)}
              activeOpacity={0.8}
            >
              <MaterialIcons name="add" size={16} color="#112116" />
              <Text style={styles.addTxBtnText}>Transact</Text>
            </TouchableOpacity>
          </View>

          {filtered.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="savings" size={48} color="#2d4a36" />
              <Text style={styles.emptyText}>No vault entries yet.</Text>
              <Text style={styles.emptySubText}>Use the Transact button or close a month to add savings.</Text>
            </View>
          ) : (
            <View style={styles.activityList}>
              {filtered.map((item) => {
                const isDeposit = item.transaction_type === 'deposit';
                const sign = isDeposit ? '+' : '-';
                const amountColor = isDeposit ? '#19e65e' : '#f87171';
                const iconName = isDeposit ? 'savings' : 'outbox';
                const iconColor = isDeposit ? '#19e65e' : '#f87171';
                const iconBg = isDeposit ? 'rgba(25,230,94,0.1)' : 'rgba(239,68,68,0.1)';
                
                const dateLabel = item.year > 0 && item.month > 0
                  ? `${MONTH_NAMES[item.month]} ${item.year}`
                  : new Date(item.created_at).toLocaleDateString(undefined, { 
                      month: 'long', 
                      year: 'numeric',
                      day: 'numeric' 
                    });

                const noteLabel = item.note || (isDeposit ? 'Manual Deposit' : 'Manual Withdrawal');

                return (
                  <View key={item.id} style={styles.historyItem}>
                    <View style={styles.historyLeft}>
                      <View style={[styles.historyIconWrapper, { backgroundColor: iconBg }]}>
                        <MaterialIcons name={iconName} size={22} color={iconColor} />
                      </View>
                      <View>
                        <Text style={styles.historyMonth}>{dateLabel}</Text>
                        <Text style={styles.historyType}>{noteLabel}</Text>
                      </View>
                    </View>
                    <View style={styles.historyRight}>
                      <Text style={[styles.historyAmount, { color: amountColor }]}>
                        {sign}${Math.abs(item.amount).toLocaleString('en-US', { 
                          minimumFractionDigits: 2, 
                          maximumFractionDigits: 2 
                        })}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Manual Vault Transaction Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Vault Transaction</Text>
              <TouchableOpacity 
                style={styles.modalCloseBtn}
                onPress={() => setModalVisible(false)}
              >
                <MaterialIcons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Type Selector (Deposit vs Withdrawal) */}
            <View style={styles.typeSelectorRow}>
              <TouchableOpacity
                style={[
                  styles.typeTab,
                  styles.typeTabDeposit,
                  txType === 'deposit' && styles.typeTabDepositActive
                ]}
                onPress={() => setTxType('deposit')}
              >
                <MaterialIcons 
                  name="savings" 
                  size={18} 
                  color={txType === 'deposit' ? '#112116' : '#19e65e'} 
                />
                <Text style={[
                  styles.typeTabText,
                  txType === 'deposit' && styles.typeTabTextActive
                ]}>
                  Deposit
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.typeTab,
                  styles.typeTabWithdrawal,
                  txType === 'withdrawal' && styles.typeTabWithdrawalActive
                ]}
                onPress={() => setTxType('withdrawal')}
              >
                <MaterialIcons 
                  name="outbox" 
                  size={18} 
                  color={txType === 'withdrawal' ? '#112116' : '#f87171'} 
                />
                <Text style={[
                  styles.typeTabText,
                  txType === 'withdrawal' && styles.typeTabTextActive
                ]}>
                  Withdrawal
                </Text>
              </TouchableOpacity>
            </View>

            {/* Input Form */}
            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Amount</Text>
              <TextInput
                style={styles.formInput}
                placeholder="$ 0.00"
                placeholderTextColor="#4b5563"
                value={amountInput}
                onChangeText={setAmountInput}
                keyboardType="numeric"
              />

              <View style={{ height: 16 }} />

              <Text style={styles.formLabel}>Note / Source</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g. Side Gig, Emergency Repair"
                placeholderTextColor="#4b5563"
                value={noteInput}
                onChangeText={setNoteInput}
              />

              <View style={{ height: 24 }} />

              <TouchableOpacity 
                style={[
                  styles.submitBtn, 
                  txType === 'deposit' ? styles.submitBtnDeposit : styles.submitBtnWithdrawal
                ]}
                onPress={handleCreateVaultTx}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#112116" />
                ) : (
                  <>
                    <MaterialIcons name="done" size={20} color="#112116" />
                    <Text style={styles.submitBtnText}>Confirm Transaction</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#112116' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 16 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', color: '#FFFFFF', fontSize: 18, fontWeight: 'bold', marginRight: 40 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 48, gap: 24 },
  heroCard: { position: 'relative', backgroundColor: '#1a2c20', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)', padding: 24, alignItems: 'center', overflow: 'hidden', marginTop: 8 },
  heroGlow: { position: 'absolute', top: 0, right: 0, width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(25,230,94,0.08)' },
  heroLabel: { color: '#93c8a5', fontSize: 12, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  heroAmount: { color: '#FFFFFF', fontSize: 44, fontWeight: '800', marginBottom: 16, letterSpacing: -1 },
  growthBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(25,230,94,0.1)', borderWidth: 1, borderColor: 'rgba(25,230,94,0.2)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999 },
  growthText: { color: '#19e65e', fontSize: 14, fontWeight: 'bold' },
  filtersRow: { gap: 12, paddingBottom: 4 },
  filterChip: { height: 36, flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 16, borderRadius: 999, backgroundColor: '#24382a', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)' },
  filterChipActive: { backgroundColor: '#19e65e', borderColor: '#19e65e' },
  filterText: { color: '#FFFFFF', fontSize: 14, fontWeight: '500' },
  filterTextActive: { color: '#112116', fontWeight: 'bold' },
  activitySection: { gap: 16 },
  activityHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  activityTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold' },
  addTxBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#19e65e', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  addTxBtnText: { color: '#112116', fontWeight: 'bold', fontSize: 12 },
  activityList: { gap: 12 },
  historyItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#1a2c20', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)' },
  historyLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  historyIconWrapper: { width: 48, height: 48, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  historyMonth: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  historyType: { color: '#93c8a5', fontSize: 12, fontWeight: '500', marginTop: 2 },
  historyRight: { alignItems: 'flex-end', gap: 4 },
  historyAmount: { fontSize: 18, fontWeight: 'bold' },
  emptyState: { alignItems: 'center', paddingVertical: 48, gap: 12 },
  emptyText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  emptySubText: { color: '#6b7280', fontSize: 14, textAlign: 'center' },

  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.75)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#112116', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40, borderTopWidth: 1, borderColor: 'rgba(25,230,94,0.2)' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF' },
  modalCloseBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center' },
  typeSelectorRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  typeTab: { flex: 1, height: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 8, borderWidth: 1, backgroundColor: '#1A2C22' },
  typeTabDeposit: { borderColor: 'rgba(25,230,94,0.2)' },
  typeTabDepositActive: { backgroundColor: '#19e65e', borderColor: '#19e65e' },
  typeTabWithdrawal: { borderColor: 'rgba(239,68,68,0.2)' },
  typeTabWithdrawalActive: { backgroundColor: '#f87171', borderColor: '#f87171' },
  typeTabText: { fontSize: 14, fontWeight: 'bold', color: '#FFFFFF' },
  typeTabTextActive: { color: '#112116' },
  formSection: { gap: 8 },
  formLabel: { fontSize: 12, fontWeight: 'bold', color: '#9ca3af', textTransform: 'uppercase' },
  formInput: { backgroundColor: '#1A2C22', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, color: '#FFFFFF', fontSize: 16, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)' },
  submitBtn: { height: 48, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  submitBtnDeposit: { backgroundColor: '#19e65e' },
  submitBtnWithdrawal: { backgroundColor: '#f87171' },
  submitBtnText: { color: '#112116', fontSize: 16, fontWeight: 'bold' },
});

export default VaultHistoryScreen;
