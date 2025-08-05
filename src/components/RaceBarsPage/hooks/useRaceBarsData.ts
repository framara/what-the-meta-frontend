import { useState, useEffect, useCallback, useMemo } from 'react';
import { fetchSpecEvolution } from '../../../services/api';
import { 
  WOW_SPECIALIZATIONS, 
  WOW_SPEC_TO_CLASS, 
  WOW_CLASS_COLORS, 
  WOW_CLASS_NAMES, 
  WOW_SPEC_ROLES, 
  WOW_MELEE_SPECS, 
  WOW_RANGED_SPECS, 
  WOW_SEASONS_PER_EXPANSION, 
  WOW_SPEC_COLORS 
} from '../../../constants/wow-constants';
import type { SpecData, PeriodData, RaceBarsData } from '../types/types';

type ChartView = 'all' | 'tank' | 'healer' | 'dps' | 'melee' | 'ranged';

interface SeasonData {
  season_id: number;
  expansion_id: number;
  expansion_name: string;
  season_name: string;
  evolution: Array<{
    period_id: number;
    week: number;
    period_label: string;
    spec_counts: Record<string, number>;
  }>;
}

interface ApiResponse {
  seasons: SeasonData[];
}

// Global cache for API responses
const dataCache = new Map<string, { data: ApiResponse; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Memoized helper function to get season IDs based on filters
const getSeasonIdsFromFilters = (
  expansion_id?: number, 
  season_id?: number, 
  availableSeasons?: number[]
): number[] => {
  // If we have a specific season_id, check if it exists in available seasons
  if (season_id && availableSeasons?.includes(season_id)) {
    return [season_id];
  }

  // If expansion is "all" (undefined), include all available seasons
  if (!expansion_id) {
    return availableSeasons || [];
  }

  // If expansion is specific but season is "all" (undefined), get all seasons for that expansion
  if (expansion_id && !season_id) {
    const expectedSeasons = WOW_SEASONS_PER_EXPANSION[expansion_id] || [];
    return expectedSeasons.filter(seasonId => availableSeasons?.includes(seasonId) || false);
  }

  // If both expansion and season are specific, return just that season if it exists
  if (expansion_id && season_id) {
    return availableSeasons?.includes(season_id) ? [season_id] : [];
  }

  return [];
};

// Memoized helper function to filter specs based on chart view
const filterSpecsByChartView = (specs: SpecData[], chartView: ChartView): SpecData[] => {
  if (chartView === 'all') {
    return specs;
  }

  return specs.filter(spec => {
    const role = WOW_SPEC_ROLES[spec.spec_id];
    
    switch (chartView) {
      case 'tank':
        return role === 'tank';
      case 'healer':
        return role === 'healer';
      case 'dps':
        return role === 'dps';
      case 'melee':
        return WOW_MELEE_SPECS.has(spec.spec_id);
      case 'ranged':
        return WOW_RANGED_SPECS.has(spec.spec_id);
      default:
        return true;
    }
  });
};

export const useRaceBarsData = (
  expansion_id?: number, 
  season_id?: number, 
  chartView: ChartView = 'all'
): RaceBarsData => {
  const [allData, setAllData] = useState<ApiResponse | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  const [data, setData] = useState<RaceBarsData>({
    season_id: 0,
    periods: [],
    loading: true,
    error: null
  });

  // Memoize available season IDs to prevent recalculation
  const availableSeasonIds = useMemo(() => {
    return allData?.seasons.map((s: SeasonData) => s.season_id) || [];
  }, [allData]);

  // Memoize season IDs based on filters
  const seasonIds = useMemo(() => {
    return getSeasonIdsFromFilters(expansion_id, season_id, availableSeasonIds);
  }, [expansion_id, season_id, availableSeasonIds]);

  // Memoized function to process a single period
  const processPeriod = useCallback((period: any, season: SeasonData): PeriodData => {
    const specEntries = Object.entries(period.spec_counts);
    const totalCount = specEntries.reduce((sum, [, count]) => sum + (count as number), 0);
    
    const specs: SpecData[] = specEntries
      .map(([specId, count]) => {
        const spec_id = parseInt(specId);
        const class_id = WOW_SPEC_TO_CLASS[spec_id];
        
        return {
          spec_id,
          spec_name: WOW_SPECIALIZATIONS[spec_id] || `Spec ${spec_id}`,
          class_id,
          class_name: WOW_CLASS_NAMES[class_id] || `Class ${class_id}`,
          class_color: WOW_SPEC_COLORS[spec_id] || WOW_CLASS_COLORS[class_id] || '#666666',
          count: count as number,
          percentage: totalCount > 0 ? ((count as number) / totalCount) * 100 : 0
        };
      })
      .sort((a, b) => b.count - a.count);
    
    // Filter specs based on chart view
    const filteredSpecs = filterSpecsByChartView(specs, chartView);
    
    // Recalculate total count and percentages for filtered specs
    const filteredTotalCount = filteredSpecs.reduce((sum, spec) => sum + spec.count, 0);
    const filteredSpecsWithRecalculatedPercentages = filteredSpecs.map(spec => ({
      ...spec,
      percentage: filteredTotalCount > 0 ? (spec.count / filteredTotalCount) * 100 : 0
    }));
    
    return {
      period_id: period.period_id,
      period_name: period.period_name,
      period_label: period.period_label,
      expansion_id: season.expansion_id,
      expansion_name: season.expansion_name,
      season_id: season.season_id,
      season_name: season.season_name,
      specs: filteredSpecsWithRecalculatedPercentages,
      total_count: filteredTotalCount
    };
  }, [chartView]);

  // Memoized function to determine actual season ID
  const determineActualSeasonId = useCallback((filteredPeriods: PeriodData[], seasonIds: number[]): number => {
    if (seasonIds.length === 1) {
      return seasonIds[0];
    } else if (filteredPeriods.length > 0 && allData) {
      // When we have multiple seasons, find which season the first period belongs to
      const firstPeriodId = filteredPeriods[0].period_id;
      
      // Find which season contains this period
      for (const season of allData.seasons) {
        const periodExists = season.evolution.some((period) => period.period_id === firstPeriodId);
        if (periodExists) {
          return season.season_id;
        }
      }
    }
    return 0;
  }, [allData]);

  // Optimized data fetching with caching
  const fetchData = useCallback(async () => {
    try {
      // Check cache first
      const cacheKey = `spec-evolution-${season_id || 'all'}`;
      const cached = dataCache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        setAllData(cached.data);
        setIsInitialLoad(false);
        return;
      }

      // Fetch new data
      const response = await fetchSpecEvolution(season_id);
      
      // Transform single season response to multi-season format for consistency
      const transformedResponse: ApiResponse = {
        seasons: [{
          season_id: response.season_id,
          expansion_id: response.expansion_id || 10, // Default to The War Within
          expansion_name: response.expansion_name || 'The War Within',
          season_name: response.season_name,
          evolution: response.evolution.map(period => ({
            period_id: period.period_id,
            week: period.week,
            period_label: period.period_label,
            spec_counts: period.spec_counts
          }))
        }]
      };

      // Cache the response
      dataCache.set(cacheKey, { data: transformedResponse, timestamp: Date.now() });
      
      setAllData(transformedResponse);
      setIsInitialLoad(false);
    } catch (error) {
      console.error('Error fetching race bars data:', error);
      setData(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch data' 
      }));
      setIsInitialLoad(false);
    }
  }, [season_id]);

  // Fetch data when season_id changes
  useEffect(() => {
    if (season_id) {
      fetchData();
    }
  }, [season_id, fetchData]);

  // Process and filter data based on current filters - optimized with useMemo
  const processedData = useMemo(() => {
    // If we're still loading and this is the initial load, return loading state
    if (isInitialLoad && !allData) {
      return {
        season_id: 0,
        periods: [],
        loading: true,
        error: null
      };
    }
    
    // If no data available, return error state
    if (!allData) {
      return {
        season_id: 0,
        periods: [],
        loading: false,
        error: 'No data available'
      };
    }
    
    // If no seasons are selected, return error state
    if (seasonIds.length === 0) {
      return {
        season_id: 0,
        periods: [],
        loading: false,
        error: 'No seasons selected'
      };
    }

    try {
      // Filter the data based on current filters
      const filteredPeriods: PeriodData[] = [];
      
      // Process each season that matches our filter criteria
      allData.seasons.forEach((season: SeasonData) => {
        // Check if this season is in our selected season IDs
        if (seasonIds.includes(season.season_id)) {
          // Process each period in this season
          season.evolution.forEach((period) => {
            const processedPeriod = processPeriod(period, season);
            filteredPeriods.push(processedPeriod);
          });
        }
      });

      // Sort periods by period_id to maintain chronological order
      filteredPeriods.sort((a, b) => a.period_id - b.period_id);

      // Determine the actual season_id for the current data
      const actualSeasonId = determineActualSeasonId(filteredPeriods, seasonIds);

      return {
        season_id: actualSeasonId,
        periods: filteredPeriods,
        loading: false,
        error: null
      };
    } catch (error) {
      console.error('Error processing race bars data:', error);
      return {
        season_id: 0,
        periods: [],
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to process data'
      };
    }
  }, [allData, seasonIds, processPeriod, determineActualSeasonId, isInitialLoad]);

  // Update data when processed data changes
  useEffect(() => {
    setData(processedData);
  }, [processedData]);

  return data;
}; 