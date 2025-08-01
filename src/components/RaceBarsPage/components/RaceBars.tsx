import React, { useState, useEffect, useMemo, useRef } from 'react';
import { race } from 'racing-bars';
import type { SpecData, PeriodData } from '../types';
import type { ChartView } from '../../MetaEvolutionPage/types';
import { PeriodNavigation } from './PeriodNavigation';
import { ChartViewSelector } from '../../MetaEvolutionPage/components/ChartViewSelector';
import './RaceBars.css';
import { WOW_HEALER_SPECS, WOW_MELEE_SPECS, WOW_RANGED_SPECS, WOW_TANK_SPECS } from '../../../constants/wow-constants';

interface RaceBarsProps {
  periods: PeriodData[];
  currentPeriodIndex: number;
  isAnimating?: boolean;
  chartView?: ChartView;
  onPeriodChange: (index: number) => void;
  onPlayPause: () => void;
  isPlaying: boolean;
  setChartView: (view: ChartView) => void;
  isMobile: boolean;
  expansionId?: number;
  seasonId?: number;
  actualSeasonId?: number;
  onRacerReady?: (racer: any) => void;
}

export const RaceBars: React.FC<RaceBarsProps> = ({ 
  periods, 
  currentPeriodIndex, 
  isAnimating,
  chartView = 'all' as ChartView,
  onPeriodChange,
  onPlayPause,
  isPlaying,
  setChartView,
  isMobile,
  expansionId,
  seasonId,
  actualSeasonId,
  onRacerReady
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const racerRef = useRef<any>(null);

  // Transform data for racing-bars library
  const racingBarsData = useMemo(() => {
    if (periods.length === 0) return [];
    
    const transformedData: any[] = [];
    
    periods.forEach((period, periodIndex) => {
      // Create a dummy date that increments for each period
      // Start from 2020-01-01 and add periodIndex days
      const dummyDate = new Date(2020, 0, 1 + periodIndex);
      const dateString = dummyDate.toISOString().split('T')[0]; // YYYY-MM-DD format
      
      period.specs.forEach(spec => {
        transformedData.push({
          date: dateString,
          value: spec.count,
          name: `${spec.spec_name} (${spec.class_name})`,
          color: spec.class_color, 
        });
      });
    });
    
    // Debug: Log the first few entries to verify data format
    console.log('🔍 Racing bars data sample:', {
      totalEntries: transformedData.length,
      uniqueDates: [...new Set(transformedData.map(d => d.date))].length,
      sampleEntries: transformedData.slice(0, 6)
    });
    
    return transformedData;
  }, [periods]);

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
          height: getTopN() * 40, // Increased height calculation
          width: containerWidth,
          barHeight: 40, // Increased bar height from 40 to 50
          barGap: 10, // Increased gap from 8 to 12
          duration: 300,
          easing: "easeOutCubic",
          showValue: true,
          valueFormatter: (value: number) => value.toLocaleString(),
          // onIndexChange: (index: number) => {
          //   console.log('📊 Racing bars index changed to:', index);
          //   onPeriodChange(index);
          // },
          labelsPosition: 'outside',
          labelsWidth: 200, // Increased width for labels
          topN: getTopN(), // Show all specs for the current chart view
          controlButtons: 'none',
          autorun: false,
          autoplay: true,
          autoplaySpeed: 2000,
          dateCounter: '',
          fixedScale: false,
          fixedOrder: true, // Keep specs visible even when value is 0
          injectStyles: true
        });
        
        racerRef.current = racer;
        
        // Notify parent that racer is ready
        if (onRacerReady) {
          onRacerReady(racer);
        }
        
        // Set up comprehensive event listeners for debugging
        racerRef.current.on('dateChange', (details: any) => {
          console.log('🔄 Date changed to:', details.date, 'Details:', details);
        });
        
        racerRef.current.on('play', (details: any) => {
          console.log('▶️ Play started:', details);
        });
        
        racerRef.current.on('pause', (details: any) => {
          console.log('⏸️ Pause triggered:', details);
        });
        
        racerRef.current.on('firstDate', (details: any) => {
          console.log('🏁 Reached first date:', details);
        });
        
        racerRef.current.on('lastDate', (details: any) => {
          console.log('🏁 Reached last date:', details);
        });
        
        // Immediately pause after initialization to prevent auto-start
        console.log('⏸️ Immediately pausing after initialization');
        racerRef.current.pause();
        
        // Double-check it's paused
        setTimeout(() => {
          if (racerRef.current && racerRef.current.isRunning()) {
            console.log('🔄 Force pausing again');
            racerRef.current.pause();
          }
        }, 100);
      } catch (error) {
        console.error('Error initializing racing bars:', error);
      }
    };

    // Only initialize if racerRef.current is null
    if (!racerRef.current) {
      console.log('🚀 Initializing racing bars with data:', {
        totalPeriods: periods.length,
        racingBarsDataLength: racingBarsData.length,
        sampleData: racingBarsData.slice(0, 3)
      });
      initRacingBars();
    } else {
      console.log('⚠️ Skipping initialization - racer already exists');
    }
  }, [racingBarsData, onPeriodChange]);

  // Handle play/pause from external controls
  // Control play/pause based on isPlaying prop and sync state
  useEffect(() => {
    if (racerRef.current) {
      console.log('🎮 External control - isPlaying:', isPlaying);
      if (isPlaying) {
        console.log('▶️ Calling racer.play()');
        racerRef.current.play();
        
        // Set up interval to sync React state with racing-bars progress
        const syncInterval = setInterval(() => {
          if (racerRef.current && isPlaying) {
            try {
              const currentDate = racerRef.current.getDate();
              const allDates = racerRef.current.getAllDates();
              const currentIndex = allDates.indexOf(currentDate);
              
              if (currentIndex !== -1 && currentIndex !== currentPeriodIndex) {
                console.log('🔄 Syncing index from racing-bars:', currentIndex);
                onPeriodChange(currentIndex);
              }
            } catch (error) {
              console.error('Error syncing racing-bars state:', error);
            }
          }
        }, 100); // Check every 100ms for smooth updates
        
        return () => clearInterval(syncInterval);
      } else {
        console.log('⏸️ Calling racer.pause()');
        racerRef.current.pause();
      }
    }
  }, [isPlaying, currentPeriodIndex, onPeriodChange]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (racerRef.current) {
        racerRef.current.destroy();
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
    
    // Use the period_label which contains the exact format we want
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