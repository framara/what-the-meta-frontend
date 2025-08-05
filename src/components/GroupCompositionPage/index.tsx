import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useFilterState } from '../FilterContext';
import { fetchTopKeys, fetchCompositionData } from '../../services/api';
import { GroupCompositionStats } from './components/GroupCompositionStats';
import LoadingScreen from '../LoadingScreen';
import { FilterBar } from '../FilterBar';
import './styles/GroupCompositionPage.css';

interface Season {
  season_id: number;
  season_name: string;
}

interface GroupMember {
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
        spec_id: string;
        class_id: string;
        role: string;
      }>;
      [key: string]: any;
    }>;
  }>;
}

// Global cache for API responses
const dataCache = new Map<string, { runs: Run[]; seasonData: SeasonData; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const GroupCompositionPage: React.FC = () => {
  const filter = useFilterState();
  const [runs, setRuns] = useState<Run[]>([]);
  const [seasonData, setSeasonData] = useState<SeasonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [trendLoading, setTrendLoading] = useState(false);
  const isFetchingRef = useRef(false);
  const workerRef = useRef<Worker | null>(null);

  // Memoized cache key for current filter state
  const cacheKey = useMemo(() => {
    return `group-composition-${filter.season_id}-${filter.period_id || 'all'}-${filter.dungeon_id || 'all'}-${filter.limit || 1000}`;
  }, [filter.season_id, filter.period_id, filter.dungeon_id, filter.limit]);

  // Progressive loading function
  const fetchData = useCallback(async () => {
    const startTime = performance.now();
    
    if (!filter.season_id) return;

    // Check cache first
    const cached = dataCache.get(cacheKey);
    const richCached = dataCache.get(`rich-${cacheKey}`);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setRuns(cached.runs);
      setSeasonData(cached.seasonData);
      setLoading(false);
      setIsInitialLoad(false);
      
      // If we have rich data cached, use it immediately
      if (richCached && Date.now() - richCached.timestamp < CACHE_DURATION) {
        setSeasonData(richCached.seasonData);
      } else {
        // Start worker to get rich data
        startCompositionWorker();
      }
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
      // Start with a smaller initial fetch for faster first render
      const initialLimit = Math.min(filter.limit || 1000, 250);
      
      setLoadingProgress(10);
      const topKeysStart = performance.now();
      
      // Fetch top keys first (this is the heaviest call)
      const runsData = await fetchTopKeys({
        season_id: filter.season_id,
        period_id: filter.period_id,
        dungeon_id: filter.dungeon_id,
        limit: initialLimit
      });
      
      const topKeysTime = performance.now() - topKeysStart;
      
      setLoadingProgress(60);
      setRuns(runsData); // Show initial data immediately
      
      // If we fetched less than the full limit, fetch the rest
      let finalRuns = runsData;
      if (initialLimit < (filter.limit || 1000)) {
        const remainingLimit = (filter.limit || 1000) - initialLimit;
        
        const additionalStart = performance.now();
        const additionalRuns = await fetchTopKeys({
          season_id: filter.season_id,
          period_id: filter.period_id,
          dungeon_id: filter.dungeon_id,
          limit: remainingLimit,
          offset: initialLimit
        });
        
        const additionalTime = performance.now() - additionalStart;
        
        finalRuns = [...runsData, ...additionalRuns];
      }
      
      setLoadingProgress(90);
      
      // Create initial season data structure from runs (for immediate display)
      const initialSeasonData = {
        season_id: filter.season_id,
        total_periods: 1,
        total_keys: finalRuns.length,
        periods: [{
          period_id: filter.period_id || 1,
          keys_count: finalRuns.length,
          keys: finalRuns.map((run: Run) => ({
            id: run.id,
            keystone_level: run.keystone_level,
            score: run.keystone_level * 10, // Generate a score based on key level
            members: run.members.map((member: GroupMember) => ({
              spec_id: member.spec_id.toString(),
              class_id: member.class_id.toString(),
              role: member.role
            }))
          }))
        }]
      };
      
      // Cache the initial results
      dataCache.set(cacheKey, {
        runs: finalRuns,
        seasonData: initialSeasonData,
        timestamp: Date.now()
      });
      
      setRuns(finalRuns);
      setSeasonData(initialSeasonData);
      setIsInitialLoad(false);
      setLoadingProgress(100);
      
      const totalTime = performance.now() - startTime;  
      
      // Start background worker for rich composition data
      startCompositionWorker();
      
    } catch (err) {
      const errorTime = performance.now() - startTime;
      console.error(`❌ [${new Date().toISOString()}] Error after ${errorTime.toFixed(2)}ms:`, err);
      setError('Failed to load group composition data');
    } finally {
      isFetchingRef.current = false;
      setLoading(false);
      setLoadingProgress(0);
    }
  }, [filter.season_id, filter.period_id, filter.dungeon_id, filter.limit, cacheKey]);

  // Start composition worker for rich data
  const startCompositionWorker = useCallback(() => {
    if (!filter.season_id) return;
    
    setTrendLoading(true);
    
    // Create worker if it doesn't exist
    if (!workerRef.current) {
      workerRef.current = new Worker('/composition-worker.js');
      
      // Set up message handler
      workerRef.current.onmessage = (event) => {
        const { success, seasonData, error } = event.data;
        
        if (success && seasonData) {
          
          // Update with rich data
          setSeasonData(seasonData);
          setTrendLoading(false);
          
          // Update cache with rich data
          const richCacheKey = `rich-${cacheKey}`;
          dataCache.set(richCacheKey, {
            runs: runs,
            seasonData: seasonData,
            timestamp: Date.now()
          });
          
        } else {
          console.error(`❌ [${new Date().toISOString()}] Worker error:`, error);
          setTrendLoading(false);
        }
      };
      
      // Set up error handler
      workerRef.current.onerror = (error) => {
        console.error(`❌ [${new Date().toISOString()}] Worker error:`, error);
        setTrendLoading(false);
      };
    }
    
    // Send data to worker
    workerRef.current.postMessage({
      season_id: filter.season_id,
      period_id: filter.period_id,
      dungeon_id: filter.dungeon_id,
      limit: filter.limit,
      apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
    });
    
  }, [filter.season_id, filter.period_id, filter.dungeon_id, filter.limit, cacheKey, runs]);

  // Fetch data when filters change
  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

  // Cleanup worker on unmount
  useEffect(() => {
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, []);

  // Memoize page header content
  const pageHeaderContent = useMemo(() => (
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
  ), []);

  // Memoize filter bar props
  const filterBarProps = useMemo(() => ({
    showExpansion: false,
    showPeriod: true,
    showDungeon: true,
    showLimit: true,
    className: "group-composition-filter"
  }), []);

  // Memoize error content
  const errorContent = useMemo(() => (
    <div className="group-composition-page">
      <div className="error-container">
        <h2 className="error-title">Error Loading Data</h2>
        <p className="error-message">{error}</p>
        <button 
          className="retry-button"
          onClick={() => fetchData()}
        >
          Try Again
        </button>
      </div>
    </div>
  ), [error, fetchData]);

  // Memoize main content
  const mainContent = useMemo(() => (
    <div className="group-composition-content">
      <GroupCompositionStats runs={runs} seasonData={seasonData} />
    </div>
  ), [runs, seasonData]);

  // Show loading only for initial load, not for data updates
  if (isInitialLoad && loading) {
    return (
      <div className="group-composition-page">
        {pageHeaderContent}
        <FilterBar {...filterBarProps} />
        <LoadingScreen />
      </div>
    );
  }

  if (error) {
    return errorContent;
  }

  return (
    <div className="group-composition-page">
      {pageHeaderContent}
      
      <FilterBar {...filterBarProps} />

      {loading ? (
        <div className="loading-overlay" style={{
          position: 'relative',
          minHeight: '400px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          borderRadius: '8px',
          margin: '1rem 0'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div className="loading-spinner" style={{ margin: '0 auto 1rem' }}></div>
            <p style={{ color: '#666', fontSize: '0.9rem' }}>
              Loading composition data... {loadingProgress}%
            </p>
            {runs.length > 0 && (
              <p style={{ color: '#888', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                Showing {runs.length} runs (loading more...)
              </p>
            )}
          </div>
        </div>
      ) : (
        <div style={{ position: 'relative' }}>
          {mainContent}
          
          {/* Trend loading overlay */}
          {trendLoading && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(17, 24, 39, 0.8)', // Dark background matching page theme
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
                  Loading trend data...
                </p>
                <p style={{ color: '#9ca3af', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                  Charts will update with historical data
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 