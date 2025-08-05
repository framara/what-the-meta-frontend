import React from 'react';

// Import all spec icon PNG images
// This creates a mapping of spec IDs to their image URLs
export const SPEC_ICON_IMAGES: Record<number, string> = {
  // Warrior
  71: '/spec-icons-png/71.png', // Arms
  72: '/spec-icons-png/72.png', // Fury  
  73: '/spec-icons-png/73.png', // Protection
  
  // Paladin
  65: '/spec-icons-png/65.png', // Holy
  66: '/spec-icons-png/66.png', // Protection
  70: '/spec-icons-png/70.png', // Retribution
  
  // Hunter
  253: '/spec-icons-png/253.png', // Beast Mastery
  254: '/spec-icons-png/254.png', // Marksmanship
  255: '/spec-icons-png/255.png', // Survival
  
  // Rogue
  259: '/spec-icons-png/259.png', // Assassination
  260: '/spec-icons-png/260.png', // Outlaw
  261: '/spec-icons-png/261.png', // Subtlety
  
  // Priest
  256: '/spec-icons-png/256.png', // Discipline
  257: '/spec-icons-png/257.png', // Holy
  258: '/spec-icons-png/258.png', // Shadow
  
  // Death Knight
  250: '/spec-icons-png/250.png', // Blood
  251: '/spec-icons-png/251.png', // Frost
  252: '/spec-icons-png/252.png', // Unholy
  
  // Shaman
  262: '/spec-icons-png/262.png', // Elemental
  263: '/spec-icons-png/263.png', // Enhancement
  264: '/spec-icons-png/264.png', // Restoration
  
  // Mage
  62: '/spec-icons-png/62.png', // Arcane
  63: '/spec-icons-png/63.png', // Fire
  64: '/spec-icons-png/64.png', // Frost
  
  // Warlock
  265: '/spec-icons-png/265.png', // Affliction
  266: '/spec-icons-png/266.png', // Demonology
  267: '/spec-icons-png/267.png', // Destruction
  
  // Monk
  268: '/spec-icons-png/268.png', // Brewmaster
  269: '/spec-icons-png/269.png', // Windwalker
  270: '/spec-icons-png/270.png', // Mistweaver
  
  // Druid
  102: '/spec-icons-png/102.png', // Balance
  103: '/spec-icons-png/103.png', // Feral
  104: '/spec-icons-png/104.png', // Guardian
  105: '/spec-icons-png/105.png', // Restoration
  
  // Demon Hunter
  577: '/spec-icons-png/577.png', // Havoc
  581: '/spec-icons-png/581.png', // Vengeance
  
  // Evoker
  1467: '/spec-icons-png/1467.png', // Devastation
  1468: '/spec-icons-png/1468.png', // Preservation
  1473: '/spec-icons-png/1473.png', // Augmentation
};

// Function to get spec icon image URL
export function getSpecIconImage(specId: number): string {
  return SPEC_ICON_IMAGES[specId] || '/spec-icons-png/71.png'; // Default to Arms if not found
}

// Function to check if spec icon image exists
export function hasSpecIconImage(specId: number): boolean {
  return specId in SPEC_ICON_IMAGES;
}

// React component for spec icon image
export const SpecIconImage: React.FC<{
  specId: number;
  className?: string;
  style?: React.CSSProperties;
  alt?: string;
}> = ({ specId, className, style, alt }) => {
  const imageUrl = getSpecIconImage(specId);
  const specName = alt || `Spec ${specId}`;
  
  return (
    <img
      src={imageUrl}
      alt={specName}
      className={className}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'contain',
        ...style
      }}
      onError={(e) => {
        // Fallback to emoji if image fails to load
        const target = e.target as HTMLImageElement;
        target.style.display = 'none';
        const fallback = document.createElement('span');
        fallback.textContent = '⚔️'; // Default emoji
        fallback.style.fontSize = 'inherit';
        target.parentNode?.appendChild(fallback);
      }}
    />
  );
}; 