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

// Melee DPS spec IDs
export const WOW_MELEE_SPECS = new Set([
  71, 72, 70, 255, 259, 260, 261, 251, 252, 263, 269, 103, 577,
  // Add more if needed
]);
// Ranged DPS spec IDs
export const WOW_RANGED_SPECS = new Set([
  62, 63, 64, 253, 254, 258, 262, 102, 265, 266, 267, 1467, 1473
  // Add more if needed
]);