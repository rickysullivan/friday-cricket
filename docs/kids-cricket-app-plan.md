# Kids Cricket Game Tracker (Expo App Plan)

## Context
Outdoor use in bright summer afternoons → UI must be high-contrast, simple, and fast to use. The app replaces paper score sheets but retains their logic: mandatory scorekeeping, tracking bowlers, batters, and overs, with an optional scoring mode.

---

## 1. Rules and Constraints
- 16 overs per team  
- Batters in pairs (max 4 overs per pair)  
- Everyone bowls (min 1 over each)  
- Bowling from one end  
- No LBW  
- “Bad ball” → place on tee → free hit  
- Fielders rotate each over  
- Keep 8 players on field  

---

## 2. Core User Flows
### Home
- **New Game**
- **Resume Last Game**
- **View History**

### New Game Wizard
- Input: teams, venue, date  
- Configure overs (default 16), team size, notes  
- Add player lists → auto-generate batting pairs + bowling rotation (editable)

### Innings Screen
- Header: innings info, score, wickets  
- Tabs: Overs / Batting Pairs / Bowlers / Fielding  
- Quick buttons: dot, 1–6, wicket, wide, no-ball, “bad ball → tee free hit”

### Summary
- Show totals, per-pair runs, per-bowler overs  
- Auto-save and export (PDF/CSV)

### History
- List all games (date, teams, result)  
- Tap to view, duplicate, or resume  

---

## 3. Data Model (TypeScript)
```ts
type Player = { id: string; name: string };

type BattingPair = {
  id: string;
  p1: string;
  p2: string;
  oversPlanned: number;
  oversFaced: number;
};

type OverEvent =
  | { t: 'run'; runs: 0 | 1 | 2 | 3 | 4 | 6 }
  | { t: 'wide'; runs: 1 }
  | { t: 'noball'; runs: 1 }
  | { t: 'wicket' }
  | { t: 'badball_freehit'; result?: 'run' | 'dot' | number };

type Over = { number: number; bowlerId: string; events: OverEvent[] };

type Innings = {
  battingTeamId: string;
  bowlingTeamId: string;
  oversPlanned: 16;
  overs: Over[];
  battingPairs: BattingPair[];
};

type Game = {
  id: string;
  dateISO: string;
  venue?: string;
  teamA: { id: string; name: string; players: Player[] };
  teamB: { id: string; name: string; players: Player[] };
  innings: [Innings, Innings?];
  settings: { scoringEnabled: boolean };
  meta: { version: 1 };
};
```

---

## 4. Rule Engine Checks
- Enforce 16-over cap  
- Max 4 overs per batting pair  
- Ensure each player bowls ≥1 over  
- Prevent consecutive overs by same bowler  
- “Bad ball” → mark event, trigger free-hit flow  
- Auto fielding rotation suggestion  
- Warn if skipped bowler or pair exceeds limit  

---

## 5. Algorithms
### Generate Batting Pairs
```ts
function makePairs(players: Player[]): BattingPair[] {
  const ids = players.map(p => p.id);
  const pairs: BattingPair[] = [];
  for (let i = 0; i < ids.length; i += 2) {
    const p1 = ids[i], p2 = ids[i + 1] ?? ids[0];
    pairs.push({ id: crypto.randomUUID(), p1, p2, oversPlanned: 4, oversFaced: 0 });
    if (pairs.length === 4) break;
  }
  return pairs;
}
```

### Bowling Rotation
```ts
function planBowlers(all: Player[], totalOvers = 16): string[] {
  const order: string[] = [];
  let i = 0;
  while (order.length < totalOvers) {
    const next = all[i % all.length].id;
    if (order.at(-1) == next) { i++; continue; }
    order.push(next); i++;
  }
  return order;
}
```

---

## 6. Outdoor-Optimized UI and UX

### Visual Design
- High contrast (black on white or white on dark navy/green)
- Manual “Bright Mode” toggle
- Bold accent color (e.g., #007AFF or #FFB300)
- Avoid mid-tones and gradients

### Touch Targets
- Buttons ≥56 px tall  
- Run buttons in keypad grid  
- Strong haptic feedback  

### Font and Layout
- System font, semibold, ≥18 pt  
- Minimal text, large numeric indicators  
- Overs grid: 2×8 blocks, bold numbers  

### Navigation
- Bottom bar: **Game**, **Overs**, **Batting**, **History**  
- “Hold to End Game” safeguard  

### Data Display
- Large numeric totals centered  
- Color codes: Runs = green, Wicket = red, Extras = orange  
- Progress rings for overs and pair limits  

### Offline Reliability
- Autosave every event  
- “Saved” toast confirmation  
- Slide-in panels instead of modals  

### Accessibility and Speed
- Full-screen tap zones  
- One-handed operation  
- “Undo” always visible  

---

## 7. Persistence
- **Storage:** `expo-sqlite` or MMKV  
- **Autosave:** every event  
- **Local history:** indexed list of all games  
- **Export/Import:** JSON  
- **Share:** PDF or CSV via `expo-print` + `expo-sharing`

---

## 8. PDF/CSV Output
- PDF mirrors paper score sheet (batting pairs, overs, runs, wickets, averages)
- CSV = one row per over event

---

## 9. Tech Stack
- **Framework:** Expo (React Native + TypeScript)  
- **Router:** Expo Router  
- **State:** React Context  
- **Storage:** SQLite / MMKV  
- **UI Library:** shadcn/ui-style components (custom theme for visibility)  
- **Haptics & Sharing:** `expo-haptics`, `expo-print`, `expo-sharing`

---

## 10. Edge Cases
- Team >8 players → rotation reminder  
- Odd batters → pair with first or sub  
- Player leaves mid-game → reassign over  
- Rain → early innings close  
- Tie → display “Runs ÷ Wickets = Average”

---

## 11. MVP Checklist
- [ ] Create game + players  
- [ ] Auto-generate pairs + bowling plan  
- [ ] Overs screen with run events and “bad ball → free hit” flow  
- [ ] Progress tracking and rule warnings  
- [ ] Autosave + local history  
- [ ] PDF/CSV export

---

## Next Step
Draft the **component tree** and **theme system** for Expo + shadcn-style outdoor visibility.
