import React from 'react';
import type { ChartType } from '../types';

interface ChartTypeToggleProps {
  activeChart: ChartType;
  setActiveChart: (chartType: ChartType) => void;
}

export const ChartTypeToggle: React.FC<ChartTypeToggleProps> = ({ activeChart, setActiveChart }) => {
  return (
    <div className="chart-controls-row" style={{ marginBottom: '1.5rem', justifyContent: 'flex-end' }}>
      <div className="button-group chart-type-toggle compact">
        <button 
          className={`chart-view-button ${activeChart === 'line' ? 'active' : ''}`} 
          onClick={() => setActiveChart('line')} 
          data-first-letter="L"
        >
          Line
        </button>
        <button 
          className={`chart-view-button ${activeChart === 'bar' ? 'active' : ''}`} 
          onClick={() => setActiveChart('bar')} 
          data-first-letter="B"
        >
          Bar
        </button>
        <button 
          className={`chart-view-button ${activeChart === 'area' ? 'active' : ''}`} 
          onClick={() => setActiveChart('area')} 
          data-first-letter="A"
        >
          Area
        </button>
        <button 
          className={`chart-view-button ${activeChart === 'heatmap' ? 'active' : ''}`} 
          onClick={() => setActiveChart('heatmap')} 
          data-first-letter="H"
        >
          Heatmap
        </button>
        <button 
          className={`chart-view-button ${activeChart === 'treemap' ? 'active' : ''}`} 
          onClick={() => setActiveChart('treemap')} 
          data-first-letter="T"
        >
          Treemap
        </button>
      </div>
    </div>
  );
}; 