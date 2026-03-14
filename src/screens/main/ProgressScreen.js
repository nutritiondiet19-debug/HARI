import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, StatusBar, TouchableOpacity,
} from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { getWeeklyCalories, getLast7Days } from '../../services/firestoreService';
import { BorderRadius, FontSize, FontWeight, Colors, Shadow } from '../../theme';

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - 48;

const TABS = ['Calories', 'Weight', 'Activity'];

const ProgressScreen = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('Calories');
  const [weeklyData, setWeeklyData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const data = await getWeeklyCalories(user.uid);
        setWeeklyData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const chartConfig = {
    backgroundColor: 'transparent',
    backgroundGradientFrom: theme.card,
    backgroundGradientTo: theme.card,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`,
    labelColor: () => theme.textSecondary,
    propsForDots: { r: '5', strokeWidth: '2', stroke: Colors.primary },
    propsForBackgroundLines: { stroke: theme.border, strokeDasharray: '4' },
  };

  const labels = weeklyData
    ? weeklyData.map(d => {
        const date = new Date(d.date);
        return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
      })
    : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const calorieValues = weeklyData
    ? weeklyData.map(d => d.calories || 0)
    : [1800, 2100, 1650, 2300, 1900, 2450, 2000];

  // Simulated weight data
  const weightData = [72.5, 72.3, 72.1, 71.9, 71.8, 71.6, 71.5];

  // Stats
  const avgCalories = Math.round(calorieValues.reduce((a, b) => a + b, 0) / 7);
  const maxCalDay = Math.max(...calorieValues);
  const minCalDay = Math.min(...calorieValues);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <LinearGradient colors={['#a855f7', '#7c3aed']} style={styles.header} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Progress</Text>
        <Text style={styles.headerSub}>Last 7 days</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Summary Stats */}
        <View style={styles.statRow}>
          {[
            { label: 'Avg. Calories', value: avgCalories, unit: 'kcal', color: Colors.accentOrange },
            { label: 'Best Day', value: maxCalDay, unit: 'kcal', color: Colors.primary },
            { label: 'Lowest Day', value: minCalDay, unit: 'kcal', color: Colors.secondary },
          ].map(s => (
            <View key={s.label} style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }, Shadow.sm]}>
              <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
              <Text style={[styles.statUnit, { color: theme.textSecondary }]}>{s.unit}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Tabs */}
        <View style={[styles.tabs, { backgroundColor: theme.card, borderColor: theme.border }]}>
          {TABS.map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && { backgroundColor: Colors.primary }]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, { color: activeTab === tab ? '#fff' : theme.textSecondary }]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Chart */}
        <View style={[styles.chartCard, { backgroundColor: theme.card }, Shadow.md]}>
          <Text style={[styles.chartTitle, { color: theme.textPrimary }]}>
            {activeTab === 'Calories' ? '📊 Calorie Intake' :
             activeTab === 'Weight' ? '⚖️ Weight Trend' : '🏃 Activity'}
          </Text>

          {activeTab === 'Calories' && (
            <BarChart
              data={{ labels, datasets: [{ data: calorieValues }] }}
              width={CHART_WIDTH}
              height={200}
              chartConfig={{ ...chartConfig, color: (op = 1) => `rgba(249, 115, 22, ${op})` }}
              style={styles.chart}
              fromZero
              showValuesOnTopOfBars
            />
          )}

          {activeTab === 'Weight' && (
            <LineChart
              data={{ labels, datasets: [{ data: weightData }] }}
              width={CHART_WIDTH}
              height={200}
              chartConfig={{ ...chartConfig, color: (op = 1) => `rgba(59, 130, 246, ${op})` }}
              style={styles.chart}
              bezier
            />
          )}

          {activeTab === 'Activity' && (
            <BarChart
              data={{ labels, datasets: [{ data: [30, 45, 0, 60, 30, 90, 45] }] }}
              width={CHART_WIDTH}
              height={200}
              chartConfig={{ ...chartConfig, color: (op = 1) => `rgba(168, 85, 247, ${op})` }}
              style={styles.chart}
              fromZero
            />
          )}
        </View>

        {/* Weekly Breakdown */}
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Daily Breakdown</Text>
        {labels.map((label, i) => (
          <View key={label} style={[styles.dayRow, { backgroundColor: theme.card, borderColor: theme.border }, Shadow.sm]}>
            <Text style={[styles.dayLabel, { color: theme.textSecondary }]}>{label}</Text>
            <View style={styles.dayBar}>
              <View
                style={[
                  styles.dayBarFill,
                  { width: `${(calorieValues[i] / 2500) * 100}%`, backgroundColor: Colors.accentOrange },
                ]}
              />
            </View>
            <Text style={[styles.dayValue, { color: theme.textPrimary }]}>{calorieValues[i]}</Text>
          </View>
        ))}
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
  scroll: { padding: 20, paddingBottom: 40, gap: 16 },
  statRow: { flexDirection: 'row', gap: 10 },
  statCard: { flex: 1, alignItems: 'center', padding: 14, borderRadius: BorderRadius.lg, borderWidth: 1, gap: 2 },
  statValue: { fontSize: FontSize.lg, fontWeight: '800' },
  statUnit: { fontSize: 10 },
  statLabel: { fontSize: 10, textAlign: 'center' },
  tabs: { flexDirection: 'row', borderRadius: BorderRadius.lg, padding: 4, borderWidth: 1 },
  tab: { flex: 1, paddingVertical: 8, borderRadius: BorderRadius.md, alignItems: 'center' },
  tabText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  chartCard: { borderRadius: BorderRadius.xl, padding: 20, gap: 12 },
  chartTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold },
  chart: { borderRadius: BorderRadius.lg, marginLeft: -16 },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  dayRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 14, borderRadius: BorderRadius.lg, borderWidth: 1,
  },
  dayLabel: { width: 36, fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  dayBar: { flex: 1, height: 8, backgroundColor: '#e2e8f0', borderRadius: 4, overflow: 'hidden' },
  dayBarFill: { height: '100%', borderRadius: 4 },
  dayValue: { width: 44, fontSize: FontSize.sm, fontWeight: FontWeight.bold, textAlign: 'right' },
});

export default ProgressScreen;
