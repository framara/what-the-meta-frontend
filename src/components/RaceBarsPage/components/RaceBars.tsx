import React, { useState, useEffect } from 'react';
import type { SpecData, PeriodData } from '../types';
import type { ChartView } from '../../MetaEvolutionPage/types';
import { PeriodNavigation } from './PeriodNavigation';
import { ChartViewSelector } from '../../MetaEvolutionPage/components/ChartViewSelector';
import { WOW_EXPANSIONS } from '../../../constants/wow-constants';
import './RaceBars.css';

interface RaceBarsProps {
  periods: PeriodData[];
  currentPeriodIndex: number;
  isAnimating: boolean;
  chartView?: ChartView;
  onPeriodChange: (index: number) => void;
  onPlayPause: () => void;
  isPlaying: boolean;
  setChartView: (view: ChartView) => void;
  isMobile: boolean;
  expansionId?: number;
  seasonId?: number;
  actualSeasonId?: number;
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
  actualSeasonId
}) => {
  const [displayedPeriod, setDisplayedPeriod] = useState<PeriodData | null>(null);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Update displayed period when current period changes
  useEffect(() => {
    if (periods.length === 0) return;
    setDisplayedPeriod(periods[currentPeriodIndex]);
  }, [currentPeriodIndex, periods.length]);

  // Handle smooth data transitions
  useEffect(() => {
    if (periods.length === 0) return;
    
    if (isAnimating) {
      setIsTransitioning(true);
      setAnimationProgress(0);
      
      // Animate the progress from 0 to 1
      const startTime = performance.now();
      const duration = 1500;
      
      const animate = () => {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Smooth easing
        const easedProgress = 1 - Math.pow(1 - progress, 3);
        setAnimationProgress(easedProgress);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setIsTransitioning(false);
        }
      };
      
      requestAnimationFrame(animate);
    } else {
      setIsTransitioning(false);
      setAnimationProgress(1);
    }
  }, [isAnimating, periods.length]);

  if (periods.length === 0) {
    return (
      <div className="race-bars-container">
        <div className="no-data-message">No data available</div>
      </div>
    );
  }

  // Get current and next periods for interpolation
  const currentPeriod = displayedPeriod;
  const nextPeriodIndex = Math.min(currentPeriodIndex + 1, periods.length - 1);
  const nextPeriod = periods[nextPeriodIndex];
  
  if (!currentPeriod) {
    return (
      <div className="race-bars-container">
        <div className="no-data-message">No data available</div>
      </div>
    );
  }

  // Sort current period specs for position calculation
  const currentSortedSpecs = [...currentPeriod.specs].sort((a, b) => b.count - a.count);
  const nextSortedSpecs = nextPeriod ? [...nextPeriod.specs].sort((a, b) => b.count - a.count) : [];
  
  // Use current period for final display, but interpolate values
  const topSpecs = currentSortedSpecs;
  const maxCount = Math.max(...currentPeriod.specs.map(spec => spec.count));

  // Helper function to get interpolated spec count for smooth bar width transitions
  const getInterpolatedSpecCount = (specId: number) => {
    if (!currentPeriod) return 0;
    
    const currentSpec = currentPeriod.specs.find(s => s.spec_id === specId);
    const currentCount = currentSpec?.count || 0;
    
    if (!isTransitioning || !nextPeriod) {
      return currentCount;
    }
    
    const nextSpec = nextPeriod.specs.find(s => s.spec_id === specId);
    const nextCount = nextSpec?.count || currentCount;
    
    return currentCount + (nextCount - currentCount) * animationProgress;
  };

  // Helper function to get interpolated max count for proper width calculation
  const getInterpolatedMaxCount = () => {
    if (!currentPeriod) return 0;
    
    const currentMaxCount = Math.max(...currentPeriod.specs.map(spec => spec.count));
    
    if (!isTransitioning || !nextPeriod) {
      return currentMaxCount;
    }
    
    const nextMaxCount = Math.max(...nextPeriod.specs.map(spec => spec.count));
    return currentMaxCount + (nextMaxCount - currentMaxCount) * animationProgress;
  };

  // Smooth position calculation with interpolation
  const getBarPosition = (specId: number) => {
    const currentIndex = currentSortedSpecs.findIndex(spec => spec.spec_id === specId);
    
    if (currentIndex === -1) return 0;
    
    // If we're not transitioning, just return the current position
    if (!isTransitioning || !nextPeriod) {
      return currentIndex;
    }
    
    // During transition, interpolate between current and next position
    const nextIndex = nextSortedSpecs.findIndex(spec => spec.spec_id === specId);
    
    if (nextIndex === -1) {
      return currentIndex;
    }
    
    // Interpolate between current and next position
    const interpolatedPosition = currentIndex + (nextIndex - currentIndex) * animationProgress;
    
    return interpolatedPosition;
  };

    // Get the season label from the current period
  const getSeasonLabel = () => {
    if (!currentPeriod) {
      return 'No data available';
    }
    
    // Use the period_label which contains the exact format we want
    return currentPeriod.period_label || `Period ${currentPeriod.period_id}`;
  };

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

                                                                                                               <div 
                          className="race-bars-content"
                          style={{
                            height: `${topSpecs.length * 48}px` // Dynamic height based on number of specs
                          }}
                        >
            {topSpecs.map((spec, index) => {
              const position = getBarPosition(spec.spec_id);
              return (
                <div 
                  key={spec.spec_id} 
                  className="race-bar-row" 
                  style={{ 
                    transform: `translateY(${position * 48}px)`,
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: topSpecs.length - Math.round(position)
                  }}
                >
                 <div className="spec-info">
                   <div 
                     className="spec-color-indicator" 
                     style={{ backgroundColor: spec.class_color }}
                   />
                   <div className="spec-details">
                     <div className="spec-name">{spec.spec_name}</div>
                   </div>
                 </div>
                 
                 <div className="race-bar-container">
                                       <div 
                      className="race-bar"
                      style={{
                        width: `${(getInterpolatedSpecCount(spec.spec_id) / getInterpolatedMaxCount()) * 100}%`,
                        backgroundColor: spec.class_color,
                        transformOrigin: 'left'
                      }}
                    />
                    <div className="percentage-label">
                      {Math.round(getInterpolatedSpecCount(spec.spec_id)).toLocaleString()}
                    </div>
                 </div>
               </div>
             );
           })}
         </div>

             
    </div>
  );
}; 