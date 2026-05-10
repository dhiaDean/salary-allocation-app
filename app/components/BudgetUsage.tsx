import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useDatabase } from '../../db/DatabaseContext';

const BudgetUsage: React.FC = () => {
  const { summary, currentMonth } = useDatabase();

  const salary = summary?.salary ?? 0;
  const totalSpent = summary?.totalSpent ?? 0;
  const remaining = Math.max(salary - totalSpent, 0);
  const usagePct = salary > 0 ? Math.min(Math.round((totalSpent / salary) * 100), 100) : 0;

  const monthName = currentMonth
    ? new Date(currentMonth.year, currentMonth.month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })
    : '';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Budget Usage</Text>
          <Text style={styles.subtitle}>{monthName}</Text>
        </View>
        <View style={styles.usageContainer}>
          <Text style={styles.percentage}>{usagePct}%</Text>
          <Text style={styles.usageText}>Used</Text>
        </View>
      </View>
      <View style={styles.progressBarBackground}>
        <View style={[styles.progressBarFill, { width: `${usagePct}%` as any }]} />
      </View>
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          ${totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2 })} Spent
        </Text>
        <Text style={[styles.footerText, { color: '#9ca3af' }]}>
          ${remaining.toLocaleString('en-US', { minimumFractionDigits: 2 })} Remaining
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: '#1b2e21', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 20, marginTop: 24, marginHorizontal: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' },
  subtitle: { fontSize: 14, color: '#93c8a5' },
  usageContainer: { alignItems: 'flex-end' },
  percentage: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF' },
  usageText: { fontSize: 12, color: '#9ca3af' },
  progressBarBackground: { width: '100%', backgroundColor: 'rgba(107,114,128,0.5)', borderRadius: 999, height: 12, marginVertical: 4 },
  progressBarFill: { backgroundColor: '#19e65e', height: 12, borderRadius: 999 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  footerText: { fontSize: 12, fontWeight: '500', color: '#93c8a5' },
});

export default BudgetUsage;
