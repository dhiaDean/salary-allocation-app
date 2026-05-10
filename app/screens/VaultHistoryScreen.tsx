import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
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

type Filter = 'all' | string; // 'all' | '2026' | '2025' etc.

const VaultHistoryScreen: React.FC = () => {
  const { isReady, vaultEntries, vaultBalance } = useDatabase();
  const [activeFilter, setActiveFilter] = useState<Filter>('all');

  // Build dynamic year filter list from entries
  const years = Array.from(new Set(vaultEntries.map((e) => String(e.year)))).sort((a, b) => Number(b) - Number(a));
  const filters = ['all', ...years];

  const filtered = activeFilter === 'all'
    ? vaultEntries
    : vaultEntries.filter((e) => String(e.year) === activeFilter);

  if (!isReady) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ActivityIndicator size="large" color="#19e65e" style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

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
          <Text style={styles.heroAmount}>${vaultBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
          <View style={styles.growthBadge}>
            <MaterialIcons name="savings" size={16} color="#19e65e" />
            <Text style={styles.growthText}>{filtered.length} contribution{filtered.length !== 1 ? 's' : ''}</Text>
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
          </View>

          {filtered.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="savings" size={48} color="#2d4a36" />
              <Text style={styles.emptyText}>No vault entries yet.</Text>
              <Text style={styles.emptySubText}>Close a month to add to your vault.</Text>
            </View>
          ) : (
            <View style={styles.activityList}>
              {filtered.map((item, index) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.historyItem}
                  activeOpacity={0.75}
                >
                  <View style={styles.historyLeft}>
                    <View style={[styles.historyIconWrapper, index === 0 ? styles.historyIconActive : styles.historyIconMuted]}>
                      <MaterialIcons
                        name={index === 0 ? 'savings' : 'calendar-today'}
                        size={22}
                        color={index === 0 ? '#19e65e' : 'rgba(255,255,255,0.6)'}
                      />
                    </View>
                    <View>
                      <Text style={styles.historyMonth}>{MONTH_NAMES[item.month]} {item.year}</Text>
                      <Text style={styles.historyType}>{item.note ?? 'Monthly Contribution'}</Text>
                    </View>
                  </View>
                  <View style={styles.historyRight}>
                    <Text style={styles.historyAmount}>
                      +${item.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#112116' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 16 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', color: '#FFFFFF', fontSize: 18, fontWeight: 'bold', marginRight: 40 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 48, gap: 24 },
  heroCard: { position: 'relative', backgroundColor: '#1a2c20', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', padding: 24, alignItems: 'center', overflow: 'hidden', marginTop: 8 },
  heroGlow: { position: 'absolute', top: 0, right: 0, width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(25,230,94,0.08)' },
  heroLabel: { color: '#93c8a5', fontSize: 12, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  heroAmount: { color: '#FFFFFF', fontSize: 44, fontWeight: '800', marginBottom: 16, letterSpacing: -1 },
  growthBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(25,230,94,0.1)', borderWidth: 1, borderColor: 'rgba(25,230,94,0.2)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999 },
  growthText: { color: '#19e65e', fontSize: 14, fontWeight: 'bold' },
  filtersRow: { gap: 12, paddingBottom: 4 },
  filterChip: { height: 36, flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 16, borderRadius: 999, backgroundColor: '#24382a', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  filterChipActive: { backgroundColor: '#19e65e', borderColor: '#19e65e' },
  filterText: { color: '#FFFFFF', fontSize: 14, fontWeight: '500' },
  filterTextActive: { color: '#112116', fontWeight: 'bold' },
  activitySection: { gap: 16 },
  activityHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  activityTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold' },
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
  emptyState: { alignItems: 'center', paddingVertical: 48, gap: 12 },
  emptyText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  emptySubText: { color: '#6b7280', fontSize: 14, textAlign: 'center' },
});

export default VaultHistoryScreen;
