import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, Alert, StatusBar,
} from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { loginUser } from '../../services/authService';
import { useTheme } from '../../hooks/useTheme';
import { BorderRadius, FontSize, FontWeight, Shadow, Spacing } from '../../theme';

const LoginScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const btnScale = useSharedValue(1);
  const btnStyle = useAnimatedStyle(() => ({ transform: [{ scale: btnScale.value }] }));

  const handleLogin = async () => {
    if (!email || !password) { Alert.alert('Missing Fields', 'Please fill in all fields.'); return; }
    setLoading(true);
    btnScale.value = withSpring(0.95);
    try {
      await loginUser(email.trim(), password);
      // Navigation handled by auth state change in root navigator
    } catch (err) {
      Alert.alert('Login Failed', err.message);
      btnScale.value = withSpring(1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={{ flex: 1, backgroundColor: theme.background }} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <StatusBar barStyle="light-content" />

        {/* Header gradient */}
        <LinearGradient colors={['#22c55e', '#3b82f6']} style={styles.header} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View style={styles.headerContent}>
            <Text style={styles.logo}>🥦</Text>
            <Text style={styles.appName}>NutriTrack</Text>
            <Text style={styles.tagline}>Welcome back!</Text>
          </View>
        </LinearGradient>

        {/* Card */}
        <View style={[styles.card, { backgroundColor: theme.card }, Shadow.lg]}>
          <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>Sign In</Text>

          {/* Email */}
          <View style={[styles.inputWrapper, { borderColor: theme.border, backgroundColor: theme.surface }]}>
            <Ionicons name="mail-outline" size={20} color={theme.textLight} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: theme.textPrimary }]}
              placeholder="Email address"
              placeholderTextColor={theme.textLight}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Password */}
          <View style={[styles.inputWrapper, { borderColor: theme.border, backgroundColor: theme.surface }]}>
            <Ionicons name="lock-closed-outline" size={20} color={theme.textLight} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: theme.textPrimary }]}
              placeholder="Password"
              placeholderTextColor={theme.textLight}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPass}
            />
            <TouchableOpacity onPress={() => setShowPass(p => !p)}>
              <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={20} color={theme.textLight} />
            </TouchableOpacity>
          </View>

          {/* Forgot */}
          <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} style={styles.forgotBtn}>
            <Text style={[styles.forgotText, { color: theme.primary }]}>Forgot Password?</Text>
          </TouchableOpacity>

          {/* Login Button */}
          <Animated.View style={btnStyle}>
            <TouchableOpacity onPress={handleLogin} activeOpacity={0.9}>
              <LinearGradient colors={['#22c55e', '#16a34a']} style={styles.loginBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Text style={styles.loginBtnText}>{loading ? 'Signing In...' : 'Sign In'}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* Register link */}
          <View style={styles.registerRow}>
            <Text style={[styles.registerText, { color: theme.textSecondary }]}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={[styles.registerLink, { color: theme.primary }]}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scroll: { flexGrow: 1 },
  header: { height: 240, padding: 24, paddingTop: 60, justifyContent: 'flex-end' },
  headerContent: { alignItems: 'center', gap: 8 },
  logo: { fontSize: 48 },
  appName: { color: '#fff', fontSize: 28, fontWeight: '800' },
  tagline: { color: 'rgba(255,255,255,0.8)', fontSize: 15 },
  card: {
    margin: 20,
    borderRadius: BorderRadius.xl,
    padding: 28,
    marginTop: -28,
  },
  cardTitle: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, marginBottom: 24 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 14,
    gap: 10,
  },
  inputIcon: {},
  input: { flex: 1, fontSize: FontSize.md },
  forgotBtn: { alignSelf: 'flex-end', marginBottom: 20 },
  forgotText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  loginBtn: { borderRadius: BorderRadius.full, paddingVertical: 16, alignItems: 'center' },
  loginBtnText: { color: '#fff', fontSize: FontSize.md, fontWeight: FontWeight.bold },
  registerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  registerText: { fontSize: FontSize.sm },
  registerLink: { fontSize: FontSize.sm, fontWeight: FontWeight.bold },
});

export default LoginScreen;
