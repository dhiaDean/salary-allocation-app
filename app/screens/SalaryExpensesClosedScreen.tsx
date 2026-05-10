import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDatabase } from '../../db/DatabaseContext';

const MONTH_NAMES = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const SalaryExpensesClosedScreen: React.FC = () => {
  const { isReady, currentMonth, summary, expenses } = useDatabase();

  if (!isReady || !currentMonth || !summary) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ActivityIndicator size="large" color="#19e65e" style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  const monthLabel = `${MONTH_NAMES[currentMonth.month]} ${currentMonth.year}`;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#112116" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{monthLabel}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Closed Badge */}
        <View style={styles.closedBadgeRow}>
          <View style={styles.closedBadge}>
            <MaterialIcons name="lock" size={16} color="#9ca3af" />
            <Text style={styles.closedBadgeText}>CLOSED</Text>
          </View>
        </View>

        {/* Summary Stats Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryCell}>
              <Text style={styles.summaryCellLabel}>Total Income</Text>
              <Text style={styles.summaryCellAmount}>
                ${summary.salary.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </Text>
            </View>
            <View style={[styles.summaryCell, { alignItems: 'flex-end' }]}>
              <Text style={styles.summaryCellLabel}>Total Expenses</Text>
              <Text style={styles.summaryCellAmount}>
                ${summary.totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.netResultRow}>
            <Text style={styles.netLabel}>Net Result</Text>
            <Text style={styles.netAmount}>
              +${summary.projectedSavings.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </Text>
          </View>
        </View>

        {/* Expense Breakdown */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionLabel}>Expenses Breakdown</Text>
          {expenses.map((item, i) => {
            const color = JSON.parse(item.color);
            return (
              <View
                key={item.id}
                style={[styles.listItem, i < expenses.length - 1 && styles.listItemBorder]}
              >
                <View style={[styles.listIconWrapper, { backgroundColor: color.bg }]}>
                  <MaterialIcons name={item.icon as any} size={22} color={color.dark} />
                </View>
                <View style={styles.listItemInfo}>
                  <Text style={styles.listItemLabel}>{item.name}</Text>
                  <Text style={styles.listItemSub}>
                    Planned: ${item.planned_amount}
                  </Text>
                </View>
                <Text style={[
                  styles.listItemAmount,
                  item.spent_amount > item.planned_amount && { color: '#f87171' }
                ]}>
                  ${item.spent_amount.toFixed(2)}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Vault Contribution */}
        <View style={styles.vaultSection}>
          <Text style={styles.sectionLabel}>Vault Contribution</Text>
          <TouchableOpacity
            style={styles.vaultCard}
            onPress={() => router.push('/vault-history')}
            activeOpacity={0.8}
          >
            <View style={styles.vaultIconWrapper}>
              <MaterialIcons name="savings" size={24} color="#19e65e" />
            </View>
            <View style={styles.vaultInfo}>
              <Text style={styles.vaultTitle}>Transfer to Vault</Text>
              <View style={styles.completedRow}>
                <MaterialIcons name="check-circle" size={14} color="#19e65e" />
                <Text style={styles.completedText}>Completed</Text>
              </View>
            </View>
            <View style={styles.vaultAmountRow}>
              <MaterialIcons name="lock" size={16} color="#4b5563" />
              <Text style={styles.vaultAmount}>
                ${summary.projectedSavings.toFixed(2)}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Read-only footer */}
        <View style={styles.readOnlyFooter}>
          <Text style={styles.readOnlyText}>Read-only mode</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#112116' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, height: 64, borderBottomWidth: 1, borderColor: '#1e3a28' },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20 },
  headerTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  scrollContent: { paddingBottom: 32 },
  closedBadgeRow: { alignItems: 'center', paddingVertical: 24 },
  closedBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 6, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  closedBadgeText: { color: '#9ca3af', fontSize: 12, fontWeight: 'bold', letterSpacing: 1 },
  summaryCard: { marginHorizontal: 16, backgroundColor: '#1a2c20', borderRadius: 16, padding: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', marginBottom: 32 },
  summaryGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  summaryCell: { gap: 4 },
  summaryCellLabel: { color: '#9ca3af', fontSize: 14, fontWeight: '500' },
  summaryCellAmount: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold' },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: 24 },
  netResultRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  netLabel: { color: '#d1d5db', fontSize: 16, fontWeight: '500' },
  netAmount: { color: '#19e65e', fontSize: 24, fontWeight: 'bold' },
  sectionBlock: { marginBottom: 8 },
  sectionLabel: { color: '#6b7280', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, paddingHorizontal: 16, marginBottom: 4, paddingTop: 8 },
  listItem: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: 16, paddingVertical: 16 },
  listItemBorder: { borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  listIconWrapper: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  listItemInfo: { flex: 1 },
  listItemLabel: { color: '#FFFFFF', fontSize: 16, fontWeight: '500' },
  listItemSub: { color: '#6b7280', fontSize: 12 },
  listItemAmount: { color: '#FFFFFF', fontSize: 16, fontWeight: '500' },
  vaultSection: { paddingHorizontal: 16, marginTop: 8, marginBottom: 32 },
  vaultCard: { flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: '#1a2c20', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  vaultIconWrapper: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(25,230,94,0.2)', alignItems: 'center', justifyContent: 'center' },
  vaultInfo: { flex: 1, gap: 4 },
  vaultTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  completedRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  completedText: { color: '#19e65e', fontSize: 12, fontWeight: '500' },
  vaultAmountRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  vaultAmount: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  readOnlyFooter: { alignItems: 'center', paddingVertical: 24 },
  readOnlyText: { color: '#6b7280', fontSize: 12, fontWeight: '500', backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999 },
});

export default SalaryExpensesClosedScreen;
