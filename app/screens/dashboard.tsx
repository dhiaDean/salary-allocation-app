import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';

// Custom Components
import BudgetUsage from '../components/BudgetUsage';
import Header from '../components/Header';
import MetricCards from '../components/MetricCards';
import QuickActions from '../components/QuickActions';

const Dashboard = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      

      {/* Dashboard Content */}
      <Header/>
      <MetricCards />
      <BudgetUsage />
      <QuickActions />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingVertical: 20,
    backgroundColor: '#112116',
  },
  header: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});

export default Dashboard;