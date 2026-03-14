import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { addDietLog } from '../../services/firestoreService';
import MealCard from '../../components/MealCard';
import FloatingActionButton from '../../components/FloatingActionButton';
import { BorderRadius, FontSize, FontWeight, Shadow, Colors } from '../../theme';

const MEAL_TYPES = [
  { key: 'breakfast', label: 'Breakfast', emoji: '🌅', color: '#f97316' },
  { key: 'lunch', label: 'Lunch', emoji: '☀️', color: '#22c55e' },
  { key: 'dinner', label: 'Dinner', emoji: '🌙', color: '#3b82f6' },
  { key: 'snacks', label: 'Snacks', emoji: '🍎', color: '#a855f7' },
];

const AddMealScreen = ({ navigation, route }) => {
  const { theme, isDark } = useTheme();
  const { user } = useAuth();
  const [activeMeal, setActiveMeal] = useState(route?.params?.meal || 'breakfast');
  const [selectedFood, setSelectedFood] = useState(route?.params?.selectedFood || null);
  const [quantity, setQuantity] = useState('1');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!selectedFood) {
      return navigation.navigate('FoodSearch', { meal: activeMeal });
    }
    setSaving(true);
    try {
      const qty = parseFloat(quantity) || 1;
      await addDietLog(user.uid, {
        foodId: selectedFood.id,
        foodName: selectedFood.name,
        calories: Math.round(selectedFood.calories * qty),
        protein: Math.round(selectedFood.protein * qty),
        carbs: Math.round(selectedFood.carbs * qty),
        fat: Math.round(selectedFood.fat * qty),
        meal: activeMeal,
        quantity: qty,
        servingSize: selectedFood.servingSize,
      });
      Alert.alert('✅ Added!', `${selectedFood.name} added to ${activeMeal}.`, [
        { text: 'Add More', onPress: () => { setSelectedFood(null); setQuantity('1'); } },
        { text: 'Done', onPress: () => navigation.navigate('Dashboard') },
      ]);
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setSaving(false);
    }
  };

  const mealInfo = MEAL_TYPES.find(m => m.key === activeMeal);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <LinearGradient colors={[mealInfo?.color || Colors.primary, Colors.secondary]} style={styles.header} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerEmoji}>{mealInfo?.emoji}</Text>
          <Text style={styles.headerTitle}>Add to {mealInfo?.label}</Text>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Meal Selector */}
        <View style={styles.mealSelector}>
          {MEAL_TYPES.map(m => (
            <TouchableOpacity
              key={m.key}
              style={[
                styles.mealTab,
                { backgroundColor: activeMeal === m.key ? m.color : theme.card, borderColor: activeMeal === m.key ? m.color : theme.border },
              ]}
              onPress={() => setActiveMeal(m.key)}
            >
              <Text style={styles.mealTabEmoji}>{m.emoji}</Text>
              <Text style={[styles.mealTabLabel, { color: activeMeal === m.key ? '#fff' : theme.textSecondary }]}>
                {m.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Selected Food Card */}
        {selectedFood ? (
          <View style={[styles.selectedFood, { backgroundColor: theme.card, borderColor: Colors.primary }, Shadow.md]}>
            <View style={styles.selectedFoodRow}>
              <View style={[styles.foodIconBox, { backgroundColor: Colors.primary + '20' }]}>
                <Text style={{ fontSize: 28 }}>🥗</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.foodName, { color: theme.textPrimary }]}>{selectedFood.name}</Text>
                <Text style={[styles.foodServing, { color: theme.textSecondary }]}>{selectedFood.servingSize}</Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedFood(null)}>
                <Ionicons name="close-circle" size={24} color={theme.textLight} />
              </TouchableOpacity>
            </View>

            {/* Quantity */}
            <View style={styles.quantityRow}>
              <Text style={[styles.quantityLabel, { color: theme.textSecondary }]}>Quantity</Text>
              <View style={styles.quantityControls}>
                <TouchableOpacity
                  style={[styles.quantityBtn, { backgroundColor: theme.border }]}
                  onPress={() => setQuantity(q => String(Math.max(0.5, parseFloat(q) - 0.5)))}
                >
                  <Ionicons name="remove" size={20} color={theme.textPrimary} />
                </TouchableOpacity>
                <TextInput
                  style={[styles.quantityInput, { color: theme.textPrimary, borderColor: theme.border }]}
                  value={quantity}
                  onChangeText={setQuantity}
                  keyboardType="decimal-pad"
                />
                <TouchableOpacity
                  style={[styles.quantityBtn, { backgroundColor: Colors.primary }]}
                  onPress={() => setQuantity(q => String(parseFloat(q) + 0.5))}
                >
                  <Ionicons name="add" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Macro Summary */}
            <View style={styles.macroRow}>
              {[
                { label: 'Calories', value: Math.round(selectedFood.calories * (parseFloat(quantity) || 1)), color: Colors.accentOrange, unit: 'kcal' },
                { label: 'Protein', value: Math.round(selectedFood.protein * (parseFloat(quantity) || 1)), color: '#3b82f6', unit: 'g' },
                { label: 'Carbs', value: Math.round(selectedFood.carbs * (parseFloat(quantity) || 1)), color: Colors.accentOrange, unit: 'g' },
                { label: 'Fat', value: Math.round(selectedFood.fat * (parseFloat(quantity) || 1)), color: Colors.accentPurple, unit: 'g' },
              ].map(macro => (
                <View key={macro.label} style={[styles.macroItem, { backgroundColor: macro.color + '15' }]}>
                  <Text style={[styles.macroValue, { color: macro.color }]}>{macro.value}</Text>
                  <Text style={[styles.macroUnit, { color: theme.textSecondary }]}>{macro.unit}</Text>
                  <Text style={[styles.macroLabel, { color: theme.textSecondary }]}>{macro.label}</Text>
                </View>
              ))}
            </View>

            {/* Save Button */}
            <TouchableOpacity onPress={handleSave} activeOpacity={0.9} style={{ marginTop: 8 }}>
              <LinearGradient colors={[mealInfo?.color || Colors.primary, Colors.secondary]} style={styles.saveBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Log Food'}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          /* Search Prompt */
          <TouchableOpacity
            style={[styles.searchPrompt, { backgroundColor: theme.card, borderColor: theme.border, borderStyle: 'dashed' }, Shadow.sm]}
            onPress={() => navigation.navigate('FoodSearch', { meal: activeMeal })}
          >
            <Ionicons name="search" size={36} color={theme.textLight} />
            <Text style={[styles.searchPromptText, { color: theme.textPrimary }]}>Search for a food</Text>
            <Text style={[styles.searchPromptSub, { color: theme.textSecondary }]}>
              Browse thousands of foods or scan a barcode
            </Text>
            <View style={[styles.searchBtnInline, { backgroundColor: Colors.primary }]}>
              <Text style={{ color: '#fff', fontWeight: FontWeight.semibold }}>Browse Foods</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Barcode Scanner shortcut */}
        <TouchableOpacity
          style={[styles.scannerShortcut, { backgroundColor: theme.card, borderColor: theme.border }, Shadow.sm]}
          onPress={() => navigation.navigate('Scanner', { meal: activeMeal })}
        >
          <Ionicons name="barcode-outline" size={22} color={Colors.secondary} />
          <Text style={[styles.scannerText, { color: theme.textPrimary }]}>Scan Barcode</Text>
          <Ionicons name="chevron-forward" size={18} color={theme.textLight} />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 32 },
  backBtn: { marginBottom: 14 },
  headerContent: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerEmoji: { fontSize: 36 },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: FontWeight.bold },
  scroll: { padding: 16, gap: 16, paddingBottom: 40 },
  mealSelector: { flexDirection: 'row', gap: 8 },
  mealTab: {
    flex: 1, alignItems: 'center', paddingVertical: 12,
    borderRadius: BorderRadius.lg, borderWidth: 1.5, gap: 4,
  },
  mealTabEmoji: { fontSize: 20 },
  mealTabLabel: { fontSize: 10, fontWeight: FontWeight.semibold },
  selectedFood: { borderRadius: BorderRadius.xl, padding: 20, borderWidth: 1.5, gap: 16 },
  selectedFoodRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  foodIconBox: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  foodName: { fontSize: FontSize.md, fontWeight: FontWeight.bold },
  foodServing: { fontSize: FontSize.sm, marginTop: 2 },
  quantityRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  quantityLabel: { fontSize: FontSize.md, fontWeight: FontWeight.semibold },
  quantityControls: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  quantityBtn: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  quantityInput: {
    width: 56, textAlign: 'center', fontSize: FontSize.lg,
    fontWeight: FontWeight.bold, borderWidth: 1, borderRadius: 8, paddingVertical: 6,
  },
  macroRow: { flexDirection: 'row', gap: 8 },
  macroItem: { flex: 1, alignItems: 'center', padding: 10, borderRadius: BorderRadius.md, gap: 2 },
  macroValue: { fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  macroUnit: { fontSize: 9 },
  macroLabel: { fontSize: 9 },
  saveBtn: { borderRadius: BorderRadius.full, paddingVertical: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 },
  saveBtnText: { color: '#fff', fontSize: FontSize.md, fontWeight: FontWeight.bold },
  searchPrompt: {
    alignItems: 'center', padding: 36, borderRadius: BorderRadius.xl,
    borderWidth: 2, gap: 10,
  },
  searchPromptText: { fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  searchPromptSub: { fontSize: FontSize.sm, textAlign: 'center' },
  searchBtnInline: { paddingHorizontal: 24, paddingVertical: 10, borderRadius: BorderRadius.full },
  scannerShortcut: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 16, borderRadius: BorderRadius.lg, borderWidth: 1,
  },
  scannerText: { flex: 1, fontSize: FontSize.md, fontWeight: FontWeight.medium },
});

export default AddMealScreen;
