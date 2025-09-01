import React, { useMemo } from 'react';
import { AreaChart as RechartsAreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { WOW_CLASS_COLORS, WOW_SPEC_TO_CLASS } from '../../../constants/wow-constants';
import { CustomTooltip } from '../components/CustomTooltip';
import { useSpecHover } from '../hooks/useSpecHover';

interface AreaChartProps {
  data: any[];
  topSpecs: number[];
  isMobile: boolean;
}

export const AreaChart: React.FC<AreaChartProps> = ({ data, topSpecs, isMobile }) => {
  const { hoveredSpecId, handleSpecMouseEnter, handleSpecMouseLeave, hasHoveredSpec } = useSpecHover();

  const percentData = useMemo(() => {
    return data.map(row => {
      const total = topSpecs.reduce((sum, specId) => sum + (row[specId] || 0), 0);
      const newRow: any = { week: row.week };
      topSpecs.forEach(specId => {
        newRow[specId] = total > 0 ? ((row[specId] || 0) / total) * 100 : 0;
      });
      return newRow;
    });
  }, [data, topSpecs]);

  return (
    <div className="chart-container">
      <div className="chart-header">
        <h3 className="chart-title">Spec Popularity Percentage</h3>
      </div>
      <div className="meta-chart-scroll">
        <ResponsiveContainer width="100%" height={600}>
          <RechartsAreaChart data={percentData}>
            <XAxis dataKey="week" tick={{ fontSize: isMobile ? 0 : '0.75rem' }} />
            <YAxis 
              tick={{ fontSize: isMobile ? 0 : '0.75rem' }} 
              domain={[0, 100]} 
              tickFormatter={v => `${Math.round(v * 100) / 100}%`} 
              ticks={[25, 50, 75, 100]} 
            />
            <Tooltip 
              content={
                <CustomTooltip 
                  percent 
                  hoveredSpecId={hoveredSpecId} 
                  showOnlyHovered={hasHoveredSpec}
                />
              } 
              wrapperStyle={{ marginTop: '-40px' }} 
            />
            {topSpecs.map(specId => (
              <Area
                key={specId}
                type="monotone"
                dataKey={specId}
                stackId="1"
                stroke={WOW_CLASS_COLORS[WOW_SPEC_TO_CLASS[specId]] || '#888'}
                strokeWidth={hoveredSpecId === specId ? 3 : 1}
                fill={WOW_CLASS_COLORS[WOW_SPEC_TO_CLASS[specId]] || '#888'}
                fillOpacity={hoveredSpecId === null ? 0.8 : hoveredSpecId === specId ? 0.9 : 0.3}
                onMouseEnter={() => handleSpecMouseEnter(specId)}
                onMouseLeave={handleSpecMouseLeave}
              />
            ))}
          </RechartsAreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}; 