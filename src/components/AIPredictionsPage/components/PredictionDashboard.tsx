import React, { useMemo, useState, useEffect } from 'react';
import { WOW_CLASS_COLORS, WOW_SPECIALIZATIONS, WOW_SPEC_TO_CLASS, WOW_CLASS_NAMES, SEASON_METADATA } from '../../../constants/wow-constants';
import { PredictionCard } from './PredictionCard';
import '../styles/PredictionDashboard.css';
import { Tooltip } from './Tooltip';
import { DISPLAY_COUNT } from '../constants/predictionConstants';
import { fetchSeasonInfo } from '../../../services/api';

interface PredictionDashboardProps {
  aiAnalysis: any;
  usingCache?: boolean;
  cacheMetadata?: { created_at: string; age_hours: number; max_age_hours: number } | null;
  seasonId?: number; // Add seasonId prop
}

interface Prediction {
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

export const PredictionDashboard: React.FC<PredictionDashboardProps> = ({ aiAnalysis, usingCache, cacheMetadata, seasonId: propSeasonId }) => {
  const [seasonInfo, setSeasonInfo] = useState<any>(null);
  const [loadingSeasonInfo, setLoadingSeasonInfo] = useState(false);
  const [cacheInfo, setCacheInfo] = useState<{ created_at: string; age_hours: number; max_age_hours: number } | null>(null);

  // Function to convert season ID to user-friendly name
  const getSeasonName = (seasonId: number): string => {
    return SEASON_METADATA[seasonId]?.name || `Season ${seasonId}`;
  };

  // Use the seasonId prop instead of extracting from AI analysis
  const seasonId = propSeasonId || 0;

  // Fetch season info when seasonId changes
  useEffect(() => {
    if (seasonId && seasonId > 0) {
      setLoadingSeasonInfo(true);
      fetchSeasonInfo(seasonId)
        .then(info => {
          setSeasonInfo(info);
        })
        .catch(error => {
          console.error('Failed to fetch season info:', error);
        })
        .finally(() => {
          setLoadingSeasonInfo(false);
        });
    }
  }, [seasonId]);

  // Derive cache info from prop or analysis payload
  useEffect(() => {
    if (cacheMetadata) setCacheInfo(cacheMetadata);
    else if ((aiAnalysis as any)?._cache) setCacheInfo((aiAnalysis as any)._cache);
    else setCacheInfo(null);
  }, [cacheMetadata, aiAnalysis]);

  const predictions = useMemo(() => {
    // Only use AI analysis data
    if (aiAnalysis && aiAnalysis.predictions && aiAnalysis.predictions.length > 0) {
      return aiAnalysis.predictions;
    }
    return [];
  }, [aiAnalysis]);

  // Separate rising and declining predictions
  const displayRisers = predictions
    .filter((p: any) => p.predictedChange > 0)
    .sort((a: any, b: any) => b.confidence - a.confidence)
    .slice(0, DISPLAY_COUNT);

  const displayDecliners = predictions
    .filter((p: any) => p.predictedChange < 0)
    .sort((a: any, b: any) => b.confidence - a.confidence)
    .slice(0, DISPLAY_COUNT);

  const risingCount = predictions.filter((p: any) => p.predictedChange > 0).length;
  const decliningCount = predictions.filter((p: any) => p.predictedChange < 0).length;

  // Calculate season info
  const totalPeriods = seasonInfo?.periods?.length || 0;
  const totalKeys = totalPeriods * 1000; // Hardcoded: each period has 1000 keys

  // Debug logging
  console.log('🔍 [PredictionDashboard] Debug info:', {
    seasonId,
    seasonName: getSeasonName(seasonId),
    seasonInfo,
    totalPeriods,
    totalKeys,
    loadingSeasonInfo,
    hasAiAnalysis: !!aiAnalysis,
    aiAnalysisKeys: aiAnalysis ? Object.keys(aiAnalysis) : [],
    analysisKeys: aiAnalysis?.analysis ? Object.keys(aiAnalysis.analysis) : []
  });

  return (
    <div className="prediction-dashboard dashboard-refactored">
      <div className="dashboard-header">
        <h1 className="dashboard-title">
          Spec Predictions – AI Analysis
        </h1>
        <p className="dashboard-subtitle">AI-generated predictions using OpenAI models.</p>
        <p className="dashboard-data-info">
          {getSeasonName(seasonId)} • {totalPeriods} week(s)
        </p>
        {cacheInfo && (
          <div className="prediction-cache-indicator" title={`Generated ${formatAge(cacheInfo.age_hours)} ago • Max age ${cacheInfo.max_age_hours}h`}>
            <span className="prediction-cache-dot" />
            Cached • {formatAge(cacheInfo.age_hours)} ago
          </div>
        )}
      </div>

      <div className="predictions-columns">
        <div className="predictions-column">
          <h3 className="section-title">
            🚀 Top Rising Specs
            <Tooltip content="These are the specializations that are gaining popularity and performing better each week. Watch these for emerging meta trends.">
              <svg className="ai-tooltip-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-label="Info" role="img" style={{marginLeft: '0.5rem', verticalAlign: 'middle'}}>
                <circle cx="10" cy="10" r="10" fill="#3b82f6" />
                <text x="10" y="15" textAnchor="middle" fontSize="13" fill="#fff" fontWeight="bold">i</text>
              </svg>
            </Tooltip>
          </h3>
          <div className="summary-badge rising">Rising Specs <span>{displayRisers.length || 0}</span></div> 
          <div className="predictions-list">
            {displayRisers.map((prediction: any) => (
              <PredictionCard
                key={prediction.specId}
                prediction={prediction}
                type="rising"
                style={{ cursor: 'pointer' }}
              />
            ))}
          </div>
        </div>

        <div className="predictions-column">
          <h3 className="section-title">
            📉 Top Declining Specs
            <Tooltip content="These specializations are being used less or performing worse over time. They may be falling out of favor in the current meta.">
              <svg className="ai-tooltip-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-label="Info" role="img" style={{marginLeft: '0.5rem', verticalAlign: 'middle'}}>
                <circle cx="10" cy="10" r="10" fill="#3b82f6" />
                <text x="10" y="15" textAnchor="middle" fontSize="13" fill="#fff" fontWeight="bold">i</text>
              </svg>
            </Tooltip>
          </h3>
          <div className="summary-badge declining">Declining Specs <span>{displayDecliners.length || 0}</span></div>
          <div className="predictions-list">
            {displayDecliners.map((prediction: any) => (
              <PredictionCard
                key={prediction.specId}
                prediction={prediction}
                type="declining"
                style={{ cursor: 'pointer' }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

function formatAge(hours: number | undefined): string {
  if (!Number.isFinite(hours as number) || (hours as number) < 0) return '';
  const h = hours as number;
  if (h < 1) {
    const mins = Math.max(1, Math.round(h * 60));
    return `${mins}m`;
  }
  if (h < 24) return `${h.toFixed(h < 10 ? 1 : 0)}h`;
  const d = h / 24;
  return `${d.toFixed(d < 10 ? 1 : 0)}d`;
}