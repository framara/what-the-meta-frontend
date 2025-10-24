// WoW class colors (official Blizzard)
export const WOW_CLASS_COLORS: Record<number, string> = {
  1: '#C79C6E', // Warrior
  2: '#F58CBA', // Paladin
  3: '#ABD473', // Hunter
  4: '#FFF569', // Rogue
  5: '#FFFFFF', // Priest
  6: '#C41F3B', // Death Knight
  7: '#0070DE', // Shaman
  8: '#69CCF0', // Mage
  9: '#9482C9', // Warlock
  10: '#00FF96', // Monk
  11: '#FF7D0A', // Druid
  12: '#A330C9', // Demon Hunter
  13: '#33937F', // Evoker
};

// WoW spec colors (official Blizzard spec colors)
export const WOW_SPEC_COLORS: Record<number, string> = {
  // Warrior
  71: '#C79C6E', // Arms
  72: '#C79C6E', // Fury  
  73: '#C79C6E', // Protection
  // Paladin
  65: '#F58CBA', // Holy
  66: '#F58CBA', // Protection
  70: '#F58CBA', // Retribution
  // Hunter
  253: '#ABD473', // Beast Mastery
  254: '#ABD473', // Marksmanship
  255: '#ABD473', // Survival
  // Rogue
  259: '#FFF569', // Assassination
  260: '#FFF569', // Outlaw
  261: '#FFF569', // Subtlety
  // Priest
  256: '#FFFFFF', // Discipline
  257: '#FFFFFF', // Holy
  258: '#FFFFFF', // Shadow
  // Death Knight
  250: '#C41F3B', // Blood
  251: '#C41F3B', // Frost
  252: '#C41F3B', // Unholy
  // Shaman
  262: '#0070DE', // Elemental
  263: '#0070DE', // Enhancement
  264: '#0070DE', // Restoration
  // Mage
  62: '#69CCF0', // Arcane
  63: '#69CCF0', // Fire
  64: '#69CCF0', // Frost
  // Warlock
  265: '#9482C9', // Affliction
  266: '#9482C9', // Demonology
  267: '#9482C9', // Destruction
  // Monk
  268: '#00FF96', // Brewmaster
  269: '#00FF96', // Windwalker
  270: '#00FF96', // Mistweaver
  // Druid
  102: '#FF7D0A', // Balance
  103: '#FF7D0A', // Feral
  104: '#FF7D0A', // Guardian
  105: '#FF7D0A', // Restoration
  // Demon Hunter
  577: '#A330C9', // Havoc
  581: '#A330C9', // Vengeance
  // Evoker
  1467: '#33937F', // Devastation
  1468: '#33937F', // Preservation
  1473: '#33937F', // Augmentation
};

// WoW spec names (id -> name)
export const WOW_SPECIALIZATIONS: Record<number, string> = {
  71: 'Arms', 72: 'Fury', 73: 'Protection', 65: 'Holy', 66: 'Protection', 70: 'Retribution',
  253: 'Beast Mastery', 254: 'Marksmanship', 255: 'Survival', 259: 'Assassination', 260: 'Outlaw', 261: 'Subtlety',
  256: 'Discipline', 257: 'Holy', 258: 'Shadow', 250: 'Blood', 251: 'Frost', 252: 'Unholy',
  262: 'Elemental', 263: 'Enhancement', 264: 'Restoration', 62: 'Arcane', 63: 'Fire', 64: 'Frost',
  265: 'Affliction', 266: 'Demonology', 267: 'Destruction', 268: 'Brewmaster', 269: 'Windwalker', 270: 'Mistweaver',
  102: 'Balance', 103: 'Feral', 104: 'Guardian', 105: 'Restoration', 577: 'Havoc', 581: 'Vengeance',
  1467: 'Devastation', 1468: 'Preservation', 1473: 'Augmentation',
};

// Alias for WOW_SPECIALIZATIONS for backward compatibility
export const WOW_SPEC_NAMES = WOW_SPECIALIZATIONS;

// WoW class names (id -> name)
export const WOW_CLASS_NAMES: Record<number, string> = {
  1: 'Warrior', 2: 'Paladin', 3: 'Hunter', 4: 'Rogue', 5: 'Priest', 6: 'Death Knight', 7: 'Shaman', 8: 'Mage', 9: 'Warlock', 10: 'Monk', 11: 'Druid', 12: 'Demon Hunter', 13: 'Evoker',
};

// WoW spec to class mapping (spec id -> class id)
export const WOW_SPEC_TO_CLASS: Record<number, number> = {
  71: 1, 72: 1, 73: 1, 65: 2, 66: 2, 70: 2, 253: 3, 254: 3, 255: 3, 259: 4, 260: 4, 261: 4, 256: 5, 257: 5, 258: 5, 250: 6, 251: 6, 252: 6, 262: 7, 263: 7, 264: 7, 62: 8, 63: 8, 64: 8, 265: 9, 266: 9, 267: 9, 268: 10, 269: 10, 270: 10, 102: 11, 103: 11, 104: 11, 105: 11, 577: 12, 581: 12, 1467: 13, 1468: 13, 1473: 13
};

// WoW spec roles (spec id -> role)
export const WOW_SPEC_ROLES: Record<number, string> = {
  71: 'dps', 72: 'dps', 73: 'tank', 65: 'healer', 66: 'tank', 70: 'dps',
  253: 'dps', 254: 'dps', 255: 'dps', 259: 'dps', 260: 'dps', 261: 'dps',
  256: 'healer', 257: 'healer', 258: 'dps', 250: 'tank', 251: 'dps', 252: 'dps',
  262: 'dps', 263: 'dps', 264: 'healer', 62: 'dps', 63: 'dps', 64: 'dps',
  265: 'dps', 266: 'dps', 267: 'dps', 268: 'tank', 269: 'dps', 270: 'healer',
  102: 'dps', 103: 'dps', 104: 'tank', 105: 'healer', 577: 'dps', 581: 'tank',
  1467: 'dps', 1468: 'healer', 1473: 'dps',
};

// Tank spec IDs
export const WOW_TANK_SPECS = new Set([
  73, 66, 250, 268, 104, 581
]);

// Healer spec IDs
export const WOW_HEALER_SPECS = new Set([
  65, 256, 257, 264, 270, 105, 1468
]);

// Melee DPS spec IDs
export const WOW_MELEE_SPECS = new Set([
  71, 72, 70, 255, 259, 260, 261, 251, 252, 263, 269, 103, 577,
]);

// Ranged DPS spec IDs
export const WOW_RANGED_SPECS = new Set([
  62, 63, 64, 253, 254, 258, 262, 102, 265, 266, 267, 1467, 1473
]);

export const WOW_SEASONS_PER_EXPANSION: Record<number, number[]> = {
 7: [1, 2, 3, 4], // Battle for Azeroth
 8: [5, 6, 7, 8], // Shadowlands
 9: [9, 10, 11, 12], // Dragonflight
 10: [13, 14, 15], // The War Within
 11: [16, 17, 18], // Midnight
 12: [19, 20, 21] // The Last Titan
};

export const WOW_EXPANSIONS = [
  { id: 0, name: 'World of Warcraft', shortName: 'WoW', seasons: [] },
  { id: 1, name: 'The Burning Crusade', shortName: 'TBC', seasons: [] },
  { id: 2, name: 'Wrath of the Lich King', shortName: 'WOTLK', seasons: [] },
  { id: 3, name: 'Cataclysm', shortName: 'Cata', seasons: [] },
  { id: 4, name: 'Mists of Pandaria', shortName: 'MoP', seasons: [] },
  { id: 5, name: 'Warlords of Draenor', shortName: 'WoD', seasons: [] },
  { id: 6, name: 'Legion', shortName: 'Legion', seasons: [] },
  { id: 7, name: 'Battle for Azeroth', shortName: 'BfA', seasons: [1, 2, 3, 4] },
  { id: 8, name: 'Shadowlands', shortName: 'SL', seasons: [5, 6, 7, 8] },
  { id: 9, name: 'Dragonflight', shortName: 'DF', seasons: [9, 10, 11, 12] },
  { id: 10, name: 'The War Within', shortName: 'TWW', seasons: [13, 14, 15] },
  { id: 11, name: 'Midnight', shortName: 'MN', seasons: [16, 17, 18] },
  { id: 12, name: 'The Last Titan', shortName: 'TLT', seasons: [19, 20, 21] },
];

// Season metadata (id -> metadata)
export const SEASON_METADATA: Record<number, { expansion: string; patch: string; name: string }> = {
  1: { expansion: 'Battle for Azeroth', patch: '8.0', name: 'BFA S1' },
  2: { expansion: 'Battle for Azeroth', patch: '8.1', name: 'BFA S2' },
  3: { expansion: 'Battle for Azeroth', patch: '8.2', name: 'BFA S3' },
  4: { expansion: 'Battle for Azeroth', patch: '8.3', name: 'BFA S4' },
  5: { expansion: 'Shadowlands', patch: '9.0', name: 'SL S1' },
  6: { expansion: 'Shadowlands', patch: '9.1', name: 'SL S2' },
  7: { expansion: 'Shadowlands', patch: '9.2', name: 'SL S3' },
  8: { expansion: 'Shadowlands', patch: '9.2.5', name: 'SL S4' },
  9: { expansion: 'Dragonflight', patch: '10.0', name: 'DF S1' },
  10: { expansion: 'Dragonflight', patch: '10.1', name: 'DF S2' },
  11: { expansion: 'Dragonflight', patch: '10.2', name: 'DF S3' },
  12: { expansion: 'Dragonflight', patch: '10.2.6', name: 'DF S4' },
  13: { expansion: 'The War Within', patch: '11.0', name: 'TWW S1' },
  14: { expansion: 'The War Within', patch: '11.1', name: 'TWW S2' },
  15: { expansion: 'The War Within', patch: '11.2', name: 'TWW S3' },
  16: { expansion: 'Midnight', patch: '12.0', name: 'MN S1' },
  17: { expansion: 'Midnight', patch: '12.1', name: 'MN S2' },
  18: { expansion: 'Midnight', patch: '12.2', name: 'MN S3' },  
  19: { expansion: 'The Last Titan', patch: '13.0', name: 'TLT S1' },
  20: { expansion: 'The Last Titan', patch: '13.1', name: 'TLT S2' },
  21: { expansion: 'The Last Titan', patch: '13.2', name: 'TLT S3' },
};

// Dungeon on-time thresholds (upgrade_level 1 qualifying_duration in ms)
// Sourced from backend WOW_DUNGEONS; used to determine timed vs depleted.
export const WOW_DUNGEON_TIMERS: Record<number, number> = {
  56: 2700000,
  57: 2700000,
  58: 3600000,
  59: 3000000,
  60: 2700000,
  2: 1800000,
  76: 3300000,
  77: 2700000,
  78: 2700000,
  168: 1980000,
  169: 1800000,
  161: 3400000,
  164: 3300000,
  163: 3600000,
  165: 1980000,
  166: 1800000,
  167: 5100000,
  200: 2280000,
  197: 2100000,
  198: 1800000,
  199: 2160000,
  206: 1980000,
  207: 1980000,
  208: 1440000,
  209: 2700000,
  210: 1800000,
  234: 2100000,
  239: 2100000,
  227: 2520000,
  233: 2100000,
  247: 1980000,
  248: 2220000,
  249: 2520000,
  250: 2160000,
  251: 1800000,
  252: 2520000,
  244: 1800000,
  245: 1800000,
  246: 2160000,
  353: 1980000,
  369: 2280000,
  370: 1920000,
  375: 1800000,
  376: 1860000,
  377: 2580000,
  378: 1920000,
  379: 2280000,
  380: 2460000,
  381: 2340000,
  382: 2040000,
  399: 1800000,
  400: 2400000,
  401: 2250000,
  402: 1920000,
  403: 2100000,
  404: 1980000,
  405: 2100000,
  406: 2100000,
  438: 1800000,
  463: 2040000,
  464: 2160000,
  391: 2340000,
  392: 1800000,
  456: 2040000,
  499: 1950000,
  500: 1740000,
  501: 1980000,
  502: 2100000,
  503: 1800000,
  504: 1860000,
  505: 1860000,
  506: 1980000,
  507: 2040000,
  525: 1980000,
  541: 1800000,
  542: 1860000,
};

/**
 * Compute Raider.IO season slug (e.g., "season-tww-3") from an internal season_id.
 * This derives the slug using the expansion short name and the season index within that expansion.
 * Example: season_id 15 (TWW S3) -> season-tww-3
 */
export function getRaiderIoSeasonSlug(seasonId?: number | null): string | undefined {
  if (!seasonId) return undefined;
  const expansion = WOW_EXPANSIONS.find(exp => exp.seasons?.includes(seasonId));
  if (!expansion) return undefined;
  const indexWithinExpansion = (expansion.seasons?.indexOf(seasonId) ?? -1) + 1;
  if (indexWithinExpansion <= 0) return undefined;
  const prefix = (expansion.shortName || expansion.name || '').toLowerCase();
  if (!prefix) return undefined;
  return `season-${prefix}-${indexWithinExpansion}`;
}