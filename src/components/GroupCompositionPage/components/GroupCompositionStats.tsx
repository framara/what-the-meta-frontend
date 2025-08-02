import React, { useMemo } from 'react';
import type { Run } from '../utils/compositionUtils';
import { calculateGroupCompositions, calculateRoleSpecCounts, getTopSpecsByRole } from '../utils/compositionUtils';
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
        spec_id: string;
        class_id: string;
        role: string;
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
  
  // Memoize role spec counts calculation
  const roleSpecCounts = useMemo(() => {
    const startTime = performance.now();
    console.log(`🧮 [${new Date().toISOString()}] Starting calculateRoleSpecCounts for ${runs.length} runs...`);
    const result = calculateRoleSpecCounts(runs);
    const time = performance.now() - startTime;
    console.log(`✅ [${new Date().toISOString()}] calculateRoleSpecCounts completed in ${time.toFixed(2)}ms`);
    return result;
  }, [runs]);

  // Memoize top specs by role
  const topSpecsByRole = useMemo(() => {
    const startTime = performance.now();
    console.log(`🏆 [${new Date().toISOString()}] Starting getTopSpecsByRole calculations...`);
    const result = {
      tank: getTopSpecsByRole(roleSpecCounts, 'tank', 5),
      healer: getTopSpecsByRole(roleSpecCounts, 'healer', 5),
      dps: getTopSpecsByRole(roleSpecCounts, 'dps', 10)
    };
    const time = performance.now() - startTime;
    console.log(`✅ [${new Date().toISOString()}] getTopSpecsByRole completed in ${time.toFixed(2)}ms`);
    return result;
  }, [roleSpecCounts]);

  // Calculate compositions using useMemo for performance
  const topCompositions = useMemo(() => {
    const startTime = performance.now();
    console.log(`🎯 [${new Date().toISOString()}] Starting calculateGroupCompositions for ${runs.length} runs...`);
    const result = calculateGroupCompositions(runs, selectedSpec);
    const time = performance.now() - startTime;
    console.log(`✅ [${new Date().toISOString()}] calculateGroupCompositions completed in ${time.toFixed(2)}ms - found ${result.length} compositions`);
    return result;
  }, [runs, selectedSpec]);

  // Memoize spec selector props
  const specSelectorProps = useMemo(() => ({
    selectedClass,
    selectedSpec,
    onClassChange: handleClassChange,
    onSpecChange: handleSpecChange,
    onClearFilter: clearFilter,
    isDropdownOpen,
    setIsDropdownOpen,
    hoveredClass,
    setHoveredClass,
    dropdownRef
  }), [selectedClass, selectedSpec, handleClassChange, handleSpecChange, clearFilter, isDropdownOpen, setIsDropdownOpen, hoveredClass, setHoveredClass, dropdownRef]);

  // Memoize compositions section props
  const compositionsSectionProps = useMemo(() => ({
    compositions: topCompositions,
    selectedSpec,
    onSpecClick: handleSpecChange,
    specTooltip,
    setSpecTooltip,
    seasonData
  }), [topCompositions, selectedSpec, handleSpecChange, specTooltip, setSpecTooltip, seasonData]);

  return (
    <div className="group-composition-stats">
      {/* Spec Selector Section */}
      <SpecSelector {...specSelectorProps} />

      {/* Top Group Compositions */}
      <CompositionsSection {...compositionsSectionProps} />

      {/* Spec Tooltip */}
      {specTooltip && <SpecTooltip tooltip={specTooltip} />}
    </div>
  );
}; 