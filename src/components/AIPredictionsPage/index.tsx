import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { fetchSeasonInfo, fetchSeasons } from '../../services/api';
import { getAIPredictions, getAIAnalysis } from '../../services/aiService';
import type { AIAnalysisResponse } from '../../services/aiService';
import { PredictionDashboard } from './components/PredictionDashboard';
import { AIAnalysisInsights } from './components/AIAnalysisInsights';
import AILoadingScreen from '../AILoadingScreen';
import './styles/AIPredictionsPage.css';

export const AIPredictionsPage: React.FC = () => {
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [usingCache, setUsingCache] = useState(false);
  const [cacheMetadata, setCacheMetadata] = useState<{ created_at: string; age_hours: number; max_age_hours: number } | null>(null);
  const [forceRefresh, setForceRefresh] = useState(false);
  const [currentSeasonId, setCurrentSeasonId] = useState<number | null>(null);

  // Check if testing features should be enabled
  const isTestingEnabled = import.meta.env.VITE_ENABLE_TESTING_FEATURES === 'true';

  // Start AI analysis with simplified API
  const startAIAnalysis = useCallback(async (seasonId: number) => {
    console.log(`🤖 [Frontend] Starting AI analysis for season ${seasonId}`);
    setAiLoading(true);
    
    try {
      let aiResponse: AIAnalysisResponse;
      
      // Skip cache if force refresh is enabled
      if (forceRefresh) {
        console.log(`🔄 [Frontend] Force refresh enabled, skipping cache`);
        aiResponse = await getAIPredictions({
          seasonId: seasonId
        });
        setUsingCache(false);
        setCacheMetadata(null);
      } else {
        // First, try to get cached analysis
        console.log(`📋 [Frontend] Checking cache for season ${seasonId}`);
        try {
          aiResponse = await getAIAnalysis(seasonId);
          console.log(`✅ [Frontend] Cache hit for season ${seasonId}`);
          setUsingCache(true);
          // Extract cache metadata if available
          if (aiResponse._cache) {
            setCacheMetadata(aiResponse._cache);
          }
        } catch (cacheError: any) {
          console.log(`❌ [Frontend] Cache miss for season ${seasonId}:`, cacheError.message);
          // Check if it's a cache miss vs actual error
          if (cacheError.message === 'CACHE_MISS') {
            // Cache miss - this is expected, generate new analysis
            console.log(`🔄 [Frontend] Generating new analysis for season ${seasonId}`);
            aiResponse = await getAIPredictions({
              seasonId: seasonId
            });
            setUsingCache(false);
            setCacheMetadata(null);
            console.log(`✅ [Frontend] New analysis generated for season ${seasonId}`);
          } else {
            // Actual error - rethrow
            console.error(`❌ [Frontend] Actual error during cache check:`, cacheError);
            throw cacheError;
          }
        }
      }
      console.log(`✅ [Frontend] AI analysis completed for season ${seasonId}`);
      setAiAnalysis(aiResponse);
    } catch (aiError) {
      console.error('❌ [Frontend] AI analysis failed:', aiError);
      // Don't fail the entire page if AI fails, just show a warning
      setError('AI analysis failed. Please try again later.');
    } finally {
      setAiLoading(false);
    }
  }, [forceRefresh]);

  // Load initial data
  const loadData = useCallback(async () => {
    if (!currentSeasonId) return;

    setLoading(true);
    setError(null);

    try {
      // Start AI analysis immediately - no need to fetch dungeons data
      await startAIAnalysis(currentSeasonId);
      
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load AI prediction data');
    } finally {
      setLoading(false);
    }
  }, [currentSeasonId, startAIAnalysis]);

  useEffect(() => {
    // Check for force refresh parameter in URL
    const urlParams = new URLSearchParams(window.location.search);
    const shouldForceRefresh = urlParams.get('force_refresh') === 'true';
    setForceRefresh(shouldForceRefresh);

    const initializeData = async () => {
      try {
        // First, get the highest season_id (current season)
        const seasons = await fetchSeasons();
        const highestSeason = seasons.reduce((max: any, season: any) => 
          season.season_id > max.season_id ? season : max
        );
        setCurrentSeasonId(highestSeason.season_id);
        
        if (!highestSeason.season_id) {
          setError('No seasons available');
          return;
        }
      } catch (err) {
        setError('Failed to load seasons data');
        console.error('Error loading seasons:', err);
      }
    };

    initializeData();
  }, []);

  // Load data when currentSeasonId changes
  useEffect(() => {
    if (currentSeasonId) {
      loadData();
    }
  }, [currentSeasonId, loadData]);

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
      {/* Force Refresh Controls */}
      {currentSeasonId && isTestingEnabled && (
        <div className="force-refresh-controls">
          <div className="force-refresh-info">
            <span className="force-refresh-label">🔄 Force AI Refresh:</span>
            <span className="force-refresh-description">
              Bypass cache and generate fresh AI analysis (useful for testing)
            </span>
          </div>
          <div className="force-refresh-buttons">
            <button
              className={`force-refresh-btn ${forceRefresh ? 'active' : ''}`}
              onClick={() => {
                const url = new URL(window.location.href);
                if (forceRefresh) {
                  url.searchParams.delete('force_refresh');
                } else {
                  url.searchParams.set('force_refresh', 'true');
                }
                window.location.href = url.toString();
              }}
            >
              {forceRefresh ? '🔄 Disable Force Refresh' : '🔄 Enable Force Refresh'}
            </button>
            {forceRefresh && (
              <button
                className="refresh-now-btn"
                onClick={() => window.location.reload()}
              >
                🔄 Refresh Now
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      {!currentSeasonId ? (
        <div className="select-season-container">
          <div className="select-season-content">
            <h2>📊 Loading Current Season</h2>
            <p>Loading AI predictions for the current season...</p>
          </div>
        </div>
      ) : loading ? (
        <AILoadingScreen />
      ) : (
        <div className="ai-predictions-content">
          {aiLoading ? (
            <div className="ai-analysis-loading">
              <div className="ai-loading-content">
                <div className="ai-loading-spinner"></div>
                <h3>🤖 AI Analysis in Progress</h3>
                <p>Analyzing season data and generating predictions...</p>
                <p className="ai-loading-note">This may take a few moments as we process the data with OpenAI GPT-4</p>
              </div>
            </div>
          ) : aiAnalysis ? (
            <>
              <PredictionDashboard 
                aiAnalysis={aiAnalysis}
                usingCache={usingCache}
                cacheMetadata={cacheMetadata}
                forceRefresh={forceRefresh}
                seasonId={currentSeasonId}
              />
              <AIAnalysisInsights analysis={aiAnalysis.analysis} />
            </>
          ) : (
            <div className="ai-fallback-container">
              <div className="ai-fallback-content">
                <h3>📊 No Analysis Available</h3>
                <p>AI analysis is not available. Please try refreshing the page.</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};