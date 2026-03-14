import React, { useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const SplashScreen = ({ navigation }) => {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.6);
  const taglineOpacity = useSharedValue(0);

  useEffect(() => {
    // Logo animation
    opacity.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.exp) });
    scale.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.back(1.5)) });
    taglineOpacity.value = withDelay(600, withTiming(1, { duration: 600 }));

    // Navigate after animation
    const timer = setTimeout(() => {
      navigation.replace('Onboarding');
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const taglineStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
  }));

  return (
    <LinearGradient
      colors={['#22c55e', '#16a34a', '#3b82f6']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />

      {/* Decorative circles */}
      <View style={[styles.circle, styles.circle1]} />
      <View style={[styles.circle, styles.circle2]} />

      {/* Logo */}
      <Animated.View style={[styles.logoContainer, logoStyle]}>
        <View style={styles.logoIconWrapper}>
          <Text style={styles.logoIcon}>🥦</Text>
        </View>
        <Text style={styles.appName}>NutriTrack</Text>
      </Animated.View>

      {/* Tagline */}
      <Animated.View style={[styles.taglineContainer, taglineStyle]}>
        <Text style={styles.tagline}>Your Health Journey Starts Here</Text>
      </Animated.View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.loadingDots}>
          {[0, 1, 2].map(i => (
            <View key={i} style={[styles.dot, { opacity: 0.5 + i * 0.2 }]} />
          ))}
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  circle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  circle1: { width: 300, height: 300, top: -80, right: -80 },
  circle2: { width: 200, height: 200, bottom: 60, left: -60 },
  logoContainer: { alignItems: 'center', marginBottom: 20 },
  logoIconWrapper: {
    width: 100,
    height: 100,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  logoIcon: { fontSize: 50 },
  appName: {
    fontSize: 38,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 1,
  },
  taglineContainer: { position: 'absolute', bottom: 120 },
  tagline: { color: 'rgba(255,255,255,0.85)', fontSize: 16, textAlign: 'center' },
  footer: { position: 'absolute', bottom: 60, alignItems: 'center' },
  loadingDots: { flexDirection: 'row', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff' },
});

export default SplashScreen;
