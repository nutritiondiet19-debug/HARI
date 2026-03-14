import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Switch, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { logoutUser } from '../../services/authService';
import { getUserProfile } from '../../services/firestoreService';
import { BorderRadius, FontSize, FontWeight, Colors, Shadow } from '../../theme';

const SettingRow = ({ icon, label, value, onPress, isToggle, toggleValue, onToggle, color, danger }) => {
  const { theme } = useTheme();
  return (
    <TouchableOpacity
      style={[styles.row, { borderBottomColor: theme.border }]}
      onPress={onPress}
      activeOpacity={isToggle ? 1 : 0.7}
    >
      <View style={[styles.rowIcon, { backgroundColor: (color || Colors.primary) + '20' }]}>
        <Ionicons name={icon} size={20} color={danger ? '#ef4444' : (color || Colors.primary)} />
      </View>
      <View style={styles.rowContent}>
        <Text style={[styles.rowLabel, { color: danger ? '#ef4444' : theme.textPrimary }]}>{label}</Text>
        {value && <Text style={[styles.rowValue, { color: theme.textSecondary }]}>{value}</Text>}
      </View>
      {isToggle ? (
        <Switch
          value={toggleValue}
          onValueChange={onToggle}
          trackColor={{ false: theme.border, true: Colors.primary }}
          thumbColor="#fff"
        />
      ) : (
        <Ionicons name="chevron-forward" size={18} color={theme.textLight} />
      )}
    </TouchableOpacity>
  );
};

const SettingsScreen = ({ navigation }) => {
  const { theme, isDark, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [notificationsOn, setNotificationsOn] = useState(true);
  const [remindersOn, setRemindersOn] = useState(true);

  useEffect(() => {
    if (user) getUserProfile(user.uid).then(p => setProfile(p));
  }, [user]);

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: () => logoutUser() },
      ]
    );
  };

  const goalLabel = { lose: 'Lose Weight', maintain: 'Maintain', gain: 'Gain Muscle' }[profile?.goal] || 'Not set';

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <LinearGradient colors={['#64748b', '#475569']} style={styles.header} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <TouchableOpacity
          style={[styles.profileCard, { backgroundColor: theme.card, borderColor: theme.border }, Shadow.md]}
          onPress={() => navigation.navigate('ProfileSetup')}
        >
          <View style={[styles.avatar, { backgroundColor: Colors.primary + '20' }]}>
            <Text style={styles.avatarEmoji}>👤</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: theme.textPrimary }]}>{profile?.name || user?.displayName || 'User'}</Text>
            <Text style={[styles.profileEmail, { color: theme.textSecondary }]}>{user?.email}</Text>
            <View style={[styles.goalBadge, { backgroundColor: Colors.primary + '20' }]}>
              <Text style={[styles.goalBadgeText, { color: Colors.primary }]}>🎯 {goalLabel}</Text>
            </View>
          </View>
          <Ionicons name="pencil" size={20} color={theme.textLight} />
        </TouchableOpacity>

        {/* Body Stats */}
        {profile && (
          <View style={[styles.statsCard, { backgroundColor: theme.card, borderColor: theme.border }, Shadow.sm]}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: Colors.primary }]}>{profile.height || '--'}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>cm</Text>
              <Text style={[styles.statKey, { color: theme.textSecondary }]}>Height</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: Colors.secondary }]}>{profile.weight || '--'}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>kg</Text>
              <Text style={[styles.statKey, { color: theme.textSecondary }]}>Weight</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: Colors.accentOrange }]}>{profile.dailyCalorieGoal || '--'}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>kcal</Text>
              <Text style={[styles.statKey, { color: theme.textSecondary }]}>Daily Goal</Text>
            </View>
          </View>
        )}

        {/* Quick navigation */}
        <Text style={[styles.sectionHeader, { color: theme.textSecondary }]}>TRACKING</Text>
        <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <SettingRow icon="water" label="Water Tracker" color="#38bdf8" onPress={() => navigation.navigate('Water')} />
          <SettingRow icon="barbell" label="Workout Tracker" color="#a855f7" onPress={() => navigation.navigate('Workout')} />
          <SettingRow icon="trending-up" label="Progress Charts" color={Colors.primary} onPress={() => navigation.navigate('Progress')} />
          <SettingRow icon="sparkles" label="AI Diet Plan" color="#f97316" onPress={() => navigation.navigate('AI')} />
          <SettingRow icon="notifications" label="Notifications" color={Colors.secondary} onPress={() => navigation.navigate('Notifications')} />
        </View>

        <Text style={[styles.sectionHeader, { color: theme.textSecondary }]}>PREFERENCES</Text>
        <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <SettingRow icon="moon" label="Dark Mode" isToggle toggleValue={isDark} onToggle={toggleTheme} color="#6366f1" />
          <SettingRow icon="notifications-circle" label="Meal Reminders" isToggle toggleValue={remindersOn} onToggle={setRemindersOn} color={Colors.accentOrange} />
          <SettingRow icon="megaphone" label="Push Notifications" isToggle toggleValue={notificationsOn} onToggle={setNotificationsOn} color={Colors.primary} />
        </View>

        <Text style={[styles.sectionHeader, { color: theme.textSecondary }]}>ACCOUNT</Text>
        <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <SettingRow icon="person-circle" label="Edit Profile" onPress={() => navigation.navigate('ProfileSetup')} color={Colors.secondary} />
          <SettingRow icon="help-circle" label="Help & Support" color="#64748b" onPress={() => {}} />
          <SettingRow icon="log-out" label="Sign Out" danger onPress={handleLogout} />
        </View>

        <View style={styles.versionInfo}>
          <Text style={[styles.versionText, { color: theme.textLight }]}>NutriTrack v1.0.0</Text>
          <Text style={[styles.versionSub, { color: theme.textLight }]}>Made with ❤️ for your health</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 56, paddingHorizontal: 24, paddingBottom: 24, flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: {},
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: '800' },
  profileCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    margin: 16, padding: 18, borderRadius: BorderRadius.xl, borderWidth: 1,
  },
  avatar: { width: 60, height: 60, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  avatarEmoji: { fontSize: 30 },
  profileInfo: { flex: 1, gap: 4 },
  profileName: { fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  profileEmail: { fontSize: FontSize.sm },
  goalBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: BorderRadius.full, marginTop: 4 },
  goalBadgeText: { fontSize: 11, fontWeight: FontWeight.semibold },
  statsCard: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 16, marginBottom: 8, padding: 16,
    borderRadius: BorderRadius.xl, borderWidth: 1,
  },
  statItem: { flex: 1, alignItems: 'center', gap: 2 },
  statValue: { fontSize: FontSize.xl, fontWeight: '800' },
  statLabel: { fontSize: 10 },
  statKey: { fontSize: 11 },
  statDivider: { width: 1, height: 48 },
  sectionHeader: { fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1, marginHorizontal: 24, marginTop: 20, marginBottom: 8 },
  section: { marginHorizontal: 16, borderRadius: BorderRadius.xl, borderWidth: 1, overflow: 'hidden', marginBottom: 4 },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 15, borderBottomWidth: 1, gap: 14 },
  rowIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  rowContent: { flex: 1 },
  rowLabel: { fontSize: FontSize.md, fontWeight: FontWeight.medium },
  rowValue: { fontSize: FontSize.sm, marginTop: 2 },
  versionInfo: { alignItems: 'center', paddingVertical: 32, gap: 4 },
  versionText: { fontSize: FontSize.sm },
  versionSub: { fontSize: FontSize.xs },
});

export default SettingsScreen;
