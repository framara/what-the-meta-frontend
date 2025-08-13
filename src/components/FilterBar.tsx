import React, { useEffect, useMemo, useState } from 'react';
import { useFilterState, useFilterDispatch } from './FilterContext';
import { fetchSeasons, fetchSeasonInfo } from '../services/api';
import { WOW_EXPANSIONS } from '../constants/wow-constants';
import './styles/FilterBar.css';
import toast from 'react-hot-toast';

interface FilterBarProps {
  showExpansion?: boolean;
  showPeriod?: boolean;
  showDungeon?: boolean;
  showLimit?: boolean;
  className?: string;
  // Optional Region control (for CutoffPage). This is a controlled input owned by the page.
  showRegion?: boolean;
  region?: string;
  onRegionChange?: (region: string) => void;
  // Optional Season (slug) control (for CutoffPage). Controlled by the page.
  showSeasonSlug?: boolean;
  seasonSlug?: string;
  seasonSlugOptions?: string[];
  onSeasonSlugChange?: (slug: string) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  showExpansion = false,
  showPeriod = true,
  showDungeon = true,
  showLimit = true,
  className = '',
  showRegion = false,
  region,
  onRegionChange,
  showSeasonSlug = false,
  seasonSlug,
  seasonSlugOptions = [],
  onSeasonSlugChange,
}) => {
  const filter = useFilterState();
  const dispatch = useFilterDispatch();

  const [seasonOptions, setSeasonOptions] = useState<Array<{ label: string; value: number }>>([]);
  const [periodOptions, setPeriodOptions] = useState<Array<{ label: string; value: number }>>([]);
  const [dungeonOptions, setDungeonOptions] = useState<Array<{ label: string; value: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [periodLoading, setPeriodLoading] = useState(false);
  const [dungeonLoading, setDungeonLoading] = useState(false);
  const [mobileCollapsed, setMobileCollapsed] = useState(true);

  // Get the latest expansion and season
  const getLatestExpansionAndSeason = () => {
    // Find the latest expansion with seasons (filter out expansions with empty seasons array)
    const expansionsWithSeasons = WOW_EXPANSIONS.filter(exp => exp.seasons.length > 0);
    const latestExpansion = expansionsWithSeasons[expansionsWithSeasons.length - 1];
    
    if (latestExpansion && latestExpansion.seasons.length > 0) {
      const latestSeason = Math.max(...latestExpansion.seasons);
      return { expansionId: latestExpansion.id, seasonId: latestSeason };
    }
    
    // Fallback to The War Within (id: 10) and season 14 if no valid expansion found
    return { expansionId: 10, seasonId: 15 };
  };

  // Set default expansion and season when expansion filter becomes visible
  useEffect(() => {
    if (showExpansion && !filter.expansion_id && !filter.season_id) {
      const { expansionId, seasonId } = getLatestExpansionAndSeason();
      dispatch({ type: 'SET_EXPANSION', expansion_id: expansionId });
      dispatch({ type: 'SET_SEASON', season_id: seasonId });
    }
  }, [showExpansion, filter.expansion_id, filter.season_id, dispatch]);

  // Reset expansion-related state when expansion filter becomes hidden
  useEffect(() => {
    if (!showExpansion && filter.expansion_id) {
      dispatch({ type: 'SET_EXPANSION', expansion_id: undefined });
    }
  }, [showExpansion, filter.expansion_id, dispatch]);

  useEffect(() => {
    setLoading(true);
    fetchSeasons().then(seasons => {
      const sorted = [...seasons].sort((a, b) => b.season_id - a.season_id);
      setSeasonOptions(sorted
        .map(s => ({ label: s.season_name, value: s.season_id })));
      setLoading(false);
    });
  }, []);

  // Convenience memo for latest season id
  const latestSeasonId = useMemo(() => {
    if (seasonOptions.length === 0) return undefined;
    return Math.max(...seasonOptions.map(s => s.value));
  }, [seasonOptions]);

  // Get expansion options for the filter
  const getExpansionOptions = () => {
    return WOW_EXPANSIONS
      .filter(expansion => expansion.seasons.length > 0 && expansion.id >= 8 && expansion.id <= 10) // Only show expansions with seasons and ID 8-10
      .sort((a, b) => b.id - a.id) // Sort by ID descending
      .map(expansion => ({ label: expansion.name, value: expansion.id }));
  };

  // Get seasons for the selected expansion using WOW_EXPANSIONS mapping
  const getSeasonsForExpansion = (expansionId: number) => {
    const expansion = WOW_EXPANSIONS.find(exp => exp.id === expansionId);
    if (!expansion) return [];
    
    // Map the expansion's seasons to season options
    return seasonOptions.filter(season => 
      expansion.seasons.includes(season.value)
    );
  };

  // Get season options based on selected expansion using WOW_EXPANSIONS mapping
  const getSeasonOptionsWithSeparators = () => {
    const options: Array<{ label: string; value: number | string; isSeparator?: boolean }> = [];
    
    let seasonsToShow = seasonOptions;
    
    // If expansion filter is visible and expansion is selected, filter seasons for that expansion
    if (showExpansion && filter.expansion_id) {
      seasonsToShow = getSeasonsForExpansion(filter.expansion_id);
    }
    
    // Only add separators and grouping when expansion filter is visible
    if (showExpansion) {
      // Group seasons by expansion using WOW_EXPANSIONS mapping
      const expansionSeasons = new Map<number, typeof seasonOptions>();
      
      seasonsToShow.forEach(season => {
        // Find which expansion this season belongs to using WOW_EXPANSIONS
        const expansion = WOW_EXPANSIONS.find(exp => exp.seasons.includes(season.value));
        if (expansion) {
          if (!expansionSeasons.has(expansion.id)) {
            expansionSeasons.set(expansion.id, []);
          }
          expansionSeasons.get(expansion.id)!.push(season);
        }
      });
      
      // Sort expansions by ID descending and add separators
      const sortedExpansions = Array.from(expansionSeasons.entries())
        .sort(([a], [b]) => b - a);
      
      sortedExpansions.forEach(([expansionId, seasons], index) => {
        const expansion = WOW_EXPANSIONS.find(exp => exp.id === expansionId);
        if (expansion) {
          // Add separator if this is not the first expansion
          if (index > 0) {
            options.push({
              label: `── ${expansion.name} ─────────`,
              value: `separator-${expansion.name}`,
              isSeparator: true
            });
          }
          
          // Add seasons for this expansion
          seasons.forEach(season => {
            options.push(season);
          });
        }
      });
    } else {
      // When expansion filter is not visible, just return all seasons without grouping
      options.push(...seasonsToShow);
    }
    
    return options;
  };

  // Optimized season info fetching with granular loading states
  useEffect(() => {
    if (!filter.season_id || (!showPeriod && !showDungeon)) return;

    const load = async () => {
      // Set loading states only for the specific filters that need data
      if (showPeriod) setPeriodLoading(true);
      if (showDungeon) setDungeonLoading(true);

      try {
        const info = await fetchSeasonInfo(filter.season_id!);

        const hasData = (info?.periods?.length ?? 0) > 0 || (info?.dungeons?.length ?? 0) > 0;
        const isLatest = latestSeasonId && filter.season_id === latestSeasonId;

        if (!hasData && isLatest && seasonOptions.length > 1) {
          // Auto-fallback to previous season and notify the user
          const sortedByValue = [...seasonOptions].sort((a,b) => b.value - a.value);
          const prev = sortedByValue[1];
          if (prev) {
            const latestLabel = seasonOptions.find(s => s.value === latestSeasonId)?.label || `Season ${latestSeasonId}`;
            toast.dismiss('season-fallback');
            toast.success(`${latestLabel} has not started yet. Showing previous season instead.`, { id: 'season-fallback' });
            dispatch({ type: 'SET_SEASON', season_id: prev.value });
            return; // bail out; effect will rerun
          }
        }

        if (showPeriod) {
          const sortedPeriods = [...(info.periods || [])].sort((a, b) => b.period_id - a.period_id);
          setPeriodOptions(sortedPeriods.map(p => ({ label: p.period_name, value: p.period_id })));
          setPeriodLoading(false);
        }
        if (showDungeon) {
          setDungeonOptions((info.dungeons || []).map(d => ({ label: d.dungeon_name, value: d.dungeon_id })));
          setDungeonLoading(false);
        }
      } catch (error) {
        console.error('Error fetching season info:', error);
        if (showPeriod) setPeriodLoading(false);
        if (showDungeon) setDungeonLoading(false);
      }
    };

    load();
  }, [filter.season_id, showPeriod, showDungeon, latestSeasonId, seasonOptions, dispatch]);

  // Count visible filters
  const visibleFiltersCount = [showExpansion, true, showPeriod, showDungeon, showLimit, showRegion, showSeasonSlug].filter(Boolean).length;
  const shouldCenterFilters = visibleFiltersCount < 4;

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
      <div className={`filterbar-controls ${mobileCollapsed ? 'collapsed' : 'expanded'} md:!flex ${shouldCenterFilters ? 'center-filters' : ''}`}>
        {showExpansion && (
          <div className="filter-label">
            <span>Expansion:</span>
            <select
              className="filter-select"
              value={filter.expansion_id || ''}
              onChange={e => {
                const expansionId = e.target.value ? Number(e.target.value) : undefined;
                dispatch({ type: 'SET_EXPANSION', expansion_id: expansionId });
                
                // If expansion is selected and expansion filter is visible, default to "All seasons" for that expansion
                if (expansionId && showExpansion) {
                  // Don't auto-select a specific season, let it default to "All seasons"
                  dispatch({ type: 'SET_SEASON', season_id: undefined });
                } else if (!expansionId) {
                  // If "All Expansions" is selected, clear the season
                  dispatch({ type: 'SET_SEASON', season_id: undefined });
                }
              }}
              disabled={loading}
            >
              <option value="" className="filter-option">All Expansions</option>
              {getExpansionOptions().map(opt => (
                <option key={opt.value} value={opt.value} className="filter-option">{opt.label}</option>
              ))}
            </select>
          </div>
        )}

        <div className="filter-label">
          <span>Season:</span>
          {showSeasonSlug ? (
            <select
              className="filter-select"
              value={seasonSlug || ''}
              onChange={e => onSeasonSlugChange && onSeasonSlugChange(e.target.value)}
            >
              {seasonSlugOptions.map(s => (
                <option key={s} value={s} className="filter-option">{s}</option>
              ))}
            </select>
          ) : (
            <select
              className="filter-select"
              value={filter.season_id || ''}
              onChange={e => {
                const value = e.target.value;
                if (typeof value === 'string' && value.startsWith('separator-')) {
                  return; // Don't allow selecting separators
                }
                dispatch({ type: 'SET_SEASON', season_id: value ? Number(value) : undefined });
              }}
              disabled={loading || (showExpansion && !filter.expansion_id)}
            >
              {showExpansion && <option value="" className="filter-option">All Seasons</option>}
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
          )}
        </div>

        {showPeriod && (
          <div className="filter-label">
            <span>Period:</span>
            <select
              className="filter-select"
              value={filter.period_id || ''}
              onChange={e => dispatch({ type: 'SET_PERIOD', period_id: e.target.value ? Number(e.target.value) : undefined })}
              disabled={loading || periodLoading || !filter.season_id}
            >
              <option value="" className="filter-option">Entire Season</option>
              {periodOptions.map(opt => (
                <option key={opt.value} value={opt.value} className="filter-option">{opt.label}</option>
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
              disabled={loading || dungeonLoading || !filter.season_id}
            >
              <option value="" className="filter-option">All Dungeons</option>
              {dungeonOptions.map(opt => (
                <option key={opt.value} value={opt.value} className="filter-option">{opt.label}</option>
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
              <option value={100} className="filter-option">Top 100</option>
              <option value={250} className="filter-option">Top 250</option>
              <option value={500} className="filter-option">Top 500</option>
              <option value={1000} className="filter-option">Top 1000</option>
            </select>
          </div>
        )}

        {showRegion && (
          <div className="filter-label">
            <span>Region:</span>
            <select
              className="filter-select"
              value={region || 'us'}
              onChange={e => onRegionChange && onRegionChange(e.target.value)}
            >
              {['us','eu','kr','tw'].map(r => (
                <option key={r} value={r} className="filter-option">{r.toUpperCase()}</option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
}; 