import React, { useState } from 'react';

export const ChartDescriptionPopover: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="chart-description-popover">
      <button
        className="chart-description-trigger"
        onClick={() => setIsVisible(!isVisible)}
        title="Data sample information"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
        </svg>
      </button>
      {isVisible && (
        <div className="chart-description-content">
          <div className="chart-description-text">
            Data sample: Top 1,000 runs per week across all dungeons for the selected season.
          </div>
        </div>
      )}
    </div>
  );
}; 