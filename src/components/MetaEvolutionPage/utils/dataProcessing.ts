import { WOW_SPEC_ROLES, WOW_MELEE_SPECS, WOW_RANGED_SPECS } from '../../../constants/wow-constants';
import type { SpecEvolutionData, ChartDataState } from '../types';

export const processSpecEvolutionData = (data: SpecEvolutionData): ChartDataState => {
  const evolution = data.evolution || [];
  
  // DPS/Healer chart logic (existing)
  const weekTopSpecs: number[][] = evolution.map(period => {
    return Object.entries(period.spec_counts)
      .sort((a, b) => b[1] - a[1])
      .map(([specId]) => Number(specId));
  });
  
  const allTopSpecsSet = new Set<number>();
  weekTopSpecs.forEach(specs => specs.forEach(specId => allTopSpecsSet.add(specId)));
  const allTopSpecs = Array.from(allTopSpecsSet);
  
  const chartRows = evolution.map((period, idx) => {
    const row: any = { week: idx + 1 };
    allTopSpecs.forEach(specId => {
      row[specId] = weekTopSpecs[idx].includes(specId) ? (period.spec_counts[specId] || 0) : 0;
    });
    return row;
  });

  // Tank chart logic
  const tankSpecIds = Object.entries(WOW_SPEC_ROLES)
    .filter(([specId, role]) => role === 'tank')
    .map(([specId]) => Number(specId));
  
  const weekTopTankSpecs: number[][] = evolution.map(period => {
    return Object.entries(period.spec_counts)
      .filter(([specId]) => tankSpecIds.includes(Number(specId)))
      .sort((a, b) => b[1] - a[1])
      .map(([specId]) => Number(specId));
  });
  
  const allTopTankSpecsSet = new Set<number>();
  weekTopTankSpecs.forEach(specs => specs.forEach(specId => allTopTankSpecsSet.add(specId)));
  const allTopTankSpecs = Array.from(allTopTankSpecsSet);
  
  const tankChartRows = evolution.map((period, idx) => {
    const row: any = { week: idx + 1 };
    allTopTankSpecs.forEach(specId => {
      row[specId] = weekTopTankSpecs[idx].includes(specId) ? (period.spec_counts[specId] || 0) : 0;
    });
    return row;
  });

  // Healer chart logic
  const healerSpecIds = Object.entries(WOW_SPEC_ROLES)
    .filter(([specId, role]) => role === 'healer')
    .map(([specId]) => Number(specId));
  
  const weekTopHealerSpecs: number[][] = evolution.map(period => {
    return Object.entries(period.spec_counts)
      .filter(([specId]) => healerSpecIds.includes(Number(specId)))
      .sort((a, b) => b[1] - a[1])
      .map(([specId]) => Number(specId));
  });
  
  const allTopHealerSpecsSet = new Set<number>();
  weekTopHealerSpecs.forEach(specs => specs.forEach(specId => allTopHealerSpecsSet.add(specId)));
  const allTopHealerSpecs = Array.from(allTopHealerSpecsSet);
  
  const healerChartRows = evolution.map((period, idx) => {
    const row: any = { week: idx + 1 };
    allTopHealerSpecs.forEach(specId => {
      row[specId] = weekTopHealerSpecs[idx].includes(specId) ? (period.spec_counts[specId] || 0) : 0;
    });
    return row;
  });

  // Melee DPS chart logic
  const weekTopMeleeSpecs: number[][] = evolution.map(period => {
    return Object.entries(period.spec_counts)
      .filter(([specId]) => WOW_MELEE_SPECS.has(Number(specId)) && WOW_SPEC_ROLES[Number(specId)] === 'dps')
      .sort((a, b) => b[1] - a[1])
      .map(([specId]) => Number(specId));
  });
  
  const allTopMeleeSpecsSet = new Set<number>();
  weekTopMeleeSpecs.forEach(specs => specs.forEach(specId => allTopMeleeSpecsSet.add(specId)));
  const allTopMeleeSpecs = Array.from(allTopMeleeSpecsSet);
  
  const meleeChartRows = evolution.map((period, idx) => {
    const row: any = { week: idx + 1 };
    allTopMeleeSpecs.forEach(specId => {
      row[specId] = weekTopMeleeSpecs[idx].includes(specId) ? (period.spec_counts[specId] || 0) : 0;
    });
    return row;
  });

  // Ranged DPS chart logic
  const weekTopRangedSpecs: number[][] = evolution.map(period => {
    return Object.entries(period.spec_counts)
      .filter(([specId]) => WOW_RANGED_SPECS.has(Number(specId)) && WOW_SPEC_ROLES[Number(specId)] === 'dps')
      .sort((a, b) => b[1] - a[1])
      .map(([specId]) => Number(specId));
  });
  
  const allTopRangedSpecsSet = new Set<number>();
  weekTopRangedSpecs.forEach(specs => specs.forEach(specId => allTopRangedSpecsSet.add(specId)));
  const allTopRangedSpecs = Array.from(allTopRangedSpecsSet);
  
  const rangedChartRows = evolution.map((period, idx) => {
    const row: any = { week: idx + 1 };
    allTopRangedSpecs.forEach(specId => {
      row[specId] = weekTopRangedSpecs[idx].includes(specId) ? (period.spec_counts[specId] || 0) : 0;
    });
    return row;
  });

  // DPS chart logic (melee + ranged)
  const dpsSpecIds = Object.entries(WOW_SPEC_ROLES)
    .filter(([specId, role]) => role === 'dps')
    .map(([specId]) => Number(specId));
  
  const weekTopDpsSpecs: number[][] = evolution.map(period => {
    return Object.entries(period.spec_counts)
      .filter(([specId]) => dpsSpecIds.includes(Number(specId)))
      .sort((a, b) => b[1] - a[1])
      .map(([specId]) => Number(specId));
  });
  
  const allTopDpsSpecsSet = new Set<number>();
  weekTopDpsSpecs.forEach(specs => specs.forEach(specId => allTopDpsSpecsSet.add(specId)));
  const allTopDpsSpecs = Array.from(allTopDpsSpecsSet);
  
  const dpsChartRows = evolution.map((period, idx) => {
    const row: any = { week: idx + 1 };
    allTopDpsSpecs.forEach(specId => {
      row[specId] = weekTopDpsSpecs[idx].includes(specId) ? (period.spec_counts[specId] || 0) : 0;
    });
    return row;
  });

  return {
    all: { data: chartRows, topSpecs: allTopSpecs },
    tank: { data: tankChartRows, topSpecs: allTopTankSpecs },
    healer: { data: healerChartRows, topSpecs: allTopHealerSpecs },
    dps: { data: dpsChartRows, topSpecs: allTopDpsSpecs },
    melee: { data: meleeChartRows, topSpecs: allTopMeleeSpecs },
    ranged: { data: rangedChartRows, topSpecs: allTopRangedSpecs },
  };
}; 