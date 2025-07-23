import React from 'react';

interface GroupMember {
  character_name: string;
  class_id: number;
  spec_id: number;
  role: string;
}

interface Run {
  id: number;
  keystone_level: number;
  dungeon_id: number;
  duration_ms: number;
  members: GroupMember[];
}

interface Dungeon {
  dungeon_id: number;
  dungeon_name: string;
}

const WOW_SPECIALIZATIONS: Record<number, string> = {
  71: 'Arms', 72: 'Fury', 73: 'Protection', 65: 'Holy', 66: 'Protection', 70: 'Retribution',
  253: 'Beast Mastery', 254: 'Marksmanship', 255: 'Survival', 259: 'Assassination', 260: 'Outlaw', 261: 'Subtlety',
  256: 'Discipline', 257: 'Holy', 258: 'Shadow', 250: 'Blood', 251: 'Frost', 252: 'Unholy',
  262: 'Elemental', 263: 'Enhancement', 264: 'Restoration', 62: 'Arcane', 63: 'Fire', 64: 'Frost',
  265: 'Affliction', 266: 'Demonology', 267: 'Destruction', 268: 'Brewmaster', 269: 'Windwalker', 270: 'Mistweaver',
  102: 'Balance', 103: 'Feral', 104: 'Guardian', 105: 'Restoration', 577: 'Havoc', 581: 'Vengeance',
  1467: 'Devastation', 1468: 'Preservation', 1473: 'Augmentation',
};

const WOW_SPEC_ROLES: Record<number, string> = {
  71: 'dps', 72: 'dps', 73: 'tank', 65: 'healer', 66: 'tank', 70: 'dps',
  253: 'dps', 254: 'dps', 255: 'dps', 259: 'dps', 260: 'dps', 261: 'dps',
  256: 'healer', 257: 'healer', 258: 'dps', 250: 'tank', 251: 'dps', 252: 'dps',
  262: 'dps', 263: 'dps', 264: 'healer', 62: 'dps', 63: 'dps', 64: 'dps',
  265: 'dps', 266: 'dps', 267: 'dps', 268: 'tank', 269: 'dps', 270: 'healer',
  102: 'dps', 103: 'dps', 104: 'tank', 105: 'healer', 577: 'dps', 581: 'tank',
  1467: 'dps', 1468: 'healer', 1473: 'dps',
};

const WOW_CLASS_COLORS: Record<number, string> = {
  1: '#C79C6E', 2: '#F58CBA', 3: '#ABD473', 4: '#FFF569', 5: '#FFFFFF', 6: '#C41F3B', 7: '#0070DE', 8: '#69CCF0', 9: '#9482C9', 10: '#00FF96', 11: '#FF7D0A', 12: '#A330C9', 13: '#33937F',
};
const WOW_SPEC_TO_CLASS: Record<number, number> = {
  71: 1, 72: 1, 73: 1, 65: 2, 66: 2, 70: 2, 253: 3, 254: 3, 255: 3, 259: 4, 260: 4, 261: 4, 256: 5, 257: 5, 258: 5, 250: 6, 251: 6, 252: 6, 262: 7, 263: 7, 264: 7, 62: 8, 63: 8, 64: 8, 265: 9, 266: 9, 267: 9, 268: 10, 269: 10, 270: 10, 102: 11, 103: 11, 104: 11, 105: 11, 577: 12, 581: 12, 1467: 13, 1468: 13, 1473: 13
};
const WOW_CLASS_NAMES: Record<number, string> = {
  1: 'Warrior', 2: 'Paladin', 3: 'Hunter', 4: 'Rogue', 5: 'Priest', 6: 'Death Knight', 7: 'Shaman', 8: 'Mage', 9: 'Warlock', 10: 'Monk', 11: 'Druid', 12: 'Demon Hunter', 13: 'Evoker',
};

interface SummaryStatsProps {
  runs: Run[];
  dungeons: Dungeon[];
}

function msToTime(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export const SummaryStats: React.FC<SummaryStatsProps> = ({ runs, dungeons }) => {
  // Top runs
  const totalRuns = runs.length;

  // Highest keystone
  const highestKeystone = runs.length ? Math.max(...runs.map(r => r.keystone_level)) : '-';

  // Fastest time
  const fastestRun = runs.length ? runs.reduce((min, r) => (r.duration_ms < min.duration_ms ? r : min), runs[0]) : null;
  const fastestTime = fastestRun ? msToTime(fastestRun.duration_ms) : '-';

  // Most popular dungeon
  const dungeonCounts: Record<number, number> = {};
  runs.forEach(r => { dungeonCounts[r.dungeon_id] = (dungeonCounts[r.dungeon_id] || 0) + 1; });
  const mostPopularDungeonId = Object.entries(dungeonCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
  const mostPopularDungeon = dungeons.find(d => d.dungeon_id === Number(mostPopularDungeonId))?.dungeon_name || '-';

  // Most popular spec (overall and by role)
  const specCounts: Record<number, number> = {};
  const roleSpecCounts: Record<string, Record<number, number>> = { tank: {}, healer: {}, dps: {} };
  runs.forEach(r => {
    r.members.forEach(m => {
      specCounts[m.spec_id] = (specCounts[m.spec_id] || 0) + 1;
      const role = WOW_SPEC_ROLES[m.spec_id];
      if (role) {
        roleSpecCounts[role][m.spec_id] = (roleSpecCounts[role][m.spec_id] || 0) + 1;
      }
    });
  });
  const mostPopularSpecId = Object.entries(specCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
  const mostPopularSpec = WOW_SPECIALIZATIONS[Number(mostPopularSpecId)] || '-';
  const mostPopularByRole: Record<string, string> = {};
  (['tank', 'healer', 'dps'] as const).forEach(role => {
    const entries = Object.entries(roleSpecCounts[role]);
    if (entries.length) {
      const top = entries.sort((a, b) => b[1] - a[1])[0][0];
      mostPopularByRole[role] = WOW_SPECIALIZATIONS[Number(top)] || '-';
    } else {
      mostPopularByRole[role] = '-';
    }
  });

  // Find top 3 dps specs
  const dpsEntries = Object.entries(roleSpecCounts['dps']);
  const topDps = dpsEntries.length
    ? dpsEntries.sort((a, b) => b[1] - a[1]).slice(0, 3).map(([specId]) => Number(specId))
    : [];

  // Compute top tank and healer spec IDs for cleaner JSX
  const topTankSpecId: number = Number(
    Object.keys(roleSpecCounts.tank)
      .map(Number)
      .sort((a, b) => (roleSpecCounts.tank[b] ?? 0) - (roleSpecCounts.tank[a] ?? 0))[0]
  ) || 0;
  const topHealerSpecId: number = Number(
    Object.keys(roleSpecCounts.healer)
      .map(Number)
      .sort((a, b) => (roleSpecCounts.healer[b] ?? 0) - (roleSpecCounts.healer[a] ?? 0))[0]
  ) || 0;
  const tankClassId = Number(WOW_SPEC_TO_CLASS[topTankSpecId]) || 0;
  const healerClassId = Number(WOW_SPEC_TO_CLASS[topHealerSpecId]) || 0;

  // Emoji for roles
  const roleEmoji: Record<string, string> = { tank: '🛡️', healer: '💚', dps: '⚔️' };

  // Helper to sort members by role: tank, heal, dps, dps, dps
  function sortMembers<T extends { role: string }>(members: T[]): T[] {
    const roleOrder: Record<string, number> = { tank: 0, healer: 1, dps: 2 };
    return [...members].sort((a, b) => {
      const ra = roleOrder[a.role] ?? 99;
      const rb = roleOrder[b.role] ?? 99;
      return ra - rb;
    });
  }

  // Find most popular group composition (5-spec combo, regardless of order)
  let mostPopularGroupSpecs: number[] = [];
  let mostPopularGroupCount = 0;
  if (runs.length) {
    const groupCounts: Record<string, number> = {};
    let groupMap: Record<string, number[]> = {};
    runs.forEach((r: Run) => {
      const specIds = sortMembers(r.members).map((m: GroupMember) => m.spec_id);
      const key = specIds.slice().sort((a: number, b: number) => a - b).join('-');
      groupCounts[key] = (groupCounts[key] || 0) + 1;
      groupMap[key] = specIds;
    });
    const mostPopularGroupKey = Object.entries(groupCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
    mostPopularGroupSpecs = groupMap[mostPopularGroupKey] || [];
    mostPopularGroupCount = groupCounts[mostPopularGroupKey] || 0;
  }

  // Helper to get role for a spec
  function getRole(specId: number): string {
    return WOW_SPEC_ROLES[specId] || '';
  }

  // Helper to get classId for a spec
  function getClassId(specId: number): number {
    return Number(WOW_SPEC_TO_CLASS[specId]) || 0;
  }

  // Count occurrences for each spec in the current runs
  const specCountInRuns: Record<number, number> = {};
  runs.forEach((r: Run) => {
    r.members.forEach((m: GroupMember) => {
      specCountInRuns[m.spec_id] = (specCountInRuns[m.spec_id] || 0) + 1;
    });
  });

  // For group composition: count how many times each spec appears in the most popular group
  const groupSpecCount: Record<number, number> = {};
  mostPopularGroupSpecs.forEach((specId: number) => {
    groupSpecCount[specId] = (groupSpecCount[specId] || 0) + 1;
  });

  return (
    <div className="flex flex-wrap gap-6 mb-8">
      <div className="flex-1 min-w-[180px] bg-gray-800 rounded-xl p-4 shadow text-center">
        <div className="text-xs text-gray-400 mb-1">Top Runs</div>
        <div className="text-xl font-bold">{totalRuns}</div>
      </div>
      <div className="flex-1 min-w-[180px] bg-gray-800 rounded-xl p-4 shadow text-center">
        <div className="text-xs text-gray-400 mb-1">Highest Keystone</div>
        <div className="text-xl font-bold">{highestKeystone}</div>
      </div>
      <div className="flex-1 min-w-[180px] bg-gray-800 rounded-xl p-4 shadow text-center">
        <div className="text-xs text-gray-400 mb-1">Fastest Time</div>
        <div className="text-xl font-bold">{fastestTime}</div>
      </div>
      <div className="flex-1 min-w-[180px] bg-gray-800 rounded-xl p-4 shadow text-center">
        <div className="text-xs text-gray-400 mb-1">Most Popular Dungeon</div>
        <div className="text-xl font-bold">{mostPopularDungeon}</div>
      </div>
      {/* Most Popular Specs by Role */}
      <div className="w-full bg-gray-800 rounded-xl p-4 shadow text-center flex flex-col items-center mb-6">
        <div className="text-xs text-gray-400 mb-4">Most Popular Specs by Role</div>
        <div className="flex justify-center gap-8 mb-2">
          {/* Tank */}
          <div className="flex flex-col items-center justify-center">
            <span
              className="saas-group-square"
              style={{
                background: WOW_CLASS_COLORS[tankClassId] || '#fff',
                width: 80,
                height: 80,
                borderRadius: 20,
                fontSize: 32,
                marginBottom: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span>{roleEmoji.tank}</span>
            </span>
            <span className="text-lg font-bold mt-2" style={{ color: '#fff' }}>{WOW_SPECIALIZATIONS[topTankSpecId] || '-'}</span>
            <span className="text-xs text-gray-300 mt-1">x{specCountInRuns[topTankSpecId] || 0}</span>
          </div>
          {/* Healer */}
          <div className="flex flex-col items-center justify-center">
            <span
              className="saas-group-square"
              style={{
                background: WOW_CLASS_COLORS[healerClassId] || '#fff',
                width: 80,
                height: 80,
                borderRadius: 20,
                fontSize: 32,
                marginBottom: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span>{roleEmoji.healer}</span>
            </span>
            <span className="text-lg font-bold mt-2" style={{ color: '#fff' }}>{WOW_SPECIALIZATIONS[topHealerSpecId] || '-'}</span>
            <span className="text-xs text-gray-300 mt-1">x{specCountInRuns[topHealerSpecId] || 0}</span>
          </div>
          {/* Top 3 DPS */}
          {topDps.map((specId, i) => {
            const dpsClassId = Number(WOW_SPEC_TO_CLASS[specId]) || 0;
            return (
              <div
                key={specId}
                className="flex flex-col items-center justify-center"
              >
                <span
                  className="saas-group-square"
                  style={{
                    background: WOW_CLASS_COLORS[dpsClassId] || '#fff',
                    width: 80,
                    height: 80,
                    borderRadius: 20,
                    fontSize: 32,
                    marginBottom: 10,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span>{roleEmoji.dps}</span>
                </span>
                <span className="text-lg font-bold mt-2" style={{ color: '#fff' }}>{WOW_SPECIALIZATIONS[specId] || '-'}</span>
                <span className="text-xs text-gray-300 mt-1">x{specCountInRuns[specId] || 0}</span>
              </div>
            );
          })}
        </div>
      </div>
      {/* Most Popular Group Composition */}
      <div className="w-full bg-gray-800 rounded-xl p-4 shadow text-center flex flex-col items-center">
        <div className="text-xs text-gray-400 mb-4">Most Popular Group Composition</div>
        <div className="flex justify-center gap-8 mb-2">
          {mostPopularGroupSpecs.map((specId, i) => {
            const classId = getClassId(specId);
            const role = getRole(specId);
            return (
              <div
                key={specId + '-' + i}
                className="flex flex-col items-center justify-center"
              >
                <span
                  className="saas-group-square"
                  style={{
                    background: WOW_CLASS_COLORS[Number(classId)] || '#fff',
                    width: 80,
                    height: 80,
                    borderRadius: 20,
                    fontSize: 32,
                    marginBottom: 10,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span>{roleEmoji[role] || ''}</span>
                </span>
                <span className="text-lg font-bold mt-2" style={{ color: '#fff' }}>{WOW_SPECIALIZATIONS[Number(specId)] || '-'}</span>
              </div>
            );
          })}
        </div>
        {mostPopularGroupCount > 0 && (
          <div className="text-xs text-gray-300 mt-2">x{mostPopularGroupCount} times</div>
        )}
      </div>
    </div>
  );
}; 