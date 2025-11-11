/**
 * PlayerList Component
 * Add/remove players with unique name validation
 * T048 - Game management component
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import Input from '../ui/Input';
import Button from '../ui/Button';

interface Player {
  id: string;
  name: string;
}

interface PlayerListProps {
  players: Player[];
  onAddPlayer: (name: string) => void;
  onRemovePlayer: (id: string) => void;
  teamName: string;
  minPlayers?: number;
}

export default function PlayerList({
  players,
  onAddPlayer,
  onRemovePlayer,
  teamName,
  minPlayers = 8,
}: PlayerListProps) {
  const { colors } = useTheme();
  const [newPlayerName, setNewPlayerName] = useState('');
  const [error, setError] = useState<string | null>(null);

  function validatePlayerName(name: string): string | null {
    if (name.trim().length === 0) {
      return 'Player name cannot be empty';
    }

    if (name.trim().length < 2) {
      return 'Player name must be at least 2 characters';
    }

    // Check for duplicate names
    const isDuplicate = players.some(
      (p) => p.name.toLowerCase() === name.trim().toLowerCase()
    );

    if (isDuplicate) {
      return 'Player name must be unique within team';
    }

    return null;
  }

  function handleAddPlayer() {
    const trimmedName = newPlayerName.trim();
    const validationError = validatePlayerName(trimmedName);

    if (validationError) {
      setError(validationError);
      return;
    }

    onAddPlayer(trimmedName);
    setNewPlayerName('');
    setError(null);
  }

  function handleRemovePlayer(id: string) {
    if (players.length <= minPlayers) {
      setError(`Cannot remove player - minimum ${minPlayers} players required`);
      return;
    }

    onRemovePlayer(id);
    setError(null);
  }

  const canAddPlayer = newPlayerName.trim().length > 0;
  const needsMorePlayers = players.length < minPlayers;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.teamName, { color: colors.text }]}>
          {teamName}
        </Text>
        <Text style={[styles.playerCount, { color: colors.textSecondary }]}>
          {players.length} players {needsMorePlayers && `(min ${minPlayers})`}
        </Text>
      </View>

      {error && (
        <View style={[styles.errorContainer, { backgroundColor: '#FFF3CD' }]}>
          <Text style={[styles.errorText, { color: '#856404' }]}>
            {error}
          </Text>
        </View>
      )}

      <View style={styles.inputRow}>
        <Input
          value={newPlayerName}
          onChangeText={(text) => {
            setNewPlayerName(text);
            if (error) setError(null);
          }}
          placeholder="Player name"
          style={styles.input}
          onSubmitEditing={handleAddPlayer}
        />
        <Button
          title="Add"
          onPress={handleAddPlayer}
          disabled={!canAddPlayer}
          variant="secondary"
          size="medium"
        />
      </View>

      <FlatList
        data={players}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={[
              styles.playerItem,
              {
                backgroundColor: colors.cardBackground,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.playerName, { color: colors.text }]}>
              {item.name}
            </Text>
            <Pressable
              onPress={() => handleRemovePlayer(item.id)}
              style={styles.removeButton}
            >
              <Text style={[styles.removeButtonText, { color: colors.error }]}>
                Remove
              </Text>
            </Pressable>
          </View>
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No players added yet
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginBottom: 16,
  },
  teamName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  playerCount: {
    fontSize: 14,
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
  inputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  input: {
    flex: 1,
  },
  listContent: {
    gap: 8,
  },
  playerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '500',
  },
  removeButton: {
    padding: 8,
  },
  removeButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    padding: 24,
  },
});
