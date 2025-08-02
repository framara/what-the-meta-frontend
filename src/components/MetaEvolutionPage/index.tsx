import React, { useMemo } from 'react';
import { useChartData } from './hooks/useChartData';
import { useChartState } from './hooks/useChartState';
import { FilterBar } from '../FilterBar';
import { ChartTypeSelector } from './components/ChartTypeSelector';
import { ChartViewSelector } from './components/ChartViewSelector';
import { MobileAlert } from './components/MobileAlert';
import LoadingScreen from '../LoadingScreen';
import { LineChart } from './charts/LineChart';
import { BarChart } from './charts/BarChart';
import { AreaChart } from './charts/AreaChart';
import { HeatmapChart } from './charts/HeatmapChart';
import { TreemapChart } from './charts/TreemapChart';
import './styles/MetaEvolutionPage.css';
import { ChartDescriptionPopover } from './components/ChartDescriptionPopover';
import { useFilterState } from '../FilterContext';

export const MetaEvolutionPage: React.FC = () => {
  const filter = useFilterState();
  const { charts, loading } = useChartData();
  const { 
    chartView, 
    setChartView, 
    activeChart, 
    setActiveChart, 
    chartLoading, 
    viewLoading,
    treemapWeek, 
    setTreemapWeek, 
    isMobile 
  } = useChartState(filter.season_id);

  // Get all specs for treemap
  const allSpecs = useMemo(() => {
    const allSpecsSet = new Set<number>();
    Object.values(charts).forEach(chart => {
      chart.topSpecs.forEach(specId => allSpecsSet.add(specId));
    });
    return Array.from(allSpecsSet);
  }, [charts]);

  const currentChart = charts[chartView];

  // Only show full loading screen for initial load, not for data updates
  const shouldShowLoading = loading && !currentChart.data.length;
  
  // Show skeleton loading for data updates
  const shouldShowSkeleton = loading && currentChart.data.length > 0;

  return (
    <div className="meta-evolution-page">

      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">
            Meta Evolution
          </h1>
          <div className="description-container" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <p className="page-description">
              Explore how the Mythic+ meta has evolved—track spec popularity, class trends, and team compositions across every season.
            </p>
            <ChartDescriptionPopover />
          </div>
        </div>
      </div>
      
      <FilterBar 
        showExpansion={false}
        showPeriod={false}
        showDungeon={false}
        showLimit={false}
        className="meta-evolution-filter"
      />

      {/* Mobile Alert - Charts recommended for desktop */}
      {isMobile && <MobileAlert />}

      {/* Chart View Selector and Chart Type Toggle in one row */}
      <div className="chart-controls-row" style={{ display: 'flex', gap: '2rem', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <ChartViewSelector
          chartView={chartView}
          setChartView={setChartView}
          isMobile={isMobile}
          loading={loading}
        />
        <div className="button-group chart-type-toggle">
          <ChartTypeSelector activeChart={activeChart} setActiveChart={setActiveChart} loading={loading} />
        </div>
      </div>

      {shouldShowLoading ? (
        <LoadingScreen />
      ) : (
        <div className="chart-container-wrapper" style={{ position: 'relative' }}>
          {/* Skeleton loading overlay */}
          {shouldShowSkeleton && (
            <div 
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10,
                borderRadius: '8px'
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <div className="loading-spinner" style={{ margin: '0 auto 1rem' }}></div>
                <p style={{ color: '#666', fontSize: '0.9rem' }}>Updating chart data...</p>
              </div>
            </div>
          )}
          
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
        </div>
      )}
    </div>
  );
}; 