import React, { useState, useEffect } from 'react';
import { useFilterState, useFilterDispatch } from './FilterContext';
import { fetchSeasons } from '../services/api';
import { Tooltip } from './AIPredictionsPage/components/Tooltip';
import './styles/AIFilterBar.css';

export const AIFilterBar: React.FC = () => {
  const filter = useFilterState();
  const dispatch = useFilterDispatch();
  const [seasons, setSeasons] = useState<Array<{ season_id: number; season_name: string }>>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadSeasons = async () => {
      setLoading(true);
      try {
        let seasonsData = await fetchSeasons();
        // Only show seasons with season_id >= 9, ordered by season_id descending
        seasonsData = seasonsData
          .filter(s => s.season_id >= 9)
          .sort((a, b) => b.season_id - a.season_id);
        setSeasons(seasonsData);
        if (!filter.season_id && seasonsData.length > 0) {
          dispatch({ type: 'SET_SEASON', season_id: seasonsData[0].season_id });
        }
      } catch (error) {
        console.error('Failed to load seasons:', error);
      } finally {
        setLoading(false);
      }
    };
    loadSeasons();
  }, [dispatch, filter.season_id]);

  const handleSeasonChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const seasonId = parseInt(event.target.value);
    dispatch({ type: 'SET_SEASON', season_id: seasonId });
  };

  return (
    <div className="ai-filter-bar">
      <div className="ai-filter-row-centered">
        <label htmlFor="season-select" className="ai-filter-label-centered">
          SEASON:
        </label>
        <select
          id="season-select"
          className="ai-filter-select"
          value={filter.season_id || ''}
          onChange={handleSeasonChange}
          disabled={loading}
        >
          {loading ? (
            <option value="">Loading seasons...</option>
          ) : (
            <>
              <option value="">Select a season</option>
              {seasons.map((season) => (
                <option key={season.season_id} value={season.season_id}>
                  {season.season_name}
                </option>
              ))}
            </>
          )}
        </select>
        <Tooltip content="Select a Mythic+ season to view AI predictions and meta analysis for that period.">
          <svg className="ai-tooltip-icon" width="18" height="18" viewBox="0 0 20 20" fill="none" aria-label="Info" role="img" style={{marginLeft: '0.7rem', verticalAlign: 'middle'}}>
            <circle cx="10" cy="10" r="10" fill="#64748b" />
            <text x="10" y="15" textAnchor="middle" fontSize="13" fill="#fff" fontWeight="bold">i</text>
          </svg>
        </Tooltip>
      </div>
    </div>
  );
};