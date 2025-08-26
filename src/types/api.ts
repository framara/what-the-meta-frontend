// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    timestamp: string;
    cache?: {
      hit: boolean;
      age_ms: number;
    };
    total?: number;
    page?: number;
    limit?: number;
  };
}

export interface ApiError {
  success: false;
  error: {
    message: string;
    code: string | number;
    timestamp: string;
    details?: unknown;
  };
}

// WoW Game Data Types
export interface GroupMember {
  character_name: string;
  class_id: number;
  spec_id: number;
  role: 'tank' | 'healer' | 'dps';
}

export interface MythicKeystoneRun {
  id: number;
  rank: number;
  keystone_level: number;
  score: number;
  dungeon_id: number;
  duration_ms: number;
  completed_at: string;
  members: GroupMember[];
}

export interface Dungeon {
  dungeon_id: number;
  dungeon_name: string;
  dungeon_shortname?: string;
  name?: string;
  shortname?: string;
}

export interface Season {
  season_id: number;
  season_name: string;
  expansion_id: number;
  start_date?: string;
  end_date?: string;
}

export interface Period {
  period_id: number;
  period_name: string;
  season_id: number;
  start_date: string;
  end_date: string;
}

// API Request Parameter Types
export interface TopKeyParams {
  season_id: number;
  period_id?: number;
  dungeon_id?: number;
  limit?: number;
  offset?: number;
}

// New enhanced response format from /meta/top-keys
export interface TopKeysResponse {
  season_info: {
    season_id: number;
    season_name: string;
    expansion: string;
    patch: string;
  };
  meta: {
    total_runs: number;
    limit: number;
    offset: number;
  };
  data: MythicKeystoneRun[];
}

export interface AllSeasonsParams {
  period_id?: number;
  dungeon_id?: number;
  limit?: number;
  offset?: number;
}

export interface SeasonInfo {
  periods: Period[];
  dungeons: Dungeon[];
}

// Composition Analysis Types
export interface CompositionData {
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
      [key: string]: unknown;
    }>;
  }>;
}

// AI Service Types
export interface AIPredictionRequest {
  seasonId: number;
  forceRefresh?: boolean;
}

export interface AIAnalysisResponse {
  season_id: number;
  analysis: {
    meta_predictions: unknown;
    tier_list?: unknown;
    meta_health?: unknown;
  };
  confidence_score: number;
  generated_at: string;
  _cache?: {
    created_at: string;
    age_hours: number;
    max_age_hours: number;
  };
}

export interface TierListResponse {
  season_id: number;
  tiers: {
    S: Array<{ spec_id: number; class_id: number; score: number }>;
    A: Array<{ spec_id: number; class_id: number; score: number }>;
    B: Array<{ spec_id: number; class_id: number; score: number }>;
    C: Array<{ spec_id: number; class_id: number; score: number }>;
    D: Array<{ spec_id: number; class_id: number; score: number }>;
  };
  generated_at: string;
}

export interface MetaHealthRequest {
  seasonId: number;
  periodId?: number;
}

export interface MetaHealthResponse {
  season_id: number;
  period_id?: number;
  diversity_score: number;
  balance_metrics: {
    tank_diversity: number;
    healer_diversity: number;
    dps_diversity: number;
  };
  analysis: {
    summary: string;
    recommendations: string[];
  };
  generated_at: string;
}

// Cutoff Data Types
export interface CutoffSnapshot {
  id: number;
  created_at: string;
  season_slug: string;
  region: string;
  cutoff_score: number;
  target_count: number;
  total_qualifying: number;
  source_pages: number;
  dungeon_count: number;
  distribution: Record<string, { total: number; specs: Record<string, number> }>;
  allColor?: string; // optional color hint for overall/cutoff visuals
}

// Progress Tracking Types
export interface ProgressState {
  currentStep: number;
  totalSteps: number;
  progress: number;
  message: string;
  isCompleted: boolean;
  hasErrors: boolean;
}

export interface LoadingStep {
  id: string;
  label: string;
  status: 'pending' | 'loading' | 'completed' | 'error';
}
