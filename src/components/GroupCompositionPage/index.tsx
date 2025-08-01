import React, { useState, useEffect } from 'react';
import { useFilterState } from '../FilterContext';
import { fetchTopKeys, fetchSeasonData } from '../../services/api';
import { GroupCompositionStats } from './components/GroupCompositionStats';
import LoadingScreen from '../LoadingScreen';
import { FilterBar } from '../FilterBar';
import './styles/GroupCompositionPage.css';

interface Season {
  season_id: number;
  season_name: string;
}

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

interface SeasonData {
  season_id: number;
  total_periods: number;
  total_keys: number;
  periods: Array<{
    period_id: number;
    keys_count: number;
    keys: Array<{
      id: number;
      keystone_level: number;
      score: number;
      members: Array<{
        spec_id: number;
        class_id: number;
        name: string;
      }>;
      [key: string]: any;
    }>;
  }>;
}

export const GroupCompositionPage: React.FC = () => {
  const filter = useFilterState();
  const [runs, setRuns] = useState<Run[]>([]);
  const [seasonData, setSeasonData] = useState<SeasonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch runs when filter changes
  useEffect(() => {
    const loadData = async () => {
      if (!filter.season_id) return;

      setLoading(true);
      setError(null);

      try {
        // Fetch both top keys and season data in parallel
        const [runsData, seasonDataResult] = await Promise.all([
          fetchTopKeys({
            season_id: filter.season_id,
            period_id: filter.period_id,
            dungeon_id: filter.dungeon_id,
            limit: filter.limit || 1000 // Get more data for better analysis
          }),
          fetchSeasonData(filter.season_id)
        ]);
        
        setRuns(runsData);
        setSeasonData(seasonDataResult);
      } catch (err) {
        setError('Failed to load group composition data');
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [filter.season_id, filter.period_id, filter.dungeon_id, filter.limit]);

  if (error) {
    return (
      <div className="group-composition-page">
        <div className="error-container">
          <h2 className="error-title">Error Loading Data</h2>
          <p className="error-message">{error}</p>
          <button 
            className="retry-button"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="group-composition-page">
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">
            Group Composition - Details per Season
          </h1>
          <p className="page-description">
            Analyze successful group compositions and discover optimal team setups for the current season.
          </p>
        </div>
      </div>

      <FilterBar 
        showExpansion={false}
        showPeriod={true}
        showDungeon={true}
        showLimit={true}
        className="group-composition-filter"
      />

      {loading ? (
        <LoadingScreen />
      ) : (
        <div className="group-composition-content">
          <GroupCompositionStats runs={runs} seasonData={seasonData} />
        </div>
      )}
    </div>
  );
}; 