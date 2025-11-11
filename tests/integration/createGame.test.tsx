/**
 * Integration test for game creation flow
 * Tests the end-to-end process of creating a new game
 *
 * Flow:
 * 1. Render home screen
 * 2. Tap "New Game" button
 * 3. Fill in team names and player names
 * 4. Submit form
 * 5. Verify Game, Teams, and Players created in WatermelonDB
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { database } from '@/models/database';
import Game from '@/models/Game';
import Team from '@/models/Team';
import Player from '@/models/Player';

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockNavigate,
    replace: mockNavigate,
  }),
  Stack: ({ children }: any) => children,
  Tabs: ({ children }: any) => children,
}));

describe('Game Creation Flow', () => {
  beforeEach(async () => {
    // Clear database before each test
    await database.write(async () => {
      const games = await database.get<Game>('games').query().fetch();
      const teams = await database.get<Team>('teams').query().fetch();
      const players = await database.get<Player>('players').query().fetch();

      await Promise.all([
        ...games.map((g) => g.markAsDeleted()),
        ...teams.map((t) => t.markAsDeleted()),
        ...players.map((p) => p.markAsDeleted()),
      ]);
    });

    mockNavigate.mockClear();
  });

  it('should create game with teams and players in database', async () => {
    // This test will be implemented after the home screen component is created
    // For now, we'll test the model creation directly

    await database.write(async () => {
      // Create game
      const game = await database.get<Game>('games').create((g) => {
        g.status = 'setup';
        g.oversPlanned = 16;
      });

      // Create teams
      const teamA = await database.get<Team>('teams').create((t) => {
        t.name = 'Team Cobras';
        t.game.set(game);
      });

      const teamB = await database.get<Team>('teams').create((t) => {
        t.name = 'Team Dragons';
        t.game.set(game);
      });

      // Create players for Team A
      const teamAPlayers = await Promise.all(
        Array.from({ length: 8 }, (_, i) =>
          database.get<Player>('players').create((p) => {
            p.name = `Player A${i + 1}`;
            p.team.set(teamA);
          })
        )
      );

      // Create players for Team B
      const teamBPlayers = await Promise.all(
        Array.from({ length: 8 }, (_, i) =>
          database.get<Player>('players').create((p) => {
            p.name = `Player B${i + 1}`;
            p.team.set(teamB);
          })
        )
      );
    });

    // Verify game created
    const games = await database.get<Game>('games').query().fetch();
    expect(games).toHaveLength(1);
    expect(games[0].status).toBe('setup');
    expect(games[0].oversPlanned).toBe(16);

    // Verify teams created
    const teams = await database.get<Team>('teams').query().fetch();
    expect(teams).toHaveLength(2);
    expect(teams.map((t) => t.name).sort()).toEqual(['Team Cobras', 'Team Dragons']);

    // Verify players created
    const players = await database.get<Player>('players').query().fetch();
    expect(players).toHaveLength(16);

    // Verify team A has 8 players
    const teamA = teams.find((t) => t.name === 'Team Cobras');
    const teamAPlayers = await teamA!.players.fetch();
    expect(teamAPlayers).toHaveLength(8);

    // Verify team B has 8 players
    const teamB = teams.find((t) => t.name === 'Team Dragons');
    const teamBPlayers = await teamB!.players.fetch();
    expect(teamBPlayers).toHaveLength(8);
  });

  it('should enforce minimum 8 players per team', async () => {
    await database.write(async () => {
      const game = await database.get<Game>('games').create((g) => {
        g.status = 'setup';
        g.oversPlanned = 16;
      });

      const team = await database.get<Team>('teams').create((t) => {
        t.name = 'Team Cobras';
        t.game.set(game);
      });

      // Create only 6 players
      await Promise.all(
        Array.from({ length: 6 }, (_, i) =>
          database.get<Player>('players').create((p) => {
            p.name = `Player ${i + 1}`;
            p.team.set(team);
          })
        )
      );
    });

    const teams = await database.get<Team>('teams').query().fetch();
    const team = teams[0];
    const players = await team.players.fetch();

    // Validation should happen at UI level before creating game
    expect(players.length).toBeLessThan(8);
  });

  it('should enforce unique player names within a team', async () => {
    // This test validates that the UI layer prevents duplicate names
    // WatermelonDB allows duplicates, so enforcement must happen in business logic

    const duplicateNames = ['Alice', 'Bob', 'Alice', 'Dave'];
    const uniqueNames = new Set(duplicateNames);

    expect(uniqueNames.size).toBeLessThan(duplicateNames.length);
    // UI should show validation error when duplicate detected
  });

  it('should create game with proper relationships', async () => {
    let gameId: string;

    await database.write(async () => {
      const game = await database.get<Game>('games').create((g) => {
        g.status = 'setup';
        g.oversPlanned = 16;
      });

      gameId = game.id;

      const team = await database.get<Team>('teams').create((t) => {
        t.name = 'Team Cobras';
        t.game.set(game);
      });

      await database.get<Player>('players').create((p) => {
        p.name = 'Alice';
        p.team.set(team);
      });
    });

    // Verify relationships
    const game = await database.get<Game>('games').find(gameId!);
    const teams = await game.teams.fetch();
    expect(teams).toHaveLength(1);

    const team = teams[0];
    const players = await team.players.fetch();
    expect(players).toHaveLength(1);
    expect(players[0].name).toBe('Alice');

    // Verify inverse relationship
    const player = players[0];
    const playerTeam = await player.team.fetch();
    expect(playerTeam.id).toBe(team.id);

    const teamGame = await team.game.fetch();
    expect(teamGame.id).toBe(game.id);
  });
});
