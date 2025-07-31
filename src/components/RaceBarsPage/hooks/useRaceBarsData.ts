import { useState, useEffect } from 'react';
import { fetchSpecEvolution } from '../../../services/api';
import { WOW_SPECIALIZATIONS, WOW_SPEC_TO_CLASS, WOW_CLASS_COLORS, WOW_CLASS_NAMES, WOW_EXPANSIONS, WOW_SPEC_ROLES, WOW_MELEE_SPECS, WOW_RANGED_SPECS } from '../../../constants/wow-constants';
import type { SpecData, PeriodData, RaceBarsData } from '../types';

interface FilterParams {
  expansion_id?: number;
  season_id?: number;
}

type ChartView = 'all' | 'tank' | 'healer' | 'dps' | 'melee' | 'ranged';

// Helper function to get season IDs based on filters
const getSeasonIdsFromFilters = (expansion_id?: number, season_id?: number): number[] => {
  // If expansion is "all" (undefined), include all seasons
  if (!expansion_id) {
    return WOW_EXPANSIONS
      .filter(expansion => expansion.seasons.length > 0)
      .flatMap(expansion => expansion.seasons);
  }

  // If expansion is specific but season is "all" (undefined), get all seasons for that expansion
  if (expansion_id && !season_id) {
    const expansion = WOW_EXPANSIONS.find(exp => exp.id === expansion_id);
    return expansion?.seasons || [];
  }

  // If both expansion and season are specific, return just that season
  if (expansion_id && season_id) {
    return [season_id];
  }

  return [];
};

// Helper function to filter specs based on chart view
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

export const useRaceBarsData = (expansion_id?: number, season_id?: number, chartView: ChartView = 'all'): RaceBarsData => {
  const [allData, setAllData] = useState<any>(null);
  
  const [data, setData] = useState<RaceBarsData>({
    season_id: 0,
    periods: [],
    loading: true,
    error: null
  });

  // Fetch all data once on mount
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setData(prev => ({ ...prev, loading: true, error: null }));
        
        // Fetch all spec evolution data
        const response = await fetchSpecEvolution(); // No seasonId = all data
        setAllData(response);
        
        setData(prev => ({ ...prev, loading: false }));
      } catch (error) {
        console.error('Error fetching all race bars data:', error);
        setData(prev => ({ 
          ...prev, 
          loading: false, 
          error: error instanceof Error ? error.message : 'Failed to fetch data' 
        }));
      }
    };

    fetchAllData();
  }, []); // Only fetch once on mount

  // Process and filter data based on current filters
  useEffect(() => {
    if (!allData) return;

    const seasonIds = getSeasonIdsFromFilters(expansion_id, season_id);
    
    if (seasonIds.length === 0) {
      setData(prev => ({ ...prev, periods: [], error: 'No seasons selected' }));
      return;
    }

    try {
      // Filter the data based on current filters
      const filteredPeriods: PeriodData[] = [];
      
      // Process each season that matches our filter criteria
      allData.seasons.forEach((season: any) => {
        // Check if this season is in our selected season IDs
        if (seasonIds.includes(season.season_id)) {
          // Process each period in this season
          season.evolution.forEach((period: any) => {
            const specEntries = Object.entries(period.spec_counts);
            const totalCount = specEntries.reduce((sum, [_, count]) => sum + (count as number), 0);
            
            const specs: SpecData[] = specEntries
              .map(([specId, count]) => {
                const spec_id = parseInt(specId);
                const class_id = WOW_SPEC_TO_CLASS[spec_id];
                
                return {
                  spec_id,
                  spec_name: WOW_SPECIALIZATIONS[spec_id] || `Spec ${spec_id}`,
                  class_id,
                  class_name: WOW_CLASS_NAMES[class_id] || `Class ${class_id}`,
                  class_color: WOW_CLASS_COLORS[class_id] || '#666666',
                  count: count as number,
                  percentage: totalCount > 0 ? ((count as number) / totalCount) * 100 : 0
                };
              })
              .sort((a, b) => (b.count as number) - (a.count as number)); // Sort by count descending
            
            // Filter specs based on chart view
            const filteredSpecs = filterSpecsByChartView(specs, chartView);
            
            // Recalculate total count and percentages for filtered specs
            const filteredTotalCount = filteredSpecs.reduce((sum, spec) => sum + spec.count, 0);
            const filteredSpecsWithRecalculatedPercentages = filteredSpecs.map(spec => ({
              ...spec,
              percentage: filteredTotalCount > 0 ? (spec.count / filteredTotalCount) * 100 : 0
            }));
            
            filteredPeriods.push({
              period_id: period.period_id,
              period_name: period.period_name,
              period_label: period.period_label,
              expansion_id: season.expansion_id,
              expansion_name: season.expansion_name,
              season_id: season.season_id,
              season_name: season.season_name,
              specs: filteredSpecsWithRecalculatedPercentages,
              total_count: filteredTotalCount
            });
          });
        }
      });

      // Sort periods by period_id to maintain chronological order
      filteredPeriods.sort((a, b) => a.period_id - b.period_id);

      // Determine the actual season_id for the current data
      let actualSeasonId = 0;
      if (seasonIds.length === 1) {
        actualSeasonId = seasonIds[0];
      } else if (filteredPeriods.length > 0) {
        // When we have multiple seasons, find which season the first period belongs to
        const firstPeriodId = filteredPeriods[0].period_id;
        
        // Find which season contains this period
        for (const season of allData.seasons) {
          const periodExists = season.evolution.some((period: any) => period.period_id === firstPeriodId);
          if (periodExists) {
            actualSeasonId = season.season_id;
            break;
          }
        }
      }

      setData({
        season_id: actualSeasonId,
        periods: filteredPeriods,
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Error processing race bars data:', error);
      setData(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Failed to process data' 
      }));
    }
  }, [allData, expansion_id, season_id, chartView]);

  return data;
}; 