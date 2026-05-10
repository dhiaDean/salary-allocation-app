import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const FILTERS = ['All Time', '2026', '2025'];

const historyData = [
  { id: '1', month: 'January 2026', type: 'Monthly Contribution', amount: 1320, hasNote: true, isLatest: true },
  { id: '2', month: 'December 2025', type: 'Year-end Bonus', amount: 980, hasNote: true, isLatest: false },
  { id: '3', month: 'November 2025', type: 'Monthly Contribution', amount: 1100, hasNote: false, isLatest: false },
  { id: '4', month: 'October 2025', type: 'Automatic Transfer', amount: 1100, hasNote: false, isLatest: false },
  { id: '5', month: 'September 2025', type: 'Automatic Transfer', amount: 1100, hasNote: false, isLatest: false, faded: true },
];

const VaultHistoryScreen: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState(0);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#112116" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn}>
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
          <Text style={styles.heroAmount}>$15,420.00</Text>
          <View style={styles.growthBadge}>
            <MaterialIcons name="trending-up" size={16} color="#19e65e" />
            <Text style={styles.growthText}>+12.5% this year</Text>
          </View>
        </View>

        {/* Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersRow}>
          {FILTERS.map((f, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.filterChip, i === activeFilter && styles.filterChipActive]}
              onPress={() => setActiveFilter(i)}
            >
              <Text style={[styles.filterText, i === activeFilter && styles.filterTextActive]}>{f}</Text>
              {i === 0 && (
                <MaterialIcons name="expand-more" size={18} color={i === activeFilter ? '#112116' : '#FFFFFF'} />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Recent Activity */}
        <View style={styles.activitySection}>
          <View style={styles.activityHeader}>
            <Text style={styles.activityTitle}>Recent Activity</Text>
            <TouchableOpacity>
              <Text style={styles.exportBtn}>Export</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.activityList}>
            {historyData.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.historyItem, (item as any).faded && { opacity: 0.6 }]}
                activeOpacity={0.75}
              >
                <View style={styles.historyLeft}>
                  <View style={[styles.historyIconWrapper, item.isLatest ? styles.historyIconActive : styles.historyIconMuted]}>
                    <MaterialIcons
                      name={item.isLatest ? 'savings' : 'calendar-today'}
                      size={22}
                      color={item.isLatest ? '#19e65e' : 'rgba(255,255,255,0.6)'}
                    />
                  </View>
                  <View>
                    <Text style={styles.historyMonth}>{item.month}</Text>
                    <Text style={styles.historyType}>{item.type}</Text>
                  </View>
                </View>
                <View style={styles.historyRight}>
                  <Text style={styles.historyAmount}>+${item.amount.toLocaleString()}.00</Text>
                  <MaterialIcons
                    name="description"
                    size={18}
                    color={item.hasNote ? '#19e65e' : 'transparent'}
                  />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Bottom gradient overlay */}
      <View style={styles.bottomGradient} pointerEvents="none" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#112116' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 16 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', color: '#FFFFFF', fontSize: 18, fontWeight: 'bold', marginRight: 40 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 48, gap: 24 },

  // Hero card
  heroCard: { position: 'relative', backgroundColor: '#1a2c20', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', padding: 24, alignItems: 'center', overflow: 'hidden', marginTop: 8 },
  heroGlow: { position: 'absolute', top: 0, right: 0, width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(25,230,94,0.08)' },
  heroLabel: { color: '#93c8a5', fontSize: 12, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  heroAmount: { color: '#FFFFFF', fontSize: 44, fontWeight: '800', marginBottom: 16, letterSpacing: -1 },
  growthBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(25,230,94,0.1)', borderWidth: 1, borderColor: 'rgba(25,230,94,0.2)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999 },
  growthText: { color: '#19e65e', fontSize: 14, fontWeight: 'bold' },

  // Filters
  filtersRow: { gap: 12, paddingBottom: 4 },
  filterChip: { height: 36, flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 16, borderRadius: 999, backgroundColor: '#24382a', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  filterChipActive: { backgroundColor: '#19e65e', borderColor: '#19e65e' },
  filterText: { color: '#FFFFFF', fontSize: 14, fontWeight: '500' },
  filterTextActive: { color: '#112116', fontWeight: 'bold' },

  // Activity
  activitySection: { gap: 16 },
  activityHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  activityTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold' },
  exportBtn: { color: '#19e65e', fontSize: 14, fontWeight: '600' },
  activityList: { gap: 12 },
  historyItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#1a2c20', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  historyLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  historyIconWrapper: { width: 48, height: 48, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  historyIconActive: { backgroundColor: 'rgba(25,230,94,0.1)' },
  historyIconMuted: { backgroundColor: 'rgba(255,255,255,0.05)' },
  historyMonth: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  historyType: { color: '#93c8a5', fontSize: 12, fontWeight: '500', marginTop: 2 },
  historyRight: { alignItems: 'flex-end', gap: 4 },
  historyAmount: { color: '#19e65e', fontSize: 18, fontWeight: 'bold' },

  // Bottom gradient
  bottomGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 64, backgroundColor: 'transparent' },
});

export default VaultHistoryScreen;
