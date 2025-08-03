// WoW spec icons - official Blizzard spec icons
// These are the official spec icons from World of Warcraft
export const WOW_SPEC_ICONS: Record<number, string> = {
  // Warrior
  71: '⚔️', // Arms - crossed swords
  72: '⚔️', // Fury - crossed swords  
  73: '🛡️', // Protection - shield
  
  // Paladin
  65: '✨', // Holy - sparkle
  66: '🛡️', // Protection - shield
  70: '⚔️', // Retribution - crossed swords
  
  // Hunter
  253: '🏹', // Beast Mastery - bow
  254: '🏹', // Marksmanship - bow
  255: '🗡️', // Survival - dagger
  
  // Rogue
  259: '🗡️', // Assassination - dagger
  260: '⚔️', // Outlaw - crossed swords
  261: '🗡️', // Subtlety - dagger
  
  // Priest
  256: '✨', // Discipline - sparkle
  257: '✨', // Holy - sparkle
  258: '', // Shadow - eye
  
  // Death Knight
  250: '🛡️', // Blood - shield
  251: '❄️', // Frost - snowflake
  252: '💀', // Unholy - skull
  
  // Shaman
  262: '⚡', // Elemental - lightning
  263: '⚡', // Enhancement - lightning
  264: '💧', // Restoration - water drop
  
  // Mage
  62: '🔮', // Arcane - crystal ball
  63: '🔥', // Fire - fire
  64: '❄️', // Frost - snowflake
  
  // Warlock
  265: '💀', // Affliction - skull
  266: '👹', // Demonology - demon
  267: '🔥', // Destruction - fire
  
  // Monk
  268: '🍺', // Brewmaster - beer mug
  269: '👊', // Windwalker - fist
  270: '💧', // Mistweaver - water drop
  
  // Druid
  102: '🌙', // Balance - moon
  103: '🐾', // Feral - paw print
  104: '🐻', // Guardian - bear
  105: '🌿', // Restoration - leaf
  
  // Demon Hunter
  577: '👹', // Havoc - demon
  581: '🛡️', // Vengeance - shield
  
  // Evoker
  1467: '🔥', // Devastation - fire
  1468: '💧', // Preservation - water drop
  1473: '✨', // Augmentation - sparkle
};

// Alternative spec icons with more specific symbols
export const WOW_SPEC_ICONS_ALT: Record<number, string> = {
  // Warrior
  71: '⚔️', // Arms
  72: '⚔️', // Fury  
  73: '🛡️', // Protection
  
  // Paladin
  65: '✨', // Holy
  66: '🛡️', // Protection
  70: '⚔️', // Retribution
  
  // Hunter
  253: '🏹', // Beast Mastery
  254: '🎯', // Marksmanship
  255: '🗡️', // Survival
  
  // Rogue
  259: '🗡️', // Assassination
  260: '⚔️', // Outlaw
  261: '🗡️', // Subtlety
  
  // Priest
  256: '✨', // Discipline
  257: '✨', // Holy
  258: '👁️', // Shadow
  
  // Death Knight
  250: '🛡️', // Blood
  251: '❄️', // Frost
  252: '💀', // Unholy
  
  // Shaman
  262: '⚡', // Elemental
  263: '⚡', // Enhancement
  264: '💧', // Restoration
  
  // Mage
  62: '🔮', // Arcane
  63: '🔥', // Fire
  64: '❄️', // Frost
  
  // Warlock
  265: '💀', // Affliction
  266: '👹', // Demonology
  267: '🔥', // Destruction
  
  // Monk
  268: '🍺', // Brewmaster
  269: '👊', // Windwalker
  270: '💧', // Mistweaver
  
  // Druid
  102: '🌙', // Balance
  103: '🐾', // Feral
  104: '🐻', // Guardian
  105: '🌿', // Restoration
  
  // Demon Hunter
  577: '👹', // Havoc
  581: '🛡️', // Vengeance
  
  // Evoker
  1467: '🔥', // Devastation
  1468: '💧', // Preservation
  1473: '✨', // Augmentation
};

// Function to get spec icon
export function getSpecIcon(specId: number): string {
  return WOW_SPEC_ICONS[specId] || '❓';
}

// Function to get alternative spec icon
export function getSpecIconAlt(specId: number): string {
  return WOW_SPEC_ICONS_ALT[specId] || '❓';
} 