
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const QuickActions: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quick Actions</Text>
      <View style={styles.actionsContainer}>
        {/* Update Spent Amount → links to Salary & Expenses (same as Budget Usage widget) */}
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push('/salary-expenses')}
          activeOpacity={0.85}
        >
          <MaterialIcons name="add-circle" size={24} color="#112116" />
          <Text style={styles.primaryButtonText}>Update Spent Amount</Text>
        </TouchableOpacity>

        <View style={styles.secondaryActions}>
          {/* View Vault → Savings Vault History */}
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push('/vault-history')}
            activeOpacity={0.75}
          >
            <View style={styles.secondaryButtonIconWrapper}>
              <MaterialIcons name="lock" size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.secondaryButtonText}>View Vault</Text>
          </TouchableOpacity>

          {/* Analyze Trends → Charts & Insights */}
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push('/charts-insights')}
            activeOpacity={0.75}
          >
            <View style={styles.secondaryButtonIconWrapper}>
              <MaterialIcons name="insights" size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.secondaryButtonText}>Analyze Trends</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    gap: 16,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  actionsContainer: {
    gap: 16,
  },
  primaryButton: {
    backgroundColor: '#19e65e',
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButtonText: {
    color: '#112116',
    fontWeight: 'bold',
    fontSize: 16,
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: 16,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#1b2e21',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    height: 128,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  secondaryButtonIconWrapper: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
    fontSize: 14,
  },
});

export default QuickActions;
