import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useDatabase } from '../../db/DatabaseContext';
import type { ExpenseEntryWithCategory, Transaction } from '../../db/types';

interface TransactionManagerModalProps {
  visible: boolean;
  expense: ExpenseEntryWithCategory | null;
  onClose: () => void;
}

const TransactionManagerModal: React.FC<TransactionManagerModalProps> = ({
  visible,
  expense,
  onClose,
}) => {
  const {
    currentMonth,
    addNewTransaction,
    removeTransaction,
    getTransactionsForBudget,
  } = useDatabase();

  const [expenseTxs, setExpenseTxs] = useState<Transaction[]>([]);
  const [txAmount, setTxAmount] = useState('');
  const [txDesc, setTxDesc] = useState('');
  const [txLoading, setTxLoading] = useState(false);

  useEffect(() => {
    if (visible && expense) {
      loadTransactions();
    } else {
      setExpenseTxs([]);
      setTxAmount('');
      setTxDesc('');
    }
  }, [visible, expense]);

  const loadTransactions = async () => {
    if (!expense) return;
    setTxLoading(true);
    try {
      const txs = await getTransactionsForBudget(expense.id);
      setExpenseTxs(txs);
    } catch (err) {
      console.error(err);
    } finally {
      setTxLoading(false);
    }
  };

  const handleAddTx = async () => {
    if (!expense) return;
    const parsedAmount = parseFloat(txAmount.replace(/[^0-9.]/g, ''));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid positive amount.');
      return;
    }
    setTxLoading(true);
    try {
      await addNewTransaction(expense.id, parsedAmount, txDesc.trim() || 'Expense');
      await loadTransactions();
      setTxAmount('');
      setTxDesc('');
    } catch (err) {
      console.error(err);
    } finally {
      setTxLoading(false);
    }
  };

  const handleRemoveTx = async (txId: number) => {
    if (!expense) return;
    Alert.alert(
      'Delete Transaction',
      'Are you sure you want to delete this expense?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setTxLoading(true);
            try {
              await removeTransaction(txId);
              await loadTransactions();
            } catch (err) {
              console.error(err);
            } finally {
              setTxLoading(false);
            }
          },
        },
      ]
    );
  };

  if (!expense || !currentMonth) return null;

  const color = JSON.parse(expense.color);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderTitleRow}>
              <View style={[styles.expenseIconWrapper, { backgroundColor: color.bg, marginRight: 12 }]}>
                <MaterialIcons name={expense.icon as any} size={24} color={color.dark} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>{expense.name}</Text>
                <Text style={styles.modalSubtitle}>{expense.description}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.modalCloseBtn} onPress={onClose}>
              <MaterialIcons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Budget Overview Card */}
          <View style={styles.modalSummaryCard}>
            <View style={styles.modalSummaryRow}>
              <View>
                <Text style={styles.modalSummaryLabel}>PLANNED</Text>
                <Text style={styles.modalSummaryValue}>${expense.planned_amount}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.modalSummaryLabel}>TOTAL SPENT</Text>
                <Text
                  style={[
                    styles.modalSummaryValue,
                    {
                      color:
                        expense.spent_amount > expense.planned_amount
                          ? '#f87171'
                          : '#19e65e',
                    },
                  ]}
                >
                  ${expense.spent_amount}
                </Text>
              </View>
            </View>
          </View>

          {/* Transactions List */}
          <Text style={styles.txListTitle}>Transactions Ledger</Text>
          {txLoading && expenseTxs.length === 0 ? (
            <ActivityIndicator size="small" color="#19e65e" style={{ marginVertical: 24 }} />
          ) : expenseTxs.length === 0 ? (
            <View style={styles.emptyTxsContainer}>
              <MaterialIcons name="receipt-long" size={36} color="#4b5563" />
              <Text style={styles.emptyTxsText}>No expenses logged this month.</Text>
            </View>
          ) : (
            <ScrollView style={styles.txListScroll}>
              {expenseTxs.map((tx) => (
                <View key={tx.id} style={styles.txItem}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.txItemDesc}>{tx.description}</Text>
                    <Text style={styles.txItemDate}>
                      {new Date(tx.spent_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <Text style={styles.txItemAmount}>${tx.amount.toFixed(2)}</Text>
                    {currentMonth.status === 'open' && (
                      <TouchableOpacity onPress={() => handleRemoveTx(tx.id)}>
                        <MaterialIcons name="delete-outline" size={20} color="#f87171" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}
            </ScrollView>
          )}

          {/* Add Transaction Form (Only if Month is Open) */}
          {currentMonth.status === 'open' && (
            <View style={styles.addTxForm}>
              <Text style={styles.formTitle}>Add New Expense</Text>
              <View style={styles.formRow}>
                <TextInput
                  style={[styles.formInput, styles.formInputAmount]}
                  placeholder="$ 0.00"
                  placeholderTextColor="#4b5563"
                  value={txAmount}
                  onChangeText={setTxAmount}
                  keyboardType="numeric"
                />
                <TextInput
                  style={[styles.formInput, styles.formInputDesc]}
                  placeholder="Description (e.g. Walmart)"
                  placeholderTextColor="#4b5563"
                  value={txDesc}
                  onChangeText={setTxDesc}
                />
                <TouchableOpacity
                  style={styles.addTxBtn}
                  onPress={handleAddTx}
                  disabled={txLoading}
                >
                  {txLoading ? (
                    <ActivityIndicator size="small" color="#112116" />
                  ) : (
                    <MaterialIcons name="add" size={24} color="#112116" />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.75)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#112116', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40, borderTopWidth: 1, borderColor: 'rgba(25,230,94,0.2)', maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalHeaderTitleRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF' },
  modalSubtitle: { fontSize: 14, color: '#9ca3af', marginTop: 2 },
  modalCloseBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center' },
  expenseIconWrapper: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  modalSummaryCard: { backgroundColor: '#1A2C22', borderRadius: 12, padding: 16, borderLeftWidth: 4, borderLeftColor: '#19e65e', marginBottom: 20 },
  modalSummaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  modalSummaryLabel: { fontSize: 10, fontWeight: 'bold', color: '#9ca3af', letterSpacing: 0.5, marginBottom: 4 },
  modalSummaryValue: { fontSize: 20, fontWeight: '800', color: '#FFFFFF' },
  txListTitle: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 12, letterSpacing: -0.2 },
  txListScroll: { maxHeight: 250, marginBottom: 20 },
  emptyTxsContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 32, gap: 8, opacity: 0.8 },
  emptyTxsText: { color: '#9ca3af', fontSize: 14, fontWeight: '500' },
  txItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  txItemDesc: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  txItemDate: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  txItemAmount: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF' },
  addTxForm: { borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.05)', paddingTop: 16 },
  formTitle: { fontSize: 14, fontWeight: 'bold', color: '#9ca3af', marginBottom: 10, textTransform: 'uppercase' },
  formRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  formInput: { backgroundColor: '#1A2C22', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, color: '#FFFFFF', fontSize: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  formInputAmount: { width: 85 },
  formInputDesc: { flex: 1 },
  addTxBtn: { width: 44, height: 44, borderRadius: 8, backgroundColor: '#19e65e', alignItems: 'center', justifyContent: 'center' },
});

export default TransactionManagerModal;
