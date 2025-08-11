import React, { useMemo } from 'react';
import { useChartData } from './hooks/useChartData';
import { useChartState } from './hooks/useChartState';
import { FilterBar } from '../FilterBar';
import { ChartTypeSelector } from './components/ChartTypeSelector';
import { ChartViewSelector } from './components/ChartViewSelector';
import { MobileAlert } from './components/MobileAlert';
// Inline skeletons are used instead of full-screen loader on this page
import { LineChart } from './charts/LineChart';
import { BarChart } from './charts/BarChart';
import { AreaChart } from './charts/AreaChart';
import { HeatmapChart } from './charts/HeatmapChart';
import { TreemapChart } from './charts/TreemapChart';
import './styles/MetaEvolutionPage.css';
import { ChartDescriptionPopover } from './components/ChartDescriptionPopover';
import SEO from '../SEO';
import { useFilterState } from '../FilterContext';
import { useSeasonLabel } from '../../hooks/useSeasonLabel';

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
  // Always keep header/filters visible; use inline skeleton overlay while loading
  const isLoading = loading;
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://whatthemeta.io';
  const { seasonLabel } = useSeasonLabel(filter.season_id);

  return (
    <div className="meta-evolution-page">
      <SEO 
        title={`Meta Evolution – ${seasonLabel} – What the Meta?`}
        description="Explore how the Mythic+ meta evolves across seasons with popularity, performance, and composition charts."
        keywords={[
          'World of Warcraft','WoW','Mythic+','meta evolution','spec popularity','class trends','composition trends','season trends','charts','analytics'
        ]}
        canonicalUrl="/meta-evolution"
        image="/og-image.jpg"
    structuredData={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: origin + '/' },
      { '@type': 'ListItem', position: 2, name: `Meta Evolution (${seasonLabel})`, item: origin + '/meta-evolution' }
          ]
        }}
      />

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

      <div className="chart-container-wrapper" style={{ position: 'relative' }}>
        {/* Skeleton loading overlay - non-blocking, dark themed */}
        {isLoading && (
          <div className="meta-skeleton-overlay">
            <div className="meta-skeleton-chart">
              <div className="meta-skeleton-axis" />
              <div className="meta-skeleton-bar" />
              <div className="meta-skeleton-bar wide" />
              <div className="meta-skeleton-bar" />
              <div className="meta-skeleton-grid">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="meta-skeleton-cell" />
                ))}
              </div>
            </div>
          </div>
        )}

        <div key={activeChart} className="chart-fade">
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
      </div>
    </div>
  );
}; 