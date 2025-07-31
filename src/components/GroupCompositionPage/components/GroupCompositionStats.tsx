import React, { useMemo } from 'react';
import type { Run } from '../utils/compositionUtils';
import { calculateGroupCompositions } from '../utils/compositionUtils';
import { useSpecFilter } from '../hooks/useSpecFilter';
import { useDropdown } from '../hooks/useDropdown';
import { useTooltip } from '../hooks/useTooltip';
import { SpecSelector } from './SpecSelector';
import { CompositionsSection } from './CompositionsSection';
import { SpecTooltip } from './SpecTooltip';

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
        name: string;
      }>;
      [key: string]: any;
    }>;
  }>;
}

interface GroupCompositionStatsProps {
  runs: Run[];
  seasonData: SeasonData | null;
}

export const GroupCompositionStats: React.FC<GroupCompositionStatsProps> = ({ runs, seasonData }) => {
  const { selectedClass, selectedSpec, handleClassChange, handleSpecChange, clearFilter } = useSpecFilter();
  const { isDropdownOpen, setIsDropdownOpen, hoveredClass, setHoveredClass, dropdownRef } = useDropdown();
  const { specTooltip, setSpecTooltip } = useTooltip();
  
  // Calculate compositions using useMemo for performance
  const topCompositions = useMemo(() => 
    calculateGroupCompositions(runs, selectedSpec), 
    [runs, selectedSpec]
  );

  return (
    <div className="group-composition-stats">
      {/* Spec Selector Section */}
      <SpecSelector
        selectedClass={selectedClass}
        selectedSpec={selectedSpec}
        onClassChange={handleClassChange}
        onSpecChange={handleSpecChange}
        onClearFilter={clearFilter}
        isDropdownOpen={isDropdownOpen}
        setIsDropdownOpen={setIsDropdownOpen}
        hoveredClass={hoveredClass}
        setHoveredClass={setHoveredClass}
        dropdownRef={dropdownRef}
      />

      {/* Top Group Compositions */}
      <CompositionsSection
        compositions={topCompositions}
        selectedSpec={selectedSpec}
        onSpecClick={handleSpecChange}
        specTooltip={specTooltip}
        setSpecTooltip={setSpecTooltip}
        seasonData={seasonData}
      />

      {/* Spec Tooltip */}
      {specTooltip && <SpecTooltip tooltip={specTooltip} />}
    </div>
  );
}; 