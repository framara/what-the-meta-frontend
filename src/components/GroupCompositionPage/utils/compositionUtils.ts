import { WOW_SPEC_ROLES } from '../../../constants/wow-constants';
import { TOP_COMPOSITIONS_COUNT } from '../constants/compositionConstants';

export interface GroupMember {
  character_name: string;
  class_id: number;
  spec_id: number;
  role: string;
}

export interface Run {
  id: number;
  keystone_level: number;
  dungeon_id: number;
  duration_ms: number;
  members: GroupMember[];
}

export interface Composition {
  specs: number[];
  count: number;
}

// Helper to sort members by role: tank, heal, dps, dps, dps
export const sortMembers = <T extends { role: string; spec_id?: number }>(members: T[]): T[] => {
  const roleOrder: Record<string, number> = { tank: 0, healer: 1, dps: 2 };
  return [...members].sort((a, b) => {
    const ra = roleOrder[a.role] ?? 99;
    const rb = roleOrder[b.role] ?? 99;
    
    if (ra !== rb) {
      return ra - rb;
    }
    
    const specA = a.spec_id ?? 0;
    const specB = b.spec_id ?? 0;
    return specA - specB;
  });
};

// Calculate spec counts by role
export const calculateRoleSpecCounts = (runs: Run[]) => {
  const roleSpecCounts: Record<string, Record<number, number>> = { 
    tank: {}, 
    healer: {}, 
    dps: {} 
  };
  
  runs.forEach(r => {
    r.members.forEach(m => {
      const role = WOW_SPEC_ROLES[m.spec_id];
      if (role) {
        roleSpecCounts[role][m.spec_id] = (roleSpecCounts[role][m.spec_id] || 0) + 1;
      }
    });
  });
  
  return roleSpecCounts;
};

// Get top specs by role
export const getTopSpecsByRole = (roleSpecCounts: Record<string, Record<number, number>>, role: string, count: number = 5) => {
  const entries = Object.entries(roleSpecCounts[role]);
  return entries
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([specId, count]) => ({ specId: Number(specId), count }));
};

// Calculate group compositions
export const calculateGroupCompositions = (runs: Run[], selectedSpec: number | null): Composition[] => {
  const groupCompositions: Record<string, { specs: number[], count: number }> = {};
  
  runs.forEach(r => {
    const specIds = sortMembers(r.members).map(m => m.spec_id);
    
    // If a spec is selected, only include compositions that contain that spec
    if (selectedSpec !== null && !specIds.includes(selectedSpec)) {
      return;
    }
    
    const key = specIds.slice().sort((a, b) => a - b).join('-');
    
    if (!groupCompositions[key]) {
      groupCompositions[key] = { specs: specIds, count: 0 };
    }
    groupCompositions[key].count++;
  });
  
  return Object.values(groupCompositions)
    .sort((a, b) => b.count - a.count)
    .slice(0, TOP_COMPOSITIONS_COUNT);
};

// Helper to determine text color for tooltip
export const getTextColor = (bgColor: string): string => {
  const hex = bgColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#23263a' : '#fff';
}; 