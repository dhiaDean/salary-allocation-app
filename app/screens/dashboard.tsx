import React, { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

// Custom Components
import BudgetUsage from '../components/BudgetUsage';
import Drawer from '../components/Drawer';
import Header from '../components/Header';
import MetricCards from '../components/MetricCards';
import QuickActions from '../components/QuickActions';

const Dashboard = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Dashboard Content */}
        <Header onMenuPress={() => setIsDrawerOpen(true)} />
        <MetricCards />
        <BudgetUsage />
        <QuickActions />
      </ScrollView>
      <Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </>
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