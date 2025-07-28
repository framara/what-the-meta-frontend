import React, { useState } from 'react';
import { WOW_CLASS_COLORS, WOW_SPECIALIZATIONS, WOW_SPEC_TO_CLASS, WOW_SPEC_ROLES } from '../../wow-constants';

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

interface GroupCompositionStatsProps {
  runs: Run[];
}

function msToTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export const GroupCompositionStats: React.FC<GroupCompositionStatsProps> = ({ runs }) => {
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

  // Helper to sort members by role: tank, heal, dps, dps, dps
  function sortMembers<T extends { role: string; spec_id?: number }>(members: T[]): T[] {
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
  }

  // Emoji for roles
  const roleEmoji: Record<string, string> = { tank: '🛡️', healer: '💚', dps: '⚔️' };

  // Calculate spec counts by role
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

  // Get top specs by role
  const getTopSpecsByRole = (role: string, count: number = 5) => {
    const entries = Object.entries(roleSpecCounts[role]);
    return entries
      .sort((a, b) => b[1] - a[1])
      .slice(0, count)
      .map(([specId, count]) => ({ specId: Number(specId), count }));
  };

  // Find most popular group compositions
  const groupCompositions: Record<string, { specs: number[], count: number }> = {};
  
  runs.forEach(r => {
    const specIds = sortMembers(r.members).map(m => m.spec_id);
    const key = specIds.slice().sort((a, b) => a - b).join('-');
    
    if (!groupCompositions[key]) {
      groupCompositions[key] = { specs: specIds, count: 0 };
    }
    groupCompositions[key].count++;
  });

  const topCompositions = Object.values(groupCompositions)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  return (
    <div className="group-composition-stats">

      {/* Top Group Compositions */}
      <div className="compositions-section">
        <h3 className="section-title">Most Popular Group Compositions</h3>
        <div className="compositions-grid">
          {topCompositions.map((composition, index) => {
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';
            return (
              <div key={index} className="composition-card">
                <div className="composition-header">
                  <span className="composition-rank">{medal} #{index + 1}</span>
                  <span className="composition-count">x{composition.count}</span>
                </div>
                <div className="composition-specs">
                  {composition.specs.map((specId, specIndex) => {
                    const classId = Number(WOW_SPEC_TO_CLASS[specId]) || 0;
                    const role = WOW_SPEC_ROLES[specId] || '';
                    return (
                      <span
                        key={specIndex}
                        className="composition-spec"
                        style={{
                          background: WOW_CLASS_COLORS[classId] || '#fff',
                        }}
                        onMouseEnter={e => {
                          const rect = (e.target as HTMLElement).getBoundingClientRect();
                          setSpecTooltip({
                            x: rect.left + rect.width / 2,
                            y: rect.top,
                            content: WOW_SPECIALIZATIONS[specId] || '-',
                            color: WOW_CLASS_COLORS[classId] || '#23263a',
                          });
                        }}
                        onMouseLeave={() => setSpecTooltip(null)}
                      >
                        {roleEmoji[role] || ''}
                      </span>
                    );
                  })}
                </div>
              </div>
            );
          })}
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