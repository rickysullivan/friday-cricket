/**
 * BattingPairCard Component
 * Display batting pair with player names and overs allocated
 * T049 - Game management component
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import Card from '../ui/Card';

interface BattingPair {
  player1Name: string;
  player2Name: string;
  oversAllocated: number;
  oversFaced?: number;
  isActive?: boolean;
}

interface BattingPairCardProps {
  pair: BattingPair;
  pairNumber: number;
}

export default function BattingPairCard({
  pair,
  pairNumber,
}: BattingPairCardProps) {
  const { colors } = useTheme();

  const oversFaced = pair.oversFaced ?? 0;
  const progress = oversFaced / pair.oversAllocated;
  const isComplete = oversFaced >= pair.oversAllocated;

  return (
    <Card
      style={[
        styles.card,
        pair.isActive && { borderColor: colors.primary, borderWidth: 2 },
      ]}
    >
      <View style={styles.header}>
        <Text style={[styles.pairNumber, { color: colors.textSecondary }]}>
          Pair {pairNumber}
        </Text>
        {pair.isActive && (
          <View
            style={[
              styles.activeBadge,
              { backgroundColor: colors.primary },
            ]}
          >
            <Text style={[styles.activeBadgeText, { color: colors.buttonText }]}>
              Active
            </Text>
          </View>
        )}
        {isComplete && (
          <View
            style={[
              styles.completeBadge,
              { backgroundColor: colors.success },
            ]}
          >
            <Text style={[styles.completeBadgeText, { color: '#FFFFFF' }]}>
              Complete
            </Text>
          </View>
        )}
      </View>

      <View style={styles.players}>
        <Text style={[styles.playerName, { color: colors.text }]}>
          {pair.player1Name}
        </Text>
        <Text style={[styles.playerName, { color: colors.text }]}>
          {pair.player2Name}
        </Text>
      </View>

      <View style={styles.overs}>
        <Text style={[styles.oversText, { color: colors.textSecondary }]}>
          Overs: {oversFaced} / {pair.oversAllocated}
        </Text>

        {/* Progress bar */}
        <View
          style={[
            styles.progressBarContainer,
            { backgroundColor: colors.border },
          ]}
        >
          <View
            style={[
              styles.progressBar,
              {
                width: `${Math.min(progress * 100, 100)}%`,
                backgroundColor: isComplete
                  ? colors.success
                  : pair.isActive
                  ? colors.primary
                  : colors.textSecondary,
              },
            ]}
          />
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  pairNumber: {
    fontSize: 14,
    fontWeight: '600',
  },
  activeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  activeBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  completeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  completeBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  players: {
    gap: 4,
    marginBottom: 12,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '500',
  },
  overs: {
    gap: 8,
  },
  oversText: {
    fontSize: 14,
  },
  progressBarContainer: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
});
