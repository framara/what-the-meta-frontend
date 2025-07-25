import React, { useState } from 'react';
import { WOW_CLASS_COLORS, WOW_SPECIALIZATIONS, WOW_SPEC_TO_CLASS, WOW_SPEC_ROLES } from './wow-constants';
import './styles/SummaryStats.css';

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

interface SummaryStatsProps {
  runs: Run[];
  dungeons: Dungeon[];
}

function msToTime(ms: number): string {
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

  // Tooltip state for spec cards
  const [specTooltip, setSpecTooltip] = useState<{
    x: number;
    y: number;
    content: string;
    color: string;
  } | null>(null);

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
        <div className="flex justify-center flex-wrap gap-2 md:gap-8 mb-2">
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
              onMouseEnter={e => {
                const rect = (e.target as HTMLElement).getBoundingClientRect();
                setSpecTooltip({
                  x: rect.left + rect.width / 2,
                  y: rect.top,
                  content: WOW_SPECIALIZATIONS[topTankSpecId] || '-',
                  color: WOW_CLASS_COLORS[tankClassId] || '#23263a',
                });
              }}
              onMouseLeave={() => setSpecTooltip(null)}
            >
              <span>{roleEmoji.tank}</span>
            </span>
            <span className="summary-spec-label text-lg font-bold mt-2 hidden md:inline">
              {WOW_SPECIALIZATIONS[topTankSpecId] || '-'}
            </span>
            <span className="summary-spec-count text-xs text-gray-300 mt-1">x{specCountInRuns[topTankSpecId] || 0}</span>
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
              onMouseEnter={e => {
                const rect = (e.target as HTMLElement).getBoundingClientRect();
                setSpecTooltip({
                  x: rect.left + rect.width / 2,
                  y: rect.top,
                  content: WOW_SPECIALIZATIONS[topHealerSpecId] || '-',
                  color: WOW_CLASS_COLORS[healerClassId] || '#23263a',
                });
              }}
              onMouseLeave={() => setSpecTooltip(null)}
            >
              <span>{roleEmoji.healer}</span>
            </span>
            <span className="summary-spec-label text-lg font-bold mt-2 hidden md:inline">
              {WOW_SPECIALIZATIONS[topHealerSpecId] || '-'}
            </span>
            <span className="summary-spec-count text-xs text-gray-300 mt-1">x{specCountInRuns[topHealerSpecId] || 0}</span>
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
                  onMouseEnter={e => {
                    const rect = (e.target as HTMLElement).getBoundingClientRect();
                    setSpecTooltip({
                      x: rect.left + rect.width / 2,
                      y: rect.top,
                      content: WOW_SPECIALIZATIONS[specId] || '-',
                      color: WOW_CLASS_COLORS[dpsClassId] || '#23263a',
                    });
                  }}
                  onMouseLeave={() => setSpecTooltip(null)}
                >
                  <span>{roleEmoji.dps}</span>
                </span>
                <span className="summary-spec-label text-lg font-bold mt-2 hidden md:inline">
                  {WOW_SPECIALIZATIONS[specId] || '-'}
                </span>
                <span className="summary-spec-count text-xs text-gray-300 mt-1">x{specCountInRuns[specId] || 0}</span>
              </div>
            );
          })}
        </div>
      </div>
      {/* Most Popular Group Composition */}
      <div className="w-full bg-gray-800 rounded-xl p-4 shadow text-center flex flex-col items-center">
        <div className="text-xs text-gray-400 mb-4">Most Popular Group Composition</div>
        <div className="flex justify-center flex-wrap gap-2 md:gap-8 mb-2">
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
                  onMouseEnter={e => {
                    const rect = (e.target as HTMLElement).getBoundingClientRect();
                    setSpecTooltip({
                      x: rect.left + rect.width / 2,
                      y: rect.top,
                      content: WOW_SPECIALIZATIONS[Number(specId)] || '-',
                      color: WOW_CLASS_COLORS[Number(classId)] || '#23263a',
                    });
                  }}
                  onMouseLeave={() => setSpecTooltip(null)}
                >
                  <span>{roleEmoji[role] || ''}</span>
                </span>
                <span className="summary-spec-label text-lg font-bold mt-2 hidden md:inline">
                  {WOW_SPECIALIZATIONS[Number(specId)] || '-'}
                </span>
              </div>
            );
          })}
        </div>
        {mostPopularGroupCount > 0 && (
          <div className="text-xs text-gray-300 mt-2">x{mostPopularGroupCount} times</div>
        )}
      </div>
      {/* Custom tooltip for spec cards */}
      {specTooltip && (() => {
        const minWidth = 80;
        const maxWidth = 180;
        const tooltipWidth = maxWidth;
        let left = specTooltip.x;
        if (typeof window !== 'undefined' && left + tooltipWidth > window.innerWidth - 8) {
          left = Math.max(8, window.innerWidth - tooltipWidth - 8);
        }
        return (
          <div
            className="fixed z-50 px-4 py-2 rounded-lg text-xs shadow-lg border pointer-events-none"
            style={{
              left,
              top: specTooltip.y - 40,
              minWidth,
              maxWidth,
              background: specTooltip.color,
              borderColor: specTooltip.color,
              borderWidth: 1.5,
              color:
                specTooltip.color.toLowerCase() === '#fff' || specTooltip.color.toLowerCase() === '#ffffff' || specTooltip.color.toLowerCase() === '#fff569'
                  ? '#23263a'
                  : '#fff',
              fontWeight: 500,
              boxShadow: '0 4px 24px 0 rgba(0,0,0,0.18)',
              textAlign: 'center',
            }}
          >
            {specTooltip.content}
          </div>
        );
      })()}
    </div>
  );
}; 