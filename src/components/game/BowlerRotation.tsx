/**
 * BowlerRotation Component
 * Show bowling order with current bowler highlighted
 * T050 - Game management component
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import Card from '../ui/Card';

interface BowlerRotationProps {
  bowlingPlan: Array<{ overNumber: number; bowlerId: string; bowlerName: string }>;
  currentOverNumber: number;
}

export default function BowlerRotation({
  bowlingPlan,
  currentOverNumber,
}: BowlerRotationProps) {
  const { colors } = useTheme();

  return (
    <Card style={styles.card}>
      <Text style={[styles.title, { color: colors.text }]}>
        Bowling Rotation
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {bowlingPlan.map((item) => {
          const isCurrent = item.overNumber === currentOverNumber;
          const isCompleted = item.overNumber < currentOverNumber;
          const isUpcoming = item.overNumber > currentOverNumber;

          return (
            <View
              key={item.overNumber}
              style={[
                styles.overItem,
                {
                  backgroundColor: isCurrent
                    ? colors.primary
                    : isCompleted
                    ? colors.success
                    : colors.cardBackground,
                  borderColor: isCurrent ? colors.primaryDark : colors.border,
                  opacity: isUpcoming ? 0.6 : 1,
                },
              ]}
            >
              <Text
                style={[
                  styles.overNumber,
                  {
                    color: isCurrent || isCompleted
                      ? colors.buttonText
                      : colors.textSecondary,
                  },
                ]}
              >
                Over {item.overNumber}
              </Text>
              <Text
                style={[
                  styles.bowlerName,
                  {
                    color: isCurrent || isCompleted
                      ? colors.buttonText
                      : colors.text,
                  },
                ]}
              >
                {item.bowlerName}
              </Text>
              {isCurrent && (
                <View
                  style={[
                    styles.currentBadge,
                    { backgroundColor: colors.buttonText },
                  ]}
                >
                  <Text
                    style={[styles.currentBadgeText, { color: colors.primary }]}
                  >
                    Now
                  </Text>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View
            style={[
              styles.legendDot,
              { backgroundColor: colors.success },
            ]}
          />
          <Text style={[styles.legendText, { color: colors.textSecondary }]}>
            Completed
          </Text>
        </View>
        <View style={styles.legendItem}>
          <View
            style={[
              styles.legendDot,
              { backgroundColor: colors.primary },
            ]}
          />
          <Text style={[styles.legendText, { color: colors.textSecondary }]}>
            Current
          </Text>
        </View>
        <View style={styles.legendItem}>
          <View
            style={[
              styles.legendDot,
              { backgroundColor: colors.border },
            ]}
          />
          <Text style={[styles.legendText, { color: colors.textSecondary }]}>
            Upcoming
          </Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  scrollContent: {
    gap: 12,
    paddingBottom: 16,
  },
  overItem: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    minWidth: 100,
    alignItems: 'center',
  },
  overNumber: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  bowlerName: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  currentBadge: {
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  currentBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
  },
});
