import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../hooks/useTheme';
import { BorderRadius, Shadow } from '../theme';

const GlassmorphismCard = ({ children, style, gradient = false, colors }) => {
  const { theme } = useTheme();

  if (gradient && colors) {
    return (
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.card, { borderColor: 'rgba(255,255,255,0.2)' }, Shadow.lg, style]}
      >
        {children}
      </LinearGradient>
    );
  }

  return (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }, Shadow.md, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.xl,
    padding: 20,
    borderWidth: 1,
  },
});

export default GlassmorphismCard;
