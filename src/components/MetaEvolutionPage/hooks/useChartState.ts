import { useState, useEffect } from 'react';
import type { ChartView, ChartType } from '../types';

interface ChartSelections {
  chartView: ChartView;
  activeChart: ChartType;
}

export const useChartState = (seasonId?: number) => {
  // Get stored selections or use defaults
  const getStoredSelections = (): ChartSelections => {
    if (typeof window === 'undefined') {
      return { chartView: 'all', activeChart: 'line' };
    }
    
    try {
      const stored = localStorage.getItem('chart-selections');
      return stored ? JSON.parse(stored) : { chartView: 'all', activeChart: 'line' };
    } catch {
      return { chartView: 'all', activeChart: 'line' };
    }
  };

  const [chartView, setChartView] = useState<ChartView>(getStoredSelections().chartView);
  const [activeChart, setActiveChart] = useState<ChartType>(getStoredSelections().activeChart);
  const [chartLoading, setChartLoading] = useState(false);
  const [viewLoading, setViewLoading] = useState(false);
  const [treemapWeek, setTreemapWeek] = useState<number | null>(null);

  // Helper to detect mobile
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

  // Store selections in localStorage whenever they change
  const storeSelections = (selections: ChartSelections) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('chart-selections', JSON.stringify(selections));
      } catch (error) {
        console.warn('Failed to store chart selections:', error);
      }
    }
  };

  // Reset selections when season changes
  useEffect(() => {
    if (seasonId) {
      const stored = getStoredSelections();
      setChartView(stored.chartView);
      setActiveChart(stored.activeChart);
    }
  }, [seasonId]);

  const handleChartTypeChange = (newChartType: ChartType) => {
    if (activeChart !== newChartType) {
      setChartLoading(true);
      setActiveChart(newChartType);
      storeSelections({ chartView, activeChart: newChartType });
      setTimeout(() => setChartLoading(false), 400);
    }
  };

  const handleChartViewChange = (newChartView: ChartView) => {
    if (chartView !== newChartView) {
      setViewLoading(true);
      setChartView(newChartView);
      storeSelections({ chartView: newChartView, activeChart });
      setTimeout(() => setViewLoading(false), 300);
    }
  };

  return {
    chartView,
    setChartView: handleChartViewChange,
    activeChart,
    setActiveChart: handleChartTypeChange,
    chartLoading,
    viewLoading,
    setChartLoading,
    treemapWeek,
    setTreemapWeek,
    isMobile,
  };
}; 