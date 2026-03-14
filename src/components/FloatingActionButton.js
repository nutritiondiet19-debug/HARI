import React from 'react';
import { TouchableOpacity, StyleSheet, Text } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Shadow } from '../theme';

const AnimatedTouch = Animated.createAnimatedComponent(TouchableOpacity);

const FloatingActionButton = ({ onPress, icon = 'add', colors = ['#22c55e', '#16a34a'], size = 56 }) => {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handlePressIn = () => { scale.value = withSpring(0.9); };
  const handlePressOut = () => { scale.value = withSpring(1.05, {}, () => { scale.value = withSpring(1); }); };

  return (
    <AnimatedTouch
      style={[styles.fab, { width: size, height: size, borderRadius: size / 2 }, Shadow.lg, animStyle]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
    >
      <LinearGradient
        colors={colors}
        style={[styles.gradient, { borderRadius: size / 2 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Ionicons name={icon} size={28} color="#fff" />
      </LinearGradient>
    </AnimatedTouch>
  );
};

const styles = StyleSheet.create({
  fab: { overflow: 'hidden' },
  gradient: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});

export default FloatingActionButton;
