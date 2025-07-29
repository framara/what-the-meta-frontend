import { useState, useEffect } from 'react';
import { fetchSpecEvolution } from '../../../services/api';
import { processSpecEvolutionData } from '../utils/dataProcessing';
import type { ChartDataState, SpecEvolutionData } from '../types';
import { useFilterState } from '../../FilterContext';

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

  // Fetch spec evolution when season changes
  useEffect(() => {
    if (!filter.season_id) return;
    
    setLoading(true);
    
    fetchSpecEvolution(filter.season_id)
      .then((data: SpecEvolutionData) => {
        const processedData = processSpecEvolutionData(data);
        setCharts(processedData);
      })
      .catch(err => {
        console.error('Error fetching spec evolution:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [filter.season_id]);

  return {
    charts,
    loading,
  };
}; 