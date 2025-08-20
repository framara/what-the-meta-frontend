import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export interface AIPredictionRequest {
  seasonId: number;
}

export interface AIPrediction {
  specId: number;
  specName: string;
  className: string;
  classColor: string;
  currentUsage: number;
  predictedChange: number;
  confidence: number;
  successRate: number;
  reasoning: string;
  temporalData: {
    appearances: number[];
    successRates: number[];
    totalRuns: number;
    recentTrend: number;
    trendSlope: number;
    consistency: number;
    crossValidationScore: number;
  };
}

export interface AIAnalysisResponse {
  predictions: AIPrediction[];
  analysis: {
    metaTrends: string[];
    keyInsights: string[];
    confidence: number;
    dataQuality: string;
  };
  _cache?: {
    created_at: string;
    age_hours: number;
    max_age_hours: number;
  };
}

export interface MetaHealthRequest {
  seasonId: number;
  forceRefresh?: boolean;
}

export interface CompositionAnalysis {
  mostPopularGroup?: {
    specs: number[]; // Array of 5 spec IDs in the most popular composition
    specNames: string[]; // Array of spec names for display
    usage: number; // Percentage of total runs this composition represents
    avgLevel: number; // Average keystone level for this composition
    count: number; // Total count of this composition
  };
  specReplacements?: {
    [specId: number]: {
      specName: string; // Name of the spec in the most popular group
      role: string; // "tank", "healer", or "dps"
      replacements: Array<{
        specId: number; // ID of the replacement spec
        specName: string; // Name of the replacement spec
        count: number; // How many times this replacement occurred
        avgLevel: number; // Average keystone level for this replacement
        usage: number; // Percentage of total runs this replacement represents
        role: string; // Role of the replacement spec
      }>;
    };
  };
  compositionDiversity: string; // "High", "Medium", "Low" - assessment of composition variety
  dominantPatterns: string[]; // 1-2 sentences about composition flexibility and meta adaptability
}

export interface MetaHealthResponse {
  metaSummary: {
    overallState: string; // Healthy, Concerning, Unhealthy
    summary: string;
    keyInsights: string[];
  };
  roleAnalysis: {
    tank: RoleAnalysis;
    healer: RoleAnalysis;
    dps: RoleAnalysis;
  };
  compositionAnalysis: CompositionAnalysis;
  balanceIssues: Array<{
    type: string; // dominance, underuse, role_imbalance, composition_stagnation
    description: string;
    severity: string; // low, medium, high
  }>;
  _cache?: { created_at: string; age_hours: number; max_age_hours: number };
}

export interface AffixInsightsRequest {
  seasonId: number;
  periodId?: number;
  dungeonId?: number;
}

export interface AffixInsightsResponse {
  summary: string;
  winners: Array<{ specId: number; reason: string; confidence: number }>;
  losers: Array<{ specId: number; reason: string; confidence: number }>;
  dungeonTips?: Array<{ dungeonId: number; tips: string[] }>;
  citations: { periodIds: number[] };
  _cache?: { created_at: string; age_hours: number; max_age_hours: number };
}

export async function getAffixInsights(request: AffixInsightsRequest): Promise<AffixInsightsResponse> {
  const response = await axios.post(`${API_BASE_URL}/ai/affix-insights`, request, {
    headers: { 'Content-Type': 'application/json' },
  });
  return response.data as AffixInsightsResponse;
}

export interface RoleAnalysis {
  dominantSpecs: Array<{ specId: number; usage: number; name: string }>; // Top 3 most used specs
  underusedSpecs: Array<{ specId: number; usage: number; name: string }>;
  healthStatus: string; // Good, Concerning, Poor
  totalRuns: number; // Total number of runs for this role
}

// Tier List types
export type TierKey = 'S' | 'A' | 'B' | 'C' | 'D';
export interface TierListEntry {
  specId: number;
  specName: string;
  className: string;
  role: string;
  usage: number;
}
export interface TierListResponse {
  tiers: Record<TierKey, TierListEntry[]>;
  // tiers-only schema
  _cache?: { created_at: string; age_hours: number; max_age_hours: number };
}

export async function getAIPredictions(request: AIPredictionRequest): Promise<AIAnalysisResponse> {
  try {
    console.log('🤖 [AI Service] Making predictions request:', {
      seasonId: request.seasonId,
      url: `${API_BASE_URL}/ai/predictions`
    });
    
    const response = await axios.post(`${API_BASE_URL}/ai/predictions`, request, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('✅ [AI Service] Predictions response received:', {
      status: response.status,
      hasData: !!response.data,
      dataKeys: Object.keys(response.data || {})
    });
    
    return response.data;
  } catch (error: any) {
    console.error('❌ [AI Service] AI prediction error:', error);
    // Preserve axios error so callers can inspect response.status (e.g., 404)
    if (error?.response) {
      throw error;
    }
    // Fallback: wrap unknown error types
    const wrapped: any = new Error('Failed to get AI predictions');
    if (error?.message) wrapped.cause = error;
    throw wrapped;
  }
}

// Cache-first: GET cached Tier List, else POST to generate
export async function getTierListCached(seasonId: number): Promise<TierListResponse> {
  try {
    const resp = await axios.get(`${API_BASE_URL}/ai/analysis/${seasonId}?type=tier_list`);
    return resp.data as TierListResponse;
  } catch (err: any) {
    if (err.response?.status === 404) throw new Error('CACHE_MISS');
    throw new Error('Failed to get cached tier list');
  }
}

export async function generateTierList(seasonId: number, forceRefresh?: boolean): Promise<TierListResponse> {
  const resp = await axios.post(`${API_BASE_URL}/ai/tier-list`, { seasonId, forceRefresh: !!forceRefresh }, {
    headers: { 'Content-Type': 'application/json' },
  });
  return resp.data as TierListResponse;
}

export async function getTierList(seasonId: number): Promise<TierListResponse> {
  try {
    return await getTierListCached(seasonId);
  } catch (e: any) {
    if (e.message === 'CACHE_MISS') {
      return await generateTierList(seasonId);
    }
    throw e;
  }
}

export async function getAIAnalysis(seasonId: number): Promise<AIAnalysisResponse> {
  try {
    console.log(`📋 [AI Service] Getting cached analysis for season ${seasonId}:`, `${API_BASE_URL}/ai/analysis/${seasonId}?type=predictions`);
    
    const response = await axios.get(`${API_BASE_URL}/ai/analysis/${seasonId}?type=predictions`);
    
    console.log('✅ [AI Service] Cached analysis response received:', {
      status: response.status,
      hasData: !!response.data,
      dataKeys: Object.keys(response.data || {})
    });
    
    return response.data;
  } catch (error: any) {
    console.log(`❌ [AI Service] Cache check failed for season ${seasonId}:`, {
      status: error.response?.status,
      message: error.message
    });
    
    // Check if it's a 404 (cache miss) vs other error
    if (error.response?.status === 404) {
      console.log(`📋 [AI Service] Cache miss for season ${seasonId} - this is expected`);
      throw new Error('CACHE_MISS');
    } else {
      console.error('❌ [AI Service] AI analysis error:', error);
      throw new Error('Failed to get AI analysis');
    }
  }
}

export async function getMetaHealthAnalysis(request: MetaHealthRequest): Promise<MetaHealthResponse> {
  console.log('🤖 [AI Service] getMetaHealthAnalysis called', {
    seasonId: request.seasonId
  });
  
  try {
    // If force refresh is requested, bypass cache and generate fresh analysis
    if (request.forceRefresh) {
      console.log(`🔄 [AI Service] Force refresh enabled for season ${request.seasonId} - generating new analysis`);
      const response = await axios.post(`${API_BASE_URL}/ai/meta-health`, request, {
        headers: { 'Content-Type': 'application/json' },
      });
      console.log('✅ [AI Service] Meta health analysis (forced) completed:', {
        status: response.status,
        hasData: !!response.data,
        dataKeys: Object.keys(response.data || {})
      });
      return response.data;
    }

    // Otherwise, first try to get cached analysis
    console.log(`📋 [AI Service] Checking cache for season ${request.seasonId}`);
    const cachedResponse = await axios.get(`${API_BASE_URL}/ai/analysis/${request.seasonId}?type=meta_health`);
    console.log('✅ [AI Service] Cached meta health analysis found:', {
      status: cachedResponse.status,
      hasData: !!cachedResponse.data,
      dataKeys: Object.keys(cachedResponse.data || {})
    });
    return cachedResponse.data;
  } catch (error: any) {
    console.log(`📋 [AI Service] Cache miss for season ${request.seasonId} - generating new analysis`);
    
    // If cache miss (404), call the meta-health endpoint to generate new analysis
    if (error.response?.status === 404) {
      console.log('🤖 [AI Service] Calling meta-health endpoint for new analysis...');
      
      const response = await axios.post(`${API_BASE_URL}/ai/meta-health`, request, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('✅ [AI Service] Meta health analysis completed:', {
        status: response.status,
        hasData: !!response.data,
        dataKeys: Object.keys(response.data || {})
      });
      
      return response.data;
    } else {
      console.error('❌ [AI Service] Meta health analysis error:', error);
      if (error.response) {
        console.error('❌ [AI Service] Error response:', {
          status: error.response.status,
          data: error.response.data
        });
      }
      throw new Error('Failed to get meta health analysis');
    }
  }
} 