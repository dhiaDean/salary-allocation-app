import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDatabase } from '../../db/DatabaseContext';
import { addCategory } from '../../db/queries';

const ManagePlannedExpensesScreen: React.FC = () => {
  const { isReady, categories, removeCategory, editCategory, refreshCategories } = useDatabase();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const [editName, setEditName] = useState('');

  if (!isReady) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ActivityIndicator size="large" color="#19e65e" style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  const handleEdit = (id: number, name: string, amount: number) => {
    setEditingId(id);
    setEditName(name);
    setEditValue(String(amount));
  };

  const handleSaveEdit = async (id: number, description: string) => {
    const parsed = parseFloat(editValue.replace(/[^0-9.]/g, ''));
    if (!isNaN(parsed) && editName.trim()) {
      await editCategory(id, editName.trim(), description, parsed);
    }
    setEditingId(null);
    setEditValue('');
    setEditName('');
  };

  const handleDelete = (id: number, name: string) => {
    Alert.alert(
      'Delete Category',
      `Are you sure you want to remove "${name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await removeCategory(id);
          },
        },
      ]
    );
  };

  const handleAdd = () => {
    Alert.prompt(
      'New Category',
      'Enter category name:',
      async (name) => {
        if (!name?.trim()) return;
        await addCategory(
          name.trim(),
          '',
          'category',
          { light: '#19e65e', dark: '#19e65e', bg: 'rgba(25,230,94,0.2)' },
          0
        );
        await refreshCategories();
      },
      'plain-text'
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#112116" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back-ios-new" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Planned Expenses</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Add New Category */}
        <TouchableOpacity style={styles.addButton} onPress={handleAdd} activeOpacity={0.85}>
          <MaterialIcons name="add" size={22} color="#112116" />
          <Text style={styles.addButtonText}>Add New Category</Text>
        </TouchableOpacity>

        {/* Section label */}
        <Text style={styles.listSectionLabel}>Current Budget</Text>

        {/* Categories List */}
        <View style={styles.listCard}>
          {categories.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No categories yet. Add one above!</Text>
            </View>
          ) : (
            categories.map((item, index) => {
              const color = JSON.parse(item.color);
              const isEditing = editingId === item.id;
              return (
                <View
                  key={item.id}
                  style={[styles.listItem, index < categories.length - 1 && styles.listItemBorder]}
                >
                  <View style={styles.listItemLeft}>
                    <View style={[styles.categoryIcon, { backgroundColor: color.bg }]}>
                      <MaterialIcons name={item.icon as any} size={24} color={color.dark} />
                    </View>
                    <View style={{ flex: 1 }}>
                      {isEditing ? (
                        <>
                          <TextInput
                            style={styles.editNameInput}
                            value={editName}
                            onChangeText={setEditName}
                            placeholder="Name"
                            placeholderTextColor="#6b7280"
                            autoFocus
                          />
                          <TextInput
                            style={styles.editAmountInput}
                            value={editValue}
                            onChangeText={setEditValue}
                            keyboardType="numeric"
                            placeholder="Amount"
                            placeholderTextColor="#6b7280"
                            onBlur={() => handleSaveEdit(item.id, item.description)}
                            onSubmitEditing={() => handleSaveEdit(item.id, item.description)}
                          />
                        </>
                      ) : (
                        <>
                          <Text style={styles.categoryName}>{item.name}</Text>
                          <Text style={styles.categoryAmount}>
                            ${item.planned_amount.toFixed(2)}
                          </Text>
                        </>
                      )}
                    </View>
                  </View>
                  <View style={styles.listItemActions}>
                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={() => handleEdit(item.id, item.name, item.planned_amount)}
                    >
                      <MaterialIcons name="edit" size={20} color="#9ca3af" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={() => handleDelete(item.id, item.name)}
                    >
                      <MaterialIcons name="delete" size={20} color="#9ca3af" />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <MaterialIcons name="info-outline" size={16} color="#6b7280" />
          <Text style={styles.disclaimerText}>
            Changes apply to future monthly budgets. Closed months remain unchanged.
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
  addButton: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#19e65e', height: 56, borderRadius: 12, marginBottom: 24, shadowColor: '#19e65e', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 12, elevation: 6 },
  addButtonText: { color: '#112116', fontWeight: 'bold', fontSize: 16 },
  listSectionLabel: { color: '#6b7280', fontSize: 12, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, paddingHorizontal: 4 },
  listCard: { backgroundColor: '#1a2c20', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', marginBottom: 24 },
  listItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  listItemBorder: { borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  listItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 16, flex: 1 },
  categoryIcon: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  categoryName: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  categoryAmount: { color: 'rgba(25,230,94,0.8)', fontSize: 14, fontWeight: '500', marginTop: 2 },
  editNameInput: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold', borderBottomWidth: 1, borderColor: '#19e65e', paddingVertical: 2, marginBottom: 4 },
  editAmountInput: { color: '#19e65e', fontSize: 14, fontWeight: '500', borderBottomWidth: 1, borderColor: '#19e65e', paddingVertical: 2 },
  listItemActions: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  disclaimer: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingHorizontal: 8, opacity: 0.7 },
  disclaimerText: { flex: 1, color: '#9ca3af', fontSize: 13, lineHeight: 20 },
  emptyState: { padding: 32, alignItems: 'center' },
  emptyText: { color: '#6b7280', fontSize: 14, textAlign: 'center' },
});

export default ManagePlannedExpensesScreen;
