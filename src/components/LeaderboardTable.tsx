import React, { useState, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { WOW_CLASS_COLORS, WOW_SPECIALIZATIONS, WOW_CLASS_NAMES, WOW_SPEC_TO_CLASS, WOW_DUNGEON_TIMERS } from '../constants/wow-constants';
import { SpecIconImage } from '../utils/specIconImages';
import type { GroupMember, MythicKeystoneRun, Dungeon } from '../types/api';
import './styles/LeaderboardTable.css';

interface LeaderboardTableProps {
  runs: MythicKeystoneRun[];
  dungeons: Dungeon[];
  loading?: boolean; // shows skeleton rows when true
}

function msToTime(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export const LeaderboardTable: React.FC<LeaderboardTableProps> = ({ runs, dungeons, loading = false }) => {
  const dungeonMap = React.useMemo(() => {
    const map: Record<number, { name: string; shortname: string }> = {};
    dungeons.forEach(d => {
      map[d.dungeon_id] = {
        name: d.dungeon_name || d.name || '',
        shortname: d.dungeon_shortname || d.shortname || ''
      };
    });
    return map;
  }, [dungeons]);

  // Pagination state
  const PAGE_SIZE = 20;
  const [page, setPage] = useState(0);
  const pageCount = Math.ceil(runs.length / PAGE_SIZE);
  const pagedRuns = runs.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  // Build skeleton rows while loading
  const skeletonRowCount = PAGE_SIZE;

  // Helper to sort members by role: tank, heal, dps, dps, dps
  // Within same role, sort by spec_id (memoized)
  const sortMembers = useCallback((members: GroupMember[]) => {
    const roleOrder: Record<string, number> = { tank: 0, healer: 1, dps: 2 };
    return [...members].sort((a, b) => {
      const ra = roleOrder[a.role] ?? 99;
      const rb = roleOrder[b.role] ?? 99;
      
      // First sort by role
      if (ra !== rb) {
        return ra - rb;
      }
      
      // Within same role, sort by spec_id
      return a.spec_id - b.spec_id;
    });
  }, []);

  // Tooltip state for group squares
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    content: string;
    color: string;
  } | null>(null);

  // Helper to determine text color for tooltip (memoized)
  const getTextColor = useCallback((bgColor: string): string => {
    const hex = bgColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#23263a' : '#fff';
  }, []);

  // Helper to calculate tooltip position within table bounds (memoized)
  const calculateTooltipPosition = useCallback((element: HTMLElement, content: string): { x: number; y: number } => {
    const rect = element.getBoundingClientRect();
    const tableContainer = element.closest('.leaderboard-table-container');
    const tableRect = tableContainer?.getBoundingClientRect();
    
    if (!tableRect) {
      return { x: rect.left + rect.width / 2, y: rect.top };
    }

    // Tooltip dimensions (approximate)
    const tooltipWidth = 200;
    const tooltipHeight = 80;
    const padding = 10;

    // Calculate initial position (centered above the element)
    let x = rect.left + rect.width / 2;
    let y = rect.top - tooltipHeight - padding;

    // Adjust horizontal position to stay within table bounds
    const minX = tableRect.left + padding;
    const maxX = tableRect.right - tooltipWidth - padding;
    
    if (x < minX) {
      x = minX;
    } else if (x > maxX) {
      x = maxX;
    }

    // Adjust vertical position to stay within table bounds
    const minY = tableRect.top + padding;
    const maxY = tableRect.bottom - tooltipHeight - padding;
    
    if (y < minY) {
      // If tooltip would go above table, position it below the element
      y = rect.bottom + padding;
    }
    
    if (y > maxY) {
      y = maxY;
    }

    return { x, y };
  }, []);

  // Memoized GroupSquares component for better performance
  const GroupSquares = React.memo<{
    members: GroupMember[];
    onTooltipShow: (e: React.MouseEvent<HTMLDivElement>, content: string, color: string) => void;
    onTooltipHide: () => void;
  }>(({ members, onTooltipShow, onTooltipHide }) => {
    const sortedMembers = useMemo(() => sortMembers(members), [members]);
    
    return (
      <div className="saas-group-squares">
        {sortedMembers.map((m, idx) => {
          const roleCap = m.role && typeof m.role === 'string'
            ? m.role.charAt(0).toUpperCase() + m.role.slice(1)
            : 'Unknown';
          const tooltipContent = `Name: ${m.character_name}\nRole: ${roleCap}\nClass: ${WOW_CLASS_NAMES[m.class_id] || m.class_id}\nSpec: ${WOW_SPECIALIZATIONS[m.spec_id] || m.spec_id}`;
          const classId = Number(WOW_SPEC_TO_CLASS[m.spec_id]) || 0;
          const classColor = WOW_CLASS_COLORS[classId] || '#23263a';
          
          return (
            <div
              key={m.character_name + idx}
              className="saas-group-square"
              style={{ border: `0.15rem solid ${classColor}` }}
              onMouseEnter={(e) => onTooltipShow(e, tooltipContent, classColor)}
              onMouseLeave={onTooltipHide}
            >
              <SpecIconImage 
                specId={m.spec_id} 
                alt={WOW_SPECIALIZATIONS[m.spec_id] || 'Spec'}
              />
            </div>
          );
        })}
      </div>
    );
  });

  // Memoized tooltip handlers
  const handleTooltipShow = useCallback((e: React.MouseEvent<HTMLDivElement>, content: string, color: string) => {
    const position = calculateTooltipPosition(e.currentTarget as HTMLElement, content);
    setTooltip({
      x: position.x,
      y: position.y,
      content: content.replace(/\n/g, '<br/>'),
      color: color,
    });
  }, [calculateTooltipPosition]);

  const handleTooltipHide = useCallback(() => {
    setTooltip(null);
  }, []);

  return (
    <>
      <div className="leaderboard-table-container">
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th className="table-cell rank-cell">Rank</th>
              <th className="md:hidden">Key</th>
              <th className="hidden md:table-cell">Key</th>
              <th className="hidden md:table-cell">Dungeon</th>
              <th className="hidden md:table-cell">Score</th>
              <th className="hidden md:table-cell">Time</th>
              <th className="hidden md:table-cell">Date</th>
              <th className="table-cell">Group</th>
            </tr>
          </thead>
          <tbody>
            {loading && pagedRuns.length === 0 && (
              Array.from({ length: skeletonRowCount }).map((_, i) => (
                <tr key={`skeleton-${i}`}>
                  <td className="table-cell rank-cell"><div className="skeleton skeleton-bar tiny" /></td>
                  <td className="md:hidden"><div className="skeleton skeleton-bar" /></td>
                  <td className="hidden md:table-cell"><div className="skeleton skeleton-bar short" /></td>
                  <td className="hidden md:table-cell"><div className="skeleton skeleton-bar" /></td>
                  <td className="hidden md:table-cell"><div className="skeleton skeleton-bar short" /></td>
                  <td className="hidden md:table-cell"><div className="skeleton skeleton-bar tiny" /></td>
                  <td className="hidden md:table-cell"><div className="skeleton skeleton-bar tiny" /></td>
                  <td className="table-cell">
                    <div className="saas-group-squares">
                      {Array.from({ length: 5 }).map((__, j) => (
                        <div key={j} className="skeleton skeleton-square" />
                      ))}
                    </div>
                  </td>
                </tr>
              ))
            )}
            {!loading && pagedRuns.map((run, i) => {
              const timer = WOW_DUNGEON_TIMERS[run.dungeon_id as number];
              const isDepleted = timer ? run.duration_ms > timer : false;
              return (
              <tr key={run.id} className={isDepleted ? 'depleted-row' : undefined}>
                <td className="table-cell rank-cell">{page * PAGE_SIZE + i + 1}</td>
                <td className="md:hidden">{run.keystone_level} {dungeonMap[run.dungeon_id] ? dungeonMap[run.dungeon_id].shortname : run.dungeon_id}</td>
                <td className="hidden md:table-cell">{run.keystone_level}</td>
                <td className="hidden md:table-cell">{dungeonMap[run.dungeon_id] ? (
                    <>
                      <span className="dungeon-name-desktop">{dungeonMap[run.dungeon_id].name}</span>
                      <span className="dungeon-name-mobile">{dungeonMap[run.dungeon_id].shortname}</span>
                    </>
                  ) : run.dungeon_id}
                </td>
                <td className="hidden md:table-cell">{typeof run.score === 'number' ? run.score.toFixed(1) : run.score}</td>
                <td className="hidden md:table-cell">{msToTime(run.duration_ms)}</td>
                <td className="hidden md:table-cell">{new Date(run.completed_at).toLocaleDateString()}</td>
                <td className="table-cell">
                  <GroupSquares
                    members={run.members}
                    onTooltipShow={handleTooltipShow}
                    onTooltipHide={handleTooltipHide}
                  />
                </td>
              </tr>
            );})}
          </tbody>
        </table>

        {/* Enhanced Pagination */}
  <div className="pagination-container">
          <button
            className="pagination-button"
            onClick={() => setPage(0)}
            disabled={page === 0}
            aria-label="First page"
          >
            {'«'}
          </button>
          <button
            className="pagination-button"
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            aria-label="Previous page"
          >
            {'‹'}
          </button>
          <span className="pagination-info">
            Page {page + 1} of {pageCount}
          </span>
          <button
            className="pagination-button"
            onClick={() => setPage(p => Math.min(pageCount - 1, p + 1))}
            disabled={page >= pageCount - 1}
            aria-label="Next page"
          >
            {'›'}
          </button>
          <button
            className="pagination-button"
            onClick={() => setPage(pageCount - 1)}
            disabled={page >= pageCount - 1}
            aria-label="Last page"
          >
            {'»'}
          </button>
        </div>
      </div>

      {/* Enhanced Tooltip - Moved outside table container */}
      {tooltip && createPortal(
        <div
          className="leaderboard-tooltip"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            background: tooltip.color,
            borderColor: tooltip.color,
            color: getTextColor(tooltip.color),
          }}
          dangerouslySetInnerHTML={{ __html: tooltip.content }}
        />,
        document.body
      )}
    </>
  );
} 