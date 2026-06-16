import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import type { ExpenseCategory } from '../../db/types';

interface AddCategoryModalProps {
  visible: boolean;
  categoryToEdit?: ExpenseCategory | null;
  onSave: (
    name: string,
    description: string,
    icon: string,
    color: { light: string; dark: string; bg: string },
    plannedAmount: number
  ) => Promise<void>;
  onEdit?: (
    id: number,
    name: string,
    description: string,
    icon: string,
    color: { light: string; dark: string; bg: string },
    plannedAmount: number
  ) => Promise<void>;
  onClose: () => void;
}

// Curated modern color presets
const COLOR_PRESETS = [
  { light: '#19e65e', dark: '#19e65e', bg: 'rgba(25,230,94,0.2)', name: 'Emerald' },
  { light: '#fbbf24', dark: '#facc15', bg: 'rgba(251,191,36,0.2)', name: 'Gold' },
  { light: '#3b82f6', dark: '#60a5fa', bg: 'rgba(59,130,246,0.2)', name: 'Blue' },
  { light: '#a855f7', dark: '#c084fc', bg: 'rgba(168,85,247,0.2)', name: 'Purple' },
  { light: '#f43f5e', dark: '#fb7185', bg: 'rgba(244,63,94,0.2)', name: 'Rose' },
  { light: '#06b6d4', dark: '#22d3ee', bg: 'rgba(6,182,212,0.2)', name: 'Teal' },
  { light: '#f97316', dark: '#fb923c', bg: 'rgba(249,115,22,0.2)', name: 'Orange' },
  { light: '#6366f1', dark: '#818cf8', bg: 'rgba(99,102,241,0.2)', name: 'Indigo' },
];

// Curated modern icon presets
const ICON_PRESETS = [
  'shopping-cart',
  'restaurant',
  'home',
  'directions-car',
  'directions-bus',
  'wifi',
  'movie',
  'local-hospital',
  'school',
  'fitness-center',
  'card-giftcard',
  'flight',
  'pets',
  'build',
  'electrical-services',
  'payment',
  'local-bar',
  'work',
];

export const AddCategoryModal: React.FC<AddCategoryModalProps> = ({
  visible,
  categoryToEdit = null,
  onSave,
  onEdit,
  onClose,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [amountInput, setAmountInput] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(ICON_PRESETS[0]);
  const [selectedColor, setSelectedColor] = useState(COLOR_PRESETS[0]);

  // Reset or load state when modal opens
  useEffect(() => {
    if (visible) {
      if (categoryToEdit) {
        setName(categoryToEdit.name);
        setDescription(categoryToEdit.description);
        setAmountInput(String(categoryToEdit.planned_amount));
        setSelectedIcon(categoryToEdit.icon);
        
        let parsedColor = COLOR_PRESETS[0];
        try {
          const catColor = JSON.parse(categoryToEdit.color);
          const matchedPreset = COLOR_PRESETS.find(
            (p) => p.light === catColor.light || p.dark === catColor.dark
          );
          if (matchedPreset) parsedColor = matchedPreset;
          else parsedColor = { ...catColor, name: 'Custom' };
        } catch (e) {
          console.error(e);
        }
        setSelectedColor(parsedColor);
      } else {
        setName('');
        setDescription('');
        setAmountInput('');
        setSelectedIcon(ICON_PRESETS[0]);
        setSelectedColor(COLOR_PRESETS[0]);
      }
    }
  }, [visible, categoryToEdit]);

  const handleSave = async () => {
    if (!name.trim()) return;
    const amount = parseFloat(amountInput.replace(/[^0-9.]/g, '')) || 0;

    if (categoryToEdit && onEdit) {
      await onEdit(
        categoryToEdit.id,
        name.trim(),
        description.trim(),
        selectedIcon,
        {
          light: selectedColor.light,
          dark: selectedColor.dark,
          bg: selectedColor.bg,
        },
        amount
      );
    } else {
      await onSave(
        name.trim(),
        description.trim(),
        selectedIcon,
        {
          light: selectedColor.light,
          dark: selectedColor.dark,
          bg: selectedColor.bg,
        },
        amount
      );
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
          <View style={[styles.topDecoration, { backgroundColor: selectedColor.light }]} />
          
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContainer}
          >
            <Text style={styles.modalTitle}>{categoryToEdit ? 'Edit Category' : 'New Category'}</Text>
            
            {/* Live Preview Card */}
            <View style={styles.previewContainer}>
              <View style={[styles.categoryIconPreview, { backgroundColor: selectedColor.bg }]}>
                <MaterialIcons name={selectedIcon as any} size={28} color={selectedColor.dark} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.previewName}>{name.trim() || 'Category Name'}</Text>
                <Text style={[styles.previewAmount, { color: selectedColor.light }]}>
                  ${(parseFloat(amountInput) || 0).toFixed(2)}
                </Text>
              </View>
            </View>

            {/* Inputs */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Name</Text>
              <TextInput
                style={styles.textInput}
                value={name}
                onChangeText={setName}
                placeholder="e.g. Groceries"
                placeholderTextColor="#6b7280"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Planned Monthly Budget ($)</Text>
              <TextInput
                style={styles.textInput}
                value={amountInput}
                onChangeText={setAmountInput}
                keyboardType="numeric"
                placeholder="0.00"
                placeholderTextColor="#6b7280"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description (Optional)</Text>
              <TextInput
                style={styles.textInput}
                value={description}
                onChangeText={setDescription}
                placeholder="e.g. Weekly supermarket runs"
                placeholderTextColor="#6b7280"
              />
            </View>

            {/* Icon Picker */}
            <View style={styles.pickerGroup}>
              <Text style={styles.inputLabel}>Select Icon</Text>
              <View style={styles.iconGrid}>
                {ICON_PRESETS.map((iconName) => {
                  const isSelected = selectedIcon === iconName;
                  return (
                    <TouchableOpacity
                      key={iconName}
                      style={[
                        styles.iconGridItem,
                        isSelected && {
                          backgroundColor: selectedColor.bg,
                          borderColor: selectedColor.light,
                        },
                      ]}
                      onPress={() => setSelectedIcon(iconName)}
                      activeOpacity={0.7}
                    >
                      <MaterialIcons
                        name={iconName as any}
                        size={22}
                        color={isSelected ? selectedColor.light : '#9ca3af'}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Color Picker */}
            <View style={styles.pickerGroup}>
              <Text style={styles.inputLabel}>Select Theme Color</Text>
              <View style={styles.colorRow}>
                {COLOR_PRESETS.map((color) => {
                  const isSelected = selectedColor.name === color.name;
                  return (
                    <TouchableOpacity
                      key={color.name}
                      style={[
                        styles.colorCircle,
                        { backgroundColor: color.light },
                        isSelected && styles.colorCircleSelected,
                      ]}
                      onPress={() => setSelectedColor(color)}
                      activeOpacity={0.7}
                    >
                      {isSelected && (
                        <MaterialIcons name="check" size={16} color="#112116" />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Buttons */}
            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  !name.trim() && styles.disabledButton,
                  name.trim() && { backgroundColor: selectedColor.light },
                ]}
                onPress={handleSave}
                disabled={!name.trim()}
                activeOpacity={0.85}
              >
                <Text style={styles.confirmButtonText}>{categoryToEdit ? 'Save Changes' : 'Create Category'}</Text>
                <MaterialIcons name={categoryToEdit ? 'done' : 'add'} size={20} color="#112116" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={onClose} activeOpacity={0.7}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
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
    maxHeight: '85%',
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
  topDecoration: { height: 6, width: '100%' },
  scrollContainer: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 24 },
  modalTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '800', marginBottom: 16, letterSpacing: -0.5 },
  previewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: '#112116',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  categoryIconPreview: { width: 56, height: 56, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  previewName: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  previewAmount: { fontSize: 14, fontWeight: '600', marginTop: 2 },
  inputGroup: { width: '100%', marginBottom: 16 },
  inputLabel: { color: '#9ca3af', fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  textInput: {
    width: '100%',
    backgroundColor: '#112116',
    borderWidth: 1,
    borderColor: 'rgba(25,230,94,0.15)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#FFFFFF',
    fontSize: 15,
  },
  pickerGroup: { width: '100%', marginBottom: 20 },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    backgroundColor: '#112116',
    borderWidth: 1,
    borderColor: 'rgba(25,230,94,0.15)',
    borderRadius: 8,
    padding: 12,
  },
  iconGridItem: {
    width: 42,
    height: 42,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
    backgroundColor: '#1a2c20',
  },
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    backgroundColor: '#112116',
    borderWidth: 1,
    borderColor: 'rgba(25,230,94,0.15)',
    borderRadius: 8,
    padding: 12,
    justifyContent: 'space-between',
  },
  colorCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorCircleSelected: {
    borderColor: '#FFFFFF',
  },
  actionsContainer: { width: '100%', gap: 10, marginTop: 8 },
  confirmButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    shadowColor: '#19e65e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledButton: {
    backgroundColor: '#4b5563',
    shadowOpacity: 0,
    elevation: 0,
  },
  confirmButtonText: { color: '#112116', fontWeight: 'bold', fontSize: 16 },
  cancelButton: { width: '100%', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#4b5563', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8 },
  cancelButtonText: { color: '#d1d5db', fontWeight: 'bold', fontSize: 16 },
});

export default AddCategoryModal;
