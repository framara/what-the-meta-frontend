import React, { useMemo } from 'react';
import { useChartData } from './hooks/useChartData';
import { useChartState } from './hooks/useChartState';
import { FilterBar } from '../FilterBar';
import { ChartTypeToggle } from './components/ChartTypeToggle';
import { MobileAlert } from './components/MobileAlert';
import LoadingScreen from '../LoadingScreen';
import { LineChart } from './charts/LineChart';
import { BarChart } from './charts/BarChart';
import { AreaChart } from './charts/AreaChart';
import { HeatmapChart } from './charts/HeatmapChart';
import { TreemapChart } from './charts/TreemapChart';
import './styles/MetaEvolutionPage.css';
import { ChartDescriptionPopover } from './components/ChartDescriptionPopover';

export const MetaEvolutionPage: React.FC = () => {
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

  // Show loading for initial page load or when changing chart views
  const shouldShowLoading = loading || viewLoading || chartLoading;

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
        showPeriod={false}
        showDungeon={false}
        showLimit={false}
        className="meta-evolution-filter"
      />

      {/* Mobile Alert - Charts recommended for desktop */}
      {isMobile && <MobileAlert />}

      {/* Chart View Selector and Chart Type Toggle in one row */}
      <div className="chart-controls-row" style={{ display: 'flex', gap: '2rem', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div className="button-group chart-view-selector">
          <button 
            className={`chart-view-button ${chartView === 'all' ? 'active' : ''}`} 
            onClick={() => setChartView('all')} 
            title="All"
            disabled={shouldShowLoading}
          >
            {isMobile ? '📚' : 'All'}
          </button>
          <button 
            className={`chart-view-button ${chartView === 'tank' ? 'active' : ''}`} 
            onClick={() => setChartView('tank')} 
            title="Tank"
            disabled={shouldShowLoading}
          >
            {isMobile ? '🛡️' : 'Tank'}
          </button>
          <button 
            className={`chart-view-button ${chartView === 'healer' ? 'active' : ''}`} 
            onClick={() => setChartView('healer')} 
            title="Healer"
            disabled={shouldShowLoading}
          >
            {isMobile ? '💚' : 'Healer'}
          </button>
          <button 
            className={`chart-view-button ${chartView === 'dps' ? 'active' : ''}`} 
            onClick={() => setChartView('dps')} 
            title="DPS"
            disabled={shouldShowLoading}
          >
            {isMobile ? '⚔️' : 'DPS'}
          </button>
          <button 
            className={`chart-view-button ${chartView === 'melee' ? 'active' : ''}`} 
            onClick={() => setChartView('melee')} 
            title="Melee"
            disabled={shouldShowLoading}
          >
            {isMobile ? '🗡️' : 'Melee'}
          </button>
          <button 
            className={`chart-view-button ${chartView === 'ranged' ? 'active' : ''}`} 
            onClick={() => setChartView('ranged')} 
            title="Ranged"
            disabled={shouldShowLoading}
          >
            {isMobile ? '🔥' : 'Ranged'}
          </button>
        </div>
        <div className="button-group chart-type-toggle">
          <ChartTypeToggle activeChart={activeChart} setActiveChart={setActiveChart} loading={shouldShowLoading} />
        </div>
      </div>

      {shouldShowLoading ? (
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