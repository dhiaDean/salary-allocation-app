import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import CloseMonthModal from './CloseMonthModal';

const expenseData = [
  {
    name: 'Food',
    description: 'Monthly groceries',
    icon: 'restaurant',
    planned: 500,
    spent: 350,
    color: { light: '#fbbf24', dark: '#facc15', bg: 'rgba(251, 191, 36, 0.2)' },
  },
  {
    name: 'Transport',
    description: 'Daily commute',
    icon: 'directions-bus',
    planned: 200,
    spent: 50,
    color: { light: '#3b82f6', dark: '#60a5fa', bg: 'rgba(59, 130, 246, 0.2)' },
  },
  {
    name: 'Internet',
    description: 'Home fiber',
    icon: 'wifi',
    planned: 60,
    spent: 60,
    color: { light: '#a855f7', dark: '#c084fc', bg: 'rgba(168, 85, 247, 0.2)' },
  },
];

const MONTH = 'January 2026';
const SAVINGS_AMOUNT = '$1,200';

const SalaryExpensesScreen: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);

  const handleConfirmClose = () => {
    setModalVisible(false);
    // Navigate to the closed month view after confirming
    router.push('/salary-expenses-closed');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#112116" />

      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.monthSelector}>
          <Text style={styles.headerTitle}>{MONTH}</Text>
          <MaterialIcons name="expand-more" size={24} color="#9ca3af" />
        </TouchableOpacity>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>OPEN</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Salary Section */}
        <View style={styles.section}>
          <Text style={styles.salaryLabel}>Monthly Salary</Text>
          <View>
            <TextInput
              style={styles.salaryInput}
              defaultValue="$5,000"
              placeholderTextColor="#4b5563"
              keyboardType="numeric"
            />
          </View>
          <View style={styles.salaryStatus}>
            <MaterialIcons name="check-circle" size={18} color="#19e65e" />
            <Text style={styles.salaryStatusText}>Entered on: Jan 1</Text>
          </View>
        </View>

        <View style={{ height: 24 }} />

        {/* Planned Expenses Section */}
        <View style={styles.section}>
          {/* Section header row: title + pulsing dot + Manage button */}
          <View style={styles.sectionTitleRow}>
            <View style={styles.sectionTitleLeft}>
              <Text style={styles.sectionTitle}>Planned Expenses</Text>
              {/* Pulsing dot — matches the HTML animate-pulse dot */}
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
            {expenseData.map((item, index) => (
              <View key={index} style={styles.expenseCard}>
                <View style={styles.expenseCardTop}>
                  <View style={styles.expenseInfo}>
                    <View style={[styles.expenseIconWrapper, { backgroundColor: item.color.bg }]}>
                      <MaterialIcons name={item.icon as any} size={24} color={item.color.dark} />
                    </View>
                    <View>
                      <Text style={styles.expenseName}>{item.name}</Text>
                      <Text style={styles.expenseDescription}>{item.description}</Text>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.remainingBadge,
                      {
                        backgroundColor:
                          item.planned - item.spent > 0
                            ? 'rgba(25, 230, 94, 0.2)'
                            : 'rgba(255, 255, 255, 0.05)',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.remainingText,
                        { color: item.planned - item.spent > 0 ? '#19e65e' : '#6b7280' },
                      ]}
                    >
                      REM: ${item.planned - item.spent}
                    </Text>
                  </View>
                </View>
                <View style={styles.expenseCardBottom}>
                  <View style={styles.amountContainer}>
                    <Text style={styles.amountLabel}>Planned</Text>
                    <Text style={styles.plannedAmount}>${item.planned}</Text>
                  </View>
                  <View style={styles.amountContainer}>
                    <Text style={[styles.amountLabel, { color: '#19e65e', textAlign: 'right' }]}>
                      Spent
                    </Text>
                    <TextInput
                      style={styles.spentInput}
                      defaultValue={`$${item.spent}`}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Sticky Footer */}
      <View style={styles.footer}>
        <View style={styles.footerContent}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Projected Savings</Text>
            <Text style={styles.summaryAmount}>{SAVINGS_AMOUNT}</Text>
          </View>
          {/* Close Month → opens CloseMonthModal */}
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

      {/* Close Month Confirmation Modal */}
      <CloseMonthModal
        visible={modalVisible}
        month={MONTH}
        savingsAmount={SAVINGS_AMOUNT}
        onConfirm={handleConfirmClose}
        onCancel={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#112116' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 8,
  },
  monthSelector: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF', letterSpacing: -0.5 },
  statusBadge: {
    backgroundColor: 'rgba(25, 230, 94, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(25, 230, 94, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusText: { color: '#19e65e', fontSize: 10, fontWeight: 'bold', letterSpacing: 0.5 },
  scrollContent: { paddingBottom: 150 },
  section: { paddingHorizontal: 20 },
  salaryLabel: {
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  salaryInput: { color: '#FFFFFF', fontSize: 42, fontWeight: '800', padding: 0, height: 64 },
  salaryStatus: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  salaryStatusText: { color: 'rgba(25, 230, 94, 0.8)', fontSize: 14, fontWeight: '500' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#19e65e',
  },
  manageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: 'rgba(25, 230, 94, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(25, 230, 94, 0.2)',
  },
  manageButtonText: {
    color: '#19e65e',
    fontSize: 12,
    fontWeight: 'bold',
  },
  expenseList: { gap: 12 },
  expenseCard: {
    backgroundColor: '#1A2C22',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  expenseCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  expenseInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  expenseIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  expenseName: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
  expenseDescription: { color: '#9ca3af', fontSize: 12, fontWeight: '500' },
  remainingBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  remainingText: { fontSize: 12, fontWeight: 'bold' },
  expenseCardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    paddingTop: 12,
  },
  amountContainer: { flex: 1, gap: 2 },
  amountLabel: { fontSize: 10, textTransform: 'uppercase', fontWeight: 'bold', color: '#9ca3af' },
  plannedAmount: { fontSize: 16, fontWeight: '600', color: '#d1d5db' },
  spentInput: {
    backgroundColor: '#112116',
    borderWidth: 1,
    borderColor: 'rgba(25, 230, 94, 0.3)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    textAlign: 'right',
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontSize: 14,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(17, 33, 22, 0.95)',
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  footerContent: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 32, gap: 16 },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  summaryLabel: { color: '#9ca3af', fontSize: 14, fontWeight: '600' },
  summaryAmount: { color: '#19e65e', fontSize: 24, fontWeight: '800' },
  closeButton: {
    backgroundColor: '#19e65e',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#19e65e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  closeButtonText: { color: '#112116', fontWeight: 'bold', fontSize: 16 },
});

export default SalaryExpensesScreen;