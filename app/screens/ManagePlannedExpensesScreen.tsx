import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface ExpenseCategory {
  id: string;
  name: string;
  amount: number;
  icon: string;
  iconColor: string;
  iconBg: string;
}

const initialCategories: ExpenseCategory[] = [
  { id: '1', name: 'Rent', amount: 1200, icon: 'home', iconColor: '#19e65e', iconBg: 'rgba(25,230,94,0.15)' },
  { id: '2', name: 'Food & Dining', amount: 400, icon: 'restaurant', iconColor: '#f97316', iconBg: 'rgba(249,115,22,0.15)' },
  { id: '3', name: 'Transport', amount: 150, icon: 'directions-bus', iconColor: '#a78bfa', iconBg: 'rgba(167,139,250,0.15)' },
  { id: '4', name: 'Utilities', amount: 120, icon: 'wifi', iconColor: '#2dd4bf', iconBg: 'rgba(45,212,191,0.15)' },
  { id: '5', name: 'Entertainment', amount: 200, icon: 'movie', iconColor: '#f472b6', iconBg: 'rgba(244,114,182,0.15)' },
];

const ManagePlannedExpensesScreen: React.FC = () => {
  const [categories, setCategories] = useState<ExpenseCategory[]>(initialCategories);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleEdit = (item: ExpenseCategory) => {
    setEditingId(item.id);
    setEditValue(String(item.amount));
  };

  const handleSaveEdit = (id: string) => {
    const parsed = parseFloat(editValue.replace(/[^0-9.]/g, ''));
    if (!isNaN(parsed)) {
      setCategories(prev => prev.map(c => c.id === id ? { ...c, amount: parsed } : c));
    }
    setEditingId(null);
    setEditValue('');
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Category', 'Are you sure you want to remove this category?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => setCategories(prev => prev.filter(c => c.id !== id)) },
    ]);
  };

  const handleAdd = () => {
    Alert.alert('Add Category', 'This would open a form to add a new expense category.');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#112116" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn}>
          <MaterialIcons name="arrow-back-ios-new" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Planned Expenses</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Add New Category Button */}
        <TouchableOpacity style={styles.addButton} onPress={handleAdd} activeOpacity={0.85}>
          <MaterialIcons name="add" size={22} color="#112116" />
          <Text style={styles.addButtonText}>Add New Category</Text>
        </TouchableOpacity>

        {/* Categories List */}
        <Text style={styles.listSectionLabel}>Current Budget</Text>
        <View style={styles.listCard}>
          {categories.map((item, index) => (
            <View key={item.id} style={[styles.listItem, index < categories.length - 1 && styles.listItemBorder]}>
              <View style={styles.listItemLeft}>
                <View style={[styles.categoryIcon, { backgroundColor: item.iconBg }]}>
                  <MaterialIcons name={item.icon as any} size={24} color={item.iconColor} />
                </View>
                <View>
                  <Text style={styles.categoryName}>{item.name}</Text>
                  {editingId === item.id ? (
                    <TextInput
                      style={styles.amountInput}
                      value={editValue}
                      onChangeText={setEditValue}
                      keyboardType="numeric"
                      autoFocus
                      onBlur={() => handleSaveEdit(item.id)}
                      onSubmitEditing={() => handleSaveEdit(item.id)}
                    />
                  ) : (
                    <Text style={styles.categoryAmount}>${item.amount.toFixed(2)}</Text>
                  )}
                </View>
              </View>
              <View style={styles.listItemActions}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => handleEdit(item)}>
                  <MaterialIcons name="edit" size={20} color="#9ca3af" />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={() => handleDelete(item.id)}>
                  <MaterialIcons name="delete" size={20} color="#9ca3af" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <MaterialIcons name="info-outline" size={16} color="#6b7280" />
          <Text style={styles.disclaimerText}>
            Changes made to planned amounts will apply to future monthly budgets starting next month. Closed months will remain unchanged.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#112116' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20 },
  headerTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  scrollContent: { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 40 },
  addButton: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#19e65e', height: 56, borderRadius: 12, marginBottom: 32, shadowColor: '#19e65e', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 12, elevation: 6 },
  addButtonText: { color: '#112116', fontWeight: 'bold', fontSize: 16 },
  listSectionLabel: { color: '#6b7280', fontSize: 12, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, paddingHorizontal: 4 },
  listCard: { backgroundColor: '#1a2c20', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', marginBottom: 24 },
  listItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  listItemBorder: { borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  listItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 16, flex: 1 },
  categoryIcon: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  categoryName: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  categoryAmount: { color: 'rgba(25,230,94,0.8)', fontSize: 14, fontWeight: '500', marginTop: 2 },
  amountInput: { color: '#19e65e', fontSize: 14, fontWeight: '500', borderBottomWidth: 1, borderColor: '#19e65e', minWidth: 80, paddingVertical: 2 },
  listItemActions: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  deleteBtn: {},
  disclaimer: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingHorizontal: 8, opacity: 0.7 },
  disclaimerText: { flex: 1, color: '#9ca3af', fontSize: 13, lineHeight: 20 },
});

export default ManagePlannedExpensesScreen;
