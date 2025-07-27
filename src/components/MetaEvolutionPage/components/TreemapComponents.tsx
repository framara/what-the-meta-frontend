import React from 'react';
import { WOW_SPECIALIZATIONS, WOW_CLASS_COLORS, WOW_SPEC_TO_CLASS } from '../../wow-constants';
import { getTextColor, getShortName } from '../utils/chartHelpers';

export const CustomContentTreemap: React.FC<any> = (props) => {
  const { root, depth, x, y, width, height, name, value, color } = props;
  const textColor = getTextColor(color);
  const shortName = getShortName(name, width);

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: color,
          stroke: '#fff',
          strokeWidth: 2 / (depth + 1e-10),
          strokeOpacity: 1 / (depth + 1e-10),
        }}
      />
      {depth === 1 ? (
        <text
          x={x + width / 2}
          y={y + height / 2 + 7}
          textAnchor="middle"
          fill={textColor}
          fontSize={14}
        >
          {shortName}
        </text>
      ) : null}

    </g>
  );
};

export const TreemapTooltip: React.FC<{ active: boolean; payload: any[] }> = ({ active, payload }) => {
  if (!active || !payload || payload.length === 0) return null;

  const data = payload[0].payload;
  const specId = Object.keys(WOW_SPECIALIZATIONS).find(
    key => WOW_SPECIALIZATIONS[Number(key)] === data.name
  );
  const classId = specId ? WOW_SPEC_TO_CLASS[Number(specId)] : null;
  const color = classId ? WOW_CLASS_COLORS[classId] : '#888';

  return (
    <div className="meta-tooltip">
      <div className="meta-tooltip__header">
        <div className="meta-tooltip__title">Week {data.week || 'Unknown'}</div>
      </div>
      <div className="meta-tooltip__columns">
        <div className="meta-tooltip__column">
          <div className="meta-tooltip__row">
            <div className="meta-tooltip__spec-info">
              <div 
                className="meta-tooltip__spec-name" 
                style={{ color }}
              >
                {data.name}
              </div>
            </div>
            <div className="meta-tooltip__value">
              <div className="meta-tooltip__primary-value">
                {data.value} runs
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 