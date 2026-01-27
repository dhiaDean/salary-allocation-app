
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const BudgetUsage: React.FC = () => {
  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={() => router.push('/salary-expenses')}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Budget Usage</Text>
          <Text style={styles.subtitle}>January 2026</Text>
        </View>
        <View style={styles.usageContainer}>
          <Text style={styles.percentage}>65%</Text>
          <Text style={styles.usageText}>Used</Text>
        </View>
      </View>
      <View style={styles.progressBarBackground}>
        <View 
          style={[styles.progressBarFill, { width: '65%' }]}
        />
      </View>
      <View style={styles.footer}>
        <Text style={styles.footerText}>$2,350 Spent</Text>
        <Text style={[styles.footerText, { color: '#9ca3af' }]}>$1,850 Remaining</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1b2e21',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginTop: 24,
    marginHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 14,
    color: '#93c8a5',
  },
  usageContainer: {
    alignItems: 'flex-end',
  },
  percentage: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  usageText: {
    fontSize: 12,
    color: '#9ca3af', // gray-400
  },
  progressBarBackground: {
    width: '100%',
    backgroundColor: 'rgba(107, 114, 128, 0.5)', // gray-700/50
    borderRadius: 999,
    height: 12,
    marginVertical: 4,
  },
  progressBarFill: {
    backgroundColor: '#19e65e',
    height: 12,
    borderRadius: 999,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  footerText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#93c8a5',
  }
});

export default BudgetUsage;
