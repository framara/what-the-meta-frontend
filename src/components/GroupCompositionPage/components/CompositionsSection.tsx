import React from 'react';
import type { Composition } from '../utils/compositionUtils';
import type { TooltipState } from '../hooks/useTooltip';
import { CompositionCard } from './CompositionCard';

interface CompositionsSectionProps {
  compositions: Composition[];
  selectedSpec: number | null;
  onSpecClick: (specId: number) => void;
  specTooltip: TooltipState | null;
  setSpecTooltip: (tooltip: TooltipState | null) => void;
}

export const CompositionsSection: React.FC<CompositionsSectionProps> = ({
  compositions,
  selectedSpec,
  onSpecClick,
  specTooltip,
  setSpecTooltip
}) => {
  return (
    <div className="compositions-section">
      <div className="compositions-grid">
        {compositions.length > 0 ? (
          compositions.map((composition, index) => (
            <CompositionCard
              key={index}
              composition={composition}
              index={index}
              selectedSpec={selectedSpec}
              onSpecClick={onSpecClick}
              setSpecTooltip={setSpecTooltip}
            />
          ))
        ) : (
          <div className="no-compositions">
            <p>No compositions found for the selected spec.</p>
          </div>
        )}
      </div>
    </div>
  );
}; 