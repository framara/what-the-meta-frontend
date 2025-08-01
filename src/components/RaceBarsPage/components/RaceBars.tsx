import React, { useEffect, useMemo, useRef, useCallback } from 'react';
import { race } from 'racing-bars';
import type { PeriodData } from '../types';
import type { ChartView } from '../../MetaEvolutionPage/types';
import { PeriodNavigation } from './PeriodNavigation';
import { ChartViewSelector } from '../../MetaEvolutionPage/components/ChartViewSelector';
import './RaceBars.css';
import { WOW_HEALER_SPECS, WOW_MELEE_SPECS, WOW_RANGED_SPECS, WOW_TANK_SPECS } from '../../../constants/wow-constants';

interface RaceBarsProps {
  periods: PeriodData[];
  currentPeriodIndex: number;
  chartView?: ChartView;
  onPeriodChange: (index: number) => void;
  onPlayPause: () => void;
  isPlaying: boolean;
  setChartView: (view: ChartView) => void;
  isMobile: boolean;
  onRacerReady?: (racer: unknown) => void;
}

export const RaceBars: React.FC<RaceBarsProps> = ({ 
  periods, 
  currentPeriodIndex, 
  chartView = 'all' as ChartView,
  onPeriodChange,
  onPlayPause,
  isPlaying,
  setChartView,
  isMobile,
  onRacerReady
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const racerRef = useRef<unknown>(null);

  // Transform data for racing-bars library
  const racingBarsData = useMemo(() => {
    if (periods.length === 0) return [];
    
    const transformedData: Array<{
      date: string;
      value: number;
      name: string;
      color: string;
    }> = [];
    
    periods.forEach((period, periodIndex) => {
      // Create a dummy date that increments for each period
      const dummyDate = new Date(2020, 0, 1 + periodIndex);
      const dateString = dummyDate.toISOString().split('T')[0];
      
      period.specs.forEach(spec => {
        transformedData.push({
          date: dateString,
          value: spec.count,
          name: `${spec.spec_name} (${spec.class_name})`,
          color: spec.class_color, 
        });
      });
    });
    
    console.log('🔍 Racing bars data sample:', {
      totalEntries: transformedData.length,
      uniqueDates: [...new Set(transformedData.map(d => d.date))].length,
      sampleEntries: transformedData.slice(0, 6)
    });
    
    return transformedData;
  }, [periods]);

  // Stable callback for racer ready
  const handleRacerReady = useCallback((racer: unknown) => {
    if (onRacerReady) {
      onRacerReady(racer);
    }
  }, [onRacerReady]);

  // Initialize racing bars when data changes
  useEffect(() => {
    if (racingBarsData.length === 0 || !containerRef.current) return;

    const initRacingBars = async () => {
      if (!containerRef.current) return;
      
      try {
        const containerWidth = containerRef.current.offsetWidth;
        
        // Calculate topN based on chartView
        const getTopN = () => {
          switch (chartView) {
            case 'tank':
              return WOW_TANK_SPECS.size;
            case 'healer':
              return WOW_HEALER_SPECS.size;
            case 'dps':
              return WOW_MELEE_SPECS.size + WOW_RANGED_SPECS.size;
            case 'melee':
              return WOW_MELEE_SPECS.size;
            case 'ranged':
              return WOW_RANGED_SPECS.size;
            default:
              return WOW_MELEE_SPECS.size + WOW_RANGED_SPECS.size + WOW_TANK_SPECS.size + WOW_HEALER_SPECS.size;
          }
        };

        const racer = await race(racingBarsData, containerRef.current, {
          currentIndex: 0,
          height: getTopN() * 40,
          width: containerWidth,
          barHeight: 40,
          barGap: 10,
          duration: 300,
          easing: "easeOutCubic",
          showValue: true,
          valueFormatter: (value: number) => value.toLocaleString(),
          labelsPosition: isMobile ? undefined : 'outside',
          labelsWidth: isMobile ? 0 : 200,
          topN: getTopN(),
          controlButtons: 'none',
          autorun: false,
          autoplay: true,
          autoplaySpeed: 2000,
          dateCounter: '',
          fixedScale: false,
          fixedOrder: true,
          injectStyles: true
        });
        
        racerRef.current = racer;
        
        // Notify parent that racer is ready
        handleRacerReady(racer);
        
        // Set up event listeners for debugging
        if (racer && typeof racer === 'object' && 'on' in racer) {
          const racerWithEvents = racer as { on: (event: string, callback: (details: unknown) => void) => void };
          
          racerWithEvents.on('dateChange', (details: unknown) => {
            console.log('🔄 Date changed to:', details);
          });
          
          racerWithEvents.on('play', (details: unknown) => {
            console.log('▶️ Play started:', details);
          });
          
          racerWithEvents.on('pause', (details: unknown) => {
            console.log('⏸️ Pause triggered:', details);
          });
          
          racerWithEvents.on('firstDate', (details: unknown) => {
            console.log('🏁 Reached first date:', details);
          });
          
          racerWithEvents.on('lastDate', (details: unknown) => {
            console.log('🏁 Reached last date:', details);
          });
        }
        
        // Immediately pause after initialization
        console.log('⏸️ Immediately pausing after initialization');
        if (racer && typeof racer === 'object' && 'pause' in racer) {
          (racer as { pause: () => void }).pause();
        }
        
        // Double-check it's paused
        setTimeout(() => {
          if (racerRef.current && typeof racerRef.current === 'object' && racerRef.current !== null && 'isRunning' in racerRef.current) {
            const racerInstance = racerRef.current as { isRunning: () => boolean; pause: () => void };
            if (racerInstance.isRunning()) {
              console.log('🔄 Force pausing again');
              racerInstance.pause();
            }
          }
        }, 100);
      } catch (error) {
        console.error('Error initializing racing bars:', error);
      }
    };

    // Destroy existing racer if it exists
    if (racerRef.current && typeof racerRef.current === 'object' && racerRef.current !== null && 'destroy' in racerRef.current) {
      console.log('🗑️ Destroying existing racer');
      (racerRef.current as { destroy: () => void }).destroy();
      racerRef.current = null;
    }

    console.log('🚀 Initializing racing bars with data:', {
      totalPeriods: periods.length,
      racingBarsDataLength: racingBarsData.length,
      sampleData: racingBarsData.slice(0, 3),
      chartView
    });
    initRacingBars();
  }, [racingBarsData, chartView, isMobile, handleRacerReady]);

  // Handle play/pause from external controls
  useEffect(() => {
    if (racerRef.current && typeof racerRef.current === 'object' && racerRef.current !== null) {
      console.log('🎮 External control - isPlaying:', isPlaying);
      
      const racerInstance = racerRef.current as { 
        play: () => void; 
        pause: () => void; 
        getDate: () => string; 
        getAllDates: () => string[] 
      };
      
      if (isPlaying) {
        console.log('▶️ Calling racer.play()');
        racerInstance.play();
        
        // Set up interval to sync React state with racing-bars progress
        const syncInterval = setInterval(() => {
          if (racerRef.current && isPlaying) {
            try {
              const currentDate = racerInstance.getDate();
              const allDates = racerInstance.getAllDates();
              const currentIndex = allDates.indexOf(currentDate);
              
              if (currentIndex !== -1 && currentIndex !== currentPeriodIndex) {
                console.log('🔄 Syncing index from racing-bars:', currentIndex);
                onPeriodChange(currentIndex);
              }
            } catch (error) {
              console.error('Error syncing racing-bars state:', error);
            }
          }
        }, 100);
        
        return () => clearInterval(syncInterval);
      } else {
        console.log('⏸️ Calling racer.pause()');
        racerInstance.pause();
      }
    }
  }, [isPlaying, currentPeriodIndex, onPeriodChange]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (racerRef.current && typeof racerRef.current === 'object' && racerRef.current !== null && 'destroy' in racerRef.current) {
        (racerRef.current as { destroy: () => void }).destroy();
        racerRef.current = null;
      }
    };
  }, []);

  // Get the current period for the season label
  const currentPeriod = periods[currentPeriodIndex] || null;

  // Get the season label from the current period
  const getSeasonLabel = () => {
    if (!currentPeriod) {
      return 'No data available';
    }
    
    return currentPeriod.period_label || `Period ${currentPeriod.period_id}`;
  };

  if (periods.length === 0) {
    return (
      <div className="race-bars-container">
        <div className="no-data-message">No data available</div>
      </div>
    );
  }

  return (
    <div className="race-bars-container">
      <div className="race-bars-header">
        <div className="header-left">
          <ChartViewSelector
            chartView={chartView}
            setChartView={setChartView}
            isMobile={isMobile}
            loading={isPlaying}
          />
        </div>
        
        <div className="header-right">
          <PeriodNavigation
            currentPeriodIndex={currentPeriodIndex}
            totalPeriods={periods.length}
            onPeriodChange={onPeriodChange}
            onPlayPause={onPlayPause}
            isPlaying={isPlaying}
          />
        </div>
      </div>

      <div className="season-label">
        {getSeasonLabel()}
      </div>

      <div className="race-bars-content">
        {racingBarsData.length > 0 ? (
          <div ref={containerRef} style={{ width: '100%' }} />
        ) : (
          <div className="no-data-message">No data available for racing bars</div>
        )}
      </div>
    </div>
  );
};