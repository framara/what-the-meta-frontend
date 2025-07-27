import React from 'react';
import { HeatmapGrid } from '../components/HeatmapGrid';
import { ChartDescriptionPopover } from '../components/ChartDescriptionPopover';

interface HeatmapChartProps {
  data: any[];
  topSpecs: number[];
}

export const HeatmapChart: React.FC<HeatmapChartProps> = ({ data, topSpecs }) => {
  return (
    <div className="chart-container">
      <div className="chart-header">
        <h3 className="chart-title">Spec Popularity Heatmap</h3>
        <ChartDescriptionPopover />
      </div>
      <HeatmapGrid data={data} specs={topSpecs} />
    </div>
  );
}; 