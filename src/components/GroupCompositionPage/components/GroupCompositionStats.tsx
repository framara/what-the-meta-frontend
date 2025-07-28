import React, { useMemo } from 'react';
import type { Run } from '../utils/compositionUtils';
import { calculateGroupCompositions } from '../utils/compositionUtils';
import { useSpecFilter } from '../hooks/useSpecFilter';
import { useDropdown } from '../hooks/useDropdown';
import { useTooltip } from '../hooks/useTooltip';
import { SpecSelector } from './SpecSelector';
import { CompositionsSection } from './CompositionsSection';
import { SpecTooltip } from './SpecTooltip';

interface GroupCompositionStatsProps {
  runs: Run[];
}

export const GroupCompositionStats: React.FC<GroupCompositionStatsProps> = ({ runs }) => {
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
      />

      {/* Spec Tooltip */}
      {specTooltip && <SpecTooltip tooltip={specTooltip} />}
    </div>
  );
}; 