import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, Alert, StatusBar,
} from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { registerUser } from '../../services/authService';
import { useTheme } from '../../hooks/useTheme';
import { BorderRadius, FontSize, FontWeight, Shadow } from '../../theme';

const InputField = ({ icon, placeholder, value, onChangeText, secure, theme, showPass, setShowPass }) => (
  <View style={[styles.inputWrapper, { borderColor: theme.border, backgroundColor: theme.surface }]}>
    <Ionicons name={icon} size={20} color={theme.textLight} />
    <TextInput
      style={[styles.input, { color: theme.textPrimary }]}
      placeholder={placeholder}
      placeholderTextColor={theme.textLight}
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secure && !showPass}
      autoCapitalize={icon === 'mail-outline' ? 'none' : 'words'}
      keyboardType={icon === 'mail-outline' ? 'email-address' : 'default'}
    />
    {secure && (
      <TouchableOpacity onPress={() => setShowPass(p => !p)}>
        <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={20} color={theme.textLight} />
      </TouchableOpacity>
    )}
  </View>
);

const RegisterScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const btnScale = useSharedValue(1);
  const btnStyle = useAnimatedStyle(() => ({ transform: [{ scale: btnScale.value }] }));

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword)
      return Alert.alert('Missing Fields', 'Please fill in all fields.');
    if (password !== confirmPassword)
      return Alert.alert('Password Mismatch', 'Passwords do not match.');
    if (password.length < 6)
      return Alert.alert('Weak Password', 'Password must be at least 6 characters.');

    setLoading(true);
    btnScale.value = withSpring(0.95);
    try {
      await registerUser(email.trim(), password, name.trim());
      navigation.replace('ProfileSetup');
    } catch (err) {
      Alert.alert('Registration Failed', err.message);
      btnScale.value = withSpring(1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={{ flex: 1, backgroundColor: theme.background }} contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <StatusBar barStyle="light-content" />

        <LinearGradient colors={['#3b82f6', '#22c55e']} style={styles.header} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Account</Text>
          <Text style={styles.headerSub}>Join thousands on their health journey</Text>
        </LinearGradient>

        <View style={[styles.card, { backgroundColor: theme.card }, Shadow.lg]}>
          <InputField icon="person-outline" placeholder="Full Name" value={name} onChangeText={setName} theme={theme} showPass={showPass} setShowPass={setShowPass} />
          <InputField icon="mail-outline" placeholder="Email Address" value={email} onChangeText={setEmail} theme={theme} showPass={showPass} setShowPass={setShowPass} />
          <InputField icon="lock-closed-outline" placeholder="Password" value={password} onChangeText={setPassword} secure theme={theme} showPass={showPass} setShowPass={setShowPass} />
          <InputField icon="checkmark-circle-outline" placeholder="Confirm Password" value={confirmPassword} onChangeText={setConfirmPassword} secure theme={theme} showPass={showPass} setShowPass={setShowPass} />

          <Animated.View style={btnStyle}>
            <TouchableOpacity onPress={handleRegister} activeOpacity={0.9}>
              <LinearGradient colors={['#3b82f6', '#1d4ed8']} style={styles.btn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Text style={styles.btnText}>{loading ? 'Creating Account...' : 'Create Account'}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          <View style={styles.loginRow}>
            <Text style={[{ color: theme.textSecondary, fontSize: FontSize.sm }]}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={[{ color: theme.secondary, fontSize: FontSize.sm, fontWeight: FontWeight.bold }]}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  header: { padding: 24, paddingTop: 60, paddingBottom: 40 },
  backBtn: { marginBottom: 16 },
  headerTitle: { color: '#fff', fontSize: 28, fontWeight: '800', marginBottom: 8 },
  headerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 15 },
  card: { margin: 20, borderRadius: BorderRadius.xl, padding: 28, marginTop: -24 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center', borderWidth: 1.5,
    borderRadius: BorderRadius.lg, paddingHorizontal: 14, paddingVertical: 14,
    marginBottom: 14, gap: 10,
  },
  input: { flex: 1, fontSize: FontSize.md },
  btn: { borderRadius: BorderRadius.full, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#fff', fontSize: FontSize.md, fontWeight: FontWeight.bold },
  loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
});

export default RegisterScreen;
