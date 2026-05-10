import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

interface CloseMonthModalProps {
  visible: boolean;
  month?: string;
  savingsAmount?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const CloseMonthModal: React.FC<CloseMonthModalProps> = ({
  visible,
  month = 'January 2026',
  savingsAmount = '$1,200',
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>
      <View style={styles.centeredView}>
        <View style={styles.modalCard}>
          <View style={styles.topDecoration} />
          <View style={styles.modalBody}>
            <View style={styles.iconContainer}>
              <View style={styles.iconGlow} />
              <View style={styles.iconWrapper}>
                <MaterialIcons name="lock" size={32} color="#19e65e" />
              </View>
            </View>
            <Text style={styles.modalTitle}>Close {month}?</Text>
            <Text style={styles.modalDescription}>
              Closing the month will lock all values permanently and transfer savings{' '}
              <Text style={styles.savingsHighlight}>{savingsAmount}</Text> to the Savings Vault.
            </Text>
            <View style={styles.actionsContainer}>
              <TouchableOpacity style={styles.confirmButton} onPress={onConfirm} activeOpacity={0.85}>
                <Text style={styles.confirmButtonText}>Confirm &amp; Close</Text>
                <MaterialIcons name="arrow-forward" size={20} color="#112116" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={onCancel} activeOpacity={0.7}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.modalFooter}>
            <Text style={styles.footerText}>Action cannot be undone</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
  centeredView: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
  modalCard: { width: '100%', maxWidth: 384, backgroundColor: '#1F2937', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#374151', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 24, elevation: 20 },
  topDecoration: { height: 6, width: '100%', backgroundColor: '#19e65e', opacity: 0.8 },
  modalBody: { paddingHorizontal: 24, paddingTop: 32, paddingBottom: 24, alignItems: 'center' },
  iconContainer: { marginBottom: 20, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  iconGlow: { position: 'absolute', width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(25,230,94,0.2)' },
  iconWrapper: { backgroundColor: '#1C2E22', borderWidth: 2, borderColor: 'rgba(25,230,94,0.3)', borderRadius: 999, padding: 16, alignItems: 'center', justifyContent: 'center' },
  modalTitle: { color: '#FFFFFF', fontSize: 22, fontWeight: '800', marginBottom: 12, textAlign: 'center', letterSpacing: -0.5 },
  modalDescription: { color: '#d1d5db', fontSize: 15, fontWeight: '500', lineHeight: 22, textAlign: 'center', paddingHorizontal: 8 },
  savingsHighlight: { color: '#19e65e', fontWeight: 'bold' },
  actionsContainer: { width: '100%', marginTop: 32, gap: 12 },
  confirmButton: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#19e65e', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 8, shadowColor: '#19e65e', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6 },
  confirmButtonText: { color: '#112116', fontWeight: 'bold', fontSize: 16 },
  cancelButton: { width: '100%', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#4b5563', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 8 },
  cancelButtonText: { color: '#d1d5db', fontWeight: 'bold', fontSize: 16 },
  modalFooter: { backgroundColor: '#1a232f', paddingVertical: 12, alignItems: 'center', borderTopWidth: 1, borderColor: '#374151' },
  footerText: { color: '#6b7280', fontSize: 12, fontWeight: '500' },
});

export default CloseMonthModal;
