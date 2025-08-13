import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export interface TopKeyParams {
  season_id: number;
  period_id?: number;
  dungeon_id?: number;
  limit?: number;
  offset?: number;
}

export async function fetchTopKeys(params: TopKeyParams) {
  const searchParams = new URLSearchParams();
  searchParams.append('season_id', params.season_id.toString());
  if (params.period_id) searchParams.append('period_id', params.period_id.toString());
  if (params.dungeon_id) searchParams.append('dungeon_id', params.dungeon_id.toString());
  if (params.limit) searchParams.append('limit', params.limit.toString());
  if (params.offset) searchParams.append('offset', params.offset.toString());

  const url = `${API_BASE_URL}/meta/top-keys?${searchParams.toString()}`;
  const response = await axios.get(url, { timeout: 10000 }); // 10 second timeout
  return response.data;
}

export interface AllSeasonsParams {
  period_id?: number;
  dungeon_id?: number;
  limit?: number;
  offset?: number;
}

export async function fetchTopKeysAllSeasons(params: AllSeasonsParams) {
  const searchParams = new URLSearchParams();
  if (params.period_id) searchParams.append('period_id', params.period_id.toString());
  if (params.dungeon_id) searchParams.append('dungeon_id', params.dungeon_id.toString());
  if (params.limit) searchParams.append('limit', params.limit.toString());
  if (params.offset) searchParams.append('offset', params.offset.toString());

  const url = `${API_BASE_URL}/meta/top-keys-all-seasons?${searchParams.toString()}`;
  const response = await axios.get(url);
  return response.data;
}

// New: Fetch comprehensive season data for AI analysis
export async function fetchSeasonData(seasonId: number) {
  const url = `${API_BASE_URL}/meta/season-data/${seasonId}`;
  const response = await axios.get(url);
  return response.data as {
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
  };
}

// New: Fetch composition data optimized for group composition analysis
export async function fetchCompositionData(seasonId: number) {
  console.log('API: fetchCompositionData called with seasonId:', seasonId);
  const url = `${API_BASE_URL}/meta/composition-data/${seasonId}`;
  console.log('API: fetchCompositionData URL:', url);
  try {
    const response = await axios.get(url);
    console.log('API: fetchCompositionData response received:', {
      status: response.status,
      hasData: !!response.data,
      dataKeys: Object.keys(response.data || {}),
      periodsCount: response.data?.periods?.length || 0
    });
    return response.data as {
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
    };
  } catch (error) {
    console.error('API: fetchCompositionData error:', error);
    throw error;
  }
}

// New: Fetch all seasons
export async function fetchSeasons() {
  console.log('API: fetchSeasons called');
  const url = `${API_BASE_URL}/wow/advanced/seasons`;
  console.log('API: fetchSeasons URL:', url);
  try {
    const response = await axios.get(url);
    console.log('API: fetchSeasons response received:', {
      status: response.status,
      dataLength: response.data?.length || 0,
      firstSeason: response.data?.[0]
    });
    return response.data;
  } catch (error) {
    console.error('API: fetchSeasons error:', error);
    throw error;
  }
}

// Helper: Get latest season id (API provides DB-first data)
export async function getLatestSeasonId(): Promise<number | null> {
  try {
    // Prefer dedicated endpoint if available
    const url = `${API_BASE_URL}/wow/advanced/current-season`;
    const resp = await axios.get(url);
    if (resp?.data?.season_id) return Number(resp.data.season_id);
  } catch {
    // Fallback to full seasons list
  }
  try {
    const seasons = await fetchSeasons();
    if (!Array.isArray(seasons) || seasons.length === 0) return null;
    return seasons.reduce((max: number, s: any) => (s.season_id > max ? s.season_id : max), seasons[0].season_id);
  } catch {
    return null;
  }
}

// New: Fetch season info (periods and dungeons) for a given seasonId
export async function fetchSeasonInfo(seasonId: number) {
  const url = `${API_BASE_URL}/wow/advanced/season-info/${seasonId}`;
  const response = await axios.get(url);
  return response.data as {
    periods: Array<{ period_id: number; period_name: string }>;
    dungeons: Array<{ dungeon_id: number; dungeon_name: string }>;
  };
}

// Cutoff snapshots
export type CutoffSnapshot = {
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
};

export async function fetchCutoffLatest(season: string, region: string) {
  const url = `${API_BASE_URL}/raiderio/cutoff-snapshots/latest?season=${encodeURIComponent(season)}&region=${encodeURIComponent(region)}`;
  const resp = await axios.get(url);
  return resp.data as CutoffSnapshot;
}

export async function fetchCutoffIndex() {
  const url = `${API_BASE_URL}/raiderio/cutoff-snapshots/index`;
  const resp = await axios.get(url);
  return resp.data as Array<Pick<CutoffSnapshot, 'season_slug' | 'region' | 'id' | 'created_at' | 'cutoff_score' | 'target_count' | 'total_qualifying'>>;
}

export async function fetchCutoffBySeason(season: string) {
  const url = `${API_BASE_URL}/raiderio/cutoff-snapshots/by-season?season=${encodeURIComponent(season)}`;
  const resp = await axios.get(url);
  return resp.data as CutoffSnapshot[];
}

export async function fetchSpecEvolution(seasonId?: number) {
  console.log('API: fetchSpecEvolution called with seasonId:', seasonId);
  const url = seasonId 
    ? `${API_BASE_URL}/meta/spec-evolution/${seasonId}`
    : `${API_BASE_URL}/meta/spec-evolution`;
  console.log('API: fetchSpecEvolution URL:', url);
  try {
    const response = await axios.get(url);
    console.log('API: fetchSpecEvolution response received:', {
      status: response.status,
      hasData: !!response.data,
      dataKeys: Object.keys(response.data || {}),
      evolutionLength: response.data?.evolution?.length || 0
    });
    return response.data as {
    season_id: number;
    expansion_id: number;
    expansion_name: string;
    season_name: string;
    evolution: Array<{
      period_id: number;
      week: number;
      period_label: string;
      spec_counts: Record<string, number>;
    }>;
  };
  } catch (error) {
    console.error('API: fetchSpecEvolution error:', error);
    throw error;
  }
}