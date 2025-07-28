import React from 'react';
import type { TooltipState } from '../hooks/useTooltip';
import { getTextColor } from '../utils/compositionUtils';

interface SpecTooltipProps {
  tooltip: TooltipState;
}

export const SpecTooltip: React.FC<SpecTooltipProps> = ({ tooltip }) => {
  return (
    <div
      className="spec-tooltip"
      style={{
        left: tooltip.x,
        top: tooltip.y - 10,
        background: tooltip.color,
        borderColor: tooltip.color,
        color: getTextColor(tooltip.color),
      }}
    >
      {tooltip.content}
    </div>
  );
}; 