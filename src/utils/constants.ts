/**
 * Outdoor-optimized theme colors
 * Constitution: High contrast for bright sunlight readability
 */
export const COLORS = {
  // Base colors (no grays - high contrast only)
  BLACK: '#000000',
  WHITE: '#FFFFFF',

  // Semantic colors
  SUCCESS: '#00A000', // Green (darker for readability)
  ERROR: '#CC0000', // Red (darker for readability)
  WARNING: '#FF8C00', // Orange (dark orange)

  // Scoring colors
  RUN_SCORED: '#00A000', // Green for runs
  WICKET: '#CC0000', // Red for wickets
  EXTRA: '#FF8C00', // Orange for extras

  // UI colors
  PRIMARY: '#000000',
  BACKGROUND: '#FFFFFF',
  TEXT: '#000000',
  TEXT_INVERSE: '#FFFFFF',
} as const;

/**
 * Outdoor-optimized sizes
 * Constitution: Large touch targets (≥56px), bold fonts (≥18pt)
 */
export const SIZES = {
  // Touch targets (minimum 56px for outdoor use)
  TOUCH_TARGET_MIN: 56,
  TOUCH_TARGET_LARGE: 64,

  // Font sizes (minimum 18pt)
  FONT_SMALL: 18,
  FONT_MEDIUM: 24,
  FONT_LARGE: 32,
  FONT_XLARGE: 48,

  // Spacing
  SPACING_XS: 4,
  SPACING_SM: 8,
  SPACING_MD: 16,
  SPACING_LG: 24,
  SPACING_XL: 32,

  // Border radius
  BORDER_RADIUS_SM: 4,
  BORDER_RADIUS_MD: 8,
  BORDER_RADIUS_LG: 12,
} as const;

/**
 * Performance targets
 * Constitution: <100ms tap latency, <50ms autosave
 */
export const PERFORMANCE = {
  TAP_LATENCY_TARGET: 100, // milliseconds
  AUTOSAVE_TARGET: 50, // milliseconds
  COLD_START_TARGET: 2000, // milliseconds
  MEMORY_TARGET: 150 * 1024 * 1024, // 150MB in bytes
} as const;

/**
 * Cricket game constants
 */
export const CRICKET = {
  OVERS_PER_INNINGS: 16,
  BALLS_PER_OVER: 6,
  MIN_PLAYERS_PER_TEAM: 8,
  MAX_OVERS_PER_PAIR: 4,
  MIN_OVERS_PER_BOWLER: 1,
} as const;
