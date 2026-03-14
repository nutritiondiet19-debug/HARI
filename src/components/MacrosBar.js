import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { FontSize, FontWeight, BorderRadius, Spacing } from '../theme';

const MacrosBar = ({ protein = 0, carbs = 0, fat = 0, compact = false }) => {
  const { theme } = useTheme();
  const total = protein + carbs + fat || 1;

  const segments = [
    { label: 'Protein', value: protein, color: '#3b82f6', unit: 'g' },
    { label: 'Carbs', value: carbs, color: '#f97316', unit: 'g' },
    { label: 'Fat', value: fat, color: '#a855f7', unit: 'g' },
  ];

  return (
    <View>
      {/* Bar */}
      <View style={styles.barContainer}>
        {segments.map((seg, i) => (
          <View
            key={seg.label}
            style={[
              styles.barSegment,
              {
                backgroundColor: seg.color,
                flex: seg.value / total,
                borderTopLeftRadius: i === 0 ? 4 : 0,
                borderBottomLeftRadius: i === 0 ? 4 : 0,
                borderTopRightRadius: i === 2 ? 4 : 0,
                borderBottomRightRadius: i === 2 ? 4 : 0,
              },
            ]}
          />
        ))}
      </View>

      {/* Labels */}
      {!compact && (
        <View style={styles.labelsRow}>
          {segments.map(seg => (
            <View key={seg.label} style={styles.labelItem}>
              <View style={[styles.dot, { backgroundColor: seg.color }]} />
              <Text style={[styles.labelText, { color: theme.textSecondary }]}>
                {seg.label}
              </Text>
              <Text style={[styles.valueText, { color: theme.textPrimary }]}>
                {Math.round(seg.value)}{seg.unit}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  barContainer: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: '#e2e8f0',
    marginBottom: 8,
  },
  barSegment: { height: '100%' },
  labelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  labelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  labelText: {
    fontSize: FontSize.xs,
    marginRight: 2,
  },
  valueText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },
});

export default MacrosBar;
