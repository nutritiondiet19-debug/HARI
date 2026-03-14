import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl,
  TouchableOpacity, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import {
  getDietLogsByDate, getWaterLogByDate, getWorkoutLogsByDate,
  getUserProfile, getTodayDateStr,
} from '../../services/firestoreService';
import AnimatedProgressRing from '../../components/AnimatedProgressRing';
import GlassmorphismCard from '../../components/GlassmorphismCard';
import MealCard from '../../components/MealCard';
import SkeletonLoader from '../../components/SkeletonLoader';
import { BorderRadius, FontSize, FontWeight, Spacing, Shadow, Colors } from '../../theme';

const QuickStat = ({ label, value, unit, color, icon }) => {
  const { theme } = useTheme();
  return (
    <View style={[styles.quickStat, { backgroundColor: theme.card, borderColor: theme.border }, Shadow.sm]}>
      <View style={[styles.quickStatIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <Text style={[styles.quickStatValue, { color: theme.textPrimary }]}>{value}</Text>
      <Text style={[styles.quickStatLabel, { color: theme.textSecondary }]}>{label}</Text>
      <Text style={[styles.quickStatUnit, { color }]}>{unit}</Text>
    </View>
  );
};

const DashboardScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { theme, isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState(null);
  const [dietLogs, setDietLogs] = useState([]);
  const [waterTotal, setWaterTotal] = useState(0);
  const [workoutLogs, setWorkoutLogs] = useState([]);

  const today = getTodayDateStr();

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      const [p, meals, water, workouts] = await Promise.all([
        getUserProfile(user.uid),
        getDietLogsByDate(user.uid, today),
        getWaterLogByDate(user.uid, today),
        getWorkoutLogsByDate(user.uid, today),
      ]);
      setProfile(p);
      setDietLogs(meals);
      setWaterTotal(water);
      setWorkoutLogs(workouts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const onRefresh = () => { setRefreshing(true); fetchData(); };

  // Aggregations
  const totalCalories = dietLogs.reduce((s, l) => s + (l.calories || 0), 0);
  const calGoal = profile?.dailyCalorieGoal || 2000;
  const waterGoal = profile?.waterGoal || 2500;
  const totalCalBurn = workoutLogs.reduce((s, w) => s + (w.caloriesBurned || 0), 0);
  const calProgress = Math.min(totalCalories / calGoal, 1);
  const waterProgress = Math.min(waterTotal / waterGoal, 1);

  // Group meals
  const mealGroups = { breakfast: [], lunch: [], dinner: [], snacks: [] };
  dietLogs.forEach(log => {
    const meal = log.meal || 'snacks';
    if (mealGroups[meal]) mealGroups[meal].push(log);
  });

  const todayDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={{ padding: 24, paddingTop: 60 }}>
          <SkeletonLoader type="card" />
          <SkeletonLoader type="card" />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {/* Header */}
        <LinearGradient colors={['#22c55e', '#3b82f6']} style={styles.header} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>Good {getGreeting()}! 👋</Text>
              <Text style={styles.userName}>{profile?.name || user?.displayName || 'User'}</Text>
              <Text style={styles.dateText}>{todayDate}</Text>
            </View>
            <TouchableOpacity
              style={styles.profileBtn}
              onPress={() => navigation.navigate('Settings')}
            >
              <Ionicons name="person" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Calories Card */}
        <View style={styles.sectionPadding}>
          <GlassmorphismCard style={{ marginTop: -24 }}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Daily Calories</Text>
            <View style={styles.calorieRingRow}>
              <AnimatedProgressRing
                size={140}
                strokeWidth={14}
                progress={calProgress}
                color={Colors.accentOrange}
                backgroundColor={isDark ? '#334155' : '#f1f5f9'}
              >
                <View style={{ alignItems: 'center' }}>
                  <Text style={[styles.ringValue, { color: theme.textPrimary }]}>{totalCalories}</Text>
                  <Text style={[styles.ringLabel, { color: theme.textSecondary }]}>kcal</Text>
                </View>
              </AnimatedProgressRing>

              <View style={styles.calStats}>
                <View style={styles.calStatRow}>
                  <View style={[styles.calDot, { backgroundColor: Colors.accentOrange }]} />
                  <View>
                    <Text style={[styles.calStatVal, { color: theme.textPrimary }]}>{totalCalories}</Text>
                    <Text style={[styles.calStatLab, { color: theme.textSecondary }]}>Consumed</Text>
                  </View>
                </View>
                <View style={styles.calStatRow}>
                  <View style={[styles.calDot, { backgroundColor: Colors.primary }]} />
                  <View>
                    <Text style={[styles.calStatVal, { color: theme.textPrimary }]}>{Math.max(calGoal - totalCalories, 0)}</Text>
                    <Text style={[styles.calStatLab, { color: theme.textSecondary }]}>Remaining</Text>
                  </View>
                </View>
                <View style={styles.calStatRow}>
                  <View style={[styles.calDot, { backgroundColor: Colors.accentPurple }]} />
                  <View>
                    <Text style={[styles.calStatVal, { color: theme.textPrimary }]}>{totalCalBurn}</Text>
                    <Text style={[styles.calStatLab, { color: theme.textSecondary }]}>Burned</Text>
                  </View>
                </View>
              </View>
            </View>
          </GlassmorphismCard>

          {/* Quick Stats */}
          <View style={styles.quickStatsRow}>
            <QuickStat label="Water" value={waterTotal} unit="ml" color={Colors.accentBlue} icon="water" />
            <QuickStat label="Workouts" value={workoutLogs.length} unit="done" color={Colors.accentPurple} icon="barbell" />
            <QuickStat label="Goal" value={calGoal} unit="kcal" color={Colors.primary} icon="flag" />
          </View>

          {/* Water & Workout quick access */}
          <View style={styles.quickAccessRow}>
            <TouchableOpacity
              style={[styles.quickAccessBtn, { backgroundColor: Colors.accentBlue + '20', borderColor: Colors.accentBlue }]}
              onPress={() => navigation.navigate('Water')}
            >
              <Ionicons name="water" size={18} color={Colors.accentBlue} />
              <Text style={[styles.quickAccessText, { color: Colors.accentBlue }]}>Water</Text>
              <AnimatedProgressRing size={32} strokeWidth={4} progress={waterProgress} color={Colors.accentBlue} backgroundColor="#dbeafe">
                <Text style={{ fontSize: 8, color: Colors.accentBlue, fontWeight: '700' }}>
                  {Math.round(waterProgress * 100)}%
                </Text>
              </AnimatedProgressRing>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickAccessBtn, { backgroundColor: Colors.accentPurple + '20', borderColor: Colors.accentPurple }]}
              onPress={() => navigation.navigate('Workout')}
            >
              <Ionicons name="barbell" size={18} color={Colors.accentPurple} />
              <Text style={[styles.quickAccessText, { color: Colors.accentPurple }]}>Workout</Text>
              <Text style={{ fontSize: 12, color: Colors.accentPurple, fontWeight: '700' }}>{totalCalBurn} cal</Text>
            </TouchableOpacity>
          </View>

          {/* Today's Meals */}
          <Text style={[styles.sectionTitle, { color: theme.textPrimary, marginTop: 8 }]}>Today's Meals</Text>

          {Object.entries(mealGroups).map(([meal, items]) => (
            <MealCard
              key={meal}
              meal={meal}
              items={items}
              totalCalories={items.reduce((s, i) => s + (i.calories || 0), 0)}
              onAddFood={(m) => navigation.navigate('AddMeal', { meal: m })}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Morning';
  if (h < 17) return 'Afternoon';
  return 'Evening';
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 56, paddingHorizontal: 24, paddingBottom: 48 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  greeting: { color: 'rgba(255,255,255,0.8)', fontSize: FontSize.sm, marginBottom: 4 },
  userName: { color: '#fff', fontSize: 24, fontWeight: '800' },
  dateText: { color: 'rgba(255,255,255,0.7)', fontSize: FontSize.sm, marginTop: 4 },
  profileBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center',
  },
  sectionPadding: { paddingHorizontal: 16, paddingBottom: 32 },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, marginBottom: 14, marginTop: 4 },
  calorieRingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  ringValue: { fontSize: 22, fontWeight: '800' },
  ringLabel: { fontSize: FontSize.xs },
  calStats: { gap: 16 },
  calStatRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  calDot: { width: 10, height: 10, borderRadius: 5 },
  calStatVal: { fontSize: FontSize.md, fontWeight: FontWeight.bold },
  calStatLab: { fontSize: FontSize.xs },
  quickStatsRow: { flexDirection: 'row', gap: 10, marginTop: 16, marginBottom: 12 },
  quickStat: {
    flex: 1, alignItems: 'center', padding: 12,
    borderRadius: BorderRadius.lg, borderWidth: 1, gap: 4,
  },
  quickStatIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  quickStatValue: { fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  quickStatLabel: { fontSize: 10 },
  quickStatUnit: { fontSize: 9, fontWeight: FontWeight.semibold },
  quickAccessRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  quickAccessBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', padding: 14,
    borderRadius: BorderRadius.lg, borderWidth: 1.5, gap: 8,
  },
  quickAccessText: { flex: 1, fontWeight: FontWeight.semibold, fontSize: FontSize.sm },
});

export default DashboardScreen;
