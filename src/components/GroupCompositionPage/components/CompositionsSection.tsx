import React from 'react';
import type { Composition } from '../utils/compositionUtils';
import type { TooltipState } from '../hooks/useTooltip';
import { CompositionCard } from './CompositionCard';

interface SeasonData {
  season_id: number;
  total_periods: number;
  total_keys: number;
  periods: Array<{
    period_id: number;
    keys_count: number;
    keys: Array<{
      id: number;
      keystone_level: number;
      score: number;
      members: Array<{
        spec_id: number;
        class_id: number;
        role: string;
      }>;
      [key: string]: any;
    }>;
  }>;
}

interface CompositionsSectionProps {
  compositions: Composition[];
  selectedSpec: number | null;
  onSpecClick: (specId: number) => void;
  specTooltip: TooltipState | null;
  setSpecTooltip: (tooltip: TooltipState | null) => void;
  seasonData: SeasonData | null;
  trendLoading?: boolean;
}

export const CompositionsSection: React.FC<CompositionsSectionProps> = ({
  compositions,
  selectedSpec,
  onSpecClick,
  specTooltip,
  setSpecTooltip,
  seasonData,
  trendLoading = false
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
              seasonData={seasonData}
              trendLoading={trendLoading}
            />
          ))
        ) : (
          <div className="no-compositions">
            <p>No love for that spec during that season :(</p>
          </div>
        )}
      </div>
    </div>
  );
}; 