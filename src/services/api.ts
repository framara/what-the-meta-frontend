import axios from 'axios';
import { logger } from '../utils/logger';
import { ApiError } from '../utils/apiError';
import { cacheService } from './cacheService';

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

// Cache configuration
const API_CACHE_TTL_MS: number = (() => {
  const v = Number(import.meta.env?.VITE_API_CACHE_TTL_MS);
  return Number.isFinite(v) && v > 0 ? v : 5 * 60 * 1000; // 5 minutes
})();

// Inflight request tracking for deduplication
const seasonsInflight = { promise: null as Promise<Season[]> | null };
const seasonInfoInflight = new Map<number, Promise<SeasonInfo>>();

// Simple axios wrapper with ApiError normalization
async function apiRequest<T>(
  url: string, 
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  config: any = {}
): Promise<T> {
  try {
    const response = await axios.request<T>({
      url,
      method,
      ...config
    });
    
    return response.data;
  } catch (error: any) {
    throw ApiError.fromAxiosError(error);
  }
}

// Request deduplication helper
function deduplicateRequest<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
  const inflightRequests = new Map<string, Promise<any>>();
  
  // Check if request is already in flight
  if (inflightRequests.has(key)) {
    logger.log(`API: Deduplicating request for key: ${key}`);
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
  cacheService.invalidate('seasons');
}

export function invalidateSeasonInfoCache(seasonId?: number) {
  if (typeof seasonId === 'number') {
    cacheService.invalidate('season-info', String(seasonId));
  } else {
    cacheService.invalidate('season-info');
  }
}



export async function fetchTopKeys(params: TopKeyParams, options?: { signal?: AbortSignal }): Promise<TopKeysResponse> {
  const requestKey = `top-keys-${JSON.stringify(params)}`;
  
  return deduplicateRequest(requestKey, async () => {
    const searchParams = new URLSearchParams();
    searchParams.append('season_id', params.season_id.toString());
    if (params.period_id) searchParams.append('period_id', params.period_id.toString());
    if (params.dungeon_id) searchParams.append('dungeon_id', params.dungeon_id.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.offset) searchParams.append('offset', params.offset.toString());

    const url = `${API_BASE_URL}/meta/top-keys?${searchParams.toString()}`;
    logger.log('API: fetchTopKeys executing request:', url);
    
    const data = await apiRequest<TopKeysResponse>(url, 'GET', { 
      timeout: 10000, // 10 second timeout
      signal: options?.signal
    });
    
    return data;
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
export async function fetchCompositionData(seasonId: number, options?: { signal?: AbortSignal }) {
  const url = `${API_BASE_URL}/meta/composition-data/${seasonId}`;
  
  return cacheService.getOrFetch(
    'composition-data',
    String(seasonId),
    async () => {
      logger.log('API: fetchCompositionData called with seasonId:', seasonId);
      logger.log('API: fetchCompositionData URL:', url);
      try {
        const response = await axios.get(url, { signal: options?.signal });
        logger.log('API: fetchCompositionData response received:', {
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
        logger.error('API: fetchCompositionData error:', error);
        throw ApiError.fromAxiosError(error);
      }
    },
    { maxSize: 30, ttl: API_CACHE_TTL_MS }
  );
}

// New: Fetch all seasons
export async function fetchSeasons(options?: { signal?: AbortSignal }) {
  const url = `${API_BASE_URL}/wow/advanced/seasons`;
  
  return cacheService.getOrFetch(
    'seasons',
    'all-seasons',
    async () => {
      logger.log('API: fetchSeasons fetch', { url });
      try {
        const response = await axios.get(url, { signal: options?.signal });
        logger.log('API: fetchSeasons response received:', {
          status: response.status,
          dataLength: response.data?.length || 0,
        });
        return response.data;
      } catch (error) {
        logger.error('API: fetchSeasons error:', error);
        throw ApiError.fromAxiosError(error);
      }
    },
    { maxSize: 10, ttl: API_CACHE_TTL_MS }
  );
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
export async function fetchSeasonInfo(seasonId: number, options?: { signal?: AbortSignal }) {
  const url = `${API_BASE_URL}/wow/advanced/season-info/${seasonId}`;
  
  return cacheService.getOrFetch(
    'season-info',
    String(seasonId),
    async () => {
      logger.log('API: fetchSeasonInfo fetch', { seasonId, url });
      try {
        const response = await axios.get(url, { signal: options?.signal });
        const data = response.data as SeasonInfo;
        logger.log('API: fetchSeasonInfo response received for', seasonId);
        return data;
      } catch (error) {
        logger.error('API: fetchSeasonInfo error:', error);
        throw ApiError.fromAxiosError(error);
      }
    },
    { maxSize: 20, ttl: API_CACHE_TTL_MS }
  );
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

export async function fetchSpecEvolution(seasonId?: number, params?: { period_id?: number; dungeon_id?: number }, options?: { signal?: AbortSignal }) {
  logger.log('API: fetchSpecEvolution called with seasonId:', seasonId, 'params:', params);
  
  const searchParams = new URLSearchParams();
  if (params?.period_id) searchParams.append('period_id', params.period_id.toString());
  if (params?.dungeon_id) searchParams.append('dungeon_id', params.dungeon_id.toString());
  
  const queryString = searchParams.toString();
  const url = seasonId 
    ? `${API_BASE_URL}/meta/spec-evolution/${seasonId}${queryString ? `?${queryString}` : ''}`
    : `${API_BASE_URL}/meta/spec-evolution${queryString ? `?${queryString}` : ''}`;
  
  // Create cache key that includes params
  const cacheKey = `${seasonId || 'all'}-${queryString || 'default'}`;
  
  return cacheService.getOrFetch(
    'spec-evolution',
    cacheKey,
    async () => {
      logger.log('API: fetchSpecEvolution URL:', url);
      try {
        const response = await axios.get(url, { signal: options?.signal });
        logger.log('API: fetchSpecEvolution response received:', {
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
        logger.error('API: fetchSpecEvolution error:', error);
        throw ApiError.fromAxiosError(error);
      }
    },
    { maxSize: 30, ttl: API_CACHE_TTL_MS }
  );
}