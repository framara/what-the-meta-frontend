import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { fetchTopKeysAllSeasons, fetchTopKeys, fetchSeasons } from '../../services/api';
// Inline skeleton overlay replaces full-screen loader on this page
import { WOW_SPECIALIZATIONS, WOW_CLASS_COLORS, WOW_SPEC_ROLES, WOW_SPEC_TO_CLASS } from '../../constants/wow-constants';
import { SpecIconImage } from '../../utils/specIconImages';

import './styles/CompAllSeasonsPage.css';
import SEO from '../SEO';

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
const compAllSeasonsCache = new Map<string, { 
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
  const [error, setError] = useState<string | null>(null);
  const [loadedExpansions, setLoadedExpansions] = useState<number>(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isInitialStreaming, setIsInitialStreaming] = useState(true);
  const isFetchingRef = useRef(false);
  const isMountedRef = useRef(true);
  const workerRef = useRef<Worker | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // Memoized cache key
  const cacheKey = useMemo(() => {
    return 'comp-all-seasons-data';
  }, []);



  // Progressive loading function
  const loadData = useCallback(async () => {
    console.log('🔄 [LOAD] loadData function started');
    const startTime = performance.now();
    
    // Check cache first
    const cached = compAllSeasonsCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      const groupedExpansions = Object.keys(cached.groupedCompositions || {}).length;
      const compositionsCount = cached.compositions?.length || 0;
      
      // Validate cache integrity - expect at least 3 expansions and 10 seasons
      const isValidCache = groupedExpansions >= 3 && compositionsCount >= 10;
      
      if (isValidCache) {
        console.log('🏁 [CACHE] Using cached data:', {
          totalSeasons: cached.seasonsData?.total_seasons,
          compositionsCount,
          groupedExpansions,
          cacheAge: Math.round((Date.now() - cached.timestamp) / 1000) + 's'
        });
        setSeasonsData(cached.seasonsData);
        setSeasonCompositions(cached.compositions);
        setGroupedCompositions(cached.groupedCompositions);
        return;
      } else {
        console.warn('⚠️ [CACHE] Invalid/incomplete cached data detected, clearing cache:', {
          groupedExpansions,
          compositionsCount
        });
        compAllSeasonsCache.delete(cacheKey);
      }
    }

    // Prevent duplicate calls
    if (isFetchingRef.current) {
      return;
    }

    isFetchingRef.current = true;
    setError(null);

    try {
      console.log('🔄 [API] Starting season-by-season streaming fetch...');
      await startStreamingSeasonProcessing();
    } catch (err) {
      const errorTime = performance.now() - startTime;
      console.error(`❌ [${new Date().toISOString()}] Error after ${errorTime.toFixed(2)}ms:`, err);
      setError('Failed to load all seasons data');
    } finally {
      isFetchingRef.current = false;
    }
  }, [cacheKey]);

  // New streaming approach: fetch and process seasons individually
  const startStreamingSeasonProcessing = useCallback(async () => {
    console.log('🔄 [STREAMING] Starting season-by-season processing...');
    
    // First, get the list of seasons to know what to fetch
    const seasonsListResponse = await fetchSeasons();
    const seasons = seasonsListResponse.sort((a: any, b: any) => b.season_id - a.season_id); // Latest first
    
    console.log(`🔄 [STREAMING] Found ${seasons.length} seasons, processing latest first...`);
    console.log(`🔍 [DEBUG] Seasons list sample:`, {
      total: seasons.length,
      first: seasons[0],
      keys: Object.keys(seasons[0] || {}),
      allSeasons: seasons.map((s: any) => ({ id: s.season_id, name: s.season_name, expansion: s.expansion }))
    });
    
    // Initialize streaming results - clear existing state
    setGroupedCompositions({});
    setSeasonCompositions([]);
    
    let processedSeasons = 0;
    const totalSeasons = seasons.length;
    let currentGroupedCompositions: { [key: string]: SeasonComposition[] } = {};
    
    // Process seasons one by one
    for (const season of seasons) {
      try {
        const seasonStartTime = performance.now();
        console.log(`🔄 [STREAMING] Fetching season ${season.season_id}...`);
        
        console.log(`Loading season ${season.season_id}... (${processedSeasons + 1}/${totalSeasons})`);
        
        // Fetch this season's data
        const seasonData = await fetchTopKeys({
          season_id: season.season_id,
          limit: 1000
        });
        
        const fetchTime = performance.now() - seasonStartTime;
        console.log(`✅ [STREAMING] Season ${season.season_id} fetched in ${fetchTime.toFixed(2)}ms, processing...`);
        // Handle both old and new response formats
        let seasonInfo, runsArray;
        
        if (seasonData.season_info && seasonData.data) {
          // New enhanced format with metadata
          seasonInfo = seasonData.season_info;
          runsArray = seasonData.data;
          console.log(`✅ [API] Enhanced format detected for season ${season.season_id}`);
        } else if (Array.isArray(seasonData)) {
          // Old array format
          seasonInfo = season; // Use fallback from seasons list
          runsArray = seasonData;
          console.log(`⚠️ [API] Legacy array format detected for season ${season.season_id}`);
        } else {
          // Old object format (converted to array)
          seasonInfo = season; // Use fallback from seasons list
          runsArray = Object.values(seasonData || {});
          console.log(`⚠️ [API] Legacy object format detected for season ${season.season_id}`);
        }
        
        console.log(`🔍 [DEBUG] Season ${season.season_id} data structure:`, {
          format: seasonData.season_info ? 'enhanced' : 'legacy',
          runsArrayLength: runsArray.length,
          seasonInfo: seasonInfo,
          firstRun: runsArray[0] || 'no runs'
        });
        
        // Process this season immediately using enhanced metadata when available
        const processStartTime = performance.now();
        const processedSeason = await processSingleSeason({
          season_id: seasonInfo.season_id,
          season_name: seasonInfo.season_name || `Season ${seasonInfo.season_id}`,
          expansion: seasonInfo.expansion || 'Unknown Expansion',
          patch: seasonInfo.patch || '',
          keys_count: seasonData.meta?.total_runs || runsArray.length,
          data: runsArray
        });
        
        const processTime = performance.now() - processStartTime;
        console.log(`✅ [STREAMING] Season ${season.season_id} processed in ${processTime.toFixed(2)}ms`);
        
        // Add to grouped results
        const expansion = processedSeason.expansion;
        if (!currentGroupedCompositions[expansion]) {
          currentGroupedCompositions[expansion] = [];
        }
        currentGroupedCompositions[expansion].push(processedSeason);
        currentGroupedCompositions[expansion].sort((a, b) => b.season_id - a.season_id);
        
        // Update UI immediately with this season's data
        setGroupedCompositions({ ...currentGroupedCompositions });
        const flatCompositions = Object.values(currentGroupedCompositions).flat();
        setSeasonCompositions(flatCompositions);
        
        // Mark first season loaded
        if (processedSeasons === 0) {
          console.log('🔄 [STREAMING] First season loaded');
        }
        
        // Update expansions for infinite scroll
        if (isInitialStreaming) {
          const availableExpansions = Object.keys(currentGroupedCompositions).length;
          setLoadedExpansions(availableExpansions);
        }
        
        processedSeasons++;
        
        // Small delay between seasons for smooth UX
        if (processedSeasons < totalSeasons) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
      } catch (error) {
        console.error(`❌ [STREAMING] Error processing season ${season.season_id}:`, error);
        // Continue with next season instead of failing completely
      }
    }
    
    console.log(`✅ [STREAMING] Completed all ${processedSeasons} seasons`);
    
    // Final completion
    console.log(`✅ [STREAMING] Complete! Processed ${processedSeasons} seasons`);
    setIsInitialStreaming(false);
    // Keep all currently loaded expansions visible (don't reset to 1)
    
    // Cache the final results (only if component is still mounted)
    if (processedSeasons > 0 && isMountedRef.current) {
      const flatCompositions = Object.values(currentGroupedCompositions).flat();
      
      // Convert SeasonComposition to the expected AllSeasonsResponse format
      const seasonsForCache = flatCompositions.map(comp => ({
        season_id: comp.season_id,
        season_name: comp.season_name,
        expansion: comp.expansion,
        patch: comp.patch,
        keys_count: comp.keys_count,
        data: comp.top_composition.runs
      }));
      
      console.log('💾 [CACHE] Saving to cache:', {
        totalSeasons: processedSeasons,
        compositionsCount: flatCompositions.length,
        groupedExpansions: Object.keys(currentGroupedCompositions).length,
        expansions: Object.keys(currentGroupedCompositions)
      });
      
      compAllSeasonsCache.set(cacheKey, {
        seasonsData: { 
          seasons: seasonsForCache,
          total_seasons: processedSeasons,
          total_keys: flatCompositions.reduce((sum, s) => sum + (s.keys_count || 0), 0)
        },
        compositions: flatCompositions,
        groupedCompositions: currentGroupedCompositions,
        timestamp: Date.now()
      });
    } else if (!isMountedRef.current) {
      console.log('⚠️ [CACHE] Component unmounted, skipping cache write');
    }
    
  }, [cacheKey, isInitialStreaming]);

  // Helper function to process a single season (extracted from worker logic)
  const processSingleSeason = useCallback(async (season: any) => {
    // This replicates the worker logic for a single season
    const compositionCounts = new Map();
    const data = season.data || [];
    
    // Process runs in batches
    const BATCH_SIZE = 100;
    for (let runIndex = 0; runIndex < data.length; runIndex += BATCH_SIZE) {
      const batch = data.slice(runIndex, runIndex + BATCH_SIZE);
      
      batch.forEach((run: any) => {
        const sortedMembers = run.members
          .slice()
          .sort((a: any, b: any) => {
            const roleOrderA = getRoleOrder(Number(a.spec_id));
            const roleOrderB = getRoleOrder(Number(b.spec_id));
            return roleOrderA - roleOrderB || Number(a.spec_id) - Number(b.spec_id);
          });
        
        const specCombo = sortedMembers.map((member: any) => member.spec_id).join('-');
        
        const existing = compositionCounts.get(specCombo);
        if (existing) {
          existing.count++;
          if (existing.runs.length < 5) {
            existing.runs.push(run);
          }
        } else {
          compositionCounts.set(specCombo, { count: 1, runs: [run] });
        }
      });
    }
    
    // Find top composition
    let topComposition = { spec_combination: '', count: 0, percentage: 0, runs: [] };
    const totalRuns = data.length;
    
    for (const [key, value] of compositionCounts) {
      if (value.count > topComposition.count) {
        topComposition = {
          spec_combination: key,
          count: value.count,
          percentage: (value.count / totalRuns) * 100,
          runs: value.runs
        };
      }
    }
    
    return {
      season_id: season.season_id,
      season_name: season.season_name,
      expansion: season.expansion,
      patch: season.patch,
      keys_count: season.keys_count,
      top_composition: topComposition
    };
  }, []);

  // Helper function for role ordering (same as worker)
  const getRoleOrder = useCallback((specId: number) => {
    // Tank specs
    if (specId === 250 || specId === 581 || specId === 104 || specId === 66 || specId === 268 || specId === 73) {
      return 0;
    }
    // Healer specs  
    if (specId === 105 || specId === 65 || specId === 256 || specId === 257 || specId === 264 || specId === 270 || specId === 1468) {
      return 1;
    }
    // All other specs are DPS
    return 2;
  }, []);





  // Helper function to sort specs by role: tank, healer, dps, dps, dps
  const sortSpecsByRole = useCallback((specIds: number[]): number[] => {
    return [...specIds].sort((a, b) => {
      const roleA = getRoleOrder(a);
      const roleB = getRoleOrder(b);
      
      // First sort by role
      if (roleA !== roleB) {
        return roleA - roleB;
      }
      
      // Within same role, sort by spec_id
      return a - b;
    });
  }, [getRoleOrder]);

  // Load data on mount
  useEffect(() => {
    console.log('🚀 [MOUNT] CompAllSeasonsPage mounted, starting loadData');
    loadData();
  }, [loadData]);

  // Initialize with first expansion when streaming starts
  useEffect(() => {
    const availableExpansions = Object.keys(groupedCompositions).length;
    if (availableExpansions > 0 && loadedExpansions === 0) {
      setLoadedExpansions(1); // Start with first (most recent) expansion
    }
  }, [groupedCompositions, loadedExpansions]);

  // Load more expansions progressively
  const loadMoreExpansions = useCallback(() => {
    if (isLoadingMore) return;
    
    const totalExpansions = Object.keys(groupedCompositions).length;
    if (loadedExpansions < totalExpansions) {
      setIsLoadingMore(true);
      
      // Simulate loading delay for smooth UX
      setTimeout(() => {
        setLoadedExpansions(prev => Math.min(prev + 1, totalExpansions));
        setIsLoadingMore(false);
      }, 300);
    }
  }, [isLoadingMore, loadedExpansions, groupedCompositions]);

  // Set up intersection observer for infinite scroll (only after initial streaming)
  useEffect(() => {
    if (!loadMoreRef.current || isInitialStreaming) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !isLoadingMore && !isInitialStreaming) {
          loadMoreExpansions();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '100px', // Start loading 100px before the element comes into view
      }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loadMoreExpansions, isLoadingMore, isInitialStreaming]);

  // Cleanup worker on unmount
  useEffect(() => {
    return () => {
      console.log('🔄 [UNMOUNT] CompAllSeasonsPage unmounting, cleaning up...');
      isMountedRef.current = false;
      isFetchingRef.current = false;
      
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
      for (const [key, value] of compAllSeasonsCache.entries()) {
        if (now - value.timestamp > CACHE_DURATION) {
          compAllSeasonsCache.delete(key);
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
      <SEO
        title="Historical Composition – What the Meta?"
        description="Top Mythic+ compositions across all seasons with trends by expansion and patch."
        canonicalUrl="/historical-composition"
      />
      

      

      
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">
            Historical Compositions
          </h1>
          <div className="description-container" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <p className="page-description">
              Discover the most popular group compositions across all seasons of Mythic+ history.
            </p>
            <div className="chart-description-popover group relative">
              <button
                className="chart-description-trigger p-1 rounded-full hover:bg-gray-700 transition-colors"
                title="Data sample information"
              >
                <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
              </button>
              
              {/* Simple CSS-based tooltip */}
              <div className="chart-description-tooltip absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-gray-200 text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                Data sample: Top 1,000 runs from the entire season across all regions and dungeons.
                {/* Arrow pointing down */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="comp-all-seasons-content cas-content-wrapper" style={{ position: 'relative' }}>


        <div className="cas-page-content cas-fade-in">
          {Object.entries(groupedCompositions)
            .sort(([, seasonsA], [, seasonsB]) => {
              // Sort by the highest season_id in each expansion (newest first)
              const maxSeasonIdA = Math.max(...seasonsA.map(s => s.season_id));
              const maxSeasonIdB = Math.max(...seasonsB.map(s => s.season_id));
              return maxSeasonIdB - maxSeasonIdA;
            })
            .slice(0, loadedExpansions) // Only show loaded expansions
            .map(([expansion, seasons], index) => (
            <div 
              key={expansion} 
              className="expansion-section"
              style={{
                animation: index === loadedExpansions - 1 ? 'fadeInUp 0.4s ease-out' : undefined
              }}
            >
              <h2 className="expansion-title">{expansion}</h2>
              <div className="seasons-grid">
                {seasons.map((season) => {
                  const specIds = season.top_composition.spec_combination.split('-').map(id => parseInt(id));
                  const sortedSpecIds = sortSpecsByRole(specIds);
                  
                  return (
                    <div key={season.season_id} className="season-card">
                      <div className="season-header">
                        <div className="season-header-top">
                          <h3 className="season-name">{season.season_name}</h3>
                          <div className="season-info">
                            <span className="expansion-badge">{season.expansion}</span>
                            <span className="patch">{season.patch}</span>
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
                          {sortedSpecIds.map((specId, index) => {
                            const classId = Number(WOW_SPEC_TO_CLASS[specId]) || 0;
                            const classColor = WOW_CLASS_COLORS[classId] || '#FFFFFF';
                            
                            return (
                              <div 
                                key={index} 
                                className="spec-item"
                                style={{ 
                                  border: `3px solid ${classColor}`
                                }}
                              >
                                <SpecIconImage 
                                  specId={specId} 
                                  alt={WOW_SPECIALIZATIONS[specId] || 'Spec'}
                                />
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
          
          {/* Infinite scroll trigger and loading indicator (only after initial streaming) */}
          {!isInitialStreaming && loadedExpansions > 0 && loadedExpansions < Object.keys(groupedCompositions).length && (
            <div ref={loadMoreRef} className="infinite-scroll-trigger py-8">
              <div className="flex flex-col items-center justify-center">
                {isLoadingMore ? (
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 border-2 border-gray-600 border-t-blue-400 rounded-full animate-spin"></div>
                    <span className="text-gray-400 text-sm">Loading more expansions...</span>
                  </div>
                ) : (
                  <div className="text-gray-500 text-sm">
                    Scroll down to load more expansions ({Object.keys(groupedCompositions).length - loadedExpansions} remaining)
                  </div>
                )}
              </div>
            </div>
          )}
          

        </div>
      </div>
    </div>
  );
}; 