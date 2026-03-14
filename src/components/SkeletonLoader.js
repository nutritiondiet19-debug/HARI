import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { useTheme } from '../hooks/useTheme';
import { BorderRadius } from '../theme';

const SkeletonBox = ({ width, height, style }) => {
  const { isDark } = useTheme();
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(withTiming(1, { duration: 1000 }), -1, true);
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      shimmer.value,
      [0, 1],
      isDark ? ['#1e293b', '#334155'] : ['#e2e8f0', '#f1f5f9']
    ),
  }));

  return (
    <Animated.View
      style={[{ width, height, borderRadius: BorderRadius.md }, animStyle, style]}
    />
  );
};

const SkeletonLoader = ({ type = 'card' }) => {
  const { theme } = useTheme();

  if (type === 'food-list') {
    return (
      <View style={{ gap: 12 }}>
        {[1, 2, 3].map(i => (
          <View key={i} style={[styles.foodRow, { backgroundColor: theme.card }]}>
            <SkeletonBox width={48} height={48} style={{ borderRadius: 12 }} />
            <View style={{ flex: 1, gap: 8 }}>
              <SkeletonBox width="70%" height={14} />
              <SkeletonBox width="40%" height={12} />
              <SkeletonBox width="90%" height={8} />
            </View>
          </View>
        ))}
      </View>
    );
  }

  return (
    <View style={[styles.card, { backgroundColor: theme.card }]}>
      <SkeletonBox width="60%" height={18} style={{ marginBottom: 12 }} />
      <SkeletonBox width="100%" height={12} style={{ marginBottom: 8 }} />
      <SkeletonBox width="80%" height={12} />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: BorderRadius.lg,
    marginBottom: 12,
  },
  foodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: BorderRadius.lg,
    gap: 12,
  },
});

export default SkeletonLoader;
