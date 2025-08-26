import axios from 'axios';
import type {
  TopKeyParams,
  TopKeysResponse,
  AllSeasonsParams,
  SeasonInfo,
  MythicKeystoneRun,
  CompositionData,
  Season,
  CutoffSnapshot
} from '../types/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// Lightweight in-memory cache for cross-page reuse (browser memory; resets on reload)
// TTL configurable via VITE_API_CACHE_TTL_MS (defaults to 5 minutes)
const API_CACHE_TTL_MS: number = (() => {
  const v = Number(import.meta.env?.VITE_API_CACHE_TTL_MS);
  return Number.isFinite(v) && v > 0 ? v : 5 * 60 * 1000; // 5 minutes
})();

type CacheEntry<T> = { data: T; ts: number };

const seasonsCache: { entry: CacheEntry<Season[]> | null; inflight: Promise<Season[]> | null } = {
  entry: null,
  inflight: null,
};

const seasonInfoCache = new Map<number, CacheEntry<SeasonInfo>>();
const seasonInfoInflight = new Map<number, Promise<SeasonInfo>>();

// Global request deduplication cache
const inflightRequests = new Map<string, Promise<any>>();

function isFresh(ts: number): boolean {
  return Date.now() - ts < API_CACHE_TTL_MS;
}

// Request deduplication helper
function deduplicateRequest<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
  // Check if request is already in flight
  if (inflightRequests.has(key)) {
    console.log(`API: Deduplicating request for key: ${key}`);
    return inflightRequests.get(key) as Promise<T>;
  }

  // Create new request and store it
  const request = requestFn()
    .finally(() => {
      // Clean up after request completes
      inflightRequests.delete(key);
    });

  inflightRequests.set(key, request);
  return request;
}

export function invalidateSeasonsCache() {
  seasonsCache.entry = null;
}

export function invalidateSeasonInfoCache(seasonId?: number) {
  if (typeof seasonId === 'number') {
    seasonInfoCache.delete(seasonId);
  } else {
    seasonInfoCache.clear();
  }
}



export async function fetchTopKeys(params: TopKeyParams): Promise<TopKeysResponse> {
  const requestKey = `top-keys-${JSON.stringify(params)}`;
  
  return deduplicateRequest(requestKey, async () => {
    const searchParams = new URLSearchParams();
    searchParams.append('season_id', params.season_id.toString());
    if (params.period_id) searchParams.append('period_id', params.period_id.toString());
    if (params.dungeon_id) searchParams.append('dungeon_id', params.dungeon_id.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.offset) searchParams.append('offset', params.offset.toString());

    const url = `${API_BASE_URL}/meta/top-keys?${searchParams.toString()}`;
    console.log('API: fetchTopKeys executing request:', url);
    
    const response = await axios.get<TopKeysResponse>(url, { 
      timeout: 10000 // 10 second timeout
    });
    
    return response.data;
  });
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
  const requestKey = `composition-data-${seasonId}`;
  
  return deduplicateRequest(requestKey, async () => {
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
  });
}

// New: Fetch all seasons
export async function fetchSeasons() {
  const url = `${API_BASE_URL}/wow/advanced/seasons`;
  // Cache hit
  if (seasonsCache.entry && isFresh(seasonsCache.entry.ts)) {
    console.log('API: fetchSeasons cache hit');
    return seasonsCache.entry.data;
  }
  // Deduplicate in-flight requests
  if (seasonsCache.inflight) {
    console.log('API: fetchSeasons awaiting inflight');
    return seasonsCache.inflight;
  }
  console.log('API: fetchSeasons fetch', { url });
  const req = axios.get(url)
    .then((response) => {
      seasonsCache.entry = { data: response.data, ts: Date.now() };
      seasonsCache.inflight = null;
      console.log('API: fetchSeasons response received:', {
        status: response.status,
        dataLength: response.data?.length || 0,
      });
      return response.data;
    })
    .catch((error) => {
      seasonsCache.inflight = null;
      console.error('API: fetchSeasons error:', error);
      throw error;
    });
  seasonsCache.inflight = req;
  return req;
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
  // Cache hit
  const cached = seasonInfoCache.get(seasonId);
  if (cached && isFresh(cached.ts)) {
    console.log('API: fetchSeasonInfo cache hit for', seasonId);
    return cached.data;
  }
  // Deduplicate in-flight requests per season
  const inflight = seasonInfoInflight.get(seasonId);
  if (inflight) {
    console.log('API: fetchSeasonInfo awaiting inflight for', seasonId);
    return inflight;
  }
  const url = `${API_BASE_URL}/wow/advanced/season-info/${seasonId}`;
  console.log('API: fetchSeasonInfo fetch', { seasonId, url });
  const req = axios.get(url)
    .then((response) => {
      const data = response.data as SeasonInfo;
      seasonInfoInflight.delete(seasonId);
      seasonInfoCache.set(seasonId, { data, ts: Date.now() });
      return data;
    })
    .catch((error) => {
      seasonInfoInflight.delete(seasonId);
      console.error('API: fetchSeasonInfo error:', error);
      throw error;
    });
  seasonInfoInflight.set(seasonId, req);
  return req;
}

// Cutoff snapshots

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