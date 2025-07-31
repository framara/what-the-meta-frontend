import React, { useState, useEffect } from 'react';
import { useChartData } from '../MetaEvolutionPage/hooks/useChartData';
import { useChartState } from '../MetaEvolutionPage/hooks/useChartState';
import { FilterBar } from '../FilterBar';
import { ChartViewSelector } from '../MetaEvolutionPage/components/ChartViewSelector';
import { MobileAlert } from '../MetaEvolutionPage/components/MobileAlert';
import LoadingScreen from '../LoadingScreen';
import { ChartDescriptionPopover } from '../MetaEvolutionPage/components/ChartDescriptionPopover';
import { useFilterState } from '../FilterContext';
import { useRaceBarsData } from './hooks/useRaceBarsData';
import type { RaceBarsData } from './types';
import { RaceBars } from './components/RaceBars';
import { PeriodNavigation } from './components/PeriodNavigation';
import './styles/RaceBarsPage.css';

export const RaceBarsPage: React.FC = () => {
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

  // Race bars specific state
  const [currentPeriodIndex, setCurrentPeriodIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Fetch race bars data
  const raceBarsData = useRaceBarsData(filter.expansion_id, filter.season_id, chartView);

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying || raceBarsData.periods.length === 0) return;

    const interval = setInterval(() => {
      setCurrentPeriodIndex(prev => {
        if (prev >= raceBarsData.periods.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
      setIsAnimating(true);
      
             // Reset animation flag after animation completes
       setTimeout(() => setIsAnimating(false), 1500);
     }, 2000); // Change period every 2 seconds for smooth flow

    return () => clearInterval(interval);
  }, [isPlaying, raceBarsData.periods.length]);

  // Reset to first period when data changes
  useEffect(() => {
    setCurrentPeriodIndex(0);
    setIsPlaying(false);
  }, [raceBarsData.season_id]);

  const handlePeriodChange = (index: number) => {
    setCurrentPeriodIndex(index);
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 600);
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  // Show loading for initial page load or when changing chart views
  const shouldShowLoading = loading || viewLoading || chartLoading || raceBarsData.loading;

  return (
    <div className="race-bars-page">

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
      
      <FilterBar 
        showExpansion={true}
        showPeriod={false}
        showDungeon={false}
        showLimit={false}
        className="race-bars-filter"
      />

      {/* Mobile Alert - Charts recommended for desktop */}
      {isMobile && <MobileAlert />}

      

      {shouldShowLoading ? (
        <LoadingScreen />
      ) : raceBarsData.error ? (
        <div className="race-bars-content">
          <div className="error-container">
            <h3 className="error-title">Error Loading Data</h3>
            <p className="error-message">{raceBarsData.error}</p>
          </div>
        </div>
      ) : raceBarsData.periods.length === 0 ? (
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
                   ) : (
               <div className="race-bars-content">
                                   <RaceBars
                    periods={raceBarsData.periods}
                    currentPeriodIndex={currentPeriodIndex}
                    isAnimating={isAnimating}
                    chartView={chartView}
                    onPeriodChange={handlePeriodChange}
                    onPlayPause={handlePlayPause}
                    isPlaying={isPlaying}
                    setChartView={setChartView}
                    isMobile={isMobile}
                    expansionId={filter.expansion_id}
                    seasonId={filter.season_id}
                    actualSeasonId={raceBarsData.season_id}
                  />
               </div>
             )}
    </div>
  );
}; 