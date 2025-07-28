import React, { useState, useRef, useEffect } from 'react';
import { WOW_CLASS_COLORS, WOW_SPECIALIZATIONS, WOW_SPEC_TO_CLASS, WOW_SPEC_ROLES, WOW_CLASS_NAMES } from '../../wow-constants';

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
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [selectedSpec, setSelectedSpec] = useState<number | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [hoveredClass, setHoveredClass] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [specTooltip, setSpecTooltip] = useState<{
    x: number;
    y: number;
    content: string;
    color: string;
  } | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  // Find most popular group compositions (filtered by selected spec if any)
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

  const topCompositions = Object.values(groupCompositions)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  // Create class options for the selector
  const classOptions = Object.entries(WOW_CLASS_NAMES)
    .map(([classId, className]) => ({
      id: Number(classId),
      name: className,
      color: WOW_CLASS_COLORS[Number(classId)] || '#fff'
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  // Get specs for selected class
  const getSpecsForClass = (classId: number) => {
    return Object.entries(WOW_SPECIALIZATIONS)
      .filter(([specId]) => WOW_SPEC_TO_CLASS[Number(specId)] === classId)
      .map(([specId, specName]) => ({
        id: Number(specId),
        name: specName,
        role: WOW_SPEC_ROLES[Number(specId)] || ''
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  };

  // Handle class selection
  const handleClassChange = (classId: number | null) => {
    setSelectedClass(classId);
    setSelectedSpec(null); // Reset spec when class changes
  };

  // Handle spec selection
  const handleSpecChange = (specId: number | null) => {
    setSelectedSpec(specId);
    setIsDropdownOpen(false); // Close dropdown after selection
  };

  // Get display text for the dropdown button
  const getDisplayText = () => {
    if (selectedSpec) {
      return WOW_SPECIALIZATIONS[selectedSpec];
    }
    if (selectedClass) {
      return `Select ${WOW_CLASS_NAMES[selectedClass]} Spec`;
    }
    return 'Select Class & Spec';
  };

  // Get selected class name
  const getSelectedClassName = () => {
    if (selectedClass) {
      return WOW_CLASS_NAMES[selectedClass];
    }
    return null;
  };

  return (
    <div className="group-composition-stats">

      {/* Multi-level Spec Selector */}
      <div className="spec-selector-section">
        <h3 className="section-title">
          {selectedSpec ? `Most Common Compositions with ${WOW_SPECIALIZATIONS[selectedSpec]}` : 'Most Popular Group Compositions'}
        </h3>
        <div className="spec-selector-container">
          <div className={`multi-level-dropdown ${isDropdownOpen ? 'open' : ''}`} ref={dropdownRef}>
            <button
              className="dropdown-button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              type="button"
            >
              <span className="dropdown-text">{getDisplayText()}</span>
              <svg className="dropdown-arrow" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path>
              </svg>
            </button>

            {isDropdownOpen && (
              <div className="dropdown-menu">
                <div className="dropdown-content">
                  {/* Classes */}
                  <div className="class-section">
                    <div className="section-header">Classes</div>
                    <div className="class-list">
                      {classOptions.map(classOption => (
                        <div
                          key={classOption.id}
                          className={`class-item ${selectedClass === classOption.id ? 'selected' : ''}`}
                          onMouseEnter={() => setHoveredClass(classOption.id)}
                          onMouseLeave={() => setHoveredClass(null)}
                        >
                          <div
                            className="class-color-indicator"
                            style={{ backgroundColor: classOption.color }}
                          ></div>
                          <span className="class-name">{classOption.name}</span>
                          
                          {/* Specs submenu */}
                          {hoveredClass === classOption.id && (
                            <div className="specs-submenu">
                              <div className="spec-list">
                                {getSpecsForClass(classOption.id).map(spec => (
                                                                     <button
                                     key={spec.id}
                                     className={`spec-item ${selectedSpec === spec.id ? 'selected' : ''}`}
                                     onClick={() => handleSpecChange(spec.id)}
                                     type="button"
                                   >
                                     <span className="spec-name">{spec.name}</span>
                                   </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            className="clear-filter-btn"
            onClick={() => {
              setSelectedClass(null);
              setSelectedSpec(null);
            }}
            disabled={!selectedClass && !selectedSpec}
          >
            Clear Filter
          </button>
        </div>
      </div>

      {/* Top Group Compositions */}
      <div className="compositions-section">
        <div className="compositions-grid">
          {topCompositions.length > 0 ? (
            topCompositions.map((composition, index) => {
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
                      const isSelectedSpec = selectedSpec === specId;
                      return (
                                                 <span
                           key={specIndex}
                           className={`composition-spec ${isSelectedSpec ? 'selected-spec' : ''}`}
                           style={{
                             background: WOW_CLASS_COLORS[classId] || '#fff',
                             border: isSelectedSpec ? '3px solid #3b82f6' : 'none',
                             boxShadow: isSelectedSpec ? '0 0 0 2px rgba(59, 130, 246, 0.3)' : '0 2px 4px rgba(0, 0, 0, 0.2)',
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
                           onClick={() => handleSpecChange(specId)}
                         >
                           {roleEmoji[role] || ''}
                         </span>
                      );
                    })}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="no-compositions">
              <p>No compositions found for the selected spec.</p>
            </div>
          )}
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