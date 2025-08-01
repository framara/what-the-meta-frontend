import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export interface AIPredictionRequest {
  seasonData: any;
  specEvolution: any;
  dungeons: any[];
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

export async function getAIPredictions(request: AIPredictionRequest): Promise<AIAnalysisResponse> {
  try {
    const response = await axios.post(`${API_BASE_URL}/ai/predictions`, request, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('AI prediction error:', error);
    throw new Error('Failed to get AI predictions');
  }
}

export async function getAIAnalysis(seasonId: number): Promise<AIAnalysisResponse> {
  try {
    const response = await axios.get(`${API_BASE_URL}/ai/analysis/${seasonId}`);
    return response.data;
  } catch (error: any) {
    // Check if it's a 404 (cache miss) vs other error
    if (error.response?.status === 404) {
      console.log(`📋 No cached AI analysis found for season ${seasonId} - will generate new analysis`);
      throw new Error('CACHE_MISS');
    } else {
      console.error('AI analysis error:', error);
      throw new Error('Failed to get AI analysis');
    }
  }
} 