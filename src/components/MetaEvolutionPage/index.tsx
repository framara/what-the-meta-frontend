import React, { useMemo } from 'react';
import { useChartData } from './hooks/useChartData';
import { useChartState } from './hooks/useChartState';
import { ChartControls } from './components/ChartControls';
import { ChartTypeToggle } from './components/ChartTypeToggle';
import { MobileAlert } from './components/MobileAlert';
import { LoadingScreen } from './components/LoadingScreen';
import { LineChart } from './charts/LineChart';
import { BarChart } from './charts/BarChart';
import { AreaChart } from './charts/AreaChart';
import { HeatmapChart } from './charts/HeatmapChart';
import { TreemapChart } from './charts/TreemapChart';
import '../styles/MetaEvolutionPage.css';

export const MetaEvolutionPage: React.FC = () => {
  const { charts, seasons, selectedSeason, setSelectedSeason, loading } = useChartData();
  const { 
    chartView, 
    setChartView, 
    activeChart, 
    setActiveChart, 
    chartLoading, 
    treemapWeek, 
    setTreemapWeek, 
    isMobile 
  } = useChartState();

  // Get all specs for treemap
  const allSpecs = useMemo(() => {
    const allSpecsSet = new Set<number>();
    Object.values(charts).forEach(chart => {
      chart.topSpecs.forEach(specId => allSpecsSet.add(specId));
    });
    return Array.from(allSpecsSet);
  }, [charts]);

  const currentChart = charts[chartView];

  return (
    <div className="meta-evolution-page">
      <ChartControls
        seasons={seasons}
        selectedSeason={selectedSeason}
        setSelectedSeason={setSelectedSeason}
        chartView={chartView}
        setChartView={setChartView}
        loading={loading}
        isMobile={isMobile}
      />

      {/* Mobile Alert - Charts recommended for desktop */}
      {isMobile && <MobileAlert />}

      {/* Chart Type Toggle */}
      <ChartTypeToggle activeChart={activeChart} setActiveChart={setActiveChart} />

      {chartLoading ? (
        <LoadingScreen />
      ) : (
        <>
          {activeChart === 'line' && (
            <LineChart 
              data={currentChart.data} 
              topSpecs={currentChart.topSpecs} 
              isMobile={isMobile} 
            />
          )}
          {activeChart === 'bar' && (
            <BarChart 
              data={currentChart.data} 
              topSpecs={currentChart.topSpecs} 
              isMobile={isMobile} 
            />
          )}
          {activeChart === 'area' && (
            <AreaChart 
              data={currentChart.data} 
              topSpecs={currentChart.topSpecs} 
              isMobile={isMobile} 
            />
          )}
          {activeChart === 'heatmap' && (
            <HeatmapChart 
              data={currentChart.data} 
              topSpecs={currentChart.topSpecs} 
            />
          )}
          {activeChart === 'treemap' && (
            <TreemapChart 
              data={currentChart.data} 
              topSpecs={currentChart.topSpecs}
              treemapWeek={treemapWeek}
              setTreemapWeek={setTreemapWeek}
              chartView={chartView}
              allSpecs={allSpecs}
            />
          )}
        </>
      )}
    </div>
  );
}; 