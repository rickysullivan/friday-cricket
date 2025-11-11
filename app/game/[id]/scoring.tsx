/**
 * Scoring Screen
 * Active game interface: score display, run keypad, extras, undo
 * T047 - Complete implementation
 * T068-T070 - Rule enforcement integration
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  SafeAreaView,
  ToastAndroid,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { useScoring } from '@/hooks/useScoring';
import ScoreDisplay from '@/components/scoring/ScoreDisplay';
import RunKeypad from '@/components/scoring/RunKeypad';
import ExtraButtons from '@/components/scoring/ExtraButtons';
import UndoButton from '@/components/scoring/UndoButton';
import SlidePanel from '@/components/ui/SlidePanel';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {
  validateBattingPairLimit,
  validateInningsComplete,
} from '@/services/ruleEngine';

export default function ScoringScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { colors } = useTheme();

  // Mock game data (TODO: Load from database)
  const [teamName, setTeamName] = useState('Team A');
  const [runs, setRuns] = useState(0);
  const [wickets, setWickets] = useState(0);
  const [currentOver, setCurrentOver] = useState(0);
  const [currentBall, setCurrentBall] = useState(0);
  const [currentBowler, setCurrentBowler] = useState('Bowler 1');
  const [currentPair, setCurrentPair] = useState({
    player1: 'Player 1',
    player2: 'Player 2',
    oversFaced: 0,
    oversAllocated: 4,
  });
  const [ballsInOver, setBallsInOver] = useState<string[]>([]);
  const [canUndo, setCanUndo] = useState(false);
  const [ruleWarning, setRuleWarning] = useState<string | null>(null);
  const [showWarningPanel, setShowWarningPanel] = useState(false);

  const gameId = Array.isArray(id) ? id[0] : id || 'new';
  const { recordRun, recordWicket, recordExtra, undoLastEvent, advanceOver } =
    useScoring(gameId);

  // T069: Check if batting pair needs auto-rotation
  useEffect(() => {
    const pairValidation = validateBattingPairLimit({
      id: '1',
      player1Id: '1',
      player1Name: currentPair.player1,
      player2Id: '2',
      player2Name: currentPair.player2,
      oversAllocated: currentPair.oversAllocated,
      oversFaced: currentPair.oversFaced,
    });

    if (!pairValidation.isValid) {
      // Auto-rotate to next pair
      showToast(`${currentPair.player1} and ${currentPair.player2} have completed their overs. Rotating to next pair.`);
      // TODO: Load next pair from database
      setCurrentPair({
        player1: 'Next Player 1',
        player2: 'Next Player 2',
        oversFaced: 0,
        oversAllocated: 4,
      });
    }
  }, [currentPair.oversFaced]);

  // T070: Check innings completion after each scoring event
  useEffect(() => {
    const inningsCheck = validateInningsComplete({
      id: '1',
      oversCompleted: currentOver,
      oversPlanned: 16,
      wickets,
    });

    if (inningsCheck.isComplete) {
      if (inningsCheck.reason === 'wickets') {
        Alert.alert(
          'Innings Complete',
          '10 wickets have fallen. Innings is complete.',
          [{ text: 'OK', onPress: handleInningsComplete }]
        );
      } else if (inningsCheck.reason === 'overs') {
        Alert.alert(
          'Innings Complete',
          '16 overs completed. Innings is complete.',
          [{ text: 'OK', onPress: handleInningsComplete }]
        );
      }
    }
  }, [currentOver, wickets]);

  function showToast(message: string) {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      // iOS alternative - could use a third-party toast library
      Alert.alert('Notice', message);
    }
  }

  async function handleRunScored(runValue: number) {
    await recordRun(runValue);

    // Update local state (TODO: Replace with database state management)
    setRuns(runs + runValue);
    setBallsInOver([...ballsInOver, `${runValue}`]);
    setCanUndo(true);

    // Check if over is complete
    if (ballsInOver.length + 1 >= 6) {
      handleOverComplete();
    } else {
      setCurrentBall(currentBall + 1);
    }
  }

  async function handleWide() {
    await recordExtra(1, true, false);

    // Wide adds 1 run but doesn't count as a ball
    setRuns(runs + 1);
    setBallsInOver([...ballsInOver, 'wd']);
    setCanUndo(true);
  }

  async function handleNoBall() {
    await recordExtra(1, false, true);

    // No-ball adds 1 run but doesn't count as a ball
    setRuns(runs + 1);
    setBallsInOver([...ballsInOver, 'nb']);
    setCanUndo(true);
  }

  async function handleWicket() {
    await recordWicket();

    // Wicket counts as a ball but doesn't add runs
    setWickets(wickets + 1);
    setBallsInOver([...ballsInOver, 'W']);
    setCanUndo(true);

    // Check if innings is over (10 wickets)
    if (wickets + 1 >= 10) {
      Alert.alert(
        'Innings Complete',
        '10 wickets fallen. Innings is complete.',
        [{ text: 'OK', onPress: handleInningsComplete }]
      );
      return;
    }

    // Check if over is complete
    if (ballsInOver.length + 1 >= 6) {
      handleOverComplete();
    } else {
      setCurrentBall(currentBall + 1);
    }
  }

  async function handleUndo() {
    await undoLastEvent();

    // TODO: Re-implement with database state
    // For now, just remove the last ball from the over
    if (ballsInOver.length > 0) {
      const lastBall = ballsInOver[ballsInOver.length - 1];
      setBallsInOver(ballsInOver.slice(0, -1));

      // Undo run changes
      if (lastBall === 'W') {
        setWickets(Math.max(0, wickets - 1));
      } else if (lastBall === 'wd' || lastBall === 'nb') {
        setRuns(Math.max(0, runs - 1));
      } else {
        const runValue = parseInt(lastBall, 10);
        if (!isNaN(runValue)) {
          setRuns(Math.max(0, runs - runValue));
        }
      }

      setCanUndo(ballsInOver.length > 1);
    }
  }

  function handleOverComplete() {
    Alert.alert(
      'Over Complete',
      `Over ${currentOver + 1} is complete. Next bowler: ${currentBowler}`,
      [
        {
          text: 'Continue',
          onPress: () => {
            advanceOver();
            setCurrentOver(currentOver + 1);
            setCurrentBall(0);
            setBallsInOver([]);

            // Check if batting pair needs to rotate (every 4 overs)
            const newOversFaced = currentPair.oversFaced + 1;
            if (newOversFaced >= currentPair.oversAllocated) {
              Alert.alert(
                'Pair Complete',
                `${currentPair.player1} and ${currentPair.player2} have completed their ${currentPair.oversAllocated} overs.`,
                [{ text: 'OK' }]
              );
            }

            setCurrentPair({
              ...currentPair,
              oversFaced: newOversFaced,
            });

            // Check if innings is complete (16 overs)
            if (currentOver + 1 >= 16) {
              Alert.alert(
                'Innings Complete',
                '16 overs completed. Innings is complete.',
                [{ text: 'OK', onPress: handleInningsComplete }]
              );
            }
          },
        },
      ]
    );
  }

  function handleInningsComplete() {
    // TODO: Switch to other team or go to summary
    router.push(`/game/${id}/summary`);
  }

  function handleEndMatch() {
    Alert.alert(
      'End Match',
      'Are you sure you want to end this match? This will take you to the match summary.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Match',
          style: 'destructive',
          onPress: () => router.push(`/game/${id}/summary`),
        },
      ]
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        {/* Score Display */}
        <ScoreDisplay
          teamName={teamName}
          runs={runs}
          wickets={wickets}
          overs={currentOver}
          balls={currentBall}
        />

        {/* Current Bowler and Batting Pair */}
        <Card style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
              Bowler:
            </Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {currentBowler}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
              Batting:
            </Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {currentPair.player1} & {currentPair.player2}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
              Pair Overs:
            </Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {currentPair.oversFaced} / {currentPair.oversAllocated}
            </Text>
          </View>
        </Card>

        {/* Over Progress */}
        <Card style={styles.overProgressCard}>
          <Text style={[styles.overTitle, { color: colors.text }]}>
            Over {currentOver + 1}
          </Text>
          <View style={styles.ballsContainer}>
            {ballsInOver.map((ball, index) => (
              <View
                key={index}
                style={[
                  styles.ball,
                  {
                    backgroundColor:
                      ball === 'W'
                        ? '#FF0000'
                        : ball === 'wd' || ball === 'nb'
                        ? '#FFA500'
                        : colors.primary,
                  },
                ]}
              >
                <Text style={[styles.ballText, { color: '#FFFFFF' }]}>
                  {ball}
                </Text>
              </View>
            ))}
            {Array.from({ length: 6 - ballsInOver.length }).map((_, index) => (
              <View
                key={`empty-${index}`}
                style={[
                  styles.ball,
                  styles.emptyBall,
                  { borderColor: colors.border },
                ]}
              />
            ))}
          </View>
        </Card>

        {/* Run Keypad */}
        <RunKeypad onRunScored={handleRunScored} />

        {/* Extra Buttons */}
        <ExtraButtons
          onWide={handleWide}
          onNoBall={handleNoBall}
          onWicket={handleWicket}
        />

        {/* Undo Button */}
        <View style={styles.undoContainer}>
          <UndoButton onUndo={handleUndo} disabled={!canUndo} />
        </View>

        {/* End Match Button */}
        <Button
          title="End Match"
          onPress={handleEndMatch}
          variant="secondary"
          size="medium"
        />
      </ScrollView>

      {/* T068: Rule Warning Panel */}
      <SlidePanel
        isVisible={showWarningPanel}
        onClose={() => setShowWarningPanel(false)}
        title="Rule Violation"
      >
        <Text style={[styles.warningText, { color: colors.error }]}>
          {ruleWarning}
        </Text>
        <Button
          title="Understood"
          onPress={() => setShowWarningPanel(false)}
          variant="primary"
          size="medium"
          style={{ marginTop: 16 }}
        />
      </SlidePanel>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  infoCard: {
    padding: 16,
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  overProgressCard: {
    padding: 16,
  },
  overTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  ballsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  ball: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyBall: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  ballText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  undoContainer: {
    alignItems: 'center',
  },
  warningText: {
    fontSize: 16,
    lineHeight: 24,
  },
});
