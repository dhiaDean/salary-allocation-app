import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useDatabase } from '../../db/DatabaseContext';

const MetricCards: React.FC = () => {
  const { summary, vaultBalance } = useDatabase();

  const salary = summary?.salary ?? 0;
  const totalSpent = summary?.totalSpent ?? 0;
  const leftToSpend = Math.max(salary - totalSpent, 0);
  const usagePct = salary > 0 ? Math.min((totalSpent / salary) * 100, 100) : 0;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollViewContainer}
    >
      {/* Vault Balance Card */}
      <View style={[styles.card, { width: 256 }]}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconWrapper, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
            <MaterialIcons name="lock" size={24} color="#19e65e" />
          </View>
          <Text style={styles.cardTitle}>Vault Balance</Text>
        </View>
        <View>
          <Text style={styles.balanceText}>
            ${vaultBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
          <View style={styles.percentageBadge}>
            <MaterialIcons name="savings" size={16} color="#19e65e" />
            <Text style={styles.percentageText}>Savings Vault</Text>
          </View>
        </View>
      </View>

      {/* Left to Spend Card */}
      <View style={[styles.card, { width: 224 }]}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconWrapper, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
            <MaterialIcons name="account-balance-wallet" size={24} color="#93c8a5" />
          </View>
          <Text style={styles.cardTitle}>Left to Spend</Text>
        </View>
        <View style={styles.leftContent}>
          <View>
            <Text style={styles.leftAmount}>
              ${leftToSpend.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
            <Text style={styles.salaryText}>
              of ${salary.toLocaleString('en-US', { minimumFractionDigits: 2 })} Salary
            </Text>
          </View>
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: `${100 - usagePct}%` as any }]} />
          </View>
        </View>
      </View>

      {/* Monthly Salary Card */}
      <View style={[styles.card, { width: 200 }]}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconWrapper, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
            <MaterialIcons name="payments" size={24} color="#93c8a5" />
          </View>
          <Text style={styles.cardTitle}>Monthly Salary</Text>
        </View>
        <View>
          <Text style={styles.balanceText}>
            ${salary.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
          <Text style={styles.salaryText}>Fixed Income</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollViewContainer: { gap: 16, paddingHorizontal: 16 },
  card: { backgroundColor: '#1b2e21', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 20, height: 160, justifyContent: 'space-between' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconWrapper: { padding: 8, borderRadius: 8 },
  cardTitle: { color: '#D1D5DB', fontSize: 14, fontWeight: '500' },
  balanceText: { color: '#FFFFFF', fontSize: 28, fontWeight: 'bold' },
  percentageBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(25,230,94,0.1)', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginTop: 4 },
  percentageText: { color: '#19e65e', fontSize: 12, fontWeight: '500' },
  leftContent: { gap: 8 },
  leftAmount: { color: '#19e65e', fontSize: 24, fontWeight: 'bold' },
  salaryText: { fontSize: 12, color: '#9ca3af' },
  progressBarBackground: { width: '100%', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 999, height: 6 },
  progressBarFill: { backgroundColor: '#19e65e', height: 6, borderRadius: 999 },
});

export default MetricCards;
