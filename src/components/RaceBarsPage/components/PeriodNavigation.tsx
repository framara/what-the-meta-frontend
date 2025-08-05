import React from 'react';
import '../styles/PeriodNavigation.css';

interface PeriodNavigationProps {
  currentPeriodIndex: number;
  totalPeriods: number;
  onPeriodChange: (index: number) => void;
  onPlayPause: () => void;
  isPlaying: boolean;
  disabled?: boolean;
}

export const PeriodNavigation: React.FC<PeriodNavigationProps> = ({
  currentPeriodIndex,
  totalPeriods,
  onPeriodChange,
  onPlayPause,
  isPlaying,
  disabled = false
}) => {
  const handlePrevious = () => {
    if (currentPeriodIndex > 0) {
      onPeriodChange(currentPeriodIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentPeriodIndex < totalPeriods - 1) {
      onPeriodChange(currentPeriodIndex + 1);
    }
  };

  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newIndex = parseInt(event.target.value);
    onPeriodChange(newIndex);
  };

  return (
    <div className="period-navigation">
      <div className="navigation-controls">
        <button
          className="nav-button"
          onClick={handlePrevious}
          disabled={disabled || currentPeriodIndex === 0}
          title="Previous period"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15,18 9,12 15,6"></polyline>
          </svg>
        </button>

        <button
          className="nav-button play-pause-button"
          onClick={onPlayPause}
          disabled={disabled}
          title={isPlaying ? "Pause animation" : "Play animation"}
        >
          {isPlaying ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="6" y="4" width="4" height="16"></rect>
              <rect x="14" y="4" width="4" height="16"></rect>
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="5,3 19,12 5,21"></polygon>
            </svg>
          )}
        </button>

        <button
          className="nav-button"
          onClick={handleNext}
          disabled={disabled || currentPeriodIndex === totalPeriods - 1}
          title="Next period"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9,18 15,12 9,6"></polyline>
          </svg>
        </button>

        <div className="period-slider-container">
          <input
            type="range"
            min="0"
            max={Math.max(0, totalPeriods - 1)}
            value={currentPeriodIndex}
            onChange={handleSliderChange}
            disabled={disabled}
            className="period-slider"
          />
          <div className="period-info">
            <span className="current-period">Week {currentPeriodIndex + 1}</span>
            <span className="total-periods">of {totalPeriods}</span>
          </div>
        </div>
      </div>
    </div>
  );
}; 