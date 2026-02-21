export const GAME_VARIANTS = {
  STANDARD: "standard",
  TRANSITION: "transition"
};

export const GAME_VARIANT_PROFILES = {
  [GAME_VARIANTS.STANDARD]: {
    id: GAME_VARIANTS.STANDARD,
    name: "Friday Cricket",
    minPlayers: 8,
    maxPlayers: 12,
    totalOvers: 16,
    maxOversPerPair: 4,
    description: "8-12 players, 16 overs, pairs rotate with max 4 overs each."
  },
  [GAME_VARIANTS.TRANSITION]: {
    id: GAME_VARIANTS.TRANSITION,
    name: "Transition Cricket",
    minPlayers: 6,
    maxPlayers: 10,
    totalOvers: 16,
    maxOversPerPair: null,
    description: "6-10 players, 16 overs, pairs rotate as evenly as possible."
  }
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export const getVariantProfile = (variant) => (
  GAME_VARIANT_PROFILES[variant] || GAME_VARIANT_PROFILES[GAME_VARIANTS.STANDARD]
);

export const normalizeGameConfig = (config = {}) => {
  const profile = getVariantProfile(config.gameVariant);
  const team1Players = clamp(config.team1Players ?? profile.minPlayers, profile.minPlayers, profile.maxPlayers);
  const team2Players = clamp(config.team2Players ?? profile.minPlayers, profile.minPlayers, profile.maxPlayers);
  const team1Pairs = Math.ceil(team1Players / 2);
  const team2Pairs = Math.ceil(team2Players / 2);
  const oversPerPair = Math.min(
    profile.maxOversPerPair ?? Number.POSITIVE_INFINITY,
    Math.ceil(profile.totalOvers / Math.max(team1Pairs, team2Pairs, 1))
  );

  return {
    ...config,
    gameVariant: profile.id,
    team1Players,
    team2Players,
    team1Pairs,
    team2Pairs,
    oversPerPair,
    team1TotalOvers: profile.totalOvers,
    team2TotalOvers: profile.totalOvers
  };
};

export const getPairChangeOver = (currentPair, totalPairs, totalOvers) => {
  if (!totalPairs || currentPair >= totalPairs) return null;
  return Math.ceil((currentPair * totalOvers) / totalPairs);
};
