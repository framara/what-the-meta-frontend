/**
 * UI-related constants for the WoW Leaderboard application
 * These values define layout breakpoints, thresholds, and visual boundaries
 */

export const UI = {
  // Responsive design breakpoints (pixel width)
  // Matches Tailwind CSS default breakpoints
  MOBILE_BREAKPOINT: 640, // sm
  TABLET_BREAKPOINT: 768, // md
  DESKTOP_BREAKPOINT: 1024, // lg
  WIDE_BREAKPOINT: 1280, // xl

  // Scroll behavior
  // Distance (px) from bottom before lazy-load trigger
  SCROLL_LOAD_THRESHOLD: 300,

  // Scroll-to-top button
  // Distance (px) from top before button becomes visible
  SCROLL_TO_TOP_THRESHOLD: 300,

  // Tooltips & popovers
  // Max width (px) for tooltip content
  TOOLTIP_MAX_WIDTH: 300,

  // Modal/Dialog
  // Z-index for modals (ensure it's above other floating elements)
  MODAL_Z_INDEX: 50,
  OVERLAY_Z_INDEX: 40,

  // Animation durations (ms)
  TRANSITION_FAST: 150,
  TRANSITION_BASE: 300,
  TRANSITION_SLOW: 500,
} as const;
