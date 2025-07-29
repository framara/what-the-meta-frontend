import React from 'react';
import type { ChartType } from '../types';

interface ChartTypeToggleProps {
  activeChart: ChartType;
  setActiveChart: (chartType: ChartType) => void;
  loading?: boolean;
}

export const ChartTypeToggle: React.FC<ChartTypeToggleProps> = ({ activeChart, setActiveChart, loading = false }) => {
  return (
    <div className="chart-controls-row" style={{ justifyContent: 'flex-end' }}>
      <div className="button-group chart-type-toggle">
        <button 
          className={`chart-view-button ${activeChart === 'line' ? 'active' : ''}`} 
          onClick={() => setActiveChart('line')} 
          data-first-letter="L"
          disabled={loading}
        >
          Line
        </button>
        <button 
          className={`chart-view-button ${activeChart === 'bar' ? 'active' : ''}`} 
          onClick={() => setActiveChart('bar')} 
          data-first-letter="B"
          disabled={loading}
        >
          Bar
        </button>
        <button 
          className={`chart-view-button ${activeChart === 'area' ? 'active' : ''}`} 
          onClick={() => setActiveChart('area')} 
          data-first-letter="A"
          disabled={loading}
        >
          Area
        </button>
        <button 
          className={`chart-view-button ${activeChart === 'heatmap' ? 'active' : ''}`} 
          onClick={() => setActiveChart('heatmap')} 
          data-first-letter="H"
          disabled={loading}
        >
          Heatmap
        </button>
        <button 
          className={`chart-view-button ${activeChart === 'treemap' ? 'active' : ''}`} 
          onClick={() => setActiveChart('treemap')} 
          data-first-letter="T"
          disabled={loading}
        >
          Treemap
        </button>
      </div>
    </div>
  );
}; 