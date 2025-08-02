import { WOW_SPEC_ROLES } from '../../../constants/wow-constants';
import { TOP_COMPOSITIONS_COUNT } from '../constants/compositionConstants';

export interface GroupMember {
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

// Cache for sorted members to avoid repeated sorting
const sortedMembersCache = new Map<string, GroupMember[]>();

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

// Memoized sort members function
export const sortMembersMemoized = (members: GroupMember[]): GroupMember[] => {
  // Create a cache key based on member specs and roles
  const cacheKey = members
    .map(m => `${m.spec_id}-${m.role}`)
    .sort()
    .join('|');
  
  if (sortedMembersCache.has(cacheKey)) {
    return sortedMembersCache.get(cacheKey)!;
  }
  
  const sorted = sortMembers(members);
  sortedMembersCache.set(cacheKey, sorted);
  return sorted;
};

// Cache for role spec counts
const roleSpecCountsCache = new Map<string, Record<string, Record<number, number>>>();

// Calculate spec counts by role with caching
export const calculateRoleSpecCounts = (runs: Run[]) => {
  // Create cache key based on run IDs
  const cacheKey = runs.map(r => r.id).sort().join('|');
  
  if (roleSpecCountsCache.has(cacheKey)) {
    console.log(`⚡ [${new Date().toISOString()}] Cache HIT for calculateRoleSpecCounts`);
    return roleSpecCountsCache.get(cacheKey)!;
  }
  
  console.log(`🧮 [${new Date().toISOString()}] Cache MISS for calculateRoleSpecCounts - processing ${runs.length} runs`);
  
  const roleSpecCounts: Record<string, Record<number, number>> = { 
    tank: {}, 
    healer: {}, 
    dps: {} 
  };
  
  // Use more efficient iteration
  for (let i = 0; i < runs.length; i++) {
    const run = runs[i];
    for (let j = 0; j < run.members.length; j++) {
      const member = run.members[j];
      const role = WOW_SPEC_ROLES[member.spec_id];
      if (role) {
        roleSpecCounts[role][member.spec_id] = (roleSpecCounts[role][member.spec_id] || 0) + 1;
      }
    }
  }
  
  roleSpecCountsCache.set(cacheKey, roleSpecCounts);
  return roleSpecCounts;
};

// Cache for top specs by role
const topSpecsCache = new Map<string, Array<{ specId: number; count: number }>>();

// Get top specs by role with caching
export const getTopSpecsByRole = (roleSpecCounts: Record<string, Record<number, number>>, role: string, count: number = 5) => {
  const cacheKey = `${role}-${count}-${JSON.stringify(roleSpecCounts[role])}`;
  
  if (topSpecsCache.has(cacheKey)) {
    return topSpecsCache.get(cacheKey)!;
  }
  
  const entries = Object.entries(roleSpecCounts[role]);
  const result = entries
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([specId, count]) => ({ specId: Number(specId), count }));
  
  topSpecsCache.set(cacheKey, result);
  return result;
};

// Cache for group compositions
const compositionsCache = new Map<string, Composition[]>();

// Calculate group compositions with optimized algorithm
export const calculateGroupCompositions = (runs: Run[], selectedSpec: number | null): Composition[] => {
  // Create cache key based on runs and selected spec
  const cacheKey = `${selectedSpec}-${runs.map(r => r.id).sort().join('|')}`;
  
  if (compositionsCache.has(cacheKey)) {
    console.log(`⚡ [${new Date().toISOString()}] Cache HIT for calculateGroupCompositions`);
    return compositionsCache.get(cacheKey)!;
  }
  
  console.log(`🎯 [${new Date().toISOString()}] Cache MISS for calculateGroupCompositions - processing ${runs.length} runs`);
  
  const groupCompositions = new Map<string, { specs: number[], count: number }>();
  
  // Use more efficient iteration and early filtering
  for (let i = 0; i < runs.length; i++) {
    const run = runs[i];
    const specIds = sortMembersMemoized(run.members).map(m => m.spec_id);
    
    // If a spec is selected, only include compositions that contain that spec
    if (selectedSpec !== null && !specIds.includes(selectedSpec)) {
      continue;
    }
    
    // Create sorted key for consistent grouping
    const key = specIds.slice().sort((a, b) => a - b).join('-');
    
    const existing = groupCompositions.get(key);
    if (existing) {
      existing.count++;
    } else {
      groupCompositions.set(key, { specs: specIds, count: 1 });
    }
  }
  
  const result = Array.from(groupCompositions.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, TOP_COMPOSITIONS_COUNT);
  
  compositionsCache.set(cacheKey, result);
  return result;
};

// Helper to determine text color for tooltip
export const getTextColor = (bgColor: string): string => {
  const hex = bgColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
};

// Clean up caches periodically
export const cleanupCompositionCaches = () => {
  // Clear all caches to prevent memory leaks
  sortedMembersCache.clear();
  roleSpecCountsCache.clear();
  topSpecsCache.clear();
  compositionsCache.clear();
};

// Set up periodic cache cleanup
if (typeof window !== 'undefined') {
  setInterval(cleanupCompositionCaches, 10 * 60 * 1000); // Clean up every 10 minutes
} 