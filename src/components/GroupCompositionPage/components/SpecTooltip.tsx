import React from 'react';
import { createPortal } from 'react-dom';
import type { TooltipState } from '../hooks/useTooltip';
import { getTextColor } from '../utils/compositionUtils';

interface SpecTooltipProps {
  tooltip: TooltipState;
}

export const SpecTooltip: React.FC<SpecTooltipProps> = ({ tooltip }) => {
  return createPortal(
    <div
      className="spec-tooltip"
      style={{
        left: tooltip.x + 10, // Offset from mouse cursor
        top: tooltip.y - 10, // Offset from mouse cursor
        background: tooltip.color,
        borderColor: tooltip.color,
        color: getTextColor(tooltip.color),
      }}
    >
      {tooltip.content}
    </div>,
    document.body
  );
}; 