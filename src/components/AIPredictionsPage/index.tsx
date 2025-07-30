import React, { useState, useEffect } from 'react';
import { useFilterState } from '../FilterContext';
import { fetchSeasonData, fetchSeasonInfo, fetchSpecEvolution } from '../../services/api';
import { PredictionDashboard } from './components/PredictionDashboard';
import { ConfidenceMetrics } from './components/ConfidenceMetrics';
import { HistoricalAccuracy } from './components/HistoricalAccuracy';
import { FilterBar } from '../FilterBar';
import AILoadingScreen from '../AILoadingScreen';
import './styles/AIPredictionsPage.css';
import { Tooltip } from 'recharts';

export const AIPredictionsPage: React.FC = () => {
  const filter = useFilterState();
  const [seasonData, setSeasonData] = useState<any>(null);
  const [specEvolution, setSpecEvolution] = useState<any>(null);
  const [dungeons, setDungeons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!filter.season_id) return;

      setLoading(true);
      setError(null);

      try {
        // Fetch both comprehensive season data and spec evolution data
        const [seasonDataResult, seasonInfo, specEvolutionResult] = await Promise.all([
          fetchSeasonData(filter.season_id),
          fetchSeasonInfo(filter.season_id),
          fetchSpecEvolution(filter.season_id)
        ]);

        setSeasonData(seasonDataResult);
        setSpecEvolution(specEvolutionResult);
        setDungeons(seasonInfo.dungeons);
      } catch (err) {
        setError('Failed to load AI prediction data');
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [filter.season_id]);

  if (error) {
    return (
      <div className="ai-predictions-page">
        <div className="error-container">
          <h2 className="error-title">🤖 AI Prediction Error</h2>
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
    <div className="ai-predictions-page">
      {/* Page Header */}
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">
            <span className="ai-icon" role="img" aria-label="AI" style={{ color: 'inherit', fontSize: '2rem', filter: 'none', textShadow: '0 1px 2px #fff' }}>🤖</span>
            AI Predictions
          </h1>
          <p className="page-description">
            <strong>Advanced meta trend forecasting for Mythic+ dungeons</strong> <span className="dot-separator">•</span> <span className="highlight">Cross-validated AI analysis</span> <span className="dot-separator">•</span> <span className="highlight">Temporal pattern recognition</span>
          </p>
          <div className="ai-warning-badge">
            <span>
              <strong>Enhanced Analysis:</strong> Now using both comprehensive run data and spec evolution trends for improved predictions.<br />
              <strong>Note:</strong> Take AI predictions with a grain (or three spoons) of salt.
            </span>
          </div>
        </div>
      </div>

      {/* Filter Controls */}
      <FilterBar 
        showPeriod={false}
        showDungeon={false}
        showLimit={false}
        className="ai-predictions-filter"
      />

      {/* Main Content */}
      {!filter.season_id ? (
        <div className="select-season-container">
          <div className="select-season-content">
            <h2>📊 Select a Season</h2>
            <p>Choose a season from the filter above to view enhanced AI predictions and meta analysis.</p>
            <div className="season-info">
              <p>• Cross-validated analysis using multiple data sources</p>
              <p>• Temporal trend detection with confidence intervals</p>
              <p>• Spec evolution validation</p>
              <p>• Advanced AI predictions with dungeon context</p>
            </div>
          </div>
        </div>
      ) : loading ? (
        <AILoadingScreen />
      ) : (
        <div className="predictions-content">
          <div className="predictions-main">
            <PredictionDashboard 
              seasonData={seasonData} 
              specEvolution={specEvolution}
              dungeons={dungeons} 
            />
          </div>
          
          <div className="predictions-stats">
            <div className="stats-column">
              <ConfidenceMetrics 
                seasonData={seasonData} 
                specEvolution={specEvolution}
              />
            </div>
            <div className="stats-column">
              <HistoricalAccuracy 
                seasonData={seasonData} 
                specEvolution={specEvolution}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};