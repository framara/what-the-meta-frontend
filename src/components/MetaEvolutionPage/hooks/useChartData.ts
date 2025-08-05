import { useState, useEffect, useCallback, useMemo } from 'react';
import { fetchSpecEvolution } from '../../../services/api';
import { processSpecEvolutionData } from '../utils/dataProcessing';
import type { ChartDataState, SpecEvolutionData } from '../types';
import { useFilterState } from '../../FilterContext';

// Cache for processed chart data
const chartDataCache = new Map<number, ChartDataState>();
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

  // Memoized fetch function with caching
  const fetchChartData = useCallback(async (seasonId: number) => {
    // Check cache first
    const cached = chartDataCache.get(seasonId);
    if (cached) {
      setCharts(cached);
      return;
    }

    setLoading(true);
    
    try {
      const data: SpecEvolutionData = await fetchSpecEvolution(seasonId);
      const processedData = processSpecEvolutionData(data);
      
      // Cache the processed data
      chartDataCache.set(seasonId, processedData);
      
      setCharts(processedData);
    } catch (err) {
      console.error('Error fetching spec evolution:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch spec evolution when season changes
  useEffect(() => {
    if (!filter.season_id) return;
    
    fetchChartData(filter.season_id);
  }, [filter.season_id, fetchChartData]);

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