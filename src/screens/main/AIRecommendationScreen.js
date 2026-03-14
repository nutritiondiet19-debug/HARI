import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, StatusBar,
  TouchableOpacity,
} from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withDelay,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { getUserProfile } from '../../services/firestoreService';
import GlassmorphismCard from '../../components/GlassmorphismCard';
import { BorderRadius, FontSize, FontWeight, Colors, Shadow } from '../../theme';

const AI_MEALS = (goal) => {
  const isLose = goal === 'lose';
  const isGain = goal === 'gain';

  return [
    {
      meal: 'Breakfast',
      emoji: '🌅',
      color: '#f97316',
      calories: isLose ? 350 : isGain ? 550 : 450,
      foods: isLose
        ? ['Oatmeal with berries', 'Green tea', 'Hard-boiled egg']
        : isGain
        ? ['3 scrambled eggs', 'Whole wheat toast', 'Banana', 'Protein shake']
        : ['Greek yogurt with granola', 'Fresh fruit', 'Coffee'],
      macros: { protein: isLose ? 15 : 35, carbs: isLose ? 45 : 65, fat: isLose ? 8 : 12 },
    },
    {
      meal: 'Lunch',
      emoji: '☀️',
      color: '#22c55e',
      calories: isLose ? 450 : isGain ? 750 : 600,
      foods: isLose
        ? ['Grilled chicken salad', 'Lemon dressing', 'Cucumber & tomato']
        : isGain
        ? ['Grilled chicken rice bowl', 'Steamed broccoli', 'Brown rice', 'Avocado']
        : ['Whole grain wrap', 'Turkey & mixed greens', 'Apple'],
      macros: { protein: isLose ? 35 : 55, carbs: isLose ? 40 : 80, fat: isLose ? 12 : 18 },
    },
    {
      meal: 'Dinner',
      emoji: '🌙',
      color: '#3b82f6',
      calories: isLose ? 400 : isGain ? 700 : 550,
      foods: isLose
        ? ['Baked salmon', 'Steamed vegetables', 'Quinoa']
        : isGain
        ? ['Beef stir-fry', 'White rice', 'Mixed vegetables', 'Cottage cheese']
        : ['Lentil soup', 'Whole wheat bread', 'Side salad'],
      macros: { protein: isLose ? 30 : 50, carbs: isLose ? 35 : 75, fat: isLose ? 10 : 22 },
    },
    {
      meal: 'Snacks',
      emoji: '🍎',
      color: '#a855f7',
      calories: isLose ? 150 : isGain ? 350 : 200,
      foods: isLose
        ? ['Apple', 'Almonds (15)']
        : isGain
        ? ['Peanut butter on rice cakes', 'Protein bar', 'Mixed nuts']
        : ['Banana', 'Greek yogurt'],
      macros: { protein: isLose ? 5 : 15, carbs: isLose ? 20 : 35, fat: isLose ? 7 : 14 },
    },
  ];
};

const MealRecommendationCard = ({ meal, index }) => {
  const { theme } = useTheme();
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(30);

  useEffect(() => {
    opacity.value = withDelay(index * 150, withTiming(1, { duration: 500 }));
    translateY.value = withDelay(index * 150, withTiming(0, { duration: 500 }));
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={animStyle}>
      <View style={[styles.recCard, { backgroundColor: theme.card, borderColor: meal.color + '40' }, Shadow.md]}>
        {/* Header */}
        <View style={[styles.recHeader, { backgroundColor: meal.color + '15' }]}>
          <Text style={styles.recEmoji}>{meal.emoji}</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.recMealName, { color: theme.textPrimary }]}>{meal.meal}</Text>
            <Text style={[styles.recCalories, { color: meal.color }]}>{meal.calories} kcal</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: meal.color }]}>
            <Text style={styles.badgeText}>AI</Text>
          </View>
        </View>

        {/* Foods */}
        <View style={styles.foodsList}>
          {meal.foods.map((food, i) => (
            <View key={i} style={styles.foodItem}>
              <View style={[styles.foodDot, { backgroundColor: meal.color }]} />
              <Text style={[styles.foodText, { color: theme.textSecondary }]}>{food}</Text>
            </View>
          ))}
        </View>

        {/* Macros */}
        <View style={styles.macrosRow}>
          <View style={styles.macroChip}>
            <Text style={[styles.macroLabel, { color: '#3b82f6' }]}>Protein</Text>
            <Text style={[styles.macroVal, { color: theme.textPrimary }]}>{meal.macros.protein}g</Text>
          </View>
          <View style={styles.macroChip}>
            <Text style={[styles.macroLabel, { color: Colors.accentOrange }]}>Carbs</Text>
            <Text style={[styles.macroVal, { color: theme.textPrimary }]}>{meal.macros.carbs}g</Text>
          </View>
          <View style={styles.macroChip}>
            <Text style={[styles.macroLabel, { color: Colors.accentPurple }]}>Fat</Text>
            <Text style={[styles.macroVal, { color: theme.textPrimary }]}>{meal.macros.fat}g</Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

const AIRecommendationScreen = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const { user } = useAuth();
  const [goal, setGoal] = useState('maintain');
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (user) {
      getUserProfile(user.uid).then(p => {
        if (p) { setProfile(p); setGoal(p.goal || 'maintain'); }
      });
    }
  }, [user]);

  const meals = AI_MEALS(goal);
  const totalCals = meals.reduce((s, m) => s + m.calories, 0);

  const goalLabels = { lose: 'Weight Loss', maintain: 'Maintenance', gain: 'Muscle Gain' };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" />

      <LinearGradient colors={['#22c55e', '#3b82f6']} style={styles.header} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>AI Diet Plan</Text>
          <Text style={styles.headerSub}>Goal: {goalLabels[goal]} · {totalCals} kcal/day</Text>
        </View>
        <View style={[styles.aiBadge, { backgroundColor: 'rgba(255,255,255,0.25)' }]}>
          <Text style={styles.aiBadgeText}>✨ AI</Text>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Info Card */}
        <View style={[styles.infoCard, { backgroundColor: '#dbeafe' }]}>
          <Ionicons name="information-circle" size={20} color="#1d4ed8" />
          <Text style={[styles.infoText, { color: '#1e40af' }]}>
            This plan is personalized based on your profile:  {profile?.name || 'your'} goal of <Text style={{ fontWeight: '700' }}>{goalLabels[goal]}</Text>
          </Text>
        </View>

        {/* Meal Cards */}
        {meals.map((meal, i) => (
          <MealRecommendationCard key={meal.meal} meal={meal} index={i} />
        ))}

        {/* Daily Total */}
        <View style={[styles.totalCard, { backgroundColor: theme.card, borderColor: Colors.primary }, Shadow.md]}>
          <Text style={[styles.totalTitle, { color: theme.textPrimary }]}>📊 Daily Total</Text>
          <View style={styles.totalStats}>
            <View style={styles.totalStat}>
              <Text style={[styles.totalValue, { color: Colors.accentOrange }]}>{totalCals}</Text>
              <Text style={[styles.totalLabel, { color: theme.textSecondary }]}>kcal</Text>
            </View>
            <View style={styles.totalStat}>
              <Text style={[styles.totalValue, { color: '#3b82f6' }]}>{meals.reduce((s, m) => s + m.macros.protein, 0)}g</Text>
              <Text style={[styles.totalLabel, { color: theme.textSecondary }]}>Protein</Text>
            </View>
            <View style={styles.totalStat}>
              <Text style={[styles.totalValue, { color: Colors.accentOrange }]}>{meals.reduce((s, m) => s + m.macros.carbs, 0)}g</Text>
              <Text style={[styles.totalLabel, { color: theme.textSecondary }]}>Carbs</Text>
            </View>
            <View style={styles.totalStat}>
              <Text style={[styles.totalValue, { color: Colors.accentPurple }]}>{meals.reduce((s, m) => s + m.macros.fat, 0)}g</Text>
              <Text style={[styles.totalLabel, { color: theme.textSecondary }]}>Fat</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 56, paddingHorizontal: 24, paddingBottom: 32, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { marginRight: 12 },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: '800' },
  headerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 2 },
  aiBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: BorderRadius.full },
  aiBadgeText: { color: '#fff', fontWeight: FontWeight.bold },
  scroll: { padding: 20, paddingBottom: 40, gap: 16 },
  infoCard: { flexDirection: 'row', gap: 10, padding: 14, borderRadius: BorderRadius.lg, alignItems: 'flex-start' },
  infoText: { flex: 1, fontSize: FontSize.sm, lineHeight: 20 },
  recCard: { borderRadius: BorderRadius.xl, overflow: 'hidden', borderWidth: 1.5 },
  recHeader: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  recEmoji: { fontSize: 32 },
  recMealName: { fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  recCalories: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, marginTop: 2 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: BorderRadius.full },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: FontWeight.bold },
  foodsList: { paddingHorizontal: 16, paddingBottom: 12, gap: 8 },
  foodItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  foodDot: { width: 7, height: 7, borderRadius: 4 },
  foodText: { fontSize: FontSize.sm },
  macrosRow: { flexDirection: 'row', paddingHorizontal: 16, paddingBottom: 16, gap: 8 },
  macroChip: { flex: 1, alignItems: 'center', padding: 8, backgroundColor: '#f8fafc', borderRadius: BorderRadius.md },
  macroLabel: { fontSize: 10, fontWeight: FontWeight.semibold },
  macroVal: { fontSize: FontSize.md, fontWeight: FontWeight.bold },
  totalCard: { borderRadius: BorderRadius.xl, padding: 20, borderWidth: 1.5, gap: 16 },
  totalTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  totalStats: { flexDirection: 'row', justifyContent: 'space-around' },
  totalStat: { alignItems: 'center', gap: 4 },
  totalValue: { fontSize: FontSize.xl, fontWeight: '800' },
  totalLabel: { fontSize: 11 },
});

export default AIRecommendationScreen;
