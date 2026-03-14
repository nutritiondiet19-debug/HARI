import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar,
} from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, FadeInRight,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { BorderRadius, FontSize, FontWeight, Colors, Shadow } from '../../theme';

const MOCK_NOTIFICATIONS = [
  { id: '1', type: 'reminder', title: 'Time to Log Lunch! 🥗', body: "Don't forget to track your lunch calories.", time: '12:00 PM', read: false, icon: 'restaurant', color: '#22c55e' },
  { id: '2', type: 'water', title: 'Hydration Reminder 💧', body: "You've only had 750ml of water today. Drink up!", time: '11:30 AM', read: false, icon: 'water', color: '#38bdf8' },
  { id: '3', type: 'goal', title: 'Goal Progress 🏆', body: 'You burned 320 kcal in your morning run. Great work!', time: '9:15 AM', read: true, icon: 'trophy', color: Colors.accentOrange },
  { id: '4', type: 'insight', title: 'Daily Insight ✨', body: "Yesterday's protein intake was 15% below your goal. Try adding more lean protein today.", time: 'Yesterday', read: true, icon: 'bulb', color: Colors.accentPurple },
  { id: '5', type: 'reminder', title: 'Log Your Breakfast 🌅', body: 'Start your day right by logging your breakfast.', time: 'Yesterday', read: true, icon: 'time', color: '#f97316' },
  { id: '6', type: 'achievement', title: '7-Day Streak! 🔥', body: "You've logged meals for 7 consecutive days. Keep it up!", time: '2 days ago', read: true, icon: 'flame', color: '#ef4444' },
];

const NotificationItem = ({ item, onRead }) => {
  const { theme } = useTheme();
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View entering={FadeInRight} style={animStyle}>
      <TouchableOpacity
        style={[
          styles.notifCard,
          { backgroundColor: item.read ? theme.card : item.color + '10', borderColor: item.read ? theme.border : item.color + '40' },
          Shadow.sm,
        ]}
        onPress={() => onRead(item.id)}
        activeOpacity={0.85}
      >
        <View style={[styles.notifIcon, { backgroundColor: item.color + '20' }]}>
          <Ionicons name={item.icon} size={22} color={item.color} />
        </View>

        <View style={styles.notifContent}>
          <View style={styles.notifTitleRow}>
            <Text style={[styles.notifTitle, { color: theme.textPrimary }]} numberOfLines={1}>{item.title}</Text>
            {!item.read && <View style={[styles.unreadDot, { backgroundColor: item.color }]} />}
          </View>
          <Text style={[styles.notifBody, { color: theme.textSecondary }]} numberOfLines={2}>{item.body}</Text>
          <Text style={[styles.notifTime, { color: theme.textLight }]}>{item.time}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const NotificationCenterScreen = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" />

      <LinearGradient colors={['#f97316', '#ea580c']} style={styles.header} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && <Text style={styles.headerSub}>{unreadCount} unread</Text>}
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllRead} style={styles.readAllBtn}>
            <Text style={styles.readAllText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </LinearGradient>

      <FlatList
        data={notifications}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={{ fontSize: 56 }}>🔔</Text>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No notifications yet</Text>
          </View>
        }
        renderItem={({ item }) => (
          <NotificationItem item={item} onRead={markRead} />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 56, paddingHorizontal: 24, paddingBottom: 24,
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  backBtn: {},
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: '800' },
  headerSub: { color: 'rgba(255,255,255,0.8)', fontSize: FontSize.sm },
  readAllBtn: { marginLeft: 'auto', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: BorderRadius.full },
  readAllText: { color: '#fff', fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  list: { padding: 16, gap: 10, paddingBottom: 32 },
  notifCard: { flexDirection: 'row', gap: 12, padding: 14, borderRadius: BorderRadius.lg, borderWidth: 1 },
  notifIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  notifContent: { flex: 1, gap: 3 },
  notifTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  notifTitle: { flex: 1, fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  unreadDot: { width: 8, height: 8, borderRadius: 4 },
  notifBody: { fontSize: FontSize.xs, lineHeight: 18 },
  notifTime: { fontSize: FontSize.xs },
  empty: { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyText: { fontSize: FontSize.md },
});

export default NotificationCenterScreen;
