import React, { useState, useEffect } from 'react';
import { FilterBar } from '../FilterBar';
import { MobileAlert } from '../MetaEvolutionPage/components/MobileAlert';
import LoadingScreen from '../LoadingScreen';
import { ChartDescriptionPopover } from '../MetaEvolutionPage/components/ChartDescriptionPopover';
import { useFilterState } from '../FilterContext';
import { useRaceBarsData } from './hooks/useRaceBarsData';
import { RaceBars } from './components/RaceBars';
import type { ChartView } from '../MetaEvolutionPage/types';
import './styles/RaceBarsPage.css';

export const RaceBarsPage: React.FC = () => {
  const filter = useFilterState();
  
  // Race bars specific state
  const [currentPeriodIndex, setCurrentPeriodIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [racerInstance, setRacerInstance] = useState<unknown>(null);
  const [chartView, setChartView] = useState<ChartView>('all');

  // Mobile detection
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

  // Fetch race bars data
  const raceBarsData = useRaceBarsData(filter.expansion_id, filter.season_id, chartView);

  // Reset to first period when data changes
  useEffect(() => {
    setCurrentPeriodIndex(0);
    setIsPlaying(false);
  }, [raceBarsData.season_id]);

  const handlePeriodChange = (index: number) => {
    setCurrentPeriodIndex(index);
    
    // Control the racing-bars library
    if (racerInstance && typeof racerInstance === 'object' && racerInstance !== null) {
      try {
        console.log('🎮 Manual navigation to index:', index);
        const racerWithMethods = racerInstance as { getAllDates: () => string[]; setDate: (date: string) => void };
        const allDates = racerWithMethods.getAllDates();
        if (allDates && allDates[index]) {
          racerWithMethods.setDate(allDates[index]);
        }
      } catch (error) {
        console.error('Error navigating racing-bars:', error);
      }
    }
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleChartViewChange = (newChartView: ChartView) => {
    setChartView(newChartView);
  };

  // Show loading for initial page load
  const shouldShowLoading = raceBarsData.loading;

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
            chartView={chartView}
            onPeriodChange={handlePeriodChange}
            onPlayPause={handlePlayPause}
            isPlaying={isPlaying}
            setChartView={handleChartViewChange}
            isMobile={isMobile}
            onRacerReady={setRacerInstance}
          />
        </div>
      )}
    </div>
  );
}; 