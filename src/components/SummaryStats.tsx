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
  // Within same role, sort by spec_id
  function sortMembers<T extends { role: string; spec_id?: number }>(members: T[]): T[] {
    const roleOrder: Record<string, number> = { tank: 0, healer: 1, dps: 2 };
    return [...members].sort((a, b) => {
      const ra = roleOrder[a.role] ?? 99;
      const rb = roleOrder[b.role] ?? 99;
      
      // First sort by role
      if (ra !== rb) {
        return ra - rb;
      }
      
      // Within same role, sort by spec_id
      const specA = a.spec_id ?? 0;
      const specB = b.spec_id ?? 0;
      return specA - specB;
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

  // Helper to determine text color for tooltip
  function getTextColor(bgColor: string): string {
    const hex = bgColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#23263a' : '#fff';
  }

  return (
    <div className="mb-8">
      {/* Summary Stats Grid */}
      <div className="stats-grid">
        <div className="stats-card">
          <div className="label">Top Runs</div>
          <div className="value">{totalRuns}</div>
        </div>
        <div className="stats-card">
          <div className="label">Highest Keystone</div>
          <div className="value">{highestKeystone}</div>
        </div>
        <div className="stats-card">
          <div className="label">Fastest Time</div>
          <div className="value">{fastestTime}</div>
        </div>
        <div className="stats-card">
          <div className="label">Most Popular Dungeon</div>
          <div className="value">{mostPopularDungeon}</div>
        </div>
      </div>

      {/* Most Popular Specs by Role */}
      <div className="spec-role-section">
        <div className="spec-role-title">Most Popular Specs by Role</div>
        <div className="spec-cards-container">
          {/* Tank */}
          <div className="spec-card">
            <span
              className="spec-square"
              style={{
                background: WOW_CLASS_COLORS[tankClassId] || '#fff',
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
            <span className="spec-label">
              {WOW_SPECIALIZATIONS[topTankSpecId] || '-'}
            </span>
            <span className="spec-count">x{specCountInRuns[topTankSpecId] || 0}</span>
          </div>
          {/* Healer */}
          <div className="spec-card">
            <span
              className="spec-square"
              style={{
                background: WOW_CLASS_COLORS[healerClassId] || '#fff',
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
            <span className="spec-label">
              {WOW_SPECIALIZATIONS[topHealerSpecId] || '-'}
            </span>
            <span className="spec-count">x{specCountInRuns[topHealerSpecId] || 0}</span>
          </div>
          {/* Top 3 DPS */}
          {topDps.map((specId, i) => {
            const dpsClassId = Number(WOW_SPEC_TO_CLASS[specId]) || 0;
            return (
              <div
                key={specId}
                className="spec-card"
              >
                <span
                  className="spec-square"
                  style={{
                    background: WOW_CLASS_COLORS[dpsClassId] || '#fff',
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
                <span className="spec-label">
                  {WOW_SPECIALIZATIONS[specId] || '-'}
                </span>
                <span className="spec-count">x{specCountInRuns[specId] || 0}</span>
              </div>
            );
          })}
        </div>
        <div className="meta-evolution-button-container">
          <button 
            className="meta-evolution-link"
            onClick={() => {
              // Navigate to the meta evolution page
              window.location.href = '/meta-evolution';
            }}
            title="View Meta Evolution Charts"
          >
            View Charts
          </button>
        </div>
      </div>

      {/* Most Popular Group Composition */}
      <div className="group-composition-section">
        <div className="spec-role-title">Most Popular Group Composition</div>
        <div className="spec-cards-container">
          {mostPopularGroupSpecs.map((specId, i) => {
            const classId = getClassId(specId);
            const role = getRole(specId);
            return (
              <div
                key={specId + '-' + i}
                className="spec-card"
              >
                <span
                  className="spec-square"
                  style={{
                    background: WOW_CLASS_COLORS[Number(classId)] || '#fff',
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
                <span className="spec-label">
                  {WOW_SPECIALIZATIONS[Number(specId)] || '-'}
                </span>
              </div>
            );
          })}
        </div>
        {mostPopularGroupCount > 0 && (
          <div className="group-count">x{mostPopularGroupCount} times</div>
        )}
        <div className="meta-evolution-button-container">
          <button 
            className="meta-evolution-link"
            onClick={() => {
              // Navigate to the group composition page
              window.location.href = '/group-composition';
            }}
            title="View Group Composition Analysis"
          >
            View More
          </button>
        </div>
      </div>

      {/* Enhanced Tooltip */}
      {specTooltip && (
        <div
          className="spec-tooltip"
          style={{
            left: specTooltip.x,
            top: specTooltip.y - 10,
            background: specTooltip.color,
            borderColor: specTooltip.color,
            color: getTextColor(specTooltip.color),
          }}
        >
          {specTooltip.content}
        </div>
      )}
    </div>
  );
}; 