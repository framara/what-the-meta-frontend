import React, { useState, useEffect } from 'react';
import { useFilterState } from '../FilterContext';
import { fetchSeasonData, fetchSeasonInfo } from '../../services/api';
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
  const [dungeons, setDungeons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!filter.season_id) return;

      setLoading(true);
      setError(null);

      try {
        const [seasonDataResult, seasonInfo] = await Promise.all([
          fetchSeasonData(filter.season_id),
          fetchSeasonInfo(filter.season_id)
        ]);

        setSeasonData(seasonDataResult);
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
            <strong>Meta trend forecasting for Mythic+ dungeons</strong> <span className="dot-separator">•</span> <span className="highlight">AI-powered</span> <span className="dot-separator">•</span> <span className="highlight">Comprehensive temporal analysis</span>
          </p>
          <div className="ai-warning-badge">
            <span>
              <strong>Note:</strong> Take AI predictions with a grain (or three spoons) of salt.<br />
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
            <p>Choose a season from the filter above to view AI predictions and meta analysis.</p>
            <div className="season-info">
              <p>• Comprehensive analysis across all periods</p>
              <p>• Temporal trend detection</p>
              <p>• Meta evolution tracking</p>
              <p>• Advanced AI predictions</p>
            </div>
          </div>
        </div>
      ) : loading ? (
        <AILoadingScreen />
      ) : (
        <div className="predictions-content">
          <div className="predictions-main">
            <PredictionDashboard seasonData={seasonData} dungeons={dungeons} />
          </div>
          
          <div className="predictions-stats">
            <div className="stats-column">
              <ConfidenceMetrics seasonData={seasonData} />
            </div>
            <div className="stats-column">
              <HistoricalAccuracy seasonData={seasonData} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};