import React from 'react';
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';
import { WOW_SPECIALIZATIONS, WOW_CLASS_COLORS, WOW_SPEC_TO_CLASS } from '../../../constants/wow-constants';
import { CustomContentTreemap, TreemapTooltip } from '../components/TreemapComponents';
import type { TreemapDataItem } from '../types';

interface TreemapChartProps {
  data: any[];
  topSpecs: number[];
  treemapWeek: number | null;
  setTreemapWeek: (week: number) => void;
  chartView: string;
  allSpecs: number[];
}

export const TreemapChart: React.FC<TreemapChartProps> = ({ 
  data, 
  topSpecs, 
  treemapWeek, 
  setTreemapWeek, 
  chartView, 
  allSpecs 
}) => {
  if (!data || data.length === 0) {
    return <div className="text-center text-gray-400">No data</div>;
  }

  const weekCount = data.length;
  const weekIdx = treemapWeek !== null ? treemapWeek : weekCount - 1;
  const weekData = data[weekIdx];
  const specs = (chartView === 'all' ? allSpecs : topSpecs);
  
  const treemapData: TreemapDataItem[] = specs.map(specId => ({
    name: WOW_SPECIALIZATIONS[specId] || specId.toString(),
    value: weekData[specId] || 0,
    color: WOW_CLASS_COLORS[WOW_SPEC_TO_CLASS[specId]] || '#888',
    week: weekIdx + 1,
  })).filter(d => d.value > 0);

  return (
    <div className="chart-container">
      <div className="chart-header">
        <h3 className="chart-title">Spec Popularity Treemap</h3>
      </div>
      
      <div className="treemap-controls">
        <span className="treemap-label">Week</span>
        <input
          type="range"
          className="treemap-slider"
          min={0}
          max={weekCount - 1}
          value={treemapWeek !== null ? treemapWeek : 0}
          onChange={e => setTreemapWeek(Number(e.target.value))}
        />
        <span className="treemap-info">{treemapWeek !== null ? treemapWeek + 1 : 1} / {weekCount}</span>
      </div>
      
      {treemapData.length === 0 ? (
        <div className="text-center text-gray-400">No data</div>
      ) : (
        <ResponsiveContainer width="100%" height={700}>
          <Treemap
            data={treemapData}
            dataKey="value"
            aspectRatio={4 / 3}
            content={<CustomContentTreemap />}
            animationDuration={200}
            animationEasing='ease-in-out'
          >
            <Tooltip content={(props) => <TreemapTooltip {...props} />} />
          </Treemap>
        </ResponsiveContainer>
      )}
    </div>
  );
}; 