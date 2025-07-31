import React, { useEffect, useState } from 'react';
import { useFilterState, useFilterDispatch } from './FilterContext';
import { fetchSeasons, fetchSeasonInfo } from '../services/api';
import './styles/FilterBar.css';

interface FilterBarProps {
  showPeriod?: boolean;
  showDungeon?: boolean;
  showLimit?: boolean;
  className?: string;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  showPeriod = true,
  showDungeon = true,
  showLimit = true,
  className = ''
}) => {
  const filter = useFilterState();
  const dispatch = useFilterDispatch();

  const [seasonOptions, setSeasonOptions] = useState<Array<{ label: string; value: number }>>([]);
  const [periodOptions, setPeriodOptions] = useState<Array<{ label: string; value: number }>>([]);
  const [dungeonOptions, setDungeonOptions] = useState<Array<{ label: string; value: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [mobileCollapsed, setMobileCollapsed] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth <= 768);
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchSeasons().then(seasons => {
      const sorted = [...seasons].sort((a, b) => b.season_id - a.season_id);
      setSeasonOptions(sorted
        .filter(s => s.season_id >= 5)
        .map(s => ({ label: s.season_name, value: s.season_id })));
      setLoading(false);
    });
  }, []);

  // Group seasons by expansion and create options with separators
  const getSeasonOptionsWithSeparators = () => {
    const options: Array<{ label: string; value: number | string; isSeparator?: boolean }> = [];
    
    seasonOptions.forEach((season, index) => {
      const currentExpansion = getExpansionFromSeasonName(season.label);
      const prevSeason = seasonOptions[index - 1];
      const prevExpansion = prevSeason ? getExpansionFromSeasonName(prevSeason.label) : null;
      
      // Add separator if this is the first season or if this is a different expansion than the previous one
      if (index === 0 || (prevExpansion && currentExpansion !== prevExpansion)) {
        options.push({
          label: `── ${currentExpansion} ─────────`,
          value: `separator-${currentExpansion}`,
          isSeparator: true
        });
      }
      
      options.push(season);
    });
    
    return options;
  };

  // Helper function to extract expansion from season name
  const getExpansionFromSeasonName = (seasonName: string): string => {
    if (seasonName.startsWith('BfA')) return 'Battle for Azeroth';
    if (seasonName.startsWith('SL')) return 'Shadowlands';
    if (seasonName.startsWith('DF')) return 'Dragonflight';
    if (seasonName.startsWith('TWW')) return 'The War Within';
    return 'Other';
  };

  useEffect(() => {
    if (!filter.season_id || (!showPeriod && !showDungeon)) return;
    setLoading(true);
    fetchSeasonInfo(filter.season_id).then(info => {
      if (showPeriod) {
        const sortedPeriods = [...info.periods].sort((a, b) => b.period_id - a.period_id);
        setPeriodOptions(sortedPeriods.map(p => ({ label: p.period_name, value: p.period_id })));
      }
      if (showDungeon) {
        setDungeonOptions(info.dungeons.map(d => ({ label: d.dungeon_name, value: d.dungeon_id })));
      }
      setLoading(false);
    });
  }, [filter.season_id, showPeriod, showDungeon]);

  // Check if only season filter is shown
  const isOnlySeasonFilter = !showPeriod && !showDungeon && !showLimit;

  return (
    <div className={`filter-bar ${className}`}>
      {/* Mobile toggle button */}
      <button
        className="filterbar-toggle-btn md:hidden"
        onClick={() => setMobileCollapsed((c) => !c)}
      >
        {mobileCollapsed 
          ? (filter.season_id 
              ? seasonOptions.find(opt => opt.value === filter.season_id)?.label || 'Select Season'
              : 'Select Season')
          : 'Hide Filters'
        }
      </button>

      {/* Filter controls */}
      <div className={`filterbar-controls ${mobileCollapsed ? 'collapsed' : 'expanded'} md:!flex`}>
        <div className={`filter-label ${isOnlySeasonFilter ? 'single-filter' : ''}`}>
          <span>Season:</span>
          <select
            className="filter-select"
            value={filter.season_id}
            onChange={e => {
              const value = e.target.value;
              if (typeof value === 'string' && value.startsWith('separator-')) {
                return; // Don't allow selecting separators
              }
              dispatch({ type: 'SET_SEASON', season_id: Number(value) });
            }}
            disabled={loading}
          >
            {getSeasonOptionsWithSeparators().map(opt => (
              <option 
                key={opt.value} 
                value={opt.value}
                disabled={opt.isSeparator}
                className={opt.isSeparator ? 'expansion-separator' : ''}
              >
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {showPeriod && (
          <div className="filter-label">
            <span>Period:</span>
            <select
              className="filter-select"
              value={filter.period_id || ''}
              onChange={e => dispatch({ type: 'SET_PERIOD', period_id: e.target.value ? Number(e.target.value) : undefined })}
              disabled={!filter.season_id || loading}
            >
              <option value="">Entire Season</option>
              {periodOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        )}

        {showDungeon && (
          <div className="filter-label">
            <span>Dungeon:</span>
            <select
              className="filter-select"
              value={filter.dungeon_id || ''}
              onChange={e => dispatch({ type: 'SET_DUNGEON', dungeon_id: e.target.value ? Number(e.target.value) : undefined })}
              disabled={!filter.season_id || loading}
            >
              <option value="">All Dungeons</option>
              {dungeonOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        )}

        {showLimit && (
          <div className="filter-label">
            <span>Top N:</span>
            <select
              className="filter-select"
              value={filter.limit}
              onChange={e => dispatch({ type: 'SET_LIMIT', limit: Number(e.target.value) })}
            >
              <option value={100}>Top 100</option>
              <option value={250}>Top 250</option>
              <option value={500}>Top 500</option>
              <option value={1000}>Top 1000</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
}; 