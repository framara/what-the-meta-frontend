import React, { useState, useEffect } from 'react';
import { WOW_SPECIALIZATIONS, WOW_CLASS_COLORS, WOW_SPEC_TO_CLASS } from '../../wow-constants';

interface HeatmapGridProps {
  data: any[];
  specs: number[];
}

export const HeatmapGrid: React.FC<HeatmapGridProps> = ({ data, specs }) => {
  const [tooltip, setTooltip] = useState<{
    show: boolean;
    specId: number;
    week: number;
    value: number;
    x: number;
    y: number;
  }>({ show: false, specId: 0, week: 0, value: 0, x: 0, y: 0 });

  // Calculate tooltip position with bounds checking within container
  const getTooltipPosition = (mouseX: number, mouseY: number) => {
    const tooltipWidth = 250; // Approximate tooltip width
    const tooltipHeight = 100; // Approximate tooltip height
    const padding = 20; // Padding from container edges
    
    // Get container bounds
    const container = document.querySelector('.meta-heatmap-container');
    if (!container) {
      return { left: mouseX + 10, top: mouseY - 50 };
    }
    
    const containerRect = container.getBoundingClientRect();
    const containerLeft = containerRect.left;
    const containerTop = containerRect.top;
    const containerWidth = containerRect.width;
    const containerHeight = containerRect.height;
    
    // Calculate position relative to container
    let left = mouseX - containerLeft + 10;
    let top = mouseY - containerTop + 30;
    
    // Check if tooltip would go off the right edge of container
    if (left + tooltipWidth + padding > containerWidth) {
      left = mouseX - containerLeft - tooltipWidth + 100;
    }
    
    // Check if tooltip would go off the left edge of container
    if (left < padding) {
      left = padding;
    }
    
    // Check if tooltip would go off the top edge of container
    if (top < padding) {
      top = mouseY - containerTop + 10;
    }
    
    // Check if tooltip would go off the bottom edge of container
    if (top + tooltipHeight + padding > containerHeight) {
      top = mouseY - containerTop - tooltipHeight - 10;
    }
    
    return { left, top };
  };

  // Build a matrix: rows = specs, cols = weeks
  const weeks = data.map((row: any) => row.week);
  
  // Calculate max value for each week separately for better contrast
  const getMaxValueForWeek = (week: number) => {
    return Math.max(...specs.map(specId => 
      data.find((row: any) => row.week === week)?.[specId] || 0
    ));
  };

  const handleMouseEnter = (specId: number, week: number, value: number, event: React.MouseEvent) => {
    setTooltip({
      show: true,
      specId,
      week,
      value,
      x: event.clientX,
      y: event.clientY,
    });
  };

  const handleMouseLeave = () => {
    setTooltip({ show: false, specId: 0, week: 0, value: 0, x: 0, y: 0 });
  };

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (tooltip.show) {
        setTooltip(prev => ({ 
          ...prev, 
          x: event.clientX, 
          y: event.clientY 
        }));
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [tooltip.show]);

  return (
    <div className="meta-heatmap-container">
      {/* Header row with week numbers */}
      <div className="meta-heatmap-header" style={{ gridTemplateColumns: `120px repeat(${weeks.length}, 1fr)` }}>
        <div className="meta-heatmap-spec" style={{ fontWeight: 'bold', color: '#e2e8f0' }}>
          Spec
        </div>
        {weeks.map(week => (
          <div key={week} className="meta-heatmap-spec" style={{ textAlign: 'center', fontWeight: 'bold', color: '#e2e8f0' }}>
            {week}
          </div>
        ))}
      </div>

             {/* Data rows */}
       {specs.sort((a, b) => a - b).map(specId => {
        const specName = WOW_SPECIALIZATIONS[specId] || `Spec ${specId}`;
        const classId = WOW_SPEC_TO_CLASS[specId];
        const color = WOW_CLASS_COLORS[classId] || '#888';

        return (
          <div
            key={specId}
            className="meta-heatmap-row"
            style={{ gridTemplateColumns: `120px repeat(${weeks.length}, 1fr)` }}
          >
            <div className="meta-heatmap-spec" style={{ color }}>
              {specName}
            </div>
                         {weeks.map(week => {
               const value = data.find((row: any) => row.week === week)?.[specId] || 0;
               const maxValueForWeek = getMaxValueForWeek(week);
               const intensity = maxValueForWeek > 0 ? value / maxValueForWeek : 0;
               const backgroundColor = `rgba(${parseInt(color.slice(1, 3), 16)}, ${parseInt(color.slice(3, 5), 16)}, ${parseInt(color.slice(5, 7), 16)}, ${intensity})`;

              return (
                <div
                  key={week}
                  className="meta-heatmap-spec"
                  style={{
                    backgroundColor,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => handleMouseEnter(specId, week, value, e)}
                  onMouseLeave={handleMouseLeave}
                >
                </div>
              );
            })}
          </div>
        );
      })}

      {/* Tooltip */}
      {tooltip.show && (
        <div
          className="meta-tooltip"
          style={{
            position: 'absolute',
            ...getTooltipPosition(tooltip.x, tooltip.y),
            zIndex: 1000,
          }}
        >
          <div className="meta-tooltip__header">
            <div className="meta-tooltip__title">Week {tooltip.week}</div>
          </div>
          <div className="meta-tooltip__columns">
            <div className="meta-tooltip__column">
              <div className="meta-tooltip__row">
                <div className="meta-tooltip__spec-info">
                  <div 
                    className="meta-tooltip__spec-name" 
                    style={{ color: WOW_CLASS_COLORS[WOW_SPEC_TO_CLASS[tooltip.specId]] || '#888' }}
                  >
                    {WOW_SPECIALIZATIONS[tooltip.specId] || `Spec ${tooltip.specId}`}
                  </div>
                </div>
                <div className="meta-tooltip__value">
                  <div className="meta-tooltip__primary-value">
                    {tooltip.value} runs
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 