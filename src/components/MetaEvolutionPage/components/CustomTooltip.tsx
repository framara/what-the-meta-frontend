import React from 'react';
import type { TooltipProps } from 'recharts';
import { WOW_SPECIALIZATIONS, WOW_CLASS_COLORS, WOW_SPEC_TO_CLASS } from '../../wow-constants';

interface CustomTooltipProps extends TooltipProps<number, string> {
  percent?: boolean;
}

export const CustomTooltip: React.FC<CustomTooltipProps> = (props) => {
  const { active, payload, label, percent } = props as any;
  if (!active || !payload || payload.length === 0) return null;

  // Don't show tooltip on mobile
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
  if (isMobile) return null;

  // Sort by value (descending), then by class, then spec name
  const classOrder = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
  const sortedPayload = [...payload]
    .filter((entry: any) => entry.value !== 0)
    .sort((a: any, b: any) => {
      // First sort by value (descending)
      if (b.value !== a.value) return b.value - a.value;

      // Then by class
      const aClass = WOW_SPEC_TO_CLASS[Number(a.dataKey)] || 99;
      const bClass = WOW_SPEC_TO_CLASS[Number(b.dataKey)] || 99;
      if (aClass !== bClass) return classOrder.indexOf(aClass) - classOrder.indexOf(bClass);

      // Finally by spec name
      const aSpec = WOW_SPECIALIZATIONS[Number(a.dataKey)] || '';
      const bSpec = WOW_SPECIALIZATIONS[Number(b.dataKey)] || '';
      return aSpec.localeCompare(bSpec);
    });

  // Calculate total for percentage display
  const total = sortedPayload.reduce((sum, entry) => sum + entry.value, 0);

  // Split into three columns for better layout
  const colSize = Math.ceil(sortedPayload.length / 3);
  const col1 = sortedPayload.slice(0, colSize);
  const col2 = sortedPayload.slice(colSize, colSize * 2);
  const col3 = sortedPayload.slice(colSize * 2);
  const columns = [col1, col2, col3];

  return (
    <div className="meta-tooltip">
      <div className="meta-tooltip__header">
        <div className="meta-tooltip__title">Week {label}</div>
        {percent && (
          <div className="meta-tooltip__total">Total: {total.toFixed(1)}%</div>
        )}
      </div>
      <div className="meta-tooltip__columns">
        {columns.map((col, i) => (
          <div key={i} className="meta-tooltip__column">
            {col.map((entry: any, idx: number) => {
              const specId = Number(entry.dataKey);
              const specName = WOW_SPECIALIZATIONS[specId] || `Spec ${specId}`;
              const classId = WOW_SPEC_TO_CLASS[specId];
              const color = WOW_CLASS_COLORS[classId] || '#888';
              const value = entry.value;

              return (
                <div key={specId} className="meta-tooltip__row">
                  <div className="meta-tooltip__spec-info">
                    <div className="meta-tooltip__spec-name" style={{ color }}>
                      {specName}
                    </div>
                  </div>
                  <div className="meta-tooltip__value">
                    <div className="meta-tooltip__primary-value">
                      {percent ? `${value.toFixed(1)}%` : value}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}; 