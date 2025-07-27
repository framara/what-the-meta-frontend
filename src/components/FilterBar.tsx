import React, { useEffect, useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { useFilterState, useFilterDispatch } from '../FilterContext';
import { fetchSeasons, fetchSeasonInfo } from '../api';
import './styles/FilterBar.css';

export const FilterBar: React.FC = () => {
  const filter = useFilterState();
  const dispatch = useFilterDispatch();

  const [seasonOptions, setSeasonOptions] = useState<Array<{ label: string; value: number }>>([]);
  const [periodOptions, setPeriodOptions] = useState<Array<{ label: string; value: number }>>([]);
  const [dungeonOptions, setDungeonOptions] = useState<Array<{ label: string; value: number }>>([]);
  const [loading, setLoading] = useState(true);
  // Collapsible state for mobile
  const [mobileCollapsed, setMobileCollapsed] = useState(true);

  // Detect mobile (below 640px)
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth <= 768);
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch seasons on mount
  useEffect(() => {
    setLoading(true);
    fetchSeasons().then(seasons => {
      // Descending order
      const sorted = [...seasons].sort((a, b) => b.season_id - a.season_id);
      setSeasonOptions(sorted
        .filter(s => s.season_id >= 10)
        .map(s => ({ label: s.season_name, value: s.season_id })));
      setLoading(false);
    });
  }, []);

  // Fetch periods and dungeons when season changes
  useEffect(() => {
    if (!filter.season_id) return;
    setLoading(true);
    fetchSeasonInfo(filter.season_id).then(info => {
      // Descending order for periods
      const sortedPeriods = [...info.periods].sort((a, b) => b.period_id - a.period_id);
      setPeriodOptions(sortedPeriods.map(p => ({ label: p.period_name, value: p.period_id })));
      setDungeonOptions(info.dungeons.map(d => ({ label: d.dungeon_name, value: d.dungeon_id })));
      setLoading(false);
    });
  }, [filter.season_id]);

  return (
    <div className="filter-bar">
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
        <div className="filter-label">
          <span>Season:</span>
          <select
            className="filter-select"
            value={filter.season_id}
            onChange={e => dispatch({ type: 'SET_SEASON', season_id: Number(e.target.value) })}
            disabled={loading}
          >
            {seasonOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

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
      </div>
    </div>
  );
}; 