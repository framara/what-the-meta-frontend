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

      <div className="page-header">
        <h1 className="page-title">Meta Evolution</h1>
        <p className="page-description">
          Explore how the Mythic+ meta has evolved—track spec popularity, class trends, and team compositions across every season.
        </p>
      </div>
      
      <ChartControls
        seasons={seasons}
        selectedSeason={selectedSeason}
        setSelectedSeason={setSelectedSeason}
        loading={loading}
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
          >
            {isMobile ? '📚' : 'All'}
          </button>
          <button 
            className={`chart-view-button ${chartView === 'tank' ? 'active' : ''}`} 
            onClick={() => setChartView('tank')} 
            title="Tank"
          >
            {isMobile ? '🛡️' : 'Tank'}
          </button>
          <button 
            className={`chart-view-button ${chartView === 'healer' ? 'active' : ''}`} 
            onClick={() => setChartView('healer')} 
            title="Healer"
          >
            {isMobile ? '💚' : 'Healer'}
          </button>
          <button 
            className={`chart-view-button ${chartView === 'dps' ? 'active' : ''}`} 
            onClick={() => setChartView('dps')} 
            title="DPS"
          >
            {isMobile ? '⚔️' : 'DPS'}
          </button>
          <button 
            className={`chart-view-button ${chartView === 'melee' ? 'active' : ''}`} 
            onClick={() => setChartView('melee')} 
            title="Melee"
          >
            {isMobile ? '🗡️' : 'Melee'}
          </button>
          <button 
            className={`chart-view-button ${chartView === 'ranged' ? 'active' : ''}`} 
            onClick={() => setChartView('ranged')} 
            title="Ranged"
          >
            {isMobile ? '🔥' : 'Ranged'}
          </button>
        </div>
        <div className="button-group chart-type-toggle">
          <ChartTypeToggle activeChart={activeChart} setActiveChart={setActiveChart} />
        </div>
      </div>

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