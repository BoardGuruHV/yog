import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { FilterState, Category, CATEGORY_LABELS, BODY_PARTS } from '@/types';
import { Button, Input } from '@/components/common';

interface AsanaFilterProps {
  filters: FilterState;
  onFiltersChange: (filters: Partial<FilterState>) => void;
  onReset: () => void;
}

export function AsanaFilter({ filters, onFiltersChange, onReset }: AsanaFilterProps) {
  const [showModal, setShowModal] = useState(false);

  const activeFilterCount =
    filters.categories.length +
    filters.difficulty.length +
    filters.bodyParts.length +
    (filters.search ? 1 : 0);

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <Input
          placeholder="Search poses..."
          value={filters.search}
          onChangeText={(text) => onFiltersChange({ search: text })}
          containerStyle={styles.searchInput}
        />
        <TouchableOpacity style={styles.filterButton} onPress={() => setShowModal(true)}>
          <Text style={styles.filterIcon}>⚙️</Text>
          {activeFilterCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <FilterModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        filters={filters}
        onFiltersChange={onFiltersChange}
        onReset={onReset}
      />
    </View>
  );
}

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  filters: FilterState;
  onFiltersChange: (filters: Partial<FilterState>) => void;
  onReset: () => void;
}

function FilterModal({
  visible,
  onClose,
  filters,
  onFiltersChange,
  onReset,
}: FilterModalProps) {
  const categories = Object.keys(CATEGORY_LABELS) as Category[];
  const difficulties = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  const toggleCategory = (category: Category) => {
    const current = filters.categories;
    const updated = current.includes(category)
      ? current.filter((c) => c !== category)
      : [...current, category];
    onFiltersChange({ categories: updated });
  };

  const toggleDifficulty = (level: number) => {
    const current = filters.difficulty;
    const updated = current.includes(level)
      ? current.filter((d) => d !== level)
      : [...current, level];
    onFiltersChange({ difficulty: updated });
  };

  const toggleBodyPart = (part: string) => {
    const current = filters.bodyParts;
    const updated = current.includes(part)
      ? current.filter((p) => p !== part)
      : [...current, part];
    onFiltersChange({ bodyParts: updated });
  };

  const handleReset = () => {
    onReset();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Filters</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeButton}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          {/* Categories */}
          <Text style={styles.sectionTitle}>Category</Text>
          <View style={styles.chipContainer}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.chip,
                  filters.categories.includes(category) && styles.chipSelected,
                ]}
                onPress={() => toggleCategory(category)}
              >
                <Text
                  style={[
                    styles.chipText,
                    filters.categories.includes(category) && styles.chipTextSelected,
                  ]}
                >
                  {CATEGORY_LABELS[category]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Difficulty */}
          <Text style={styles.sectionTitle}>Difficulty</Text>
          <View style={styles.chipContainer}>
            {difficulties.map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.chip,
                  styles.chipSmall,
                  filters.difficulty.includes(level) && styles.chipSelected,
                ]}
                onPress={() => toggleDifficulty(level)}
              >
                <Text
                  style={[
                    styles.chipText,
                    filters.difficulty.includes(level) && styles.chipTextSelected,
                  ]}
                >
                  {level}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Body Parts */}
          <Text style={styles.sectionTitle}>Target Body Parts</Text>
          <View style={styles.chipContainer}>
            {BODY_PARTS.map((part) => (
              <TouchableOpacity
                key={part}
                style={[
                  styles.chip,
                  filters.bodyParts.includes(part) && styles.chipSelected,
                ]}
                onPress={() => toggleBodyPart(part)}
              >
                <Text
                  style={[
                    styles.chipText,
                    filters.bodyParts.includes(part) && styles.chipTextSelected,
                  ]}
                >
                  {part.charAt(0).toUpperCase() + part.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <View style={styles.modalFooter}>
          <Button
            title="Reset"
            variant="outline"
            onPress={handleReset}
            style={styles.footerButton}
          />
          <Button title="Apply" onPress={onClose} style={styles.footerButton} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    marginBottom: 0,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterIcon: {
    fontSize: 20,
  },
  filterBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
  },
  closeButton: {
    fontSize: 24,
    color: '#64748b',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 12,
    marginTop: 16,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  chipSmall: {
    paddingHorizontal: 12,
    minWidth: 40,
    alignItems: 'center',
  },
  chipSelected: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  chipText: {
    fontSize: 14,
    color: '#475569',
  },
  chipTextSelected: {
    color: '#fff',
    fontWeight: '500',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  footerButton: {
    flex: 1,
  },
});

export default AsanaFilter;
