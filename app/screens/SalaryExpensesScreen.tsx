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
import type { ExpenseEntryWithCategory } from '../../db/types';
import CloseMonthModal from './CloseMonthModal';
import TransactionManagerModal from '../components/TransactionManagerModal';
import MonthSelectorModal from '../components/MonthSelectorModal';

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
    confirmCloseMonth,
  } = useDatabase();

  const [modalVisible, setModalVisible] = useState(false);
  const [salaryInput, setSalaryInput] = useState('');
  const [monthModalVisible, setMonthModalVisible] = useState(false);

  // Transaction manager state
  const [txModalVisible, setTxModalVisible] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<ExpenseEntryWithCategory | null>(null);

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

  const handleOpenTransactionManager = (expense: ExpenseEntryWithCategory) => {
    setSelectedExpense(expense);
    setTxModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#112116" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.monthSelector} onPress={() => setMonthModalVisible(true)}>
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
      <TransactionManagerModal
        visible={txModalVisible}
        expense={selectedExpense}
        onClose={() => {
          setTxModalVisible(false);
          setSelectedExpense(null);
        }}
      />

      {/* Month Selector Modal */}
      <MonthSelectorModal
        visible={monthModalVisible}
        onClose={() => setMonthModalVisible(false)}
      />

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
});

export default SalaryExpensesScreen;