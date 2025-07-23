import React, { useState } from 'react';

// WoW class colors (official)
const WOW_CLASS_COLORS: Record<number, string> = {
  1: '#C79C6E', // Warrior
  2: '#F58CBA', // Paladin
  3: '#ABD473', // Hunter
  4: '#FFF569', // Rogue
  5: '#FFFFFF', // Priest
  6: '#C41F3B', // Death Knight
  7: '#0070DE', // Shaman
  8: '#69CCF0', // Mage
  9: '#9482C9', // Warlock
  10: '#00FF96', // Monk
  11: '#FF7D0A', // Druid
  12: '#A330C9', // Demon Hunter
  13: '#33937F', // Evoker
};

// WoW spec names (id -> name)
const WOW_SPECIALIZATIONS: Record<number, string> = {
  71: 'Arms', 72: 'Fury', 73: 'Protection', // Warrior
  65: 'Holy', 66: 'Protection', 70: 'Retribution', // Paladin
  253: 'Beast Mastery', 254: 'Marksmanship', 255: 'Survival', // Hunter
  259: 'Assassination', 260: 'Outlaw', 261: 'Subtlety', // Rogue
  256: 'Discipline', 257: 'Holy', 258: 'Shadow', // Priest
  250: 'Blood', 251: 'Frost', 252: 'Unholy', // Death Knight
  262: 'Elemental', 263: 'Enhancement', 264: 'Restoration', // Shaman
  62: 'Arcane', 63: 'Fire', 64: 'Frost', // Mage
  265: 'Affliction', 266: 'Demonology', 267: 'Destruction', // Warlock
  268: 'Brewmaster', 269: 'Windwalker', 270: 'Mistweaver', // Monk
  102: 'Balance', 103: 'Feral', 104: 'Guardian', 105: 'Restoration', // Druid
  577: 'Havoc', 581: 'Vengeance', // Demon Hunter
  1467: 'Devastation', 1468: 'Preservation', 1473: 'Augmentation', // Evoker
};

// WoW class names (id -> name)
const WOW_CLASS_NAMES: Record<number, string> = {
  1: 'Warrior', 2: 'Paladin', 3: 'Hunter', 4: 'Rogue', 5: 'Priest', 6: 'Death Knight', 7: 'Shaman', 8: 'Mage', 9: 'Warlock', 10: 'Monk', 11: 'Druid', 12: 'Demon Hunter', 13: 'Evoker',
};

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
    const map: Record<number, string> = {};
    dungeons.forEach(d => { map[d.dungeon_id] = d.dungeon_name; });
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
            <th className="px-2 py-1">Rank</th>
            <th className="px-2 py-1">Keystone</th>
            <th className="px-2 py-1">Score</th>
            <th className="px-2 py-1">Dungeon</th>
            <th className="px-2 py-1">Time</th>
            <th className="px-2 py-1">Date</th>
            <th className="px-2 py-1">Group</th>
          </tr>
        </thead>
        <tbody>
          {pagedRuns.map((run, i) => (
            <tr key={run.id} className="border-b hover:bg-gray-100">
              <td className="px-2 py-1 text-center">{page * PAGE_SIZE + i + 1}</td>
              <td className="px-2 py-1 text-center">{run.keystone_level}</td>
              <td className="px-2 py-1 text-center">{typeof run.score === 'number' ? run.score.toFixed(1) : run.score}</td>
              <td className="px-2 py-1">{dungeonMap[run.dungeon_id] || run.dungeon_id}</td>
              <td className="px-2 py-1 text-center">{msToTime(run.duration_ms)}</td>
              <td className="px-2 py-1 text-center">{new Date(run.completed_at).toLocaleDateString()}</td>
              <td className="px-2 py-1">
                <div className="saas-group-squares">
                  {sortMembers(run.members).map((m, idx) => {
                    const tooltipContent = `Name: ${m.character_name}\nRole: ${m.role}\nClass: ${WOW_CLASS_NAMES[m.class_id] || m.class_id}\nSpec: ${WOW_SPECIALIZATIONS[m.spec_id] || m.spec_id}`;
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
      <div className="flex justify-center items-center gap-4 mt-4">
        <button
          className="px-3 py-1 rounded bg-gray-700 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-600 transition"
          onClick={() => setPage(p => Math.max(0, p - 1))}
          disabled={page === 0}
        >
          Prev
        </button>
        <span className="text-gray-200 font-medium">
          Page {page + 1} of {pageCount}
        </span>
        <button
          className="px-3 py-1 rounded bg-gray-700 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-600 transition"
          onClick={() => setPage(p => Math.min(pageCount - 1, p + 1))}
          disabled={page >= pageCount - 1}
        >
          Next
        </button>
      </div>
      {tooltip && (
        <div
          className="fixed z-50 px-4 py-2 rounded-lg text-xs shadow-lg border pointer-events-none"
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
              tooltip.color.toLowerCase() === '#fff' || tooltip.color.toLowerCase() === '#ffffff'
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