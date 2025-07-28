import React from 'react';
import { WOW_CLASS_COLORS, WOW_SPECIALIZATIONS, WOW_SPEC_TO_CLASS, WOW_SPEC_ROLES } from '../../wow-constants';
import { ROLE_EMOJI } from '../constants/compositionConstants';
import { getTextColor } from '../utils/compositionUtils';
import type { Composition } from '../utils/compositionUtils';
import type { TooltipState } from '../hooks/useTooltip';

interface CompositionCardProps {
  composition: Composition;
  index: number;
  selectedSpec: number | null;
  onSpecClick: (specId: number) => void;
  setSpecTooltip: (tooltip: TooltipState | null) => void;
}

export const CompositionCard: React.FC<CompositionCardProps> = ({
  composition,
  index,
  selectedSpec,
  onSpecClick,
  setSpecTooltip
}) => {
  const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';

  return (
    <div className="composition-card">
      <div className="composition-header">
        <span className="composition-rank">{medal} #{index + 1}</span>
        <span className="composition-count">x{composition.count}</span>
      </div>
      <div className="composition-specs">
        {composition.specs.map((specId, specIndex) => {
          const classId = Number(WOW_SPEC_TO_CLASS[specId]) || 0;
          const role = WOW_SPEC_ROLES[specId] || '';
          const isSelectedSpec = selectedSpec === specId;
          
          return (
            <span
              key={specIndex}
              className={`composition-spec ${isSelectedSpec ? 'selected-spec' : ''}`}
              style={{
                background: WOW_CLASS_COLORS[classId] || '#fff',
                border: isSelectedSpec ? '3px solid #3b82f6' : 'none',
                boxShadow: isSelectedSpec ? '0 0 0 2px rgba(59, 130, 246, 0.3)' : '0 2px 4px rgba(0, 0, 0, 0.2)',
              }}
              onMouseEnter={e => {
                setSpecTooltip({
                  x: e.clientX,
                  y: e.clientY,
                  content: WOW_SPECIALIZATIONS[specId] || '-',
                  color: WOW_CLASS_COLORS[classId] || '#23263a',
                });
              }}
              onMouseMove={e => {
                setSpecTooltip({
                  x: e.clientX,
                  y: e.clientY,
                  content: WOW_SPECIALIZATIONS[specId] || '-',
                  color: WOW_CLASS_COLORS[classId] || '#23263a',
                });
              }}
              onMouseLeave={() => setSpecTooltip(null)}
              onClick={() => onSpecClick(specId)}
            >
              {ROLE_EMOJI[role] || ''}
            </span>
          );
        })}
      </div>
    </div>
  );
}; 