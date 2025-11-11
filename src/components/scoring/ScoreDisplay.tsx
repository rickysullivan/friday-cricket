import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SIZES } from '../../utils/constants';

interface ScoreDisplayProps {
  runs: number;
  wickets: number;
  overs: number;
  balls: number;
  teamName?: string;
}

export default function ScoreDisplay({ runs, wickets, overs, balls, teamName }: ScoreDisplayProps) {
  const oversDisplay = `${overs}.${balls}`;

  return (
    <View style={styles.container}>
      {teamName && <Text style={styles.teamName}>{teamName}</Text>}
      <View style={styles.scoreRow}>
        <Text style={styles.score}>
          {runs}/{wickets}
        </Text>
        <Text style={styles.overs}>({oversDisplay})</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: SIZES.SPACING_LG,
  },
  teamName: {
    fontSize: SIZES.FONT_MEDIUM,
    fontWeight: '600',
    color: COLORS.TEXT,
    marginBottom: SIZES.SPACING_SM,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  score: {
    fontSize: SIZES.FONT_XLARGE, // 48pt for outdoor visibility
    fontWeight: 'bold',
    color: COLORS.TEXT,
    marginRight: SIZES.SPACING_MD,
  },
  overs: {
    fontSize: SIZES.FONT_LARGE, // 32pt
    fontWeight: '600',
    color: COLORS.TEXT,
  },
});
