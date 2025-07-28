import React from 'react';
import { LineChart as RechartsLineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { WOW_CLASS_COLORS, WOW_SPEC_TO_CLASS } from '../../wow-constants';
import { CustomTooltip } from '../components/CustomTooltip';

interface LineChartProps {
  data: any[];
  topSpecs: number[];
  isMobile: boolean;
}

export const LineChart: React.FC<LineChartProps> = ({ data, topSpecs, isMobile }) => {
  return (
    <div className="chart-container">
      <div className="chart-header">
        <h3 className="chart-title">Spec Popularity Over Time</h3>
      </div>
      <div className="meta-chart-scroll">
        <ResponsiveContainer width="100%" height={600}>
          <RechartsLineChart data={data}>
            <XAxis dataKey="week" tick={{ fontSize: isMobile ? 0 : '0.75rem' }} />
            <YAxis tick={{ fontSize: isMobile ? 0 : '0.75rem' }} />
            <Tooltip content={<CustomTooltip />} wrapperStyle={{ marginTop: '-40px' }} />
            {topSpecs.map(specId => (
              <Line
                key={specId}
                type="monotone"
                dataKey={specId}
                stroke={WOW_CLASS_COLORS[WOW_SPEC_TO_CLASS[specId]] || '#888'}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            ))}
          </RechartsLineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}; 