import { useState, useEffect } from 'react';
import { fetchSpecEvolution, fetchSeasons } from '../../../services/api';
import { processSpecEvolutionData } from '../utils/dataProcessing';
import type { ChartDataState, Season, SpecEvolutionData } from '../types';

export const useChartData = () => {
  const [charts, setCharts] = useState<ChartDataState>({
    all: { data: [], topSpecs: [] },
    tank: { data: [], topSpecs: [] },
    healer: { data: [], topSpecs: [] },
    dps: { data: [], topSpecs: [] },
    melee: { data: [], topSpecs: [] },
    ranged: { data: [], topSpecs: [] },
  });
  
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch all seasons on mount (only if not already loaded)
  useEffect(() => {
    if (seasons.length > 0) return;
    
    fetchSeasons()
      .then(data => {
        const sorted = (data || []).sort((a, b) => b.season_id - a.season_id);
        setSeasons(sorted);
        if (sorted.length > 0) {
          setSelectedSeason(sorted[0].season_id);
        }
      })
      .catch(err => {
        console.error('Error fetching seasons:', err);
      });
  }, [seasons.length]);

  // Fetch spec evolution when season changes
  useEffect(() => {
    if (!selectedSeason) return;
    
    setLoading(true);
    
    fetchSpecEvolution(selectedSeason)
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
  }, [selectedSeason]);

  return {
    charts,
    seasons,
    selectedSeason,
    setSelectedSeason,
    loading,
  };
}; 