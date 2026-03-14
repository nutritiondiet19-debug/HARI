import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { Colors, Shadow } from '../theme';

// Main Screens
import DashboardScreen from '../screens/main/DashboardScreen';
import FoodSearchScreen from '../screens/main/FoodSearchScreen';
import AddMealScreen from '../screens/main/AddMealScreen';
import ProgressScreen from '../screens/main/ProgressScreen';
import SettingsScreen from '../screens/main/SettingsScreen';

// Secondary Screens
import WaterTrackerScreen from '../screens/main/WaterTrackerScreen';
import WorkoutTrackerScreen from '../screens/main/WorkoutTrackerScreen';
import BarcodeScannerScreen from '../screens/main/BarcodeScannerScreen';
import AIRecommendationScreen from '../screens/main/AIRecommendationScreen';
import NotificationCenterScreen from '../screens/main/NotificationCenterScreen';
import ProfileSetupScreen from '../screens/auth/ProfileSetupScreen';

const Tab = createBottomTabNavigator();
const RootStack = createStackNavigator();

const TAB_ICONS = {
  Dashboard: ['home', 'home-outline'],
  Search: ['search', 'search-outline'],
  Add: ['add-circle', 'add-circle-outline'],
  Progress: ['trending-up', 'trending-up-outline'],
  Settings: ['settings', 'settings-outline'],
};

const MainTabs = () => {
  const { theme, isDark } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.card,
          borderTopColor: theme.border,
          borderTopWidth: 1,
          height: 72,
          paddingBottom: 12,
          paddingTop: 8,
          ...Shadow.lg,
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: theme.textLight,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginTop: 2 },
        tabBarIcon: ({ focused, color, size }) => {
          const icons = TAB_ICONS[route.name];
          const iconName = focused ? icons[0] : icons[1];

          if (route.name === 'Add') {
            return (
              <View style={[styles.addTabBtn, { backgroundColor: Colors.primary }]}>
                <Ionicons name="add" size={28} color="#fff" />
              </View>
            );
          }

          return <Ionicons name={iconName} size={22} color={color} />;
        },
        tabBarLabel: ({ focused, color }) => {
          if (route.name === 'Add') return null;
          return (
            <Text style={{ fontSize: 10, color, fontWeight: focused ? '700' : '500' }}>
              {route.name}
            </Text>
          );
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Search" component={FoodSearchScreen} />
      <Tab.Screen name="Add" component={AddMealScreen} />
      <Tab.Screen name="Progress" component={ProgressScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

const MainNavigator = () => (
  <RootStack.Navigator screenOptions={{ headerShown: false }}>
    <RootStack.Screen name="Tabs" component={MainTabs} />
    <RootStack.Screen name="Water" component={WaterTrackerScreen} />
    <RootStack.Screen name="Workout" component={WorkoutTrackerScreen} />
    <RootStack.Screen name="Scanner" component={BarcodeScannerScreen} />
    <RootStack.Screen name="AI" component={AIRecommendationScreen} />
    <RootStack.Screen name="Notifications" component={NotificationCenterScreen} />
    <RootStack.Screen name="FoodSearch" component={FoodSearchScreen} />
    <RootStack.Screen name="AddMeal" component={AddMealScreen} />
    <RootStack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
  </RootStack.Navigator>
);

const styles = StyleSheet.create({
  addTabBtn: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    ...Shadow.md,
  },
});

export default MainNavigator;
