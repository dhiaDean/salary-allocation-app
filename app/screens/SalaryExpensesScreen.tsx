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
import type { ExpenseEntryWithCategory, Transaction } from '../../db/types';
import CloseMonthModal from './CloseMonthModal';

const MONTH_NAMES = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const SalaryExpensesScreen: React.FC = () => {
  const {
    isReady,
    currentMonth,
    salary,
    expenses,
    summary,
    saveSalary,
    addNewTransaction,
    removeTransaction,
    getTransactionsForBudget,
    confirmCloseMonth,
  } = useDatabase();

  const [modalVisible, setModalVisible] = useState(false);
  const [salaryInput, setSalaryInput] = useState('');

  // Transaction manager state
  const [txModalVisible, setTxModalVisible] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<ExpenseEntryWithCategory | null>(null);
  const [expenseTxs, setExpenseTxs] = useState<Transaction[]>([]);
  const [txAmount, setTxAmount] = useState('');
  const [txDesc, setTxDesc] = useState('');
  const [txLoading, setTxLoading] = useState(false);

  if (!isReady || !currentMonth || !summary) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ActivityIndicator size="large" color="#19e65e" style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  const monthLabel = `${MONTH_NAMES[currentMonth.month]} ${currentMonth.year}`;
  const projectedSavings = summary.projectedSavings;
  const displaySalary = salary > 0 ? `$${salary.toLocaleString()}` : '$0';

  const handleSalaryBlur = async () => {
    const raw = parseFloat(salaryInput.replace(/[^0-9.]/g, ''));
    if (!isNaN(raw) && raw !== salary) {
      await saveSalary(raw);
    }
    setSalaryInput('');
  };

  const handleConfirmClose = async () => {
    setModalVisible(false);
    await confirmCloseMonth();
    router.push('/salary-expenses-closed');
  };

  const handleOpenTransactionManager = async (expense: ExpenseEntryWithCategory) => {
    setSelectedExpense(expense);
    setTxAmount('');
    setTxDesc('');
    setTxLoading(true);
    setTxModalVisible(true);
    try {
      const txs = await getTransactionsForBudget(expense.id);
      setExpenseTxs(txs);
    } catch (err) {
      console.error(err);
    } finally {
      setTxLoading(false);
    }
  };

  const handleAddTx = async () => {
    if (!selectedExpense) return;
    const parsedAmount = parseFloat(txAmount.replace(/[^0-9.]/g, ''));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid positive amount.');
      return;
    }
    setTxLoading(true);
    try {
      await addNewTransaction(selectedExpense.id, parsedAmount, txDesc.trim() || 'Expense');
      const txs = await getTransactionsForBudget(selectedExpense.id);
      setExpenseTxs(txs);
      setTxAmount('');
      setTxDesc('');
    } catch (err) {
      console.error(err);
    } finally {
      setTxLoading(false);
    }
  };

  const handleRemoveTx = async (txId: number) => {
    if (!selectedExpense) return;
    Alert.alert(
      'Delete Transaction',
      'Are you sure you want to delete this expense?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setTxLoading(true);
            try {
              await removeTransaction(txId);
              const txs = await getTransactionsForBudget(selectedExpense.id);
              setExpenseTxs(txs);
            } catch (err) {
              console.error(err);
            } finally {
              setTxLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#112116" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.monthSelector}>
          <Text style={styles.headerTitle}>{monthLabel}</Text>
          <MaterialIcons name="expand-more" size={24} color="#9ca3af" />
        </TouchableOpacity>
        <View style={[styles.statusBadge, currentMonth.status === 'closed' && styles.statusBadgeClosed]}>
          <Text style={styles.statusText}>{currentMonth.status.toUpperCase()}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Salary Section */}
        <View style={styles.section}>
          <Text style={styles.salaryLabel}>Monthly Salary</Text>
          <TextInput
            style={styles.salaryInput}
            value={salaryInput || displaySalary}
            onChangeText={setSalaryInput}
            onBlur={handleSalaryBlur}
            keyboardType="numeric"
            placeholderTextColor="#4b5563"
            editable={currentMonth.status === 'open'}
          />
          <View style={styles.salaryStatus}>
            <MaterialIcons name="check-circle" size={18} color="#19e65e" />
            <Text style={styles.salaryStatusText}>
              {salary > 0 ? 'Salary entered' : 'Tap to enter your salary'}
            </Text>
          </View>
        </View>

        <View style={{ height: 24 }} />

        {/* Planned Expenses Section */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.sectionTitleLeft}>
              <Text style={styles.sectionTitle}>Planned Expenses</Text>
              <View style={styles.pulseDot} />
            </View>
            <TouchableOpacity
              style={styles.manageButton}
              onPress={() => router.push('/manage-expenses')}
              activeOpacity={0.7}
            >
              <Text style={styles.manageButtonText}>Manage</Text>
              <MaterialIcons name="arrow-forward-ios" size={12} color="#19e65e" />
            </TouchableOpacity>
          </View>

          <View style={styles.expenseList}>
            {expenses.map((item) => {
              const color = JSON.parse(item.color);
              const remaining = item.planned_amount - item.spent_amount;
              const percentSpent = item.planned_amount > 0 
                ? Math.min((item.spent_amount / item.planned_amount) * 100, 100) 
                : 0;

              return (
                <TouchableOpacity
                  key={item.id}
                  style={styles.expenseCard}
                  onPress={() => handleOpenTransactionManager(item)}
                  activeOpacity={0.9}
                >
                  <View style={styles.expenseCardTop}>
                    <View style={styles.expenseInfo}>
                      <View style={[styles.expenseIconWrapper, { backgroundColor: color.bg }]}>
                        <MaterialIcons name={item.icon as any} size={24} color={color.dark} />
                      </View>
                      <View>
                        <Text style={styles.expenseName}>{item.name}</Text>
                        <Text style={styles.expenseDescription}>{item.description}</Text>
                      </View>
                    </View>
                    <View style={[
                      styles.remainingBadge,
                      { backgroundColor: remaining >= 0 ? 'rgba(25,230,94,0.1)' : 'rgba(239,68,68,0.1)' }
                    ]}>
                      <Text style={[
                        styles.remainingText,
                        { color: remaining >= 0 ? '#19e65e' : '#f87171' }
                      ]}>
                        {remaining >= 0 ? `REM: $${remaining}` : `OVER: $${Math.abs(remaining)}`}
                      </Text>
                    </View>
                  </View>

                  {/* Progress Bar */}
                  <View style={styles.progressBarBg}>
                    <View style={[
                      styles.progressBarFill, 
                      { 
                        width: `${percentSpent}%`,
                        backgroundColor: percentSpent >= 100 ? '#f87171' : '#19e65e' 
                      }
                    ]} />
                  </View>

                  <View style={styles.expenseCardBottom}>
                    <View style={styles.amountContainer}>
                      <Text style={styles.amountLabel}>Planned</Text>
                      <Text style={styles.plannedAmount}>${item.planned_amount}</Text>
                    </View>
                    <View style={styles.amountContainer}>
                      <Text style={[styles.amountLabel, { textAlign: 'right' }]}>Spent</Text>
                      <View style={styles.spentDisplayContainer}>
                        <Text style={styles.spentAmountText}>${item.spent_amount}</Text>
                        <MaterialIcons name="chevron-right" size={16} color="#9ca3af" />
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Transaction Manager Modal */}
      {selectedExpense && (
        <Modal
          visible={txModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setTxModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <View style={styles.modalHeaderTitleRow}>
                  <View style={[
                    styles.expenseIconWrapper,
                    { backgroundColor: JSON.parse(selectedExpense.color).bg, marginRight: 12 }
                  ]}>
                    <MaterialIcons 
                      name={selectedExpense.icon as any} 
                      size={24} 
                      color={JSON.parse(selectedExpense.color).dark} 
                    />
                  </View>
                  <View>
                    <Text style={styles.modalTitle}>{selectedExpense.name}</Text>
                    <Text style={styles.modalSubtitle}>{selectedExpense.description}</Text>
                  </View>
                </View>
                <TouchableOpacity 
                  style={styles.modalCloseBtn}
                  onPress={() => setTxModalVisible(false)}
                >
                  <MaterialIcons name="close" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              {/* Budget Overview Card */}
              <View style={styles.modalSummaryCard}>
                <View style={styles.modalSummaryRow}>
                  <View>
                    <Text style={styles.modalSummaryLabel}>PLANNED</Text>
                    <Text style={styles.modalSummaryValue}>${selectedExpense.planned_amount}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.modalSummaryLabel}>TOTAL SPENT</Text>
                    <Text style={[
                      styles.modalSummaryValue,
                      { 
                        color: selectedExpense.spent_amount > selectedExpense.planned_amount 
                          ? '#f87171' 
                          : '#19e65e' 
                      }
                    ]}>
                      ${selectedExpense.spent_amount}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Transactions List */}
              <Text style={styles.txListTitle}>Transactions Ledger</Text>
              {txLoading && expenseTxs.length === 0 ? (
                <ActivityIndicator size="small" color="#19e65e" style={{ marginVertical: 24 }} />
              ) : expenseTxs.length === 0 ? (
                <View style={styles.emptyTxsContainer}>
                  <MaterialIcons name="receipt-long" size={36} color="#4b5563" />
                  <Text style={styles.emptyTxsText}>No expenses logged this month.</Text>
                </View>
              ) : (
                <ScrollView style={styles.txListScroll}>
                  {expenseTxs.map((tx) => (
                    <View key={tx.id} style={styles.txItem}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.txItemDesc}>{tx.description}</Text>
                        <Text style={styles.txItemDate}>
                          {new Date(tx.spent_at).toLocaleDateString(undefined, { 
                            month: 'short', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <Text style={styles.txItemAmount}>${tx.amount.toFixed(2)}</Text>
                        {currentMonth.status === 'open' && (
                          <TouchableOpacity onPress={() => handleRemoveTx(tx.id)}>
                            <MaterialIcons name="delete-outline" size={20} color="#f87171" />
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  ))}
                </ScrollView>
              )}

              {/* Add Transaction Form (Only if Month is Open) */}
              {currentMonth.status === 'open' && (
                <View style={styles.addTxForm}>
                  <Text style={styles.formTitle}>Add New Expense</Text>
                  <View style={styles.formRow}>
                    <TextInput
                      style={[styles.formInput, styles.formInputAmount]}
                      placeholder="$ 0.00"
                      placeholderTextColor="#4b5563"
                      value={txAmount}
                      onChangeText={setTxAmount}
                      keyboardType="numeric"
                    />
                    <TextInput
                      style={[styles.formInput, styles.formInputDesc]}
                      placeholder="Description (e.g. Walmart)"
                      placeholderTextColor="#4b5563"
                      value={txDesc}
                      onChangeText={setTxDesc}
                    />
                    <TouchableOpacity 
                      style={styles.addTxBtn} 
                      onPress={handleAddTx}
                      disabled={txLoading}
                    >
                      {txLoading ? (
                        <ActivityIndicator size="small" color="#112116" />
                      ) : (
                        <MaterialIcons name="add" size={24} color="#112116" />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </View>
        </Modal>
      )}

      {/* Sticky Footer */}
      {currentMonth.status === 'open' && (
        <View style={styles.footer}>
          <View style={styles.footerContent}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Projected Savings</Text>
              <Text style={styles.summaryAmount}>${projectedSavings.toLocaleString()}</Text>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(true)}
              activeOpacity={0.85}
            >
              <MaterialIcons name="lock" size={24} color="#112116" />
              <Text style={styles.closeButtonText}>Close Month</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <CloseMonthModal
        visible={modalVisible}
        month={monthLabel}
        savingsAmount={`$${projectedSavings.toLocaleString()}`}
        onConfirm={handleConfirmClose}
        onCancel={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#112116' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 24, paddingBottom: 8 },
  monthSelector: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF', letterSpacing: -0.5 },
  statusBadge: { backgroundColor: 'rgba(25,230,94,0.1)', borderWidth: 1, borderColor: 'rgba(25,230,94,0.2)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999 },
  statusBadgeClosed: { backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' },
  statusText: { color: '#19e65e', fontSize: 10, fontWeight: 'bold', letterSpacing: 0.5 },
  scrollContent: { paddingBottom: 150 },
  section: { paddingHorizontal: 20 },
  salaryLabel: { color: '#9ca3af', fontSize: 14, fontWeight: '600', textTransform: 'uppercase', marginBottom: 4 },
  salaryInput: { color: '#FFFFFF', fontSize: 42, fontWeight: '800', padding: 0, height: 64 },
  salaryStatus: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  salaryStatusText: { color: 'rgba(25,230,94,0.8)', fontSize: 14, fontWeight: '500' },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  sectionTitleLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' },
  pulseDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#19e65e' },
  manageButton: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, backgroundColor: 'rgba(25,230,94,0.1)', borderWidth: 1, borderColor: 'rgba(25,230,94,0.2)' },
  manageButtonText: { color: '#19e65e', fontSize: 12, fontWeight: 'bold' },
  expenseList: { gap: 12 },
  expenseCard: { backgroundColor: '#1A2C22', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  expenseCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  expenseInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  expenseIconWrapper: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  expenseName: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
  expenseDescription: { color: '#9ca3af', fontSize: 12, fontWeight: '500' },
  remainingBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  remainingText: { fontSize: 12, fontWeight: 'bold' },
  progressBarBg: { height: 6, width: '100%', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 3, marginBottom: 16 },
  progressBarFill: { height: '100%', borderRadius: 3 },
  expenseCardBottom: { flexDirection: 'row', justifyContent: 'space-between', gap: 16, borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.05)', paddingTop: 12 },
  amountContainer: { flex: 1, gap: 2 },
  amountLabel: { fontSize: 10, textTransform: 'uppercase', fontWeight: 'bold', color: '#9ca3af' },
  plannedAmount: { fontSize: 16, fontWeight: '600', color: '#d1d5db' },
  spentDisplayContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 4 },
  spentAmountText: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(17,33,22,0.95)', borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  footerContent: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 32, gap: 16 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  summaryLabel: { color: '#9ca3af', fontSize: 14, fontWeight: '600' },
  summaryAmount: { color: '#19e65e', fontSize: 24, fontWeight: '800' },
  closeButton: { backgroundColor: '#19e65e', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 12, gap: 8, shadowColor: '#19e65e', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6 },
  closeButtonText: { color: '#112116', fontWeight: 'bold', fontSize: 16 },

  // Transaction Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.75)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#112116', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40, borderTopWidth: 1, borderColor: 'rgba(25,230,94,0.2)', maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalHeaderTitleRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF' },
  modalSubtitle: { fontSize: 14, color: '#9ca3af', marginTop: 2 },
  modalCloseBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center' },
  modalSummaryCard: { backgroundColor: '#1A2C22', borderRadius: 12, padding: 16, borderLeftWidth: 4, borderLeftColor: '#19e65e', marginBottom: 20 },
  modalSummaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  modalSummaryLabel: { fontSize: 10, fontWeight: 'bold', color: '#9ca3af', letterSpacing: 0.5, marginBottom: 4 },
  modalSummaryValue: { fontSize: 20, fontWeight: '800', color: '#FFFFFF' },
  txListTitle: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 12, letterSpacing: -0.2 },
  txListScroll: { maxHeight: 250, marginBottom: 20 },
  emptyTxsContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 32, gap: 8, opacity: 0.8 },
  emptyTxsText: { color: '#9ca3af', fontSize: 14, fontWeight: '500' },
  txItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  txItemDesc: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  txItemDate: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  txItemAmount: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF' },
  addTxForm: { borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.05)', paddingTop: 16 },
  formTitle: { fontSize: 14, fontWeight: 'bold', color: '#9ca3af', marginBottom: 10, textTransform: 'uppercase' },
  formRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  formInput: { backgroundColor: '#1A2C22', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, color: '#FFFFFF', fontSize: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  formInputAmount: { width: 85 },
  formInputDesc: { flex: 1 },
  addTxBtn: { width: 44, height: 44, borderRadius: 8, backgroundColor: '#19e65e', alignItems: 'center', justifyContent: 'center' },
});

export default SalaryExpensesScreen;