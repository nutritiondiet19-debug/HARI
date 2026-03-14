import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar,
} from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { addWaterLog, getWaterLogByDate, getUserProfile, getTodayDateStr } from '../../services/firestoreService';
import AnimatedProgressRing from '../../components/AnimatedProgressRing';
import { BorderRadius, FontSize, FontWeight, Colors, Shadow } from '../../theme';

const QUICK_AMOUNTS = [150, 250, 350, 500];

const WaterTrackerScreen = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const { user } = useAuth();
  const [waterTotal, setWaterTotal] = useState(0);
  const [waterGoal, setWaterGoal] = useState(2500);
  const [loading, setLoading] = useState(false);

  // Water fill animation (0 to 1)
  const fillProgress = useSharedValue(0);
  const rippleScale = useSharedValue(0);
  const rippleOpacity = useSharedValue(0);

  const fetchData = useCallback(async () => {
    if (!user) return;
    const [profile, water] = await Promise.all([
      getUserProfile(user.uid).catch(() => null),
      getWaterLogByDate(user.uid, getTodayDateStr()),
    ]);
    if (profile?.waterGoal) setWaterGoal(profile.waterGoal);
    setWaterTotal(water);
    fillProgress.value = withTiming(Math.min(water / (profile?.waterGoal || 2500), 1), { duration: 1200 });
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAddWater = async (amount) => {
    if (!user || loading) return;
    setLoading(true);
    try {
      await addWaterLog(user.uid, amount);
      const newTotal = Math.min(waterTotal + amount, waterGoal * 1.5);
      setWaterTotal(newTotal);
      fillProgress.value = withSpring(Math.min(newTotal / waterGoal, 1));

      // Ripple animation
      rippleScale.value = 0;
      rippleOpacity.value = 0.6;
      rippleScale.value = withTiming(2, { duration: 600 });
      rippleOpacity.value = withTiming(0, { duration: 600 });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fillStyle = useAnimatedStyle(() => ({
    height: `${fillProgress.value * 100}%`,
  }));

  const rippleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: rippleScale.value }],
    opacity: rippleOpacity.value,
  }));

  const progress = Math.min(waterTotal / waterGoal, 1);
  const remaining = Math.max(waterGoal - waterTotal, 0);
  const cups = Math.floor(waterTotal / 250);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <LinearGradient colors={['#38bdf8', '#0ea5e9']} style={styles.header} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Water Tracker</Text>
        <Text style={styles.headerSub}>Stay hydrated! 💧</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Main Ring + Bottle */}
        <View style={styles.ringSection}>
          <AnimatedProgressRing
            size={200}
            strokeWidth={16}
            progress={progress}
            color="#38bdf8"
            backgroundColor={isDark ? '#1e40af44' : '#dbeafe'}
          >
            {/* Animated fill bottle visualization */}
            <View style={styles.bottleContainer}>
              <View style={[styles.bottle, { borderColor: '#38bdf8', backgroundColor: isDark ? '#0f172a' : '#f0f9ff' }]}>
                <Animated.View style={[styles.fill, fillStyle, { backgroundColor: '#38bdf8' }]} />
                {/* Ripple */}
                <Animated.View style={[styles.ripple, rippleStyle, { borderColor: '#38bdf8' }]} />
              </View>
            </View>
          </AnimatedProgressRing>
          <Text style={[styles.totalText, { color: theme.textPrimary }]}>{waterTotal} ml</Text>
          <Text style={[styles.goalText, { color: theme.textSecondary }]}>of {waterGoal} ml goal</Text>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }, Shadow.sm]}>
            <Ionicons name="checkmark-circle" size={24} color="#22c55e" />
            <Text style={[styles.statValue, { color: theme.textPrimary }]}>{Math.round(progress * 100)}%</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Complete</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }, Shadow.sm]}>
            <Ionicons name="water" size={24} color="#38bdf8" />
            <Text style={[styles.statValue, { color: theme.textPrimary }]}>{cups}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Cups</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }, Shadow.sm]}>
            <Ionicons name="hourglass-outline" size={24} color={Colors.accentOrange} />
            <Text style={[styles.statValue, { color: theme.textPrimary }]}>{remaining}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>ml left</Text>
          </View>
        </View>

        {/* Quick Add Buttons */}
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Quick Add</Text>
        <View style={styles.quickBtns}>
          {QUICK_AMOUNTS.map(amount => (
            <TouchableOpacity
              key={amount}
              style={[styles.quickBtn, { backgroundColor: theme.card, borderColor: '#38bdf8' }, Shadow.sm]}
              onPress={() => handleAddWater(amount)}
              activeOpacity={0.8}
            >
              <Text style={styles.dropEmoji}>💧</Text>
              <Text style={[styles.quickBtnValue, { color: '#38bdf8' }]}>{amount}</Text>
              <Text style={[styles.quickBtnUnit, { color: theme.textSecondary }]}>ml</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Motivational message */}
        <View style={[styles.motivationCard, { backgroundColor: '#dbeafe' }]}>
          <Text style={styles.motivationEmoji}>
            {progress >= 1 ? '🏆' : progress >= 0.5 ? '💪' : '🌊'}
          </Text>
          <Text style={[styles.motivationText, { color: '#1e40af' }]}>
            {progress >= 1
              ? "Amazing! You've hit your daily water goal!"
              : progress >= 0.5
              ? `Halfway there! ${remaining}ml more to go.`
              : "Keep drinking! Hydration is key to health."}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 56, paddingHorizontal: 24, paddingBottom: 32 },
  backBtn: { marginBottom: 12 },
  headerTitle: { color: '#fff', fontSize: 28, fontWeight: '800' },
  headerSub: { color: 'rgba(255,255,255,0.8)', fontSize: FontSize.md, marginTop: 4 },
  scroll: { padding: 20, paddingBottom: 40, gap: 20 },
  ringSection: { alignItems: 'center', gap: 8 },
  bottleContainer: { alignItems: 'center', justifyContent: 'center' },
  bottle: {
    width: 52, height: 80, borderRadius: 8, borderWidth: 2,
    overflow: 'hidden', justifyContent: 'flex-end',
  },
  fill: { width: '100%', borderRadius: 4 },
  ripple: {
    position: 'absolute', width: 100, height: 100,
    borderRadius: 50, borderWidth: 2,
    alignSelf: 'center', top: -25,
  },
  totalText: { fontSize: 36, fontWeight: '800', marginTop: 12 },
  goalText: { fontSize: FontSize.md },
  statsRow: { flexDirection: 'row', gap: 12 },
  statCard: {
    flex: 1, alignItems: 'center', padding: 16,
    borderRadius: BorderRadius.lg, borderWidth: 1, gap: 6,
  },
  statValue: { fontSize: FontSize.xl, fontWeight: '800' },
  statLabel: { fontSize: 11 },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  quickBtns: { flexDirection: 'row', gap: 10 },
  quickBtn: {
    flex: 1, alignItems: 'center', padding: 16,
    borderRadius: BorderRadius.lg, borderWidth: 1.5, gap: 4,
  },
  dropEmoji: { fontSize: 24 },
  quickBtnValue: { fontSize: FontSize.lg, fontWeight: '800' },
  quickBtnUnit: { fontSize: 11 },
  motivationCard: { borderRadius: BorderRadius.lg, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  motivationEmoji: { fontSize: 32 },
  motivationText: { flex: 1, fontSize: FontSize.sm, lineHeight: 20, fontWeight: FontWeight.medium },
});

export default WaterTrackerScreen;
