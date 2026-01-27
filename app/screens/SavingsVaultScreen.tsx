
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar } from 'react-native';

const historyData = [
    { month: 'January 2026', type: 'Monthly Contribution', amount: 1320, hasNote: true, icon: 'savings', iconBg: 'rgba(25, 230, 94, 0.1)', iconColor: '#19e65e' },
    { month: 'December 2025', type: 'Year-end Bonus', amount: 980, hasNote: true, icon: 'calendar_month', iconBg: 'rgba(255, 255, 255, 0.05)', iconColor: 'rgba(255, 255, 255, 0.6)' },
    { month: 'November 2025', type: 'Monthly Contribution', amount: 1100, hasNote: false, icon: 'calendar_month', iconBg: 'rgba(255, 255, 255, 0.05)', iconColor: 'rgba(255, 255, 255, 0.6)' },
    { month: 'October 2025', type: 'Automatic Transfer', amount: 1100, hasNote: false, icon: 'calendar_month', iconBg: 'rgba(255, 255, 255, 0.05)', iconColor: 'rgba(255, 255, 255, 0.6)' },
    { month: 'September 2025', type: 'Automatic Transfer', amount: 1100, hasNote: false, icon: 'calendar_month', iconBg: 'rgba(255, 255, 255, 0.05)', iconColor: 'rgba(255, 255, 255, 0.6)', faded: true },
];

const SavingsVaultScreen: React.FC = () => {
    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" backgroundColor="#112116" />
            
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton}>
                    <Text style={[styles.icon, { fontSize: 24 }]}>arrow_back</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Vault History</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {/* Total Savings Card */}
                <View style={styles.totalSavingsCard}>
                    <View style={styles.cardBackgroundPattern} />
                    <Text style={styles.totalSavingsLabel}>Total Accumulated Savings</Text>
                    <Text style={styles.totalSavingsAmount}>$15,420.00</Text>
                    <View style={styles.percentageBadge}>
                        <Text style={[styles.icon, { color: '#19e65e', fontSize: 18 }]}>trending_up</Text>
                        <Text style={styles.percentageText}>+12.5% this year</Text>
                    </View>
                </View>

                {/* Filters */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersContainer}>
                    <TouchableOpacity style={styles.filterButtonActive}>
                        <Text style={styles.filterTextActive}>All Time</Text>
                        <Text style={[styles.icon, { color: '#112116', fontSize: 20 }]}>expand_more</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.filterButton}>
                        <Text style={styles.filterText}>2026</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.filterButton}>
                        <Text style={styles.filterText}>2025</Text>
                    </TouchableOpacity>
                </ScrollView>
                
                {/* Recent Activity */}
                <View style={styles.activitySection}>
                    <View style={styles.activityHeader}>
                        <Text style={styles.activityTitle}>Recent Activity</Text>
                        <TouchableOpacity>
                            <Text style={styles.exportButton}>Export</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.activityList}>
                        {historyData.map((item, index) => (
                            <TouchableOpacity key={index} style={[styles.historyItem, item.faded && { opacity: 0.6 }]}>
                                <View style={styles.historyItemLeft}>
                                    <View style={[styles.historyIconWrapper, { backgroundColor: item.iconBg }]}>
                                        <Text style={[styles.icon, { color: item.iconColor }]}>{item.icon}</Text>
                                    </View>
                                    <View>
                                        <Text style={styles.historyMonth}>{item.month}</Text>
                                        <Text style={styles.historyType}>{item.type}</Text>
                                    </View>
                                </View>
                                <View style={styles.historyItemRight}>
                                    <Text style={styles.historyAmount}>+${item.amount.toLocaleString()}</Text>
                                    <Text style={[styles.icon, { fontSize: 18, color: item.hasNote ? '#19e65e' : 'transparent'}]}>description</Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#112116' },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
    backButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { flex: 1, textAlign: 'center', color: '#FFFFFF', fontSize: 18, fontWeight: 'bold', marginRight: 40 },
    scrollContainer: { paddingHorizontal: 16, paddingBottom: 32, gap: 24 },
    totalSavingsCard: { backgroundColor: '#1a2c20', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)', padding: 24, alignItems: 'center', overflow: 'hidden', marginTop: 8 },
    cardBackgroundPattern: { position: 'absolute', inset: 0, opacity: 0.2, backgroundColor: 'transparent' /* Placeholder for complex gradient */ },
    totalSavingsLabel: { color: '#93c8a5', fontSize: 14, fontWeight: '500', textTransform: 'uppercase', marginBottom: 8 },
    totalSavingsAmount: { color: '#FFFFFF', fontSize: 40, fontWeight: '800', marginBottom: 16 },
    percentageBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(25, 230, 94, 0.1)', borderWidth: 1, borderColor: 'rgba(25, 230, 94, 0.2)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999 },
    percentageText: { color: '#19e65e', fontSize: 14, fontWeight: 'bold' },
    icon: { fontFamily: 'Material Symbols Outlined', color: '#FFFFFF' },
    filtersContainer: { gap: 12, paddingBottom: 4 },
    filterButton: { height: 36, backgroundColor: '#24382a', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 18, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' },
    filterButtonActive: { height: 36, backgroundColor: '#19e65e', borderRadius: 18, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
    filterText: { color: '#FFFFFF', fontSize: 14, fontWeight: '500' },
    filterTextActive: { color: '#112116', fontSize: 14, fontWeight: 'bold' },
    activitySection: { gap: 16 },
    activityHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    activityTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold' },
    exportButton: { color: '#19e65e', fontSize: 14, fontWeight: '600' },
    activityList: { gap: 12 },
    historyItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1a2c20', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)' },
    historyItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    historyIconWrapper: { width: 48, height: 48, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    historyMonth: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
    historyType: { color: '#93c8a5', fontSize: 12, fontWeight: '500' },
    historyItemRight: { alignItems: 'flex-end', gap: 4 },
    historyAmount: { color: '#19e65e', fontSize: 18, fontWeight: 'bold' },
});

export default SavingsVaultScreen;
