import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { fetchCompositionData, fetchSeasonInfo, fetchSpecEvolution, fetchSeasons } from '../../services/api';
import { getAIPredictions, getAIAnalysis } from '../../services/aiService';
import type { AIAnalysisResponse } from '../../services/aiService';
import { PredictionDashboard } from './components/PredictionDashboard';
import { AIAnalysisInsights } from './components/AIAnalysisInsights';
import AILoadingScreen from '../AILoadingScreen';
import './styles/AIPredictionsPage.css';
import { Tooltip } from 'recharts';

// Global cache for API responses
const dataCache = new Map<string, { seasonData: any; specEvolution: any; seasonInfo: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

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
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [richDataLoading, setRichDataLoading] = useState(false);
  const isFetchingRef = useRef(false);
  const workerRef = useRef<Worker | null>(null);

  // Check if testing features should be enabled
  const isTestingEnabled = import.meta.env.VITE_ENABLE_TESTING_FEATURES === 'true';

  // Memoized cache key for current season
  const cacheKey = useMemo(() => {
    return `ai-predictions-${currentSeasonId}-${forceRefresh}`;
  }, [currentSeasonId, forceRefresh]);

  // Progressive loading function
  const loadData = useCallback(async () => {
    const startTime = performance.now();

    if (!currentSeasonId) return;

    // Check cache first
    const cached = dataCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setSeasonData(cached.seasonData);
      setSpecEvolution(cached.specEvolution);
      setDungeons(cached.seasonInfo.dungeons);
      setLoading(false);
      
      // Start AI analysis with cached data
      startAIAnalysis(cached.seasonData, cached.specEvolution, cached.seasonInfo.dungeons);
      return;
    }

    // Prevent duplicate calls
    if (isFetchingRef.current) {
      return;
    }

    isFetchingRef.current = true;
    setLoading(true);
    setError(null);
    setLoadingProgress(0);

    try {
      // Phase 1: Load fast data first (seasons, season info, spec evolution)
      setLoadingProgress(10);
      
      const [seasonInfo, specEvolutionResult] = await Promise.all([
        fetchSeasonInfo(currentSeasonId),
        fetchSpecEvolution(currentSeasonId)
      ]);
      
      setLoadingProgress(30);
      
      setSpecEvolution(specEvolutionResult);
      setDungeons(seasonInfo.dungeons);
      
      // Show initial data immediately
      
      // Phase 2: Start background worker for heavy composition data
      startCompositionWorker();
      
      // Phase 3: Start AI analysis with available data
      startAIAnalysis(null, specEvolutionResult, seasonInfo.dungeons);
      
      setLoadingProgress(50);
      
    } catch (err) {
      const errorTime = performance.now() - startTime;
      console.error(`❌ [${new Date().toISOString()}] Error after ${errorTime.toFixed(2)}ms:`, err);
      setError('Failed to load AI prediction data');
    } finally {
      isFetchingRef.current = false;
      setLoading(false);
      setLoadingProgress(0);
    }
  }, [currentSeasonId, cacheKey]);

  // Start composition worker for rich data
  const startCompositionWorker = useCallback(() => {
    if (!currentSeasonId) return;
    
    setRichDataLoading(true);
    
    // Create worker if it doesn't exist
    if (!workerRef.current) {
      workerRef.current = new Worker('/composition-worker.js');
      
      // Set up message handler
      workerRef.current.onmessage = (event) => {
        const { success, seasonData, error } = event.data;
        
        if (success && seasonData) {
          
          // Update with rich data
          setSeasonData(seasonData);
          setRichDataLoading(false);
          
          // Cache the results
          dataCache.set(cacheKey, {
            seasonData: seasonData,
            specEvolution: specEvolution,
            seasonInfo: { dungeons },
            timestamp: Date.now()
          });
          
          // Restart AI analysis with rich data
          startAIAnalysis(seasonData, specEvolution, dungeons);
          
        } else {
          console.error(`❌ [${new Date().toISOString()}] Worker error:`, error);
          setRichDataLoading(false);
        }
      };
      
      // Set up error handler
      workerRef.current.onerror = (error) => {
        console.error(`❌ [${new Date().toISOString()}] Worker error:`, error);
        setRichDataLoading(false);
      };
    }
    
    // Send data to worker
    workerRef.current.postMessage({
      season_id: currentSeasonId,
      apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
    });
    
  }, [currentSeasonId, cacheKey, specEvolution, dungeons]);

  // Start AI analysis
  const startAIAnalysis = useCallback(async (seasonData: any, specEvolution: any, dungeons: any[]) => {
    if (!currentSeasonId) return;
    
    setAiLoading(true);
    
    try {
      let aiResponse: AIAnalysisResponse;
      
      // Skip cache if force refresh is enabled
      if (forceRefresh) {
        aiResponse = await getAIPredictions({
          seasonData: seasonData,
          specEvolution: specEvolution,
          dungeons: dungeons,
          seasonId: currentSeasonId
        });
        setUsingCache(false);
        setCacheMetadata(null);
      } else {
        // First, try to get cached analysis
        try {
          aiResponse = await getAIAnalysis(currentSeasonId);
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
              seasonData: seasonData,
              specEvolution: specEvolution,
              dungeons: dungeons,
              seasonId: currentSeasonId
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
  }, [currentSeasonId, forceRefresh]);

  useEffect(() => {
    // Check for force refresh parameter in URL
    const urlParams = new URLSearchParams(window.location.search);
    const shouldForceRefresh = urlParams.get('force_refresh') === 'true';
    setForceRefresh(shouldForceRefresh);

    const initializeData = async () => {
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

  // Cleanup worker on unmount
  useEffect(() => {
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, []);

  // Clean up old cache entries periodically
  useEffect(() => {
    const cleanupCache = () => {
      const now = Date.now();
      for (const [key, value] of dataCache.entries()) {
        if (now - value.timestamp > CACHE_DURATION) {
          dataCache.delete(key);
        }
      }
    };

    const interval = setInterval(cleanupCache, CACHE_DURATION);
    return () => clearInterval(interval);
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
        <div className="ai-predictions-content" style={{ position: 'relative' }}>
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
          
          {/* Rich data loading overlay */}
          {richDataLoading && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(17, 24, 39, 0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
              borderRadius: '8px',
              backdropFilter: 'blur(4px)'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div className="loading-spinner" style={{ margin: '0 auto 1rem' }}></div>
                <p style={{ color: '#e5e7eb', fontSize: '0.9rem', fontWeight: '500' }}>
                  Loading comprehensive data...
                </p>
                <p style={{ color: '#9ca3af', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                  AI analysis will update with complete dataset
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};