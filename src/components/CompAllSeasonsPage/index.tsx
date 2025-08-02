import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { fetchTopKeysAllSeasons } from '../../services/api';
import LoadingScreen from '../LoadingScreen';
import { WOW_SPECIALIZATIONS, WOW_CLASS_COLORS, WOW_SPEC_ROLES } from '../../constants/wow-constants';
import './styles/CompAllSeasonsPage.css';

interface GroupMember {
  class_id: string;
  spec_id: string;
  role: string;
}

interface Run {
  id: number;
  keystone_level: number;
  dungeon_id: number;
  duration_ms: number;
  members: GroupMember[];
}

interface AllSeasonsResponse {
  total_seasons: number;
  total_keys: number;
  seasons: Array<{
    season_id: number;
    season_name: string;
    expansion: string;
    patch: string;
    keys_count: number;
    data: Run[];
  }>;
}

interface SeasonComposition {
  season_id: number;
  season_name: string;
  expansion: string;
  patch: string;
  keys_count: number;
  top_composition: {
    spec_combination: string;
    count: number;
    percentage: number;
    runs: Run[];
  };
}

// Global cache for API responses
const dataCache = new Map<string, { 
  seasonsData: AllSeasonsResponse; 
  compositions: SeasonComposition[]; 
  groupedCompositions: { [key: string]: SeasonComposition[] }; 
  timestamp: number 
}>();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes (longer cache for historical data)

export const CompAllSeasonsPage: React.FC = () => {
  const [seasonsData, setSeasonsData] = useState<AllSeasonsResponse | null>(null);
  const [seasonCompositions, setSeasonCompositions] = useState<SeasonComposition[]>([]);
  const [groupedCompositions, setGroupedCompositions] = useState<{ [key: string]: SeasonComposition[] }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [processingLoading, setProcessingLoading] = useState(false);
  const isFetchingRef = useRef(false);
  const workerRef = useRef<Worker | null>(null);

  // Memoized cache key
  const cacheKey = useMemo(() => {
    return 'comp-all-seasons-data';
  }, []);

  // Progressive loading function
  const loadData = useCallback(async () => {
    const startTime = performance.now();
    console.log(`🚀 [${new Date().toISOString()}] Starting CompAllSeasonsPage load`);
    
    // Check cache first
    const cached = dataCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log(`⚡ [${new Date().toISOString()}] Cache HIT! Returning cached data in ${(performance.now() - startTime).toFixed(2)}ms`);
      setSeasonsData(cached.seasonsData);
      setSeasonCompositions(cached.compositions);
      setGroupedCompositions(cached.groupedCompositions);
      setLoading(false);
      return;
    }

    // Prevent duplicate calls
    if (isFetchingRef.current) {
      console.log(`⏳ [${new Date().toISOString()}] Already loading, skipping duplicate call`);
      return;
    }

    console.log(`💾 [${new Date().toISOString()}] Cache MISS - fetching fresh data`);
    isFetchingRef.current = true;
    setLoading(true);
    setError(null);
    setLoadingProgress(0);

    try {
      // Phase 1: Fetch data
      setLoadingProgress(10);
      console.log(`🔍 [${new Date().toISOString()}] Fetching all seasons data...`);
      
      const allSeasonsResponse = await fetchTopKeysAllSeasons({
        limit: 1000
      });
      
      setLoadingProgress(30);
      console.log(`✅ [${new Date().toISOString()}] Data fetched, starting processing...`);
      
      // Show basic data immediately
      setSeasonsData(allSeasonsResponse);
      
      // Phase 2: Start background processing
      startProcessingWorker(allSeasonsResponse);
      
      setLoadingProgress(50);
      
    } catch (err) {
      const errorTime = performance.now() - startTime;
      console.error(`❌ [${new Date().toISOString()}] Error after ${errorTime.toFixed(2)}ms:`, err);
      setError('Failed to load all seasons data');
    } finally {
      isFetchingRef.current = false;
      setLoading(false);
      setLoadingProgress(0);
    }
  }, [cacheKey]);

  // Start processing worker for heavy computation
  const startProcessingWorker = useCallback((allSeasonsResponse: AllSeasonsResponse) => {
    console.log(`🔄 [${new Date().toISOString()}] Starting processing worker...`);
    setProcessingLoading(true);
    
    // Create worker if it doesn't exist
    if (!workerRef.current) {
      workerRef.current = new Worker('/composition-processing-worker.js');
      
      // Set up message handler
      workerRef.current.onmessage = (event) => {
        const { success, compositions, groupedCompositions, error } = event.data;
        
        if (success && compositions && groupedCompositions) {
          console.log(`✅ [${new Date().toISOString()}] Processing completed:`, {
            total_compositions: compositions.length,
            total_expansions: Object.keys(groupedCompositions).length
          });
          
          // Update with processed data
          setSeasonCompositions(compositions);
          setGroupedCompositions(groupedCompositions);
          setProcessingLoading(false);
          
          // Cache the results
          dataCache.set(cacheKey, {
            seasonsData: allSeasonsResponse,
            compositions: compositions,
            groupedCompositions: groupedCompositions,
            timestamp: Date.now()
          });
          
        } else {
          console.error(`❌ [${new Date().toISOString()}] Processing error:`, error);
          setProcessingLoading(false);
        }
      };
      
      // Set up error handler
      workerRef.current.onerror = (error) => {
        console.error(`❌ [${new Date().toISOString()}] Worker error:`, error);
        setProcessingLoading(false);
      };
    }
    
    // Send data to worker
    workerRef.current.postMessage({
      seasons: allSeasonsResponse.seasons
    });
    
  }, [cacheKey]);

  // Helper function to get spec name from spec_id
  const getSpecName = useCallback((specId: number): string => {
    return WOW_SPECIALIZATIONS[specId] || `Spec ${specId}`;
  }, []);

  // Helper function to get class color
  const getClassColor = useCallback((classId: number): string => {
    return WOW_CLASS_COLORS[classId] || '#FFFFFF';
  }, []);

  // Helper function to get role order for sorting
  const getRoleOrder = useCallback((specId: number): number => {
    const role = WOW_SPEC_ROLES[specId];
    if (role === 'tank') return 1;
    if (role === 'healer') return 2;
    return 3; // DPS
  }, []);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

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
      <div className="comp-all-seasons-page">
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
    <div className="comp-all-seasons-page">
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">
            Historical Compositions
          </h1>
          <p className="page-description">
            Discover the most popular group compositions across {seasonsData?.total_seasons || 0} seasons of Mythic+ history.
          </p>
        </div>
      </div>

      {loading ? (
        <LoadingScreen />
      ) : (
        <div className="comp-all-seasons-content" style={{ position: 'relative' }}>
          {Object.entries(groupedCompositions)
            .sort(([, seasonsA], [, seasonsB]) => {
              // Sort by the highest season_id in each expansion (newest first)
              const maxSeasonIdA = Math.max(...seasonsA.map(s => s.season_id));
              const maxSeasonIdB = Math.max(...seasonsB.map(s => s.season_id));
              return maxSeasonIdB - maxSeasonIdA;
            })
            .map(([expansion, seasons]) => (
            <div key={expansion} className="expansion-section">
              <h2 className="expansion-title">{expansion}</h2>
              <div className="seasons-grid">
                {seasons.map((season) => {
                  const specIds = season.top_composition.spec_combination.split('-').map(id => parseInt(id));
                  
                  return (
                    <div key={season.season_id} className="season-card">
                      <div className="season-header">
                        <div className="season-header-top">
                          <h3 className="season-name">{season.season_name}</h3>
                          <div className="season-info">
                            <span className="patch">{season.patch}</span>
                            <span className="expansion-badge">{season.expansion}</span>
                          </div>
                        </div>
                        <div className="season-stats">
                          <div className="popularity-bar">
                            <div className="popularity-header">
                              <span className="popularity-label">Popularity</span>
                              <span className="popularity-percentage">{season.top_composition.percentage.toFixed(1)}%</span>
                            </div>
                            <div className="popularity-progress">
                              <div 
                                className="popularity-fill" 
                                style={{ width: `${season.top_composition.percentage}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="composition-display">
                        <h4 className="composition-title">Most Popular Composition</h4>
                        <div className="specs-grid">
                          {specIds.map((specId, index) => {
                            // Find the member with this spec_id from the first run
                            const member = season.top_composition.runs[0]?.members.find(m => Number(m.spec_id) === specId);
                            const classColor = member ? getClassColor(Number(member.class_id)) : '#FFFFFF';
                            // Check if color is light (white or yellow)
                            const isLightColor = classColor === '#FFFFFF' || classColor === '#FFF569';
                            
                            return (
                              <div 
                                key={index} 
                                className="spec-item"
                                style={{ 
                                  backgroundColor: classColor
                                }}
                              >
                                <span 
                                  className="spec-name"
                                  style={{ 
                                    color: isLightColor ? '#000000' : '#ffffff'
                                  }}
                                >
                                  {getSpecName(specId)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          
          {/* Processing loading overlay */}
          {processingLoading && (
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
                  Processing historical data...
                </p>
                <p style={{ color: '#9ca3af', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                  Analyzing compositions across {seasonsData?.total_seasons || 0} seasons
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 