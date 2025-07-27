import { useState } from 'react';
import type { ChartView, ChartType } from '../types';

export const useChartState = () => {
  const [chartView, setChartView] = useState<ChartView>('all');
  const [activeChart, setActiveChart] = useState<ChartType>('line');
  const [chartLoading, setChartLoading] = useState(false);
  const [treemapWeek, setTreemapWeek] = useState<number | null>(null);

  // Helper to detect mobile
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

  const handleChartTypeChange = (newChartType: ChartType) => {
    if (activeChart !== newChartType) {
      setChartLoading(true);
      setActiveChart(newChartType);
      setTimeout(() => setChartLoading(false), 400);
    }
  };

  return {
    chartView,
    setChartView,
    activeChart,
    setActiveChart: handleChartTypeChange,
    chartLoading,
    setChartLoading,
    treemapWeek,
    setTreemapWeek,
    isMobile,
  };
}; 