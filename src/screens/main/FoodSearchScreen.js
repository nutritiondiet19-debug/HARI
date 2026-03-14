import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, TextInput, StyleSheet, FlatList,
  TouchableOpacity, StatusBar, Animated, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import FoodCard from '../../components/FoodCard';
import SkeletonLoader from '../../components/SkeletonLoader';
import { FontSize, FontWeight, BorderRadius, Colors, Shadow } from '../../theme';
import TN_FOODS, { searchFoods, getFoodsByCategory, TN_CATEGORIES } from '../../data/tamilnaduFoods';

const { width: SW } = Dimensions.get('window');

const CATEGORY_COLORS = {
  'All':              ['#6366f1', '#8b5cf6'],
  'Breakfast':        ['#f97316', '#fb923c'],
  'Rice & Gravies':   ['#22c55e', '#16a34a'],
  'Tiffin':           ['#eab308', '#ca8a04'],
  'Sweets & Desserts':['#ec4899', '#db2777'],
  'Snacks':           ['#f59e0b', '#d97706'],
  'Drinks & Beverages':['#06b6d4', '#0891b2'],
  'Street Food':      ['#ef4444', '#dc2626'],
  'Seafood':          ['#3b82f6', '#2563eb'],
  'Non-Veg':          ['#a855f7', '#9333ea'],
  'Legumes & Lentils':['#84cc16', '#65a30d'],
  'Chutneys & Sides': ['#14b8a6', '#0d9488'],
  'Modern & Fusion':  ['#f43f5e', '#e11d48'],
};

const CATEGORY_EMOJIS = {
  'All':'🍽️','Breakfast':'🌅','Rice & Gravies':'🍛','Tiffin':'🫓',
  'Sweets & Desserts':'🍮','Snacks':'🥜','Drinks & Beverages':'🥤',
  'Street Food':'🌮','Seafood':'🐟','Non-Veg':'🍗',
  'Legumes & Lentils':'🫘','Chutneys & Sides':'🥗','Modern & Fusion':'✨',
};

const FoodSearchScreen = ({ navigation, route }) => {
  const { theme, isDark } = useTheme();
  const { meal, onSelect } = route?.params || {};
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [results, setResults] = useState(TN_FOODS);
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState(new Set());

  // Animations
  const headerAnim = useRef(new Animated.Value(0)).current;
  const searchAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(searchAnim, { toValue: 1, duration: 700, delay: 200, useNativeDriver: true }),
    ]).start();
  }, []);

  const filterAndSearch = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      let items = query.trim() ? searchFoods(query) : TN_FOODS;
      if (activeFilter !== 'All') {
        const catItems = getFoodsByCategory(activeFilter);
        if (query.trim()) {
          const q = query.toLowerCase();
          items = catItems.filter(f =>
            f.name.toLowerCase().includes(q) ||
            f.tamilName?.includes(q) ||
            (f.tags && f.tags.some(t => t.includes(q)))
          );
        } else {
          items = catItems;
        }
      }
      setResults(items);
      setLoading(false);
    }, 200);
  }, [query, activeFilter]);

  useEffect(() => { filterAndSearch(); }, [filterAndSearch]);

  const handleSelect = (food) => {
    if (onSelect) {
      onSelect(food);
      navigation.goBack();
    } else {
      navigation.navigate('AddMeal', { selectedFood: food, meal });
    }
  };

  const toggleFav = (food) => {
    setFavorites(prev => {
      const next = new Set(prev);
      next.has(food.id) ? next.delete(food.id) : next.add(food.id);
      return next;
    });
  };

  const activeCatColors = CATEGORY_COLORS[activeFilter] || ['#6366f1', '#8b5cf6'];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" />

      {/* ── Premium Gradient Header ── */}
      <Animated.View style={{ opacity: headerAnim, transform: [{ translateY: headerAnim.interpolate({ inputRange: [0,1], outputRange: [-30, 0] }) }] }}>
        <LinearGradient
          colors={activeCatColors}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          {/* Decorative bubbles */}
          <View style={[styles.bubble, styles.bubble1]} />
          <View style={[styles.bubble, styles.bubble2]} />

          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <View style={styles.iconCircle}>
              <Ionicons name="arrow-back" size={20} color="#fff" />
            </View>
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerEmoji}>{CATEGORY_EMOJIS[activeFilter] || '🍽️'}</Text>
            <Text style={styles.headerTitle}>
              {meal ? `Add to ${meal.charAt(0).toUpperCase() + meal.slice(1)}` : 'Tamil Nadu Foods'}
            </Text>
            <Text style={styles.headerSub}>
              {results.length.toLocaleString()} items • Ancient to Modern
            </Text>
          </View>

          <TouchableOpacity onPress={() => navigation.navigate('Scanner', { meal })} style={styles.iconCircle}>
            <Ionicons name="barcode-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </LinearGradient>
      </Animated.View>

      {/* ── Search Bar ── */}
      <Animated.View style={[
        styles.searchWrapper,
        { opacity: searchAnim, transform: [{ translateY: searchAnim.interpolate({ inputRange: [0,1], outputRange: [20, 0] }) }] }
      ]}>
        <View style={[styles.searchBar, { backgroundColor: theme.card, borderColor: theme.border }, Shadow.md]}>
          <LinearGradient colors={activeCatColors} style={styles.searchIcon} start={{ x:0, y:0 }} end={{ x:1, y:1 }}>
            <Ionicons name="search" size={16} color="#fff" />
          </LinearGradient>
          <TextInput
            style={[styles.searchInput, { color: theme.textPrimary }]}
            placeholder="Search in Tamil or English... (இட்லி, Dosa)"
            placeholderTextColor={theme.textLight}
            value={query}
            onChangeText={setQuery}
            autoFocus={!!meal}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} style={styles.clearBtn}>
              <View style={styles.clearCircle}>
                <Ionicons name="close" size={12} color="#fff" />
              </View>
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>

      {/* ── Category Filter Chips ── */}
      <FlatList
        data={TN_CATEGORIES}
        keyExtractor={c => c}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersRow}
        renderItem={({ item }) => {
          const isActive = activeFilter === item;
          const chipColors = CATEGORY_COLORS[item] || ['#6366f1', '#8b5cf6'];
          return (
            <TouchableOpacity
              onPress={() => setActiveFilter(item)}
              activeOpacity={0.8}
              style={styles.chipWrap}
            >
              {isActive ? (
                <LinearGradient colors={chipColors} style={styles.chipActive} start={{ x:0, y:0 }} end={{ x:1, y:0 }}>
                  <Text style={styles.chipEmoji}>{CATEGORY_EMOJIS[item] || '🍽️'}</Text>
                  <Text style={styles.chipLabelActive}>{item}</Text>
                </LinearGradient>
              ) : (
                <View style={[styles.chipInactive, { backgroundColor: theme.card, borderColor: theme.border }]}>
                  <Text style={styles.chipEmoji}>{CATEGORY_EMOJIS[item] || '🍽️'}</Text>
                  <Text style={[styles.chipLabelInactive, { color: theme.textSecondary }]}>{item}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        }}
      />

      {/* ── Result Count Badge ── */}
      {!loading && (
        <View style={styles.countRow}>
          <View style={[styles.countBadge, { backgroundColor: activeCatColors[0] + '18' }]}>
            <Text style={[styles.countText, { color: activeCatColors[0] }]}>
              {results.length} results {query ? `for "${query}"` : `in ${activeFilter}`}
            </Text>
          </View>
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Text style={[styles.clearAll, { color: activeCatColors[0] }]}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* ── Food List ── */}
      {loading ? (
        <View style={{ padding: 16 }}>
          <SkeletonLoader type="food-list" />
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={f => f.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>🔍</Text>
              <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>No foods found</Text>
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                Try searching in Tamil (இட்லி) or English (Idli)
              </Text>
            </View>
          }
          renderItem={({ item, index }) => (
            <FoodCard
              food={{ ...item, isFavorite: favorites.has(item.id) }}
              onPress={handleSelect}
              onFavorite={toggleFav}
              index={index}
              accentColors={CATEGORY_COLORS[
                Object.keys(CATEGORY_COLORS).find(k =>
                  item.category === (CATEGORY_COLORS[k] ? k.toLowerCase().replace(/ & /g,'-').replace(/ /g,'-') : null)
                ) || 'All'
              ] || activeCatColors}
            />
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 52, paddingBottom: 24, paddingHorizontal: 20,
    flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between',
    overflow: 'hidden', position: 'relative',
  },
  bubble: { position: 'absolute', borderRadius: 999, opacity: 0.15, backgroundColor: '#fff' },
  bubble1: { width: 120, height: 120, top: -40, right: -20 },
  bubble2: { width: 80, height: 80, bottom: -20, left: 60 },
  backBtn: {},
  iconCircle: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerEmoji: { fontSize: 30, marginBottom: 4 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: FontWeight.bold },
  headerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 2 },
  searchWrapper: { paddingHorizontal: 16, marginTop: -20, zIndex: 10 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 14, borderRadius: 18, borderWidth: 1,
  },
  searchIcon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  searchInput: { flex: 1, fontSize: FontSize.sm },
  clearBtn: {},
  clearCircle: {
    width: 20, height: 20, borderRadius: 10, backgroundColor: '#94a3b8',
    alignItems: 'center', justifyContent: 'center',
  },
  filtersRow: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  chipWrap: {},
  chipActive: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: BorderRadius.full,
  },
  chipInactive: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: BorderRadius.full, borderWidth: 1,
  },
  chipEmoji: { fontSize: 14 },
  chipLabelActive: { color: '#fff', fontSize: 12, fontWeight: FontWeight.semibold },
  chipLabelInactive: { fontSize: 12 },
  countRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, marginBottom: 4,
  },
  countBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  countText: { fontSize: 12, fontWeight: FontWeight.semibold },
  clearAll: { fontSize: 12, fontWeight: FontWeight.semibold },
  list: { paddingHorizontal: 16, paddingBottom: 40, gap: 10 },
  empty: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyEmoji: { fontSize: 52 },
  emptyTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  emptyText: { fontSize: FontSize.sm, textAlign: 'center', paddingHorizontal: 32 },
});

export default FoodSearchScreen;
