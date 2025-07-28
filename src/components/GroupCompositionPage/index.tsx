import React, { useState, useEffect } from 'react';
import { fetchSeasons, fetchTopKeys } from '../../api';
import { GroupCompositionControls } from './components/GroupCompositionControls';
import { GroupCompositionStats } from './components/GroupCompositionStats';
import LoadingScreen from '../LoadingScreen';
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
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<number | null>(null);
  const [runs, setRuns] = useState<Run[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch seasons on component mount
  useEffect(() => {
    const loadSeasons = async () => {
      try {
        const seasonsData = await fetchSeasons();
        setSeasons(seasonsData);
        // Set the latest season as default
        if (seasonsData.length > 0) {
          const latestSeason = seasonsData
            .filter(s => s.season_id >= 9)
            .sort((a, b) => b.season_id - a.season_id)[0];
          if (latestSeason) {
            setSelectedSeason(latestSeason.season_id);
          }
        }
      } catch (err) {
        setError('Failed to load seasons');
        console.error('Error loading seasons:', err);
      }
    };

    loadSeasons();
  }, []);

  // Fetch runs when season changes
  useEffect(() => {
    const loadRuns = async () => {
      if (!selectedSeason) return;

      setLoading(true);
      setError(null);

      try {
        const runsData = await fetchTopKeys({
          season_id: selectedSeason,
          limit: 1000 // Get more data for better analysis
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
  }, [selectedSeason]);

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
        <h1 className="page-title">Group Composition Overview</h1>
        <p className="page-description">
          Analyze the most popular group compositions, specs by role, and team dynamics across different seasons.
        </p>
      </div>

      <GroupCompositionControls
        seasons={seasons}
        selectedSeason={selectedSeason}
        setSelectedSeason={setSelectedSeason}
        loading={loading}
      />

      {loading ? (
        <LoadingScreen />
      ) : (
        <GroupCompositionStats runs={runs} />
      )}
    </div>
  );
}; 