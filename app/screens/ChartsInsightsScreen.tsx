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
import Svg, { Circle, G } from 'react-native-svg';
import { useDatabase } from '../../db/DatabaseContext';

const MONTH_NAMES = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const ChartsInsightsScreen: React.FC = () => {
  const { isReady, expenses, summary, currentMonth } = useDatabase();

  if (!isReady || !currentMonth || !summary) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ActivityIndicator size="large" color="#19e65e" style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  const monthLabel = `${MONTH_NAMES[currentMonth.month]} ${currentMonth.year}`;
  const totalSpent = summary.totalSpent;
  const salary = summary.salary;

  // 1. Filter categories with active spending
  const activeSpendCategories = expenses.filter((e) => e.spent_amount > 0);

  // Donut chart math parameters
  const size = 160;
  const strokeWidth = 16;
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;

  let cumulativeSpent = 0;
  const chartSegments = activeSpendCategories.map((item) => {
    let colorObj = { dark: '#19e65e', bg: 'rgba(25,230,94,0.1)' };
    try {
      colorObj = JSON.parse(item.color);
    } catch (e) {
      console.error(e);
    }

    const fraction = item.spent_amount / (totalSpent || 1);
    const strokeDasharray = `${fraction * circumference} ${circumference}`;
    const strokeDashoffset = -((cumulativeSpent / (totalSpent || 1)) * circumference);
    cumulativeSpent += item.spent_amount;

    return {
      ...item,
      colorObj,
      strokeDasharray,
      strokeDashoffset,
      percentage: Math.round(fraction * 100),
    };
  });

  // 2. Generate insights
  const insights = [];

  // Savings rate insight
  if (salary > 0) {
    const savingsRate = Math.round((summary.projectedSavings / salary) * 100);
    if (savingsRate > 0) {
      insights.push({
        type: 'success',
        icon: 'trending-up',
        title: 'Healthy Savings Rate',
        desc: `You are projected to save ${savingsRate}% ($${summary.projectedSavings.toLocaleString()}) of your salary this month.`,
      });
    } else if (savingsRate < 0) {
      insights.push({
        type: 'warning',
        icon: 'warning',
        title: 'Overspending Alert',
        desc: `Your monthly expenses exceed your salary by $${Math.abs(summary.projectedSavings).toLocaleString()}.`,
      });
    }
  }

  // Over-budget categories insight
  const overBudgetCats = expenses.filter((e) => e.spent_amount > e.planned_amount);
  if (overBudgetCats.length > 0) {
    insights.push({
      type: 'warning',
      icon: 'error-outline',
      title: 'Categories Over Budget',
      desc: `You have exceeded your planned budget in ${overBudgetCats.length} category${overBudgetCats.length > 1 ? 's' : ''}: ${overBudgetCats.map((c) => c.name).join(', ')}.`,
    });
  }

  // Top spending category insight
  if (activeSpendCategories.length > 0) {
    const topCat = [...activeSpendCategories].sort((a, b) => b.spent_amount - a.spent_amount)[0];
    const topCatPct = Math.round((topCat.spent_amount / (totalSpent || 1)) * 100);
    insights.push({
      type: 'info',
      icon: 'info',
      title: 'Top Expense Area',
      desc: `"${topCat.name}" is your highest spending area, accounting for ${topCatPct}% ($${topCat.spent_amount.toLocaleString()}) of total expenditures.`,
    });
  }

  // Under budget praise
  const activeBudgetUsed = expenses.filter((e) => e.spent_amount > 0 && e.spent_amount <= e.planned_amount);
  if (activeBudgetUsed.length > 0 && overBudgetCats.length === 0) {
    insights.push({
      type: 'success',
      icon: 'check-circle-outline',
      title: 'On Track',
      desc: 'Great job! All active categories are currently within their planned budget constraints.',
    });
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#112116" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
          <MaterialIcons name="chevron-left" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Charts &amp; Insights</Text>
        <View style={styles.monthBadge}>
          <Text style={styles.monthBadgeText}>{monthLabel}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Overview Row */}
        <View style={styles.overviewRow}>
          <View style={styles.overviewCard}>
            <Text style={styles.overviewLabel}>TOTAL SPENT</Text>
            <Text style={styles.overviewValue}>${totalSpent.toLocaleString()}</Text>
          </View>
          <View style={styles.overviewCard}>
            <Text style={styles.overviewLabel}>PLANNED TOTAL</Text>
            <Text style={styles.overviewValue}>${summary.totalPlanned.toLocaleString()}</Text>
          </View>
        </View>

        {/* Donut Chart / Visualization Card */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Spending Share</Text>
          {totalSpent === 0 ? (
            <View style={styles.emptyChartContainer}>
              <View style={styles.emptyIconWrapper}>
                <MaterialIcons name="pie-chart-outlined" size={48} color="#2d4a36" />
              </View>
              <Text style={styles.emptyText}>No spending logged yet</Text>
              <Text style={styles.emptySubText}>Add transactions in your planning categories to populate the chart.</Text>
            </View>
          ) : (
            <View style={styles.chartContainer}>
              <View style={styles.donutWrapper}>
                <Svg width={size} height={size}>
                  <G rotation="-90" origin={`${center}, ${center}`}>
                    {/* Background circle */}
                    <Circle
                      cx={center}
                      cy={center}
                      r={radius}
                      fill="transparent"
                      stroke="rgba(255,255,255,0.05)"
                      strokeWidth={strokeWidth}
                    />
                    {/* Foreground segments */}
                    {chartSegments.map((segment) => (
                      <Circle
                        key={segment.id}
                        cx={center}
                        cy={center}
                        r={radius}
                        fill="transparent"
                        stroke={segment.colorObj.dark}
                        strokeWidth={strokeWidth}
                        strokeDasharray={segment.strokeDasharray}
                        strokeDashoffset={segment.strokeDashoffset}
                      />
                    ))}
                  </G>
                </Svg>
                <View style={styles.donutInner}>
                  <Text style={styles.donutAmount}>
                    ${totalSpent.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </Text>
                  <Text style={styles.donutLabel}>Spent</Text>
                </View>
              </View>

              {/* Chart Legend */}
              <View style={styles.legendContainer}>
                {chartSegments.map((segment) => (
                  <View key={segment.id} style={styles.legendItem}>
                    <View style={[styles.legendIndicator, { backgroundColor: segment.colorObj.dark }]} />
                    <View style={styles.legendTextContainer}>
                      <Text style={styles.legendName}>{segment.name}</Text>
                      <Text style={styles.legendValue}>
                        ${segment.spent_amount.toLocaleString()} ({segment.percentage}%)
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Budget Comparison List */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Budget Progress</Text>
          <View style={styles.progressList}>
            {expenses.map((item) => {
              let colorObj = { dark: '#19e65e', bg: 'rgba(25,230,94,0.1)' };
              try {
                colorObj = JSON.parse(item.color);
              } catch (e) {
                console.error(e);
              }

              const percentSpent = item.planned_amount > 0
                ? Math.min((item.spent_amount / item.planned_amount) * 100, 100)
                : 0;

              const isOver = item.spent_amount > item.planned_amount;

              return (
                <View key={item.id} style={styles.progressItem}>
                  <View style={styles.progressHeader}>
                    <View style={styles.progressLabelRow}>
                      <View style={[styles.miniIconWrapper, { backgroundColor: colorObj.bg }]}>
                        <MaterialIcons name={item.icon as any} size={16} color={colorObj.dark} />
                      </View>
                      <Text style={styles.progressCatName}>{item.name}</Text>
                    </View>
                    <Text style={styles.progressSpentAmount}>
                      ${item.spent_amount.toFixed(0)} /{' '}
                      <Text style={styles.progressPlannedAmount}>${item.planned_amount.toFixed(0)}</Text>
                    </Text>
                  </View>
                  <View style={styles.progressBarBg}>
                    <View
                      style={[
                        styles.progressBarFill,
                        {
                          width: `${percentSpent}%`,
                          backgroundColor: isOver ? '#f87171' : colorObj.dark,
                        },
                      ]}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Smart Insights Section */}
        <View style={styles.insightsSection}>
          <Text style={styles.insightsSectionTitle}>Smart Insights</Text>
          {insights.length === 0 ? (
            <View style={styles.noInsightsCard}>
              <MaterialIcons name="insights" size={24} color="#6b7280" />
              <Text style={styles.noInsightsText}>No analytical insights available yet.</Text>
            </View>
          ) : (
            <View style={styles.insightsList}>
              {insights.map((ins, i) => {
                let iconColor = '#19e65e';
                let cardBorder = 'rgba(25,230,94,0.1)';
                if (ins.type === 'warning') {
                  iconColor = '#f87171';
                  cardBorder = 'rgba(239,68,68,0.1)';
                } else if (ins.type === 'info') {
                  iconColor = '#60a5fa';
                  cardBorder = 'rgba(96,165,250,0.1)';
                }

                return (
                  <View key={i} style={[styles.insightCard, { borderColor: cardBorder }]}>
                    <View style={[styles.insightIconWrapper, { backgroundColor: cardBorder }]}>
                      <MaterialIcons name={ins.icon as any} size={20} color={iconColor} />
                    </View>
                    <View style={styles.insightTextContent}>
                      <Text style={styles.insightTitle}>{ins.title}</Text>
                      <Text style={styles.insightDesc}>{ins.desc}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#112116' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#1e3a28',
  },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' },
  monthBadge: {
    backgroundColor: '#1b2e21',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  monthBadgeText: {
    color: '#19e65e',
    fontSize: 12,
    fontWeight: 'bold',
  },
  scrollContent: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 40, gap: 20 },
  overviewRow: { flexDirection: 'row', gap: 12 },
  overviewCard: {
    flex: 1,
    backgroundColor: '#1b2e21',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    gap: 4,
  },
  overviewLabel: { fontSize: 10, fontWeight: 'bold', color: '#9ca3af', letterSpacing: 0.5 },
  overviewValue: { fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
  sectionCard: {
    backgroundColor: '#1b2e21',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    gap: 16,
  },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF' },
  emptyChartContainer: { alignItems: 'center', paddingVertical: 32, gap: 12 },
  emptyIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(25,230,94,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  emptySubText: { color: '#6b7280', fontSize: 12, textAlign: 'center', paddingHorizontal: 20, lineHeight: 18 },
  chartContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 24, flexWrap: 'wrap' },
  donutWrapper: { width: 160, height: 160, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  donutInner: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  donutAmount: { color: '#FFFFFF', fontSize: 24, fontWeight: 'bold', letterSpacing: -0.5 },
  donutLabel: { color: '#9ca3af', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 },
  legendContainer: { flex: 1, minWidth: 150, gap: 12 },
  legendItem: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  legendIndicator: { width: 12, height: 12, borderRadius: 3, marginTop: 3 },
  legendTextContainer: { gap: 2 },
  legendName: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  legendValue: { color: '#9ca3af', fontSize: 12, fontWeight: '500' },
  progressList: { gap: 16 },
  progressItem: { gap: 8 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progressLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  miniIconWrapper: { width: 26, height: 26, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  progressCatName: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' },
  progressSpentAmount: { color: '#FFFFFF', fontSize: 13, fontWeight: 'bold' },
  progressPlannedAmount: { color: '#9ca3af', fontWeight: '500' },
  progressBarBg: { height: 8, width: '100%', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 4 },
  progressBarFill: { height: '100%', borderRadius: 4 },
  insightsSection: { gap: 12 },
  insightsSectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF' },
  noInsightsCard: {
    backgroundColor: '#1b2e21',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  noInsightsText: { color: '#6b7280', fontSize: 14, fontWeight: '500' },
  insightsList: { gap: 12 },
  insightCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#1b2e21',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  insightIconWrapper: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  insightTextContent: { flex: 1, gap: 4 },
  insightTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold' },
  insightDesc: { color: '#9ca3af', fontSize: 13, lineHeight: 18 },
});

export default ChartsInsightsScreen;
