import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, StatusBar, KeyboardAvoidingView, Platform,
} from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { saveUserProfile } from '../../services/firestoreService';
import { useTheme } from '../../hooks/useTheme';
import { BorderRadius, FontSize, FontWeight, Shadow, Spacing, Colors } from '../../theme';

const STEPS = ['Name', 'Age', 'Body', 'Gender', 'Goal'];

const GOALS = [
  { key: 'lose', label: 'Lose Weight', emoji: '⬇️', color: '#ef4444' },
  { key: 'maintain', label: 'Maintain Weight', emoji: '⚖️', color: '#f97316' },
  { key: 'gain', label: 'Gain Muscle', emoji: '💪', color: '#22c55e' },
];

const GENDERS = [
  { key: 'male', label: 'Male', emoji: '👨' },
  { key: 'female', label: 'Female', emoji: '👩' },
  { key: 'other', label: 'Other', emoji: '🧑' },
];

const ProfileSetupScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [name, setName] = useState(user?.displayName || '');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [gender, setGender] = useState('');
  const [goal, setGoal] = useState('');
  const [loading, setLoading] = useState(false);

  const progressWidth = useSharedValue(0);
  const cardOpacity = useSharedValue(1);

  const progressAnim = useAnimatedStyle(() => ({
    width: `${(step / (STEPS.length - 1)) * 100}%`,
  }));

  const cardAnim = useAnimatedStyle(() => ({ opacity: cardOpacity.value }));

  const goNext = async () => {
    // Validate
    if (step === 0 && !name.trim()) return Alert.alert('Required', 'Please enter your name.');
    if (step === 1 && (!age || isNaN(age))) return Alert.alert('Required', 'Please enter a valid age.');
    if (step === 2 && (!height || !weight)) return Alert.alert('Required', 'Please enter height and weight.');
    if (step === 3 && !gender) return Alert.alert('Required', 'Please select your gender.');
    if (step === 4 && !goal) return Alert.alert('Required', 'Please select your goal.');

      if (step === STEPS.length - 1) {
      setLoading(true);
      try {
        const parsedWeight = parseFloat(weight);
        const parsedHeight = parseFloat(height);
        const parsedAge = parseInt(age);
        
        // 1. Calculate BMR using Mifflin-St Jeor Equation
        // Men: (10 × weight in kg) + (6.25 × height in cm) - (5 × age in yrs) + 5
        // Women: (10 × weight in kg) + (6.25 × height in cm) - (5 × age in yrs) - 161
        let bmr = (10 * parsedWeight) + (6.25 * parsedHeight) - (5 * parsedAge);
        bmr = gender === 'male' ? bmr + 5 : bmr - 161;

        // 2. Calculate TDEE (Total Daily Energy Expenditure)
        // Assuming 'Lightly Active' multiplier for a baseline app user
        const tdee = bmr * 1.375;
        
        // 3. Adjust for goal
        let dailyCalories = tdee;
        if (goal === 'lose') dailyCalories -= 500; // 500 cal deficit
        if (goal === 'gain') dailyCalories += 500; // 500 cal surplus

        // 4. Calculate dynamic water goal
        // 35ml per kg of body weight
        const waterGoal = Math.round(parsedWeight * 35);

        await saveUserProfile(user.uid, {
          name: name.trim(),
          age: parsedAge,
          height: parsedHeight,
          weight: parsedWeight,
          gender,
          goal,
          dailyCalorieGoal: Math.round(dailyCalories),
          waterGoal,
        });
        navigation.replace('Tabs');
      } catch (err) {
        Alert.alert('Error', err.message);
      } finally {
        setLoading(false);
      }
      return;
    }

    // Animate transition
    cardOpacity.value = withTiming(0, { duration: 150 }, () => {
      cardOpacity.value = withTiming(1, { duration: 250 });
    });
    progressWidth.value = withTiming(((step + 1) / (STEPS.length - 1)) * 100);
    setStep(s => s + 1);
  };

  const goBack = () => {
    if (step === 0) return;
    cardOpacity.value = withTiming(0, { duration: 150 }, () => {
      cardOpacity.value = withTiming(1, { duration: 250 });
    });
    setStep(s => s - 1);
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepEmoji}>👋</Text>
            <Text style={[styles.stepTitle, { color: theme.textPrimary }]}>What's your name?</Text>
            <Text style={[styles.stepSub, { color: theme.textSecondary }]}>We'll personalize your experience</Text>
            <TextInput
              style={[styles.bigInput, { color: theme.textPrimary, borderColor: theme.primary }]}
              placeholder="Enter your name"
              placeholderTextColor={theme.textLight}
              value={name}
              onChangeText={setName}
              autoFocus
            />
          </View>
        );
      case 1:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepEmoji}>🎂</Text>
            <Text style={[styles.stepTitle, { color: theme.textPrimary }]}>How old are you?</Text>
            <Text style={[styles.stepSub, { color: theme.textSecondary }]}>Helps us calculate your needs</Text>
            <TextInput
              style={[styles.bigInput, { color: theme.textPrimary, borderColor: theme.secondary }]}
              placeholder="Your age"
              placeholderTextColor={theme.textLight}
              value={age}
              onChangeText={setAge}
              keyboardType="numeric"
              autoFocus
            />
          </View>
        );
      case 2:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepEmoji}>📏</Text>
            <Text style={[styles.stepTitle, { color: theme.textPrimary }]}>Height & Weight</Text>
            <Text style={[styles.stepSub, { color: theme.textSecondary }]}>For accurate calorie calculations</Text>
            <View style={styles.twoInputs}>
              <TextInput
                style={[styles.halfInput, { color: theme.textPrimary, borderColor: theme.border, backgroundColor: theme.surface }]}
                placeholder="Height (cm)"
                placeholderTextColor={theme.textLight}
                value={height}
                onChangeText={setHeight}
                keyboardType="decimal-pad"
              />
              <TextInput
                style={[styles.halfInput, { color: theme.textPrimary, borderColor: theme.border, backgroundColor: theme.surface }]}
                placeholder="Weight (kg)"
                placeholderTextColor={theme.textLight}
                value={weight}
                onChangeText={setWeight}
                keyboardType="decimal-pad"
              />
            </View>
          </View>
        );
      case 3:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepEmoji}>🧬</Text>
            <Text style={[styles.stepTitle, { color: theme.textPrimary }]}>Your Gender</Text>
            <View style={styles.optionGrid}>
              {GENDERS.map(g => (
                <TouchableOpacity
                  key={g.key}
                  style={[
                    styles.optionCard,
                    { backgroundColor: theme.surface, borderColor: gender === g.key ? theme.primary : theme.border },
                    gender === g.key && { backgroundColor: theme.primary + '15' },
                  ]}
                  onPress={() => setGender(g.key)}
                >
                  <Text style={styles.optionEmoji}>{g.emoji}</Text>
                  <Text style={[styles.optionLabel, { color: theme.textPrimary }]}>{g.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );
      case 4:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepEmoji}>🎯</Text>
            <Text style={[styles.stepTitle, { color: theme.textPrimary }]}>Your Fitness Goal</Text>
            <View style={{ gap: 12, width: '100%' }}>
              {GOALS.map(g => (
                <TouchableOpacity
                  key={g.key}
                  style={[
                    styles.goalCard,
                    { backgroundColor: theme.surface, borderColor: goal === g.key ? g.color : theme.border },
                    goal === g.key && { backgroundColor: g.color + '15' },
                  ]}
                  onPress={() => setGoal(g.key)}
                >
                  <Text style={styles.goalEmoji}>{g.emoji}</Text>
                  <Text style={[styles.goalLabel, { color: theme.textPrimary }]}>{g.label}</Text>
                  {goal === g.key && <Ionicons name="checkmark-circle" size={22} color={g.color} />}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={{ flex: 1, backgroundColor: theme.background }} contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <StatusBar barStyle="dark-content" />

        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.background }]}>
          {step > 0 && (
            <TouchableOpacity onPress={goBack}>
              <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
            </TouchableOpacity>
          )}
          <Text style={[styles.stepCounter, { color: theme.textSecondary }]}>
            {step + 1} of {STEPS.length}
          </Text>
        </View>

        {/* Progress bar */}
        <View style={[styles.progressBg, { backgroundColor: theme.border }]}>
          <Animated.View style={[styles.progressFill, progressAnim, { backgroundColor: Colors.primary }]} />
        </View>

        {/* Step labels */}
        <View style={styles.stepsRow}>
          {STEPS.map((s, i) => (
            <View key={s} style={styles.stepDot}>
              <View style={[
                styles.dot,
                { backgroundColor: i <= step ? Colors.primary : theme.border }
              ]}>
                {i < step && <Ionicons name="checkmark" size={10} color="#fff" />}
              </View>
            </View>
          ))}
        </View>

        {/* Content */}
        <Animated.View style={[styles.content, cardAnim]}>
          {renderStep()}
        </Animated.View>

        {/* Next Button */}
        <View style={styles.footer}>
          <TouchableOpacity onPress={goNext} activeOpacity={0.9}>
            <LinearGradient
              colors={['#22c55e', '#16a34a']}
              style={styles.nextBtn}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.nextBtnText}>
                {step === STEPS.length - 1 ? (loading ? 'Saving...' : '🚀 Get Started') : 'Continue →'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 24, paddingTop: 56, paddingBottom: 16,
  },
  stepCounter: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  progressBg: { height: 6, marginHorizontal: 24, borderRadius: 3 },
  progressFill: { height: 6, borderRadius: 3 },
  stepsRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 12 },
  stepDot: { alignItems: 'center' },
  dot: {
    width: 20, height: 20, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 24 },
  stepContent: { alignItems: 'center', paddingTop: 24 },
  stepEmoji: { fontSize: 72, marginBottom: 20 },
  stepTitle: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, textAlign: 'center', marginBottom: 8 },
  stepSub: { fontSize: FontSize.md, textAlign: 'center', marginBottom: 32 },
  bigInput: {
    width: '100%', fontSize: 24, fontWeight: FontWeight.bold, textAlign: 'center',
    borderBottomWidth: 3, paddingVertical: 12,
  },
  twoInputs: { flexDirection: 'row', gap: 12, width: '100%' },
  halfInput: {
    flex: 1, borderWidth: 1.5, borderRadius: BorderRadius.lg,
    padding: 14, fontSize: FontSize.md, textAlign: 'center',
  },
  optionGrid: { flexDirection: 'row', gap: 12, flexWrap: 'wrap', justifyContent: 'center' },
  optionCard: {
    width: 100, paddingVertical: 20, borderRadius: BorderRadius.lg,
    alignItems: 'center', borderWidth: 2, gap: 8,
  },
  optionEmoji: { fontSize: 32 },
  optionLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  goalCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 18, borderRadius: BorderRadius.lg, borderWidth: 2,
  },
  goalEmoji: { fontSize: 28 },
  goalLabel: { flex: 1, fontSize: FontSize.md, fontWeight: FontWeight.semibold },
  footer: { padding: 24 },
  nextBtn: { borderRadius: BorderRadius.full, paddingVertical: 18, alignItems: 'center' },
  nextBtnText: { color: '#fff', fontSize: FontSize.lg, fontWeight: FontWeight.bold },
});

export default ProfileSetupScreen;
