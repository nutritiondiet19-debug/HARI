import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, Alert, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { resetPassword } from '../../services/authService';
import { useTheme } from '../../hooks/useTheme';
import { BorderRadius, FontSize, FontWeight, Shadow } from '../../theme';

const ForgotPasswordScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!email) return Alert.alert('Enter Email', 'Please enter your email address.');
    setLoading(true);
    try {
      await resetPassword(email.trim());
      setSent(true);
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <StatusBar barStyle="light-content" />

        <LinearGradient colors={['#f97316', '#ea580c']} style={styles.header} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.emoji}>🔑</Text>
          <Text style={styles.headerTitle}>Reset Password</Text>
          <Text style={styles.headerSub}>We'll send a reset link to your email</Text>
        </LinearGradient>

        <View style={[styles.card, { backgroundColor: theme.card }, Shadow.lg]}>
          {!sent ? (
            <>
              <View style={[styles.inputWrapper, { borderColor: theme.border, backgroundColor: theme.surface }]}>
                <Ionicons name="mail-outline" size={20} color={theme.textLight} />
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

              <TouchableOpacity onPress={handleReset} activeOpacity={0.9}>
                <LinearGradient colors={['#f97316', '#ea580c']} style={styles.btn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                  <Text style={styles.btnText}>{loading ? 'Sending...' : 'Send Reset Link'}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.successContainer}>
              <Text style={styles.successEmoji}>✅</Text>
              <Text style={[styles.successTitle, { color: theme.textPrimary }]}>Email Sent!</Text>
              <Text style={[styles.successSub, { color: theme.textSecondary }]}>
                Check your inbox for a password reset link.
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <LinearGradient colors={['#22c55e', '#16a34a']} style={[styles.btn, { marginTop: 20 }]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                  <Text style={styles.btnText}>Back to Login</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 24, paddingTop: 60, paddingBottom: 40, alignItems: 'flex-start' },
  backBtn: { marginBottom: 20 },
  emoji: { fontSize: 48, marginBottom: 12 },
  headerTitle: { color: '#fff', fontSize: 26, fontWeight: '800', marginBottom: 8 },
  headerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 15 },
  card: { margin: 20, borderRadius: BorderRadius.xl, padding: 28, marginTop: -24 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center', borderWidth: 1.5,
    borderRadius: BorderRadius.lg, paddingHorizontal: 14, paddingVertical: 14,
    marginBottom: 20, gap: 10,
  },
  input: { flex: 1, fontSize: FontSize.md },
  btn: { borderRadius: BorderRadius.full, paddingVertical: 16, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: FontSize.md, fontWeight: FontWeight.bold },
  successContainer: { alignItems: 'center' },
  successEmoji: { fontSize: 56, marginBottom: 16 },
  successTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, marginBottom: 8 },
  successSub: { fontSize: FontSize.md, textAlign: 'center', lineHeight: 22 },
});

export default ForgotPasswordScreen;
