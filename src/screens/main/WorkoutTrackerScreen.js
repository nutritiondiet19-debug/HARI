import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Alert,
} from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withRepeat, withSequence,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { addWorkoutLog } from '../../services/firestoreService';
import { BorderRadius, FontSize, FontWeight, Colors, Shadow } from '../../theme';

const WORKOUTS = [
  { key: 'running', label: 'Running', emoji: '🏃', calPerMin: 9, color: '#f97316' },
  { key: 'cycling', label: 'Cycling', emoji: '🚴', calPerMin: 7, color: '#22c55e' },
  { key: 'swimming', label: 'Swimming', emoji: '🏊', calPerMin: 8, color: '#38bdf8' },
  { key: 'gym', label: 'Gym / Weights', emoji: '🏋️', calPerMin: 6, color: '#a855f7' },
  { key: 'yoga', label: 'Yoga', emoji: '🧘', calPerMin: 3, color: '#ec4899' },
  { key: 'hiit', label: 'HIIT', emoji: '⚡', calPerMin: 11, color: '#ef4444' },
];

const WorkoutTrackerScreen = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const { user } = useAuth();
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [timerRunning, setTimerRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [saving, setSaving] = useState(false);
  const timerRef = useRef(null);

  const pulseScale = useSharedValue(1);

  useEffect(() => {
    if (timerRunning) {
      pulseScale.value = withRepeat(
        withSequence(withTiming(1.1, { duration: 500 }), withTiming(1, { duration: 500 })),
        -1, true
      );
      timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
    } else {
      pulseScale.value = withTiming(1);
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [timerRunning]);

  const pulseStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulseScale.value }] }));

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const caloriesBurned = selectedWorkout
    ? Math.round((seconds / 60) * selectedWorkout.calPerMin)
    : 0;

  const handleStartStop = () => {
    if (!selectedWorkout) {
      Alert.alert('Select Workout', 'Please select a workout type first.');
      return;
    }
    setTimerRunning(t => !t);
  };

  const handleSave = async () => {
    if (!selectedWorkout || seconds === 0) {
      Alert.alert('No Workout', 'Start a workout first.');
      return;
    }
    setSaving(true);
    try {
      await addWorkoutLog(user.uid, {
        type: selectedWorkout.key,
        label: selectedWorkout.label,
        duration: Math.round(seconds / 60),
        caloriesBurned,
      });
      setTimerRunning(false);
      setSeconds(0);
      Alert.alert('✅ Saved!', `${selectedWorkout.label} logged! You burned ${caloriesBurned} kcal!`, [
        { text: 'Great!', onPress: () => navigation.navigate('Dashboard') },
      ]);
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setSaving(false);
    }
  };

  const workoutColor = selectedWorkout?.color || Colors.primary;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" />

      <LinearGradient colors={[workoutColor, Colors.secondary]} style={styles.header} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Workout Tracker</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Timer Card */}
        <View style={[styles.timerCard, { backgroundColor: theme.card, borderColor: theme.border }, Shadow.md]}>
          <Animated.View style={[styles.timerCircle, { borderColor: workoutColor }, pulseStyle]}>
            <Text style={[styles.timerText, { color: theme.textPrimary }]}>{formatTime(seconds)}</Text>
            <Text style={[styles.timerLabel, { color: theme.textSecondary }]}>
              {selectedWorkout?.label || 'Select Workout'}
            </Text>
          </Animated.View>

          <View style={styles.calorieCounter}>
            <Ionicons name="flame" size={28} color={Colors.accentOrange} />
            <Text style={[styles.calorieValue, { color: Colors.accentOrange }]}>{caloriesBurned}</Text>
            <Text style={[styles.calorieLabel, { color: theme.textSecondary }]}>kcal burned</Text>
          </View>

          <View style={styles.timerControls}>
            <TouchableOpacity
              style={[styles.timerBtn, { backgroundColor: timerRunning ? '#ef4444' : workoutColor }]}
              onPress={handleStartStop}
            >
              <Ionicons name={timerRunning ? 'pause' : 'play'} size={28} color="#fff" />
              <Text style={styles.timerBtnText}>{timerRunning ? 'Pause' : 'Start'}</Text>
            </TouchableOpacity>

            {seconds > 0 && !timerRunning && (
              <TouchableOpacity style={[styles.saveBtn, { backgroundColor: Colors.primary }]} onPress={handleSave}>
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save Workout'}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Workout Type Selection */}
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Choose Workout</Text>
        <View style={styles.workoutGrid}>
          {WORKOUTS.map(w => (
            <TouchableOpacity
              key={w.key}
              style={[
                styles.workoutCard,
                { backgroundColor: theme.card, borderColor: selectedWorkout?.key === w.key ? w.color : theme.border },
                selectedWorkout?.key === w.key && { backgroundColor: w.color + '15' },
                Shadow.sm,
              ]}
              onPress={() => { setSelectedWorkout(w); setSeconds(0); setTimerRunning(false); }}
            >
              <Text style={styles.workoutEmoji}>{w.emoji}</Text>
              <Text style={[styles.workoutLabel, { color: theme.textPrimary }]}>{w.label}</Text>
              <Text style={[styles.workoutCal, { color: w.color }]}>{w.calPerMin} kcal/min</Text>
            </TouchableOpacity>
          ))}
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
  scroll: { padding: 20, paddingBottom: 40, gap: 20 },
  timerCard: { borderRadius: BorderRadius.xl, padding: 28, alignItems: 'center', borderWidth: 1, gap: 20 },
  timerCircle: {
    width: 180, height: 180, borderRadius: 90, borderWidth: 4,
    alignItems: 'center', justifyContent: 'center', gap: 4,
  },
  timerText: { fontSize: 40, fontWeight: '800', fontVariant: ['tabular-nums'] },
  timerLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.medium },
  calorieCounter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  calorieValue: { fontSize: 32, fontWeight: '800' },
  calorieLabel: { fontSize: FontSize.md },
  timerControls: { flexDirection: 'row', gap: 12 },
  timerBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 32, paddingVertical: 14, borderRadius: BorderRadius.full,
  },
  timerBtnText: { color: '#fff', fontSize: FontSize.md, fontWeight: FontWeight.bold },
  saveBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 20, paddingVertical: 14, borderRadius: BorderRadius.full,
  },
  saveBtnText: { color: '#fff', fontWeight: FontWeight.bold },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  workoutGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  workoutCard: {
    width: '47%', alignItems: 'center', padding: 16,
    borderRadius: BorderRadius.lg, borderWidth: 1.5, gap: 6,
  },
  workoutEmoji: { fontSize: 36 },
  workoutLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, textAlign: 'center' },
  workoutCal: { fontSize: 11, fontWeight: FontWeight.medium },
});

export default WorkoutTrackerScreen;
