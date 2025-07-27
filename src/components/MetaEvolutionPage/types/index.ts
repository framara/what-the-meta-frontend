export type ChartGroup = { 
  data: any[]; 
  topSpecs: number[] 
};

export type ChartDataState = Record<'all' | 'tank' | 'healer' | 'dps' | 'melee' | 'ranged', ChartGroup>;

export type ChartView = 'all' | 'tank' | 'healer' | 'dps' | 'melee' | 'ranged';

export type ChartType = 'line' | 'bar' | 'area' | 'heatmap' | 'treemap';

export type Season = {
  season_id: number;
  season_name: string;
};

export type SpecEvolutionData = {
  evolution: Array<{
    spec_counts: Record<string, number>;
  }>;
};

export type TreemapDataItem = {
  name: string;
  value: number;
  color: string;
  week: number;
}; 