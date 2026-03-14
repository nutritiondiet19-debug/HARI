import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Dimensions, StatusBar,
} from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    emoji: '🥗',
    title: 'Track Your Diet',
    subtitle: 'Log every meal effortlessly. Search thousands of foods and track your daily macros and calories.',
    colors: ['#22c55e', '#16a34a'],
  },
  {
    id: '2',
    emoji: '💧',
    title: 'Monitor Your Health',
    subtitle: 'Track water intake, workout calories, and get real-time insights into your health metrics.',
    colors: ['#3b82f6', '#1d4ed8'],
  },
  {
    id: '3',
    emoji: '🏆',
    title: 'Reach Your Goals',
    subtitle: 'Set personalized fitness goals and watch your progress with beautiful animated charts.',
    colors: ['#a855f7', '#7c3aed'],
  },
];

const OnboardingScreen = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  const goNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(i => i + 1);
    } else {
      navigation.replace('Login');
    }
  };

  const renderSlide = ({ item }) => (
    <LinearGradient
      colors={item.colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.slide}
    >
      {/* Decorative circles */}
      <View style={[styles.circle, styles.circleTop]} />
      <View style={[styles.circle, styles.circleMid]} />

      <View style={styles.emojiContainer}>
        <Text style={styles.emoji}>{item.emoji}</Text>
      </View>

      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.subtitle}>{item.subtitle}</Text>
    </LinearGradient>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderSlide}
        keyExtractor={item => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        style={{ flex: 1 }}
      />

      {/* Bottom Controls */}
      <View style={styles.bottomBar}>
        {/* Dots */}
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === currentIndex ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>

        {/* CTA Button */}
        <TouchableOpacity
          style={[styles.nextBtn, { backgroundColor: SLIDES[currentIndex].colors[0] }]}
          onPress={goNext}
          activeOpacity={0.85}
        >
          <Text style={styles.nextBtnText}>
            {currentIndex === SLIDES.length - 1 ? 'Get Started 🚀' : 'Next →'}
          </Text>
        </TouchableOpacity>

        {/* Skip */}
        {currentIndex < SLIDES.length - 1 && (
          <TouchableOpacity onPress={() => navigation.replace('Login')}>
            <Text style={styles.skip}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  slide: {
    width,
    height: height * 0.72,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  circle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  circleTop: { width: 250, height: 250, top: -60, right: -60 },
  circleMid: { width: 180, height: 180, bottom: 40, left: -50 },
  emojiContainer: {
    width: 140,
    height: 140,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  emoji: { fontSize: 72 },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    lineHeight: 24,
  },
  bottomBar: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 16,
    backgroundColor: '#f8fafc',
  },
  dots: { flexDirection: 'row', gap: 8 },
  dot: { height: 8, borderRadius: 4 },
  dotActive: { width: 24, backgroundColor: '#22c55e' },
  dotInactive: { width: 8, backgroundColor: '#cbd5e1' },
  nextBtn: {
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 999,
    width: '100%',
    alignItems: 'center',
  },
  nextBtnText: { color: '#fff', fontWeight: '700', fontSize: 17 },
  skip: { color: '#94a3b8', fontSize: 15 },
});

export default OnboardingScreen;
