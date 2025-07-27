// Helper to determine readable text color based on background
export const getTextColor = (bg: string): string => {
  if (!bg) return '#fff';
  const hex = bg.replace('#', '');
  if (hex.length !== 6) return '#fff';
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#23263a' : '#fff';
};

// Helper to shorten spec name based on cell width
export const getShortName = (name: string, width: number): string => {
  if (width < 60) return name.substring(0, 3);
  if (width < 80) return name.substring(0, 4);
  if (width < 100) return name.substring(0, 5);
  return name;
}; 