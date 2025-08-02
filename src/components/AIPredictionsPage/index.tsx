import React, { useState, useEffect } from 'react';
import { fetchCompositionData, fetchSeasonInfo, fetchSpecEvolution, fetchSeasons } from '../../services/api';
import { getAIPredictions, getAIAnalysis } from '../../services/aiService';
import type { AIAnalysisResponse } from '../../services/aiService';
import { PredictionDashboard } from './components/PredictionDashboard';
import { AIAnalysisInsights } from './components/AIAnalysisInsights';
import AILoadingScreen from '../AILoadingScreen';
import './styles/AIPredictionsPage.css';
import { Tooltip } from 'recharts';

export const AIPredictionsPage: React.FC = () => {
  const [seasonData, setSeasonData] = useState<any>(null);
  const [specEvolution, setSpecEvolution] = useState<any>(null);
  const [dungeons, setDungeons] = useState<any[]>([]);
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

  useEffect(() => {
    // Check for force refresh parameter in URL
    const urlParams = new URLSearchParams(window.location.search);
    const shouldForceRefresh = urlParams.get('force_refresh') === 'true';
    setForceRefresh(shouldForceRefresh);

    const loadData = async () => {
      try {
        // First, get the highest season_id (current season)
        const seasons = await fetchSeasons();
        const highestSeason = seasons.reduce((max, season) => 
          season.season_id > max.season_id ? season : max
        );
        setCurrentSeasonId(highestSeason.season_id);
        
        if (!highestSeason.season_id) {
          setError('No seasons available');
          return;
        }

              setLoading(true);
        setError(null);

        try {
          // Fetch both comprehensive season data and spec evolution data
          const [seasonDataResult, seasonInfo, specEvolutionResult] = await Promise.all([
            fetchCompositionData(highestSeason.season_id),
            fetchSeasonInfo(highestSeason.season_id),
            fetchSpecEvolution(highestSeason.season_id)
          ]);

          setSeasonData(seasonDataResult);
          setSpecEvolution(specEvolutionResult);
          setDungeons(seasonInfo.dungeons);

          // Check cache first, then trigger AI analysis if needed
          setAiLoading(true);
          try {
            let aiResponse: AIAnalysisResponse;
            
            // Skip cache if force refresh is enabled
            if (shouldForceRefresh) {
              aiResponse = await getAIPredictions({
                seasonData: seasonDataResult,
                specEvolution: specEvolutionResult,
                dungeons: seasonInfo.dungeons,
                seasonId: highestSeason.season_id
              });
              setUsingCache(false);
              setCacheMetadata(null);
            } else {
              // First, try to get cached analysis
              try {
                aiResponse = await getAIAnalysis(highestSeason.season_id);
                setUsingCache(true);
                // Extract cache metadata if available
                if (aiResponse._cache) {
                  setCacheMetadata(aiResponse._cache);
                }
              } catch (cacheError: any) {
                // Check if it's a cache miss vs actual error
                if (cacheError.message === 'CACHE_MISS') {
                  // Cache miss - this is expected, generate new analysis
                  aiResponse = await getAIPredictions({
                    seasonData: seasonDataResult,
                    specEvolution: specEvolutionResult,
                    dungeons: seasonInfo.dungeons,
                    seasonId: highestSeason.season_id
                  });
                  setUsingCache(false);
                  setCacheMetadata(null);
                } else {
                  // Actual error - rethrow
                  throw cacheError;
                }
              }
            }
            setAiAnalysis(aiResponse);
          } catch (aiError) {
            console.error('AI analysis failed:', aiError);
            // Don't fail the entire page if AI fails, just show a warning
            setError('Data loaded successfully, but AI analysis failed. Showing fallback analysis.');
          } finally {
            setAiLoading(false);
          }

        } catch (err) {
          setError('Failed to load AI prediction data');
          console.error('Error loading data:', err);
        } finally {
          setLoading(false);
        }
      } catch (err) {
        setError('Failed to load seasons data');
        console.error('Error loading seasons:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

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
                <p>Analyzing {seasonData?.total_keys || 0} keys across {seasonData?.total_periods || 0} periods...</p>
                <p className="ai-loading-note">This may take a few moments as we process the data with OpenAI GPT-4</p>
              </div>
            </div>
          ) : aiAnalysis ? (
            <>
              <PredictionDashboard 
                seasonData={seasonData} 
                specEvolution={specEvolution} 
                dungeons={dungeons}
                aiAnalysis={aiAnalysis}
                usingCache={usingCache}
                cacheMetadata={cacheMetadata}
                forceRefresh={forceRefresh}
              />
              <AIAnalysisInsights analysis={aiAnalysis.analysis} />
            </>
          ) : (
            <div className="ai-fallback-container">
              <div className="ai-fallback-content">
                <h3>📊 Fallback Analysis</h3>
                <p>AI analysis is not available. Showing statistical analysis based on the data.</p>
                <PredictionDashboard 
                  seasonData={seasonData} 
                  specEvolution={specEvolution} 
                  dungeons={dungeons}
                  usingCache={usingCache}
                  cacheMetadata={cacheMetadata}
                  forceRefresh={forceRefresh}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};