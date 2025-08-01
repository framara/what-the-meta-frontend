export interface SpecData {
  spec_id: number;
  spec_name: string;
  class_id: number;
  class_name: string;
  class_color: string;
  count: number;
  percentage: number;
}

export interface PeriodData {
  period_id: number;
  period_name?: string;
  period_label?: string;
  expansion_id?: number;
  expansion_name?: string;
  season_id?: number;
  season_name?: string;
  specs: SpecData[];
  total_count: number;
}

export interface RaceBarsData {
  season_id: number;
  periods: PeriodData[];
  loading: boolean;
  error: string | null;
} 