import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { FontSize, FontWeight, BorderRadius, Shadow } from '../theme';
import MacrosBar from './MacrosBar';

const CAT_COLORS = {
  breakfast: ['#f97316','#fb923c'],
  tiffin: ['#eab308','#ca8a04'],
  'rice-gravies': ['#22c55e','#16a34a'],
  'sweets-desserts': ['#ec4899','#db2777'],
  snacks: ['#f59e0b','#d97706'],
  'drinks-beverages': ['#06b6d4','#0891b2'],
  'street-food': ['#ef4444','#dc2626'],
  seafood: ['#3b82f6','#2563eb'],
  'non-veg': ['#a855f7','#9333ea'],
  'legumes-lentils': ['#84cc16','#65a30d'],
  'chutneys-sides': ['#14b8a6','#0d9488'],
  'modern-fusion': ['#f43f5e','#e11d48'],
};

const CAT_EMOJI = {
  breakfast:'🌅', tiffin:'🫓', 'rice-gravies':'🍛',
  'sweets-desserts':'🍮', snacks:'🥜', 'drinks-beverages':'🥤',
  'street-food':'🌮', seafood:'🐟', 'non-veg':'🍗',
  'legumes-lentils':'🫘', 'chutneys-sides':'🥗', 'modern-fusion':'✨',
};

const ERA_BADGE = {
  ancient:      { label:'Ancient', bg:'#f59e0b20', color:'#d97706' },
  traditional:  { label:'Traditional', bg:'#22c55e20', color:'#16a34a' },
  modern:       { label:'Modern', bg:'#6366f120', color:'#4f46e5' },
};

const FoodCard = ({ food, onPress, onFavorite, showMacros = true, index = 0 }) => {
  const { theme } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  const colors = CAT_COLORS[food?.category] || ['#6366f1','#8b5cf6'];
  const emoji = CAT_EMOJI[food?.category] || '🍽️';
  const eraBadge = ERA_BADGE[food?.era] || ERA_BADGE.traditional;

  // Staggered entrance animation
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1, duration: 350,
        delay: Math.min(index * 40, 400),
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0, delay: Math.min(index * 40, 400),
        useNativeDriver: true, tension: 60, friction: 8,
      }),
    ]).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, tension: 200 }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 200 }).start();
  };

  const handlePress = () => {
    onPress && onPress(food);
  };

  const [fav, setFav] = React.useState(food?.isFavorite || false);
  const favScale = useRef(new Animated.Value(1)).current;

  const handleFav = () => {
    Animated.sequence([
      Animated.spring(favScale, { toValue: 1.4, useNativeDriver: true, tension: 200 }),
      Animated.spring(favScale, { toValue: 1, useNativeDriver: true, tension: 200 }),
    ]).start();
    setFav(p => !p);
    onFavorite && onFavorite(food);
  };

  return (
    <Animated.View style={{ opacity, transform: [{ scale }, { translateY }] }}>
      <TouchableOpacity
        style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }, Shadow.sm]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <View style={styles.row}>
          {/* Gradient Icon Box */}
          <LinearGradient colors={colors} style={styles.iconBox} start={{ x:0, y:0 }} end={{ x:1, y:1 }}>
            <Text style={styles.emoji}>{emoji}</Text>
          </LinearGradient>

          {/* Info */}
          <View style={styles.info}>
            <View style={styles.nameRow}>
              <Text style={[styles.name, { color: theme.textPrimary }]} numberOfLines={1}>
                {food?.name || 'Food'}
              </Text>
              {/* Era badge */}
              <View style={[styles.eraBadge, { backgroundColor: eraBadge.bg }]}>
                <Text style={[styles.eraText, { color: eraBadge.color }]}>{eraBadge.label}</Text>
              </View>
            </View>

            {/* Tamil name */}
            {food?.tamilName ? (
              <Text style={[styles.tamilName, { color: theme.textLight }]} numberOfLines={1}>
                {food.tamilName}
              </Text>
            ) : null}

            {/* Serving & Calories */}
            <View style={styles.metaRow}>
              <Text style={[styles.serving, { color: theme.textSecondary }]}>
                {food?.servingSize || '100g'}
              </Text>
              <View style={[styles.calBadge, { backgroundColor: colors[0] + '18' }]}>
                <Text style={[styles.calText, { color: colors[0] }]}>
                  🔥 {food?.calories || 0} kcal
                </Text>
              </View>
            </View>

            {/* Macros Bar */}
            {showMacros && (
              <MacrosBar
                protein={food?.protein || 0}
                carbs={food?.carbs || 0}
                fat={food?.fat || 0}
                compact
              />
            )}
          </View>

          {/* Fav Button */}
          <Animated.View style={{ transform: [{ scale: favScale }] }}>
            <TouchableOpacity onPress={handleFav} style={styles.favBtn}>
              <Ionicons
                name={fav ? 'heart' : 'heart-outline'}
                size={22}
                color={fav ? '#ef4444' : theme.textLight}
              />
            </TouchableOpacity>
          </Animated.View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16, padding: 14, borderWidth: 1,
  },
  row: { flexDirection:'row', alignItems:'center', gap:12 },
  iconBox: {
    width:50, height:50, borderRadius:14,
    alignItems:'center', justifyContent:'center',
  },
  emoji: { fontSize:22 },
  info: { flex:1, gap:3 },
  nameRow: { flexDirection:'row', alignItems:'center', gap:6, flexWrap:'wrap' },
  name: { fontSize:FontSize.md, fontWeight:FontWeight.semibold, flexShrink:1 },
  eraBadge: { paddingHorizontal:7, paddingVertical:2, borderRadius:8 },
  eraText: { fontSize:9, fontWeight:FontWeight.bold, textTransform:'uppercase', letterSpacing:0.5 },
  tamilName: { fontSize:12, fontStyle:'italic' },
  metaRow: { flexDirection:'row', alignItems:'center', justifyContent:'space-between' },
  serving: { fontSize:11 },
  calBadge: { paddingHorizontal:8, paddingVertical:2, borderRadius:8 },
  calText: { fontSize:11, fontWeight:FontWeight.semibold },
  favBtn: { padding:4 },
});

export default FoodCard;
