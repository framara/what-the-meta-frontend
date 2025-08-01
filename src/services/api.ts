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

// New: Fetch all seasons
export async function fetchSeasons() {
  const url = `${API_BASE_URL}/wow/advanced/seasons`;
  const response = await axios.get(url);
  return response.data as Array<{ season_id: number; season_name: string }>;
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

export async function fetchSpecEvolution(seasonId?: number) {
  const url = seasonId 
    ? `${API_BASE_URL}/meta/spec-evolution/${seasonId}`
    : `${API_BASE_URL}/meta/spec-evolution`;
  const response = await axios.get(url);
  return response.data as {
    season_id: number;
    evolution: Array<{
      period_id: number;
      period_name?: string;
      spec_counts: Record<string, number>;
    }>;
  };
}