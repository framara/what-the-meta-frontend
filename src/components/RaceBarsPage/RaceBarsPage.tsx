import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FilterBar } from '../FilterBar';
import { MobileAlert } from '../MetaEvolutionPage/components/MobileAlert';
// Inline skeleton overlays are used instead of a full-screen loader
import { ChartDescriptionPopover } from '../MetaEvolutionPage/components/ChartDescriptionPopover';
import { useFilterState } from '../FilterContext';
import { useRaceBarsData } from './hooks/useRaceBarsData';
import { RaceBars } from './components/RaceBars';
import type { ChartView } from '../MetaEvolutionPage/types';
import './styles/RaceBarsPage.css';
import SEO from '../SEO';
import { useSeasonLabel } from '../../hooks/useSeasonLabel';

export const RaceBarsPage: React.FC = () => {
  const filter = useFilterState();
  const { seasonLabel } = useSeasonLabel(filter.season_id);
  
  // Race bars specific state
  const [currentPeriodIndex, setCurrentPeriodIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [racerInstance, setRacerInstance] = useState<unknown>(null);
  const [chartView, setChartView] = useState<ChartView>('all');

  // Memoize mobile detection to prevent recalculation on every render
  const isMobile = useMemo(() => {
    return typeof window !== 'undefined' && window.innerWidth <= 768;
  }, []);

  // Fetch race bars data
  const raceBarsData = useRaceBarsData(filter.expansion_id, filter.season_id, chartView);

  // Reset to first period when data changes - memoized callback
  const resetToFirstPeriod = useCallback(() => {
    setCurrentPeriodIndex(0);
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    resetToFirstPeriod();
  }, [raceBarsData.season_id, resetToFirstPeriod]);

  // Memoized period change handler
  const handlePeriodChange = useCallback((index: number) => {
    setCurrentPeriodIndex(index);
    
    // Control the racing-bars library
    if (racerInstance && typeof racerInstance === 'object' && racerInstance !== null) {
      try {
        const racerWithMethods = racerInstance as { getAllDates: () => string[]; setDate: (date: string) => void };
        const allDates = racerWithMethods.getAllDates();
        if (allDates && allDates[index]) {
          racerWithMethods.setDate(allDates[index]);
        }
      } catch (error) {
        console.error('Error navigating racing-bars:', error);
      }
    }
  }, [racerInstance]);

  // Memoized play/pause handler
  const handlePlayPause = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  // Memoized chart view change handler
  const handleChartViewChange = useCallback((newChartView: ChartView) => {
    setChartView(newChartView);
  }, []);

  // Memoized racer ready handler
  const handleRacerReady = useCallback((racer: unknown) => {
    setRacerInstance(racer);
  }, []);

  // Memoize loading state to prevent unnecessary re-renders
  const shouldShowLoading = useMemo(() => raceBarsData.loading, [raceBarsData.loading]);

  // Memoize error state
  const hasError = useMemo(() => !!raceBarsData.error, [raceBarsData.error]);

  // Memoize empty periods state
  const hasNoPeriods = useMemo(() => raceBarsData.periods.length === 0, [raceBarsData.periods.length]);

  // Memoize page header content to prevent re-renders
  const pageHeaderContent = useMemo(() => (
    <div className="page-header">
      <div className="header-content">
        <h1 className="page-title">
          Race Bars
        </h1>
        <div className="description-container" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <p className="page-description">
            Visualize class and spec popularity as animated race bars—see how the meta evolves over time with dynamic comparisons.
          </p>
          <ChartDescriptionPopover />
        </div>
      </div>
    </div>
  ), []);

  // Memoize filter bar props
  const filterBarProps = useMemo(() => ({
    showExpansion: false,
    showPeriod: false,
    showDungeon: false,
    showLimit: false,
    className: "race-bars-filter"
  }), []);

  // Memoize error content
  const errorContent = useMemo(() => (
    <div className="race-bars-content">
      <div className="error-container">
        <h3 className="error-title">Error Loading Data</h3>
        <p className="error-message">{raceBarsData.error}</p>
      </div>
    </div>
  ), [raceBarsData.error]);

  // Memoize coming soon content
  const comingSoonContent = useMemo(() => (
    <div className="race-bars-content">
      <div className="coming-soon-container">
        <div className="coming-soon-content">
          <h2 className="coming-soon-title">🏁 Race Bars Coming Soon!</h2>
          <p className="coming-soon-description">
            Animated race bars showing class and spec popularity evolution over time. 
            Watch the meta race unfold with dynamic visualizations!
          </p>
          <div className="features-preview">
            <div className="feature-item">
              <span className="feature-icon">📊</span>
              <span>Animated popularity bars</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">⏱️</span>
              <span>Time-based evolution</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🏆</span>
              <span>Competitive rankings</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  ), []);

  // Memoize race bars content
  const raceBarsContent = useMemo(() => (
    <div className="race-bars-content">
      <RaceBars
        periods={raceBarsData.periods}
        currentPeriodIndex={currentPeriodIndex}
        chartView={chartView}
        onPeriodChange={handlePeriodChange}
        onPlayPause={handlePlayPause}
        isPlaying={isPlaying}
        setChartView={handleChartViewChange}
        isMobile={isMobile}
        onRacerReady={handleRacerReady}
      />
    </div>
  ), [
    raceBarsData.periods,
    currentPeriodIndex,
    chartView,
    handlePeriodChange,
    handlePlayPause,
    isPlaying,
    handleChartViewChange,
    isMobile,
    handleRacerReady
  ]);

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://whatthemeta.io';

  return (
    <div className="race-bars-page">
      <SEO
  title={`Race Bars – ${seasonLabel} – What the Meta?`}
        description="Animated race charts showing spec popularity over time for Mythic+ runs."
        keywords={['WoW','Mythic+','race bars','animated charts','spec popularity','time series','leaderboard']}
        canonicalUrl="/race-bars"
        image="/og-image.jpg"
    structuredData={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: origin + '/' },
      { '@type': 'ListItem', position: 2, name: `Race Bars (${seasonLabel})`, item: origin + '/race-bars' }
          ]
        }}
      />
      {pageHeaderContent}
      
      <FilterBar {...filterBarProps} />

      {/* Mobile Alert - Charts recommended for desktop */}
      {isMobile && <MobileAlert />}

      <div className="race-bars-content" style={{ position: 'relative' }}>
        {shouldShowLoading && (
          <div className="rb-skeleton-overlay">
            <div className="rb-skeleton">
              <div className="rb-skeleton-axis" />
              <div className="rb-skeleton-track" />
              <div className="rb-skeleton-bars">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="rb-skeleton-bar" />)
                )}
              </div>
            </div>
          </div>
        )}

        {hasError ? (
        errorContent
      ) : hasNoPeriods ? (
        comingSoonContent
      ) : (
        <div className="rb-fade">{raceBarsContent}</div>
      )}
      </div>
    </div>
  );
}; 