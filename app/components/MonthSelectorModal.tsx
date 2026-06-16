import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useDatabase } from '../../db/DatabaseContext';

interface MonthSelectorModalProps {
  visible: boolean;
  onClose: () => void;
}

const MONTH_NAMES = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const MonthSelectorModal: React.FC<MonthSelectorModalProps> = ({ visible, onClose }) => {
  const {
    allMonths,
    currentMonth,
    changeActiveMonth,
    startNextMonth,
  } = useDatabase();
  const [loading, setLoading] = useState(false);

  if (!currentMonth) return null;

  const handleSelectMonth = async (monthId: number) => {
    setLoading(true);
    try {
      await changeActiveMonth(monthId);
      onClose();
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to change month.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartNextMonth = async () => {
    setLoading(true);
    try {
      await startNextMonth();
      onClose();
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to start next month.');
    } finally {
      setLoading(false);
    }
  };

  // The latest chronological month will be the first item since they are sorted DESC in queries.ts
  const latestMonth = allMonths[0];
  const isLatestMonthClosed = latestMonth ? latestMonth.status === 'closed' : false;

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
            <Text style={styles.modalTitle}>Select Planning Month</Text>
            <TouchableOpacity style={styles.modalCloseBtn} onPress={onClose}>
              <MaterialIcons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#19e65e" style={{ marginVertical: 40 }} />
          ) : (
            <>
              {/* Scrollable list of months */}
              <ScrollView style={styles.monthList} showsVerticalScrollIndicator={false}>
                {allMonths.map((m) => {
                  const isCurrent = m.id === currentMonth.id;
                  const label = `${MONTH_NAMES[m.month]} ${m.year}`;
                  const isOpen = m.status === 'open';

                  return (
                    <TouchableOpacity
                      key={m.id}
                      style={[styles.monthItem, isCurrent && styles.monthItemActive]}
                      onPress={() => handleSelectMonth(m.id)}
                      activeOpacity={0.8}
                    >
                      <View style={styles.monthItemLeft}>
                        <MaterialIcons
                          name="calendar-month"
                          size={22}
                          color={isCurrent ? '#19e65e' : '#9ca3af'}
                        />
                        <Text style={[styles.monthLabel, isCurrent && styles.monthLabelActive]}>
                          {label}
                        </Text>
                      </View>

                      <View style={styles.monthItemRight}>
                        <View style={[styles.statusBadge, isOpen ? styles.badgeOpen : styles.badgeClosed]}>
                          <Text style={[styles.statusText, isOpen ? styles.statusTextOpen : styles.statusTextClosed]}>
                            {m.status.toUpperCase()}
                          </Text>
                        </View>
                        {isCurrent && (
                          <MaterialIcons name="check" size={20} color="#19e65e" style={{ marginLeft: 8 }} />
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Start Next Month action (Visible if the latest month is locked/closed) */}
              {isLatestMonthClosed && (
                <TouchableOpacity
                  style={styles.startBtn}
                  onPress={handleStartNextMonth}
                  activeOpacity={0.85}
                >
                  <MaterialIcons name="add" size={22} color="#112116" />
                  <Text style={styles.startBtnText}>Start Next Month</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.75)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: '#112116',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderColor: 'rgba(25,230,94,0.2)',
    maxHeight: '75%',
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' },
  modalCloseBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center' },
  monthList: { maxHeight: 300, marginBottom: 20 },
  monthItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
  },
  monthItemActive: {
    backgroundColor: 'rgba(25,230,94,0.05)',
    borderColor: 'rgba(25,230,94,0.1)',
  },
  monthItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  monthLabel: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  monthLabelActive: { color: '#19e65e', fontWeight: 'bold' },
  monthItemRight: { flexDirection: 'row', alignItems: 'center' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  badgeOpen: { backgroundColor: 'rgba(25,230,94,0.1)', borderWidth: 1, borderColor: 'rgba(25,230,94,0.2)' },
  badgeClosed: { backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  statusText: { fontSize: 10, fontWeight: 'bold' },
  statusTextOpen: { color: '#19e65e' },
  statusTextClosed: { color: '#9ca3af' },
  startBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#19e65e',
    height: 52,
    borderRadius: 10,
    shadowColor: '#19e65e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  startBtnText: { color: '#112116', fontWeight: 'bold', fontSize: 16 },
});

export default MonthSelectorModal;
