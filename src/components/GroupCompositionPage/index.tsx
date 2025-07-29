import React, { useState, useEffect } from 'react';
import { useFilterState } from '../FilterContext';
import { fetchTopKeys } from '../../services/api';
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

export const GroupCompositionPage: React.FC = () => {
  const filter = useFilterState();
  const [runs, setRuns] = useState<Run[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch runs when filter changes
  useEffect(() => {
    const loadRuns = async () => {
      if (!filter.season_id) return;

      setLoading(true);
      setError(null);

      try {
        const runsData = await fetchTopKeys({
          season_id: filter.season_id,
          period_id: filter.period_id,
          dungeon_id: filter.dungeon_id,
          limit: filter.limit || 1000 // Get more data for better analysis
        });
        setRuns(runsData);
      } catch (err) {
        setError('Failed to load group composition data');
        console.error('Error loading runs:', err);
      } finally {
        setLoading(false);
      }
    };

    loadRuns();
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
            Group Composition Overview
          </h1>
          <p className="page-description">
            Analyze the most popular group compositions, specs by role, and team dynamics across different seasons.
          </p>
        </div>
      </div>

      <FilterBar />

      {loading ? (
        <LoadingScreen />
      ) : (
        <GroupCompositionStats runs={runs} />
      )}
    </div>
  );
}; 