import React, { useMemo } from 'react';
import { BarChart as RechartsBarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { WOW_CLASS_COLORS, WOW_SPEC_TO_CLASS } from '../../wow-constants';
import { CustomTooltip } from '../components/CustomTooltip';
import { ChartDescriptionPopover } from '../components/ChartDescriptionPopover';

interface BarChartProps {
  data: any[];
  topSpecs: number[];
  isMobile: boolean;
}

export const BarChart: React.FC<BarChartProps> = ({ data, topSpecs, isMobile }) => {
  const barChartMax = useMemo(() => {
    return Math.max(...data.map(row => 
      topSpecs.reduce((sum, specId) => sum + (row[specId] || 0), 0)
    ));
  }, [data, topSpecs]);

  return (
    <div className="chart-container">
      <div className="chart-header">
        <h3 className="chart-title">Spec Distribution by Week</h3>
        <ChartDescriptionPopover />
      </div>
      <div className="meta-chart-scroll">
        <ResponsiveContainer width="100%" height={600}>
          <RechartsBarChart data={data}>
            <XAxis dataKey="week" tick={{ fontSize: isMobile ? 0 : '0.75rem' }} />
            <YAxis 
              tick={{ fontSize: isMobile ? 0 : '0.75rem' }} 
              domain={[0, barChartMax]} 
              ticks={[barChartMax/4, barChartMax/2, (barChartMax*3)/4, barChartMax]} 
            />
            <Tooltip content={<CustomTooltip />} wrapperStyle={{ marginTop: '-40px' }} />
            {topSpecs.map(specId => (
              <Bar
                key={specId}
                dataKey={specId}
                stackId="a"
                fill={WOW_CLASS_COLORS[WOW_SPEC_TO_CLASS[specId]] || '#888'}
              />
            ))}
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}; 