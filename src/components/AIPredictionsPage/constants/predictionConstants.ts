// Thresholds for categorizing spec changes
export const STABILITY_THRESHOLD = 5;  // Consider specs with changes within ±8% as stable
export const SIGNIFICANT_CHANGE = 14;  // Consider changes above ±14% as rising/declining

// Confidence thresholds
export const CONFIDENCE_THRESHOLDS = {
  LOW: 50,
  MEDIUM: 65,
  HIGH: 85
} as const;

// Number of specs to display in each category
export const DISPLAY_COUNT = 10;