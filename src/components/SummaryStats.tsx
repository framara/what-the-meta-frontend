import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { WOW_CLASS_COLORS, WOW_SPECIALIZATIONS, WOW_SPEC_TO_CLASS, WOW_SPEC_ROLES, WOW_DUNGEON_TIMERS } from '../constants/wow-constants';
import { SpecIconImage } from '../utils/specIconImages';
import './styles/SummaryStats.css';
import { useFilterState } from './FilterContext';
import { fetchCutoffLatest, fetchSeasonInfo } from '../services/api';
import { getRaiderIoSeasonSlug } from '../constants/wow-constants';

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

export const SummaryStats: React.FC<SummaryStatsProps> = ({ runs, dungeons }) => {
  const filter = useFilterState();
  const navigate = useNavigate();
  const [cutoffScores, setCutoffScores] = useState<{ us: number | null; eu: number | null }>({ us: null, eu: null });
  const [cutoffLoading, setCutoffLoading] = useState<boolean>(false);
  const [periodLabel, setPeriodLabel] = useState<string | null>(null);
  const [metaHealthOverall, setMetaHealthOverall] = useState<string | null>(null);
  const [metaHealthLoading, setMetaHealthLoading] = useState<boolean>(false);

  // API base URL (duplicate of services value to avoid generating analysis here)
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

  // Load latest cutoff snapshot for current season (default region: US)
  useEffect(() => {
    const seasonSlug = getRaiderIoSeasonSlug(filter?.season_id);
    if (!seasonSlug) {
      setCutoffScores({ us: null, eu: null });
      return;
    }
    setCutoffLoading(true);
    Promise.allSettled([
      fetchCutoffLatest(seasonSlug, 'us'),
      fetchCutoffLatest(seasonSlug, 'eu')
    ])
      .then(results => {
        const parse = (v: any): number | null => {
          const num = v?.cutoff_score == null ? null : Number(v.cutoff_score);
          return typeof num === 'number' && Number.isFinite(num) ? num : null;
        };
        const us = results[0].status === 'fulfilled' ? parse(results[0].value) : null;
        const eu = results[1].status === 'fulfilled' ? parse(results[1].value) : null;
        setCutoffScores({ us, eu });
      })
      .catch(() => setCutoffScores({ us: null, eu: null }))
      .finally(() => setCutoffLoading(false));
  }, [filter?.season_id]);

  // Derive display label and class for Meta Health card
  const metaHealthState = (() => {
    if (metaHealthLoading) return { label: '…', className: '' };
    const norm = (metaHealthOverall || '').toLowerCase();
    if (norm === 'healthy') return { label: 'Healthy', className: 'state-healthy' };
    if (norm === 'concerning') return { label: 'Concerning', className: 'state-concerning' };
    if (norm === 'unhealthy') return { label: 'Unhealthy', className: 'state-unhealthy' };
    return { label: 'Needs analysis', className: 'state-unknown' };
  })();

  const metaHealthSubtitle: string = (() => {
  if (metaHealthLoading) return '';
  if (!metaHealthOverall) return '';
  return '';
  })();

  // Resolve scope label for period (week) when selected
  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!filter?.season_id || !filter?.period_id) {
        setPeriodLabel(null);
        return;
      }
      try {
        const info = await fetchSeasonInfo(Number(filter.season_id));
        const p = info?.periods?.find(p => Number(p.period_id) === Number(filter.period_id));
        if (!cancelled) setPeriodLabel(p?.period_name || `Week ${filter.period_id}`);
      } catch {
        if (!cancelled) setPeriodLabel(`Week ${filter.period_id}`);
      }
    }
    run();
    return () => { cancelled = true; };
  }, [filter?.season_id, filter?.period_id]);

  // Load cached Meta Health analysis (do not trigger generation). If missing, keep null.
  useEffect(() => {
    const seasonId = Number(filter?.season_id);
    if (!seasonId) {
      setMetaHealthOverall(null);
      return;
    }
    let cancelled = false;
    setMetaHealthLoading(true);
    axios
      .get(`${API_BASE_URL}/ai/analysis/${seasonId}?type=meta_health`)
      .then((res) => {
        const overall = res?.data?.metaSummary?.overallState;
        if (!cancelled) {
          setMetaHealthOverall(typeof overall === 'string' ? overall : null);
        }
      })
      .catch(() => { if (!cancelled) { setMetaHealthOverall(null); } })
      .finally(() => { if (!cancelled) setMetaHealthLoading(false); });
    return () => { cancelled = true; };
  }, [filter?.season_id]);

  // Top runs (reflect the filter's selected Top N, not the returned rows count)
  const selectedLimit = Number(filter?.limit ?? runs.length);
  const totalRunsFormatted = selectedLimit.toLocaleString('de-DE');
  const scopeText = filter?.period_id ? (periodLabel || 'selected week') : 'entire season';

  // Highest keystone and representative dungeon name (excluding depleted runs)
  let highestKeystoneLabel: string = '-';
  if (runs.length) {
    const nonDepleted = runs.filter(r => {
      const timer = WOW_DUNGEON_TIMERS[r.dungeon_id as number];
      return !timer || r.duration_ms <= timer; // keep only in-time or unknown-timer
    });
    if (nonDepleted.length) {
      const maxLevel = nonDepleted.reduce((m, r) => (r.keystone_level > m ? r.keystone_level : m), nonDepleted[0].keystone_level);
      const topLevelRuns = nonDepleted.filter(r => r.keystone_level === maxLevel);
      const fastestAtMax = topLevelRuns.reduce<Run | null>((best, r) => {
        if (!best) return r;
        return r.duration_ms < best.duration_ms ? r : best;
      }, null);
      const topDungeonName = fastestAtMax
        ? dungeons.find(d => d.dungeon_id === fastestAtMax.dungeon_id)?.dungeon_name
        : undefined;
      highestKeystoneLabel = `${maxLevel}${topDungeonName ? ` — ${topDungeonName}` : ''}`;
    } else {
      highestKeystoneLabel = '-';
    }
  }

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
          <div className="label">Sample size</div>
          <div className="value">Best {totalRunsFormatted} runs of {scopeText}</div>
        </div>
        <div className="stats-card">
          <div className="label">Highest Keystone</div>
          <div className="value">{highestKeystoneLabel}</div>
        </div>
        <div className="stats-card">
          <div className="label">Meta Health <span className="ai-badge" title="AI generated">AI</span></div>
          <div className={`value ${metaHealthState.className}`}>{metaHealthState.label}</div>
          <div className="stats-card-cta">
            <button
              className="meta-evolution-link"
              onClick={() => { navigate('/meta-health'); }}
              title="View AI Meta Health summary"
            >
              View Meta Health
            </button>
          </div>
        </div>
        <div className="stats-card cutoff-card">
          <div className="label">Current 0.1% Cutoff</div>
          <div className="value">
            {cutoffLoading ? '…' : `US: ${cutoffScores.us != null ? Math.round(cutoffScores.us) : '-'}`}
          </div>
          <div className="value" style={{ marginTop: '0.25rem' }}>
            {cutoffLoading ? '' : `EU: ${cutoffScores.eu != null ? Math.round(cutoffScores.eu) : '-'}`}
          </div>
          <div className="stats-card-cta">
            <button 
              className="meta-evolution-link"
              onClick={() => { navigate('/cutoff'); }}
              title="View current cutoff details"
            >
              View Cutoff
            </button>
          </div>
        </div>
      </div>

      {/* Most Popular Specs by Role */}
      <div className="spec-role-section">
        <div className="spec-role-title">Most Popular Specs by Role</div>
        <div className="spec-cards-container">
          {/* Tank */}
          <div className="spec-card">
            <div
              className="spec-icon"
              style={{
                border: `3px solid ${WOW_CLASS_COLORS[tankClassId] || '#fff'}`,
              }}
              onMouseEnter={(e: React.MouseEvent) => {
                const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                setSpecTooltip({
                  x: rect.left + rect.width / 2,
                  y: rect.top,
                  content: WOW_SPECIALIZATIONS[topTankSpecId] || '-',
                  color: WOW_CLASS_COLORS[tankClassId] || '#23263a',
                });
              }}
              onMouseLeave={() => setSpecTooltip(null)}
            >
              <SpecIconImage 
                specId={topTankSpecId} 
                alt={WOW_SPECIALIZATIONS[topTankSpecId] || 'Tank Spec'}
              />
            </div>
            <span className="spec-label">
              {WOW_SPECIALIZATIONS[topTankSpecId] || '-'}
            </span>
            <span className="spec-count">x{specCountInRuns[topTankSpecId] || 0}</span>
          </div>
          {/* Healer */}
          <div className="spec-card">
            <div
              className="spec-icon"
              style={{
                border: `3px solid ${WOW_CLASS_COLORS[healerClassId] || '#fff'}`,
              }}
              onMouseEnter={(e: React.MouseEvent) => {
                const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                setSpecTooltip({
                  x: rect.left + rect.width / 2,
                  y: rect.top,
                  content: WOW_SPECIALIZATIONS[topHealerSpecId] || '-',
                  color: WOW_CLASS_COLORS[healerClassId] || '#23263a',
                });
              }}
              onMouseLeave={() => setSpecTooltip(null)}
            >
              <SpecIconImage 
                specId={topHealerSpecId} 
                alt={WOW_SPECIALIZATIONS[topHealerSpecId] || 'Healer Spec'}
              />
            </div>
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
                <div
                  className="spec-icon"
                  style={{
                    border: `3px solid ${WOW_CLASS_COLORS[dpsClassId] || '#fff'}`,
                  }}
                  onMouseEnter={(e: React.MouseEvent) => {
                    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                    setSpecTooltip({
                      x: rect.left + rect.width / 2,
                      y: rect.top,
                      content: WOW_SPECIALIZATIONS[specId] || '-',
                      color: WOW_CLASS_COLORS[dpsClassId] || '#23263a',
                    });
                  }}
                  onMouseLeave={() => setSpecTooltip(null)}
                >
                  <SpecIconImage 
                    specId={specId} 
                    alt={WOW_SPECIALIZATIONS[specId] || 'DPS Spec'}
                  />
                </div>
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
              navigate('/meta-evolution');
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
                <div
                  className="spec-icon"
                  style={{
                    border: `3px solid ${WOW_CLASS_COLORS[Number(classId)] || '#fff'}`,
                  }}
                  onMouseEnter={(e: React.MouseEvent) => {
                    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                    setSpecTooltip({
                      x: rect.left + rect.width / 2,
                      y: rect.top,
                      content: WOW_SPECIALIZATIONS[Number(specId)] || '-',
                      color: WOW_CLASS_COLORS[Number(classId)] || '#23263a',
                    });
                  }}
                  onMouseLeave={() => setSpecTooltip(null)}
                >
                  <SpecIconImage 
                    specId={Number(specId)} 
                    alt={WOW_SPECIALIZATIONS[Number(specId)] || 'Group Spec'}
                  />
                </div>
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
              navigate('/group-composition');
            }}
            title="View Group Composition Analysis"
          >
            View More
          </button>
        </div>
      </div>

      {/* Enhanced Tooltip */}
      {specTooltip && createPortal(
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
        </div>,
        document.body
      )}
    </div>
  );
}; 