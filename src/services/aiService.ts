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
}

export interface RoleAnalysis {
  dominantSpecs: Array<{ specId: number; usage: number; name: string }>; // Top 3 most used specs
  underusedSpecs: Array<{ specId: number; usage: number; name: string }>;
  healthStatus: string; // Good, Concerning, Poor
  totalRuns: number; // Total number of runs for this role
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
  } catch (error) {
    console.error('❌ [AI Service] AI prediction error:', error);
    throw new Error('Failed to get AI predictions');
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
    // First, try to get cached analysis
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