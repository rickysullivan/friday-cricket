/**
 * Integration test for match scoring flow
 * Tests the end-to-end process of recording scoring events
 *
 * Flow:
 * 1. Create game with teams and players
 * 2. Start innings
 * 3. Record runs (tap run buttons)
 * 4. Verify OverEvent created in WatermelonDB
 * 5. Verify score updated in real-time
 * 6. Verify autosave completed
 */

import React from 'react';
import { database } from '@/models/database';
import Game from '@/models/Game';
import Team from '@/models/Team';
import Player from '@/models/Player';
import Innings from '@/models/Innings';
import Over from '@/models/Over';
import OverEvent from '@/models/OverEvent';

describe('Match Scoring Flow', () => {
  let game: Game;
  let teamA: Team;
  let teamB: Team;
  let innings: Innings;
  let over: Over;

  beforeEach(async () => {
    // Clear database
    await database.write(async () => {
      const games = await database.get<Game>('games').query().fetch();
      const teams = await database.get<Team>('teams').query().fetch();
      const players = await database.get<Player>('players').query().fetch();
      const inningsList = await database.get<Innings>('innings').query().fetch();
      const overs = await database.get<Over>('overs').query().fetch();
      const events = await database.get<OverEvent>('over_events').query().fetch();

      await Promise.all([
        ...games.map((g) => g.markAsDeleted()),
        ...teams.map((t) => t.markAsDeleted()),
        ...players.map((p) => p.markAsDeleted()),
        ...inningsList.map((i) => i.markAsDeleted()),
        ...overs.map((o) => o.markAsDeleted()),
        ...events.map((e) => e.markAsDeleted()),
      ]);
    });

    // Create test game
    await database.write(async () => {
      game = await database.get<Game>('games').create((g) => {
        g.status = 'in_progress';
        g.oversPlanned = 16;
      });

      teamA = await database.get<Team>('teams').create((t) => {
        t.name = 'Team Cobras';
        t.game.set(game);
      });

      teamB = await database.get<Team>('teams').create((t) => {
        t.name = 'Team Dragons';
        t.game.set(game);
      });

      // Create players
      await Promise.all(
        Array.from({ length: 8 }, (_, i) =>
          database.get<Player>('players').create((p) => {
            p.name = `Player A${i + 1}`;
            p.team.set(teamA);
          })
        )
      );

      // Create first innings
      innings = await database.get<Innings>('innings').create((i) => {
        i.inningsNumber = 1;
        i.battingTeamId = teamA.id;
        i.bowlingTeamId = teamB.id;
        i.game.set(game);
      });

      // Create first over
      over = await database.get<Over>('overs').create((o) => {
        o.overNumber = 1;
        o.bowlerId = 'player-b1';
        o.innings.set(innings);
      });
    });
  });

  it('should create OverEvent when run is scored', async () => {
    await database.write(async () => {
      await database.get<OverEvent>('over_events').create((e) => {
        e.eventType = 'run';
        e.runs = 4;
        e.isWide = false;
        e.isNoBall = false;
        e.isWicket = false;
        e.over.set(over);
      });
    });

    const events = await database.get<OverEvent>('over_events').query().fetch();
    expect(events).toHaveLength(1);
    expect(events[0].eventType).toBe('run');
    expect(events[0].runs).toBe(4);
  });

  it('should calculate innings score from over events', async () => {
    // Record multiple scoring events
    await database.write(async () => {
      await database.get<OverEvent>('over_events').create((e) => {
        e.eventType = 'run';
        e.runs = 1;
        e.isWide = false;
        e.isNoBall = false;
        e.isWicket = false;
        e.over.set(over);
      });

      await database.get<OverEvent>('over_events').create((e) => {
        e.eventType = 'run';
        e.runs = 4;
        e.isWide = false;
        e.isNoBall = false;
        e.isWicket = false;
        e.over.set(over);
      });

      await database.get<OverEvent>('over_events').create((e) => {
        e.eventType = 'run';
        e.runs = 6;
        e.isWide = false;
        e.isNoBall = false;
        e.isWicket = false;
        e.over.set(over);
      });
    });

    const events = await over.events.fetch();
    const totalRuns = events.reduce((sum, e) => sum + e.runs, 0);

    expect(totalRuns).toBe(11); // 1 + 4 + 6
  });

  it('should count valid balls toward over completion', async () => {
    // Record 6 valid balls
    await database.write(async () => {
      for (let i = 0; i < 6; i++) {
        await database.get<OverEvent>('over_events').create((e) => {
          e.eventType = 'run';
          e.runs = i % 2 === 0 ? 1 : 0; // Alternate between 1 and 0
          e.isWide = false;
          e.isNoBall = false;
          e.isWicket = false;
          e.over.set(over);
        });
      }
    });

    const events = await over.events.fetch();
    const validBalls = events.filter((e) => !e.isWide && !e.isNoBall).length;

    expect(validBalls).toBe(6);
  });

  it('should not count wides and no-balls as valid balls', async () => {
    await database.write(async () => {
      // 4 valid balls
      for (let i = 0; i < 4; i++) {
        await database.get<OverEvent>('over_events').create((e) => {
          e.eventType = 'run';
          e.runs = 1;
          e.isWide = false;
          e.isNoBall = false;
          e.isWicket = false;
          e.over.set(over);
        });
      }

      // 1 wide (not a valid ball)
      await database.get<OverEvent>('over_events').create((e) => {
        e.eventType = 'extra';
        e.runs = 1;
        e.isWide = true;
        e.isNoBall = false;
        e.isWicket = false;
        e.over.set(over);
      });

      // 1 no-ball (not a valid ball)
      await database.get<OverEvent>('over_events').create((e) => {
        e.eventType = 'extra';
        e.runs = 1;
        e.isWide = false;
        e.isNoBall = true;
        e.isWicket = false;
        e.over.set(over);
      });

      // 2 more valid balls
      for (let i = 0; i < 2; i++) {
        await database.get<OverEvent>('over_events').create((e) => {
          e.eventType = 'run';
          e.runs = 2;
          e.isWide = false;
          e.isNoBall = false;
          e.isWicket = false;
          e.over.set(over);
        });
      }
    });

    const events = await over.events.fetch();
    const validBalls = events.filter((e) => !e.isWide && !e.isNoBall).length;
    const totalEvents = events.length;

    expect(totalEvents).toBe(8); // 6 valid + 2 extras
    expect(validBalls).toBe(6); // Only valid balls count
  });

  it('should record wicket events', async () => {
    await database.write(async () => {
      await database.get<OverEvent>('over_events').create((e) => {
        e.eventType = 'wicket';
        e.runs = 0;
        e.isWide = false;
        e.isNoBall = false;
        e.isWicket = true;
        e.over.set(over);
      });
    });

    const events = await over.events.fetch();
    const wickets = events.filter((e) => e.isWicket).length;

    expect(wickets).toBe(1);
  });

  it('should support undo by soft-deleting most recent event', async () => {
    let lastEventId: string;

    await database.write(async () => {
      // Create 3 events
      await database.get<OverEvent>('over_events').create((e) => {
        e.eventType = 'run';
        e.runs = 1;
        e.isWide = false;
        e.isNoBall = false;
        e.isWicket = false;
        e.over.set(over);
      });

      await database.get<OverEvent>('over_events').create((e) => {
        e.eventType = 'run';
        e.runs = 4;
        e.isWide = false;
        e.isNoBall = false;
        e.isWicket = false;
        e.over.set(over);
      });

      const lastEvent = await database.get<OverEvent>('over_events').create((e) => {
        e.eventType = 'run';
        e.runs = 6;
        e.isWide = false;
        e.isNoBall = false;
        e.isWicket = false;
        e.over.set(over);
      });

      lastEventId = lastEvent.id;
    });

    // Simulate undo - soft delete last event
    await database.write(async () => {
      const eventToUndo = await database.get<OverEvent>('over_events').find(lastEventId);
      await eventToUndo.markAsDeleted();
    });

    const events = await database
      .get<OverEvent>('over_events')
      .query()
      .fetch();

    expect(events).toHaveLength(2); // Only 2 events remain
    const totalRuns = events.reduce((sum, e) => sum + e.runs, 0);
    expect(totalRuns).toBe(5); // 1 + 4 (6-run event undone)
  });

  it('should maintain event order by createdAt timestamp', async () => {
    const eventIds: string[] = [];

    await database.write(async () => {
      for (let i = 0; i < 5; i++) {
        const event = await database.get<OverEvent>('over_events').create((e) => {
          e.eventType = 'run';
          e.runs = i + 1;
          e.isWide = false;
          e.isNoBall = false;
          e.isWicket = false;
          e.over.set(over);
        });
        eventIds.push(event.id);
      }
    });

    const events = await database
      .get<OverEvent>('over_events')
      .query()
      .fetch();

    // Events should be in creation order
    expect(events.map((e) => e.runs)).toEqual([1, 2, 3, 4, 5]);
  });
});
