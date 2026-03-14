import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { FontSize, FontWeight, BorderRadius, Spacing, Shadow } from '../theme';
import MacrosBar from './MacrosBar';

const MEAL_ICONS = {
  breakfast: '🌅',
  lunch: '☀️',
  dinner: '🌙',
  snacks: '🍎',
};

const MealCard = ({ meal = 'breakfast', items = [], totalCalories = 0, onAddFood }) => {
  const { theme } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const heightAnim = useSharedValue(0);
  const rotateAnim = useSharedValue(0);

  const toggle = () => {
    const newExpanded = !expanded;
    setExpanded(newExpanded);
    heightAnim.value = withSpring(newExpanded ? 1 : 0, { damping: 15 });
    rotateAnim.value = withTiming(newExpanded ? 1 : 0, { duration: 250 });
  };

  const arrowStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotateAnim.value * 180}deg` }],
  }));

  const macroTotals = items.reduce(
    (acc, item) => ({
      protein: acc.protein + (item.protein || 0),
      carbs: acc.carbs + (item.carbs || 0),
      fat: acc.fat + (item.fat || 0),
    }),
    { protein: 0, carbs: 0, fat: 0 }
  );

  return (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }, Shadow.sm]}>
      {/* Header */}
      <TouchableOpacity style={styles.header} onPress={toggle} activeOpacity={0.8}>
        <View style={styles.headerLeft}>
          <Text style={styles.emoji}>{MEAL_ICONS[meal]}</Text>
          <View>
            <Text style={[styles.mealName, { color: theme.textPrimary }]}>
              {meal.charAt(0).toUpperCase() + meal.slice(1)}
            </Text>
            <Text style={[styles.cals, { color: theme.textSecondary }]}>
              {totalCalories} kcal · {items.length} items
            </Text>
          </View>
        </View>
        <Animated.View style={arrowStyle}>
          <Ionicons name="chevron-down" size={20} color={theme.textLight} />
        </Animated.View>
      </TouchableOpacity>

      {/* Expanded Content */}
      {expanded && (
        <View style={styles.content}>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          {items.length === 0 ? (
            <Text style={[styles.empty, { color: theme.textLight }]}>No foods logged yet</Text>
          ) : (
            items.map((item, i) => (
              <View key={i} style={styles.foodRow}>
                <Text style={[styles.foodName, { color: theme.textPrimary }]} numberOfLines={1}>
                  {item.foodName}
                </Text>
                <Text style={[styles.foodCals, { color: theme.primary }]}>
                  {item.calories} kcal
                </Text>
              </View>
            ))
          )}
          {items.length > 0 && (
            <MacrosBar protein={macroTotals.protein} carbs={macroTotals.carbs} fat={macroTotals.fat} />
          )}
          <TouchableOpacity
            style={[styles.addBtn, { borderColor: theme.primary }]}
            onPress={() => onAddFood && onAddFood(meal)}
          >
            <Ionicons name="add" size={18} color={theme.primary} />
            <Text style={[styles.addBtnText, { color: theme.primary }]}>Add Food</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  emoji: { fontSize: 28 },
  mealName: { fontSize: FontSize.md, fontWeight: FontWeight.semibold },
  cals: { fontSize: FontSize.sm, marginTop: 2 },
  content: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.md },
  divider: { height: 1, marginBottom: Spacing.sm },
  empty: { textAlign: 'center', fontSize: FontSize.sm, paddingVertical: Spacing.sm },
  foodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  foodName: { fontSize: FontSize.sm, flex: 1, marginRight: 8 },
  foodCals: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingVertical: 8,
    marginTop: Spacing.sm,
  },
  addBtnText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
});

export default MealCard;
