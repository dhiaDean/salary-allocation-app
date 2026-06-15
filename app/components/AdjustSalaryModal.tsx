import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

interface AdjustSalaryModalProps {
  visible: boolean;
  currentSalary: number;
  onSave: (amount: number) => Promise<void>;
  onClose: () => void;
}

export const AdjustSalaryModal: React.FC<AdjustSalaryModalProps> = ({
  visible,
  currentSalary,
  onSave,
  onClose,
}) => {
  const [salaryInput, setSalaryInput] = useState('');

  useEffect(() => {
    if (visible) {
      setSalaryInput(currentSalary > 0 ? currentSalary.toString() : '');
    }
  }, [visible, currentSalary]);

  const handleSave = async () => {
    const raw = parseFloat(salaryInput.replace(/[^0-9.]/g, ''));
    if (!isNaN(raw)) {
      await onSave(raw);
    }
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.centeredView}
      >
        <View style={styles.modalCard}>
          <View style={styles.topDecoration} />
          <View style={styles.modalBody}>
            <View style={styles.iconContainer}>
              <View style={styles.iconGlow} />
              <View style={styles.iconWrapper}>
                <MaterialIcons name="payments" size={32} color="#19e65e" />
              </View>
            </View>
            <Text style={styles.modalTitle}>Adjust Monthly Salary</Text>
            <Text style={styles.modalDescription}>
              Enter your monthly primary salary to allocate funds.
            </Text>

            <TextInput
              style={styles.salaryInput}
              value={salaryInput}
              onChangeText={setSalaryInput}
              keyboardType="numeric"
              placeholder="$ 0.00"
              placeholderTextColor="#4b5563"
              autoFocus
            />

            <View style={styles.actionsContainer}>
              <TouchableOpacity style={styles.confirmButton} onPress={handleSave} activeOpacity={0.85}>
                <Text style={styles.confirmButtonText}>Save Salary</Text>
                <MaterialIcons name="check" size={20} color="#112116" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={onClose} activeOpacity={0.7}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
  centeredView: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
  modalCard: {
    width: '100%',
    maxWidth: 384,
    backgroundColor: '#1b2e21',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(25,230,94,0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 20,
  },
  topDecoration: { height: 6, width: '100%', backgroundColor: '#19e65e', opacity: 0.8 },
  modalBody: { paddingHorizontal: 24, paddingTop: 32, paddingBottom: 24, alignItems: 'center' },
  iconContainer: { marginBottom: 16, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  iconGlow: { position: 'absolute', width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(25,230,94,0.15)' },
  iconWrapper: { backgroundColor: '#112116', borderWidth: 2, borderColor: 'rgba(25,230,94,0.3)', borderRadius: 999, padding: 16, alignItems: 'center', justifyContent: 'center' },
  modalTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '800', marginBottom: 8, textAlign: 'center', letterSpacing: -0.5 },
  modalDescription: { color: '#d1d5db', fontSize: 14, fontWeight: '500', lineHeight: 20, textAlign: 'center', paddingHorizontal: 8, marginBottom: 20 },
  salaryInput: {
    width: '100%',
    backgroundColor: '#112116',
    borderWidth: 1,
    borderColor: 'rgba(25,230,94,0.3)',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  actionsContainer: { width: '100%', gap: 12 },
  confirmButton: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#19e65e', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 8, shadowColor: '#19e65e', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6 },
  confirmButtonText: { color: '#112116', fontWeight: 'bold', fontSize: 16 },
  cancelButton: { width: '100%', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#4b5563', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 8 },
  cancelButtonText: { color: '#d1d5db', fontWeight: 'bold', fontSize: 16 },
});

export default AdjustSalaryModal;
