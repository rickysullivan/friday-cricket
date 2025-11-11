/**
 * Game Setup Screen
 * Multi-step wizard: team names → add players → review pairs/bowlers → start match
 * T046 - Complete implementation
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { useGame } from '@/hooks/useGame';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import PlayerList from '@/components/game/PlayerList';
import BattingPairCard from '@/components/game/BattingPairCard';
import BowlerRotation from '@/components/game/BowlerRotation';
import { makePairs } from '@/services/pairingAlgorithm';
import { planBowlers } from '@/services/bowlingRotation';

interface Player {
  id: string;
  name: string;
}

interface BattingPair {
  player1Id: string;
  player1Name: string;
  player2Id: string;
  player2Name: string;
  oversAllocated: number;
}

type WizardStep = 'teamNames' | 'addPlayers' | 'review' | 'complete';

export default function GameSetupScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { colors } = useTheme();
  const { createGame } = useGame();

  const [currentStep, setCurrentStep] = useState<WizardStep>('teamNames');
  const [teamAName, setTeamAName] = useState('Team A');
  const [teamBName, setTeamBName] = useState('Team B');
  const [teamAPlayers, setTeamAPlayers] = useState<Player[]>([]);
  const [teamBPlayers, setTeamBPlayers] = useState<Player[]>([]);
  const [teamAPairs, setTeamAPairs] = useState<BattingPair[]>([]);
  const [teamBPairs, setTeamBPairs] = useState<BattingPair[]>([]);
  const [teamABowlers, setTeamABowlers] = useState<string[]>([]);
  const [teamBBowlers, setTeamBBowlers] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Step 1: Team Names
  function handleTeamNamesNext() {
    if (teamAName.trim().length < 2) {
      setError('Team A name must be at least 2 characters');
      return;
    }
    if (teamBName.trim().length < 2) {
      setError('Team B name must be at least 2 characters');
      return;
    }
    if (teamAName.trim().toLowerCase() === teamBName.trim().toLowerCase()) {
      setError('Team names must be unique');
      return;
    }
    setError(null);
    setCurrentStep('addPlayers');
  }

  // Step 2: Add Players
  function handleAddPlayerTeamA(name: string) {
    const newPlayer: Player = {
      id: `teamA-${Date.now()}-${Math.random()}`,
      name,
    };
    setTeamAPlayers([...teamAPlayers, newPlayer]);
  }

  function handleRemovePlayerTeamA(id: string) {
    setTeamAPlayers(teamAPlayers.filter((p) => p.id !== id));
  }

  function handleAddPlayerTeamB(name: string) {
    const newPlayer: Player = {
      id: `teamB-${Date.now()}-${Math.random()}`,
      name,
    };
    setTeamBPlayers([...teamBPlayers, newPlayer]);
  }

  function handleRemovePlayerTeamB(id: string) {
    setTeamBPlayers(teamBPlayers.filter((p) => p.id !== id));
  }

  function handlePlayersNext() {
    if (teamAPlayers.length < 8) {
      setError(`${teamAName} needs at least 8 players (currently ${teamAPlayers.length})`);
      return;
    }
    if (teamBPlayers.length < 8) {
      setError(`${teamBName} needs at least 8 players (currently ${teamBPlayers.length})`);
      return;
    }

    // Generate pairs and bowling rotation
    try {
      const pairsA = makePairs(teamAPlayers);
      const pairsB = makePairs(teamBPlayers);
      const bowlersA = planBowlers(teamAPlayers, 16);
      const bowlersB = planBowlers(teamBPlayers, 16);

      setTeamAPairs(pairsA);
      setTeamBPairs(pairsB);
      setTeamABowlers(bowlersA);
      setTeamBBowlers(bowlersB);

      setError(null);
      setCurrentStep('review');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate pairs/bowlers');
    }
  }

  function handlePlayersBack() {
    setCurrentStep('teamNames');
  }

  // Step 3: Review
  function handleReviewBack() {
    setCurrentStep('addPlayers');
  }

  async function handleStartMatch() {
    try {
      // Create game in database
      // TODO: Re-enable when WatermelonDB is configured
      // const game = await createGame({
      //   teamAName,
      //   teamBName,
      //   teamAPlayers,
      //   teamBPlayers,
      //   teamAPairs,
      //   teamBPairs,
      //   teamABowlers,
      //   teamBBowlers,
      // });

      // For now, navigate to scoring with placeholder data
      router.push(`/game/${id}/scoring`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create game');
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.content}
      >
        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressSteps}>
            <View
              style={[
                styles.progressDot,
                {
                  backgroundColor:
                    currentStep === 'teamNames' ? colors.primary : colors.success,
                },
              ]}
            />
            <View
              style={[
                styles.progressLine,
                {
                  backgroundColor:
                    currentStep !== 'teamNames' ? colors.success : colors.border,
                },
              ]}
            />
            <View
              style={[
                styles.progressDot,
                {
                  backgroundColor:
                    currentStep === 'addPlayers'
                      ? colors.primary
                      : currentStep === 'review'
                      ? colors.success
                      : colors.border,
                },
              ]}
            />
            <View
              style={[
                styles.progressLine,
                {
                  backgroundColor:
                    currentStep === 'review' ? colors.success : colors.border,
                },
              ]}
            />
            <View
              style={[
                styles.progressDot,
                {
                  backgroundColor:
                    currentStep === 'review' ? colors.primary : colors.border,
                },
              ]}
            />
          </View>
          <Text style={[styles.progressText, { color: colors.textSecondary }]}>
            Step {currentStep === 'teamNames' ? 1 : currentStep === 'addPlayers' ? 2 : 3}{' '}
            of 3
          </Text>
        </View>

        {error && (
          <View style={[styles.errorContainer, { backgroundColor: '#FFF3CD' }]}>
            <Text style={[styles.errorText, { color: '#856404' }]}>{error}</Text>
          </View>
        )}

        {/* Step 1: Team Names */}
        {currentStep === 'teamNames' && (
          <View style={styles.stepContainer}>
            <Text style={[styles.stepTitle, { color: colors.text }]}>
              Enter Team Names
            </Text>
            <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
              Give each team a unique name
            </Text>

            <Input
              value={teamAName}
              onChangeText={(text) => {
                setTeamAName(text);
                if (error) setError(null);
              }}
              placeholder="Team A name"
              style={styles.input}
            />

            <Input
              value={teamBName}
              onChangeText={(text) => {
                setTeamBName(text);
                if (error) setError(null);
              }}
              placeholder="Team B name"
              style={styles.input}
            />

            <Button
              title="Next"
              onPress={handleTeamNamesNext}
              variant="primary"
              size="large"
            />
          </View>
        )}

        {/* Step 2: Add Players */}
        {currentStep === 'addPlayers' && (
          <View style={styles.stepContainer}>
            <Text style={[styles.stepTitle, { color: colors.text }]}>
              Add Players
            </Text>
            <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
              Add at least 8 players to each team
            </Text>

            <View style={styles.teamSection}>
              <PlayerList
                players={teamAPlayers}
                onAddPlayer={handleAddPlayerTeamA}
                onRemovePlayer={handleRemovePlayerTeamA}
                teamName={teamAName}
                minPlayers={8}
              />
            </View>

            <View style={styles.teamSection}>
              <PlayerList
                players={teamBPlayers}
                onAddPlayer={handleAddPlayerTeamB}
                onRemovePlayer={handleRemovePlayerTeamB}
                teamName={teamBName}
                minPlayers={8}
              />
            </View>

            <View style={styles.buttonRow}>
              <Button
                title="Back"
                onPress={handlePlayersBack}
                variant="secondary"
                size="large"
                style={{ flex: 1 }}
              />
              <Button
                title="Next"
                onPress={handlePlayersNext}
                variant="primary"
                size="large"
                style={{ flex: 1 }}
              />
            </View>
          </View>
        )}

        {/* Step 3: Review */}
        {currentStep === 'review' && (
          <View style={styles.stepContainer}>
            <Text style={[styles.stepTitle, { color: colors.text }]}>
              Review Setup
            </Text>
            <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
              Check batting pairs and bowling rotation
            </Text>

            {/* Team A */}
            <View style={styles.reviewSection}>
              <Text style={[styles.reviewTeamTitle, { color: colors.text }]}>
                {teamAName} - Batting Pairs
              </Text>
              {teamAPairs.map((pair, index) => (
                <BattingPairCard key={index} pair={pair} pairNumber={index + 1} />
              ))}

              <BowlerRotation
                bowlingPlan={teamABowlers.map((bowlerId, idx) => {
                  const bowler = teamAPlayers.find((p) => p.id === bowlerId);
                  return {
                    overNumber: idx + 1,
                    bowlerId,
                    bowlerName: bowler?.name || 'Unknown',
                  };
                })}
                currentOverNumber={1}
              />
            </View>

            {/* Team B */}
            <View style={styles.reviewSection}>
              <Text style={[styles.reviewTeamTitle, { color: colors.text }]}>
                {teamBName} - Batting Pairs
              </Text>
              {teamBPairs.map((pair, index) => (
                <BattingPairCard key={index} pair={pair} pairNumber={index + 1} />
              ))}

              <BowlerRotation
                bowlingPlan={teamBBowlers.map((bowlerId, idx) => {
                  const bowler = teamBPlayers.find((p) => p.id === bowlerId);
                  return {
                    overNumber: idx + 1,
                    bowlerId,
                    bowlerName: bowler?.name || 'Unknown',
                  };
                })}
                currentOverNumber={1}
              />
            </View>

            <View style={styles.buttonRow}>
              <Button
                title="Back"
                onPress={handleReviewBack}
                variant="secondary"
                size="large"
                style={{ flex: 1 }}
              />
              <Button
                title="Start Match"
                onPress={handleStartMatch}
                variant="primary"
                size="large"
                style={{ flex: 1 }}
              />
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressSteps: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  progressLine: {
    flex: 1,
    height: 4,
    marginHorizontal: 8,
  },
  progressText: {
    fontSize: 14,
    textAlign: 'center',
  },
  errorContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    fontWeight: '500',
  },
  stepContainer: {
    gap: 16,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  stepDescription: {
    fontSize: 16,
  },
  input: {
    marginBottom: 8,
  },
  teamSection: {
    marginBottom: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  reviewSection: {
    gap: 12,
    marginBottom: 24,
  },
  reviewTeamTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
});
