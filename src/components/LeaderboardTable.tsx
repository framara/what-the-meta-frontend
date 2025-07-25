import React, { useState } from 'react';
import { WOW_CLASS_COLORS, WOW_SPECIALIZATIONS, WOW_CLASS_NAMES } from './wow-constants';
import './styles/LeaderboardTable.css';

interface GroupMember {
  character_name: string;
  class_id: number;
  spec_id: number;
  role: string;
}

interface Run {
  id: number;
  rank: number;
  keystone_level: number;
  score: number;
  dungeon_id: number;
  duration_ms: number;
  completed_at: string;
  members: GroupMember[];
}

interface Dungeon {
  dungeon_id: number;
  dungeon_name: string;
}

interface LeaderboardTableProps {
  runs: Run[];
  dungeons: Dungeon[];
}

function msToTime(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export const LeaderboardTable: React.FC<LeaderboardTableProps> = ({ runs, dungeons }) => {
  const dungeonMap = React.useMemo(() => {
    const map: Record<number, { name: string; shortname: string } > = {};
    dungeons.forEach(d => {
      map[d.dungeon_id] = {
        name: (d as any).dungeon_name || (d as any).name || '',
        shortname: (d as any).dungeon_shortname || (d as any).shortname || ''
      };
    });
    return map;
  }, [dungeons]);

  // Pagination state
  const PAGE_SIZE = 20;
  const [page, setPage] = useState(0);
  const pageCount = Math.ceil(runs.length / PAGE_SIZE);
  const pagedRuns = runs.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  // Helper to sort members by role: tank, heal, dps, dps, dps
  function sortMembers(members: GroupMember[]) {
    const roleOrder: Record<string, number> = { tank: 0, healer: 1, dps: 2 };
    return [...members].sort((a, b) => {
      const ra = roleOrder[a.role] ?? 99;
      const rb = roleOrder[b.role] ?? 99;
      return ra - rb;
    });
  }

  // Tooltip state for group squares
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    content: string;
    color: string;
  } | null>(null);

  return (
    <div className="overflow-x-auto mt-6 relative">
      <table className="min-w-full border text-sm saas-table">
        <thead>
          <tr className="bg-gray-800 text-white">
            <th className="px-1 py-1 w-6 md:w-auto">Rank</th>
            {/* Mobile: Keystone column, Desktop: Key and Dungeon columns */}
            <th className="px-1 py-1 w-10 md:hidden">Keystone</th>
            <th className="px-1 py-1 w-8 hidden md:table-cell md:w-auto">Key</th>
            <th className="px-1 py-1 w-16 hidden md:table-cell md:w-32 whitespace-nowrap">Dungeon</th>
            <th className="px-1 py-1 w-8 md:w-auto">Score</th>
            <th className="px-1 py-1 w-8 md:w-auto">Time</th>
            <th className="px-1 py-1 w-20 md:w-auto">Date</th>
            <th className="px-1 py-1 w-8 hidden md:table-cell md:w-auto">Group</th>
          </tr>
        </thead>
        <tbody>
          {pagedRuns.map((run, i) => (
            <tr key={run.id} className="border-b hover:bg-gray-100">
              <td className="px-1 py-1 text-center w-6 md:w-auto">{page * PAGE_SIZE + i + 1}</td>
              {/* Mobile: Keystone column, Desktop: Key and Dungeon columns */}
              <td className="px-1 py-1 text-center w-10 md:hidden">
                {run.keystone_level} {dungeonMap[run.dungeon_id] ? dungeonMap[run.dungeon_id].shortname : run.dungeon_id}
              </td>
              <td className="px-1 py-1 text-center w-8 hidden md:table-cell md:w-auto">{run.keystone_level}</td>
              <td className="px-1 py-1 w-16 hidden md:table-cell md:w-32 whitespace-nowrap">
                {dungeonMap[run.dungeon_id] ? (
                  <>
                    <span className="dungeon-name-desktop">{dungeonMap[run.dungeon_id].name}</span>
                    <span className="dungeon-name-mobile">{dungeonMap[run.dungeon_id].shortname}</span>
                  </>
                ) : run.dungeon_id}
              </td>
              <td className="px-1 py-1 text-center w-8 md:w-auto">{typeof run.score === 'number' ? run.score.toFixed(1) : run.score}</td>
              <td className="px-1 py-1 text-center w-8 md:w-auto">{msToTime(run.duration_ms)}</td>
              <td className="px-1 py-1 text-center w-8 hidden md:table-cell md:w-auto">{new Date(run.completed_at).toLocaleDateString()}</td>
              <td className="px-1 py-1">
                <div className="saas-group-squares w-20 md:w-32 mx-auto">
                  {sortMembers(run.members).map((m, idx) => {
                    const roleCap = m.role && typeof m.role === 'string'
                      ? m.role.charAt(0).toUpperCase() + m.role.slice(1)
                      : 'Unknown';
                    const tooltipContent = `Name: ${m.character_name}\nRole: ${roleCap}\nClass: ${WOW_CLASS_NAMES[m.class_id] || m.class_id}\nSpec: ${WOW_SPECIALIZATIONS[m.spec_id] || m.spec_id}`;
                    const classColor = WOW_CLASS_COLORS[m.class_id] || '#23263a';
                    return (
                      <span
                        key={m.character_name + idx}
                        className="saas-group-square"
                        style={{ background: classColor }}
                        onMouseEnter={e => {
                          const rect = (e.target as HTMLElement).getBoundingClientRect();
                          setTooltip({
                            x: rect.left + rect.width / 2,
                            y: rect.top,
                            content: tooltipContent.replace(/\n/g, '<br/>'),
                            color: classColor,
                          });
                        }}
                        onMouseLeave={() => setTooltip(null)}
                      />
                    );
                  })}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Pagination controls */}
      <div className="flex flex-row md:flex-row justify-center items-center gap-2 md:gap-4 mt-4 mb-8">
        <button
          className="px-3 py-1 rounded bg-gray-700 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-600 transition"
          onClick={() => setPage(0)}
          disabled={page === 0}
          aria-label="First page"
        >
          {'«'}
        </button>
        <button
          className="px-3 py-1 rounded bg-gray-700 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-600 transition"
          onClick={() => setPage(p => Math.max(0, p - 1))}
          disabled={page === 0}
          aria-label="Previous page"
        >
          {'‹'}
        </button>
        <span className="text-gray-200 font-medium">
          Page {page + 1} of {pageCount}
        </span>
        <button
          className="px-3 py-1 rounded bg-gray-700 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-600 transition"
          onClick={() => setPage(p => Math.min(pageCount - 1, p + 1))}
          disabled={page >= pageCount - 1}
          aria-label="Next page"
        >
          {'›'}
        </button>
        <button
          className="px-3 py-1 rounded bg-gray-700 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-600 transition"
          onClick={() => setPage(pageCount - 1)}
          disabled={page >= pageCount - 1}
          aria-label="Last page"
        >
          {'»'}
        </button>
      </div>
      {tooltip && (
        <div
          className="leaderboard-tooltip fixed z-50 px-4 py-2 rounded-lg text-xs shadow-lg border pointer-events-none"
          style={{
            left: tooltip.x + 8,
            top: tooltip.y - 8,
            minWidth: 160,
            maxWidth: 240,
            whiteSpace: 'pre-line',
            background: tooltip.color,
            borderColor: '#23263a',
            borderWidth: 1.5,
            color:
              tooltip.color.toLowerCase() === '#fff' || tooltip.color.toLowerCase() === '#ffffff' || tooltip.color.toLowerCase() === '#fff569'
                ? '#23263a'
                : '#fff',
            fontWeight: 500,
            boxShadow: '0 4px 24px 0 rgba(0,0,0,0.18)',
          }}
          dangerouslySetInnerHTML={{ __html: tooltip.content }}
        />
      )}
    </div>
  );
}; 