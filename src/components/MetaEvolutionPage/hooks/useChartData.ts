import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { fetchSeasons, fetchSpecEvolution } from '../../../services/api';
import { processSpecEvolutionData } from '../utils/dataProcessing';
import type { ChartDataState, SpecEvolutionData } from '../types';
import { useFilterState, useFilterDispatch } from '../../FilterContext';
// lazy toast usage

// Cache for processed chart data
const chartDataCache = new Map<string, ChartDataState>();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

export const useChartData = () => {
  const [charts, setCharts] = useState<ChartDataState>({
    all: { data: [], topSpecs: [] },
    tank: { data: [], topSpecs: [] },
    healer: { data: [], topSpecs: [] },
    dps: { data: [], topSpecs: [] },
    melee: { data: [], topSpecs: [] },
    ranged: { data: [], topSpecs: [] },
  });
  
  const [loading, setLoading] = useState(false);
  const filter = useFilterState();
  const dispatch = useFilterDispatch();
  const fallbackTriedRef = useRef<number | null>(null);

  // Memoized fetch function with caching - now includes filter parameters
  const fetchChartData = useCallback(async (seasonId: number, periodId?: number, dungeonId?: number) => {
    // Create cache key that includes all filter parameters
    const cacheKey = `${seasonId}-${periodId || 'all'}-${dungeonId || 'all'}`;
    
    // Check cache first
    const cached = chartDataCache.get(cacheKey);
    if (cached) {
      setCharts(cached);
      return;
    }

    setLoading(true);
    
    try {
      const params = {
        ...(periodId && { period_id: periodId }),
        ...(dungeonId && { dungeon_id: dungeonId })
      };
      
      const data: SpecEvolutionData = await fetchSpecEvolution(seasonId, Object.keys(params).length > 0 ? params : undefined);
      const processedData = processSpecEvolutionData(data);
      
      // Cache the processed data with the new cache key
      chartDataCache.set(cacheKey, processedData);
      
      setCharts(processedData);
    } catch (err: unknown) {
      console.error('Error fetching spec evolution:', err);
      const status = (typeof err === 'object' && err !== null && 'response' in err)
        ? (err as any).response?.status
        : undefined;
      // If latest season has no data yet, backend returns 404. Fallback once to previous season.
      if (status === 404 && fallbackTriedRef.current !== seasonId) {
        try {
          const seasons = await fetchSeasons();
          const sorted = [...seasons].sort((a: any, b: any) => b.season_id - a.season_id);
          const idx = sorted.findIndex((s: any) => s.season_id === seasonId);
          const prev = idx >= 0 ? sorted[idx + 1] : null;
          if (prev?.season_id) {
            const latest = sorted[0];
            const latestLabel = latest?.season_name || `Season ${seasonId}`;
            import('react-hot-toast').then(m => {
              const t: any = (m as any).default || (m as any).toast || m;
              t.dismiss?.('season-fallback');
              t.success?.(`${latestLabel} has not started yet. Showing previous season instead.`, { id: 'season-fallback' });
            }).catch(() => {});
            fallbackTriedRef.current = seasonId;
            dispatch({ type: 'SET_SEASON', season_id: prev.season_id });
          }
        } catch (e) {
          // ignore secondary errors; keep original
        }
      }
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  // Fetch spec evolution when season or filters change
  useEffect(() => {
    if (!filter.season_id) return;
    
    fetchChartData(filter.season_id, filter.period_id, filter.dungeon_id);
  }, [filter.season_id, filter.period_id, filter.dungeon_id, fetchChartData]);

  // Reset fallback guard when the selected season changes explicitly
  useEffect(() => {
    fallbackTriedRef.current = null;
  }, [filter.season_id]);

  // Clean up old cache entries periodically
  useEffect(() => {
    const cleanupCache = () => {
      const now = Date.now();
      for (const [key, value] of chartDataCache.entries()) {
        // Remove entries older than cache duration
        if (now - (value as any).timestamp > CACHE_DURATION) {
          chartDataCache.delete(key);
        }
      }
    };

    const interval = setInterval(cleanupCache, CACHE_DURATION);
    return () => clearInterval(interval);
  }, []);

  return {
    charts,
    loading,
  };
}; 