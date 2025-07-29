import React, { useMemo } from 'react';
import { WOW_CLASS_COLORS, WOW_SPECIALIZATIONS, WOW_SPEC_TO_CLASS, WOW_CLASS_NAMES } from '../../../constants/wow-constants';
import { PredictionCard } from './PredictionCard';
import { TrendChart } from './TrendChart';
import { SpecDetailsModal } from './SpecDetailsModal';
import './styles/PredictionDashboard.css';
import { Tooltip } from './Tooltip';
import { STABILITY_THRESHOLD, SIGNIFICANT_CHANGE, DISPLAY_COUNT } from '../constants/predictionConstants';

interface PredictionDashboardProps {
  seasonData: any;
  dungeons: any[];
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
  };
}

export const PredictionDashboard: React.FC<PredictionDashboardProps> = ({ seasonData, dungeons }) => {
  // --- IMPROVED: Smoothing, dynamic threshold, confidence interval ---
  function movingAverage(arr: number[], windowSize: number): number[] {
    if (arr.length < windowSize) return arr;
    const result = [];
    for (let i = 0; i < arr.length; i++) {
      const start = Math.max(0, i - windowSize + 1);
      const window = arr.slice(start, i + 1);
      result.push(window.reduce((a, b) => a + b, 0) / window.length);
    }
    return result;
  }

  const predictions = useMemo(() => {
    if (!seasonData || !seasonData.periods || seasonData.periods.length === 0) return [];

    const specTemporalData: Record<number, {
      appearances: number[];
      successRates: number[];
      avgLevel: number[];
      totalRuns: number;
      recentTrend: number;
      trendSlope: number;
      consistency: number;
    }> = {};

    seasonData.periods.forEach((period: any, periodIndex: number) => {
      const periodKeys = period.keys;
      const totalLevel = periodKeys.reduce((sum: number, run: any) => sum + run.keystone_level, 0);
      const avgLevelForPeriod = periodKeys.length > 0 ? totalLevel / periodKeys.length : 0;
      periodKeys.forEach((run: any) => {
        run.members?.forEach((member: any) => {
          const specId = member.spec_id;
          if (!specTemporalData[specId]) {
            specTemporalData[specId] = {
              appearances: new Array(seasonData.total_periods).fill(0),
              successRates: new Array(seasonData.total_periods).fill(0),
              avgLevel: new Array(seasonData.total_periods).fill(0),
              totalRuns: 0,
              recentTrend: 0,
              trendSlope: 0,
              consistency: 0
            };
          }
          specTemporalData[specId].appearances[periodIndex]++;
          specTemporalData[specId].totalRuns++;
          if (run.keystone_level > avgLevelForPeriod) {
            specTemporalData[specId].successRates[periodIndex]++;
          }
          specTemporalData[specId].avgLevel[periodIndex] += run.keystone_level;
        });
      });
    });

    const predictions = Object.entries(specTemporalData)
      .map(([specId, data]) => {
        const specIdNum = parseInt(specId);
        const totalSuccess = data.successRates.reduce((sum, success) => sum + success, 0);
        const totalAppearances = data.appearances.reduce((sum, appearances) => sum + appearances, 0);
        const avgSuccessRate = totalAppearances > 0 ? (totalSuccess / totalAppearances) * 100 : 0;

        // --- Smoothing: moving average for appearances ---
        const windowSize = Math.max(2, Math.floor(data.appearances.length / 4));
        const smoothedAppearances = movingAverage(data.appearances, windowSize);

        // Trend analysis using smoothed data
        const periods = smoothedAppearances.length;
        const xValues = Array.from({ length: periods }, (_, i) => i);
        const yValues = smoothedAppearances;
        const n = periods;
        const sumX = xValues.reduce((sum, x) => sum + x, 0);
        const sumY = yValues.reduce((sum, y) => sum + y, 0);
        const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
        const sumXX = xValues.reduce((sum, x) => sum + x * x, 0);
        const trendSlope = n > 1 ? (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX) : 0;

        // Recent vs early performance (smoothed)
        const recentPeriods = smoothedAppearances.slice(-3);
        const earlyPeriods = smoothedAppearances.slice(0, 3);
        const recentAvg = recentPeriods.reduce((sum, val) => sum + val, 0) / Math.max(recentPeriods.length, 1);
        const earlyAvg = earlyPeriods.reduce((sum, val) => sum + val, 0) / Math.max(earlyPeriods.length, 1);
        const recentTrend = recentAvg - earlyAvg;

        // Consistency (std dev of smoothed appearances)
        const mean = yValues.reduce((sum, val) => sum + val, 0) / periods;
        const variance = yValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / periods;
        const stdDev = Math.sqrt(variance);
        const consistencyScore = Math.max(0, 100 - (stdDev / (mean || 1)) * 100);

        // Predicted change as percent change (smoothed)
        const predictedChange = ((recentAvg - earlyAvg) / Math.max(earlyAvg, 1)) * 100;

        // --- Confidence interval (basic, for illustration) ---
        // Standard error of the mean for recent periods
        const sem = Math.sqrt(recentPeriods.reduce((sum, val) => sum + Math.pow(val - recentAvg, 2), 0) / Math.max(recentPeriods.length - 1, 1)) / Math.sqrt(Math.max(recentPeriods.length, 1));
        const confidenceInterval = 1.96 * sem; // 95% CI

        // --- Dynamic significance threshold ---
        const baseSignificance = 40;
        const dynamicSignificance = baseSignificance + Math.max(0, 10 - periods); // Lower threshold for short seasons

        const significance = (
          Math.abs(predictedChange) * 0.4 +
          Math.abs(trendSlope) * 10 +
          (consistencyScore / 100) * 20 +
          (avgSuccessRate / 100) * 20 +
          Math.min(20, (totalAppearances / 1000) * 10)
        );

        return {
          specId: specIdNum,
          specName: WOW_SPECIALIZATIONS[specIdNum] || 'Unknown',
          className: WOW_CLASS_NAMES[WOW_SPEC_TO_CLASS[specIdNum]] || 'Unknown',
          classColor: WOW_CLASS_COLORS[WOW_SPEC_TO_CLASS[specIdNum]] || '#666666',
          currentUsage: (recentAvg / seasonData.total_keys) * 100,
          predictedChange,
          significance,
          confidence: 70 + (Math.abs(trendSlope) > 1.5 ? 15 : Math.abs(trendSlope) > 0.5 ? 10 : 0) +
                     (avgSuccessRate > 60 ? 15 : avgSuccessRate > 45 ? 10 : 0) +
                     (consistencyScore > 80 ? 10 : consistencyScore > 60 ? 5 : 0),
          successRate: avgSuccessRate,
          confidenceInterval: confidenceInterval.toFixed(2),
          reasoning: `${predictedChange >= 0 ? 'Positive' : 'Negative'} trend with ${predictedChange >= 0 ? 'improving' : 'declining'} performance. Usage is ${predictedChange >= 0 ? 'increasing' : 'decreasing'} (${recentAvg.toFixed(1)} avg change in recent periods). Success rate is ${avgSuccessRate.toFixed(1)}%. Consistency score: ${consistencyScore.toFixed(1)}. 95% CI for change: ±${confidenceInterval.toFixed(2)}. This spec is becoming ${predictedChange >= 0 ? 'more' : 'less'} common in the meta.`,
          temporalData: {
            appearances: data.appearances,
            successRates: data.successRates.map((success, i) => data.appearances[i] > 0 ? (success / data.appearances[i]) * 100 : 0),
            totalRuns: data.totalRuns,
            recentTrend,
            trendSlope,
            consistency: consistencyScore
          }
        };
      })
      .filter(spec => spec.temporalData.totalRuns > 0)
      .sort((a, b) => Math.abs(b.predictedChange) - Math.abs(a.predictedChange))
      .slice(0, 10);

    return predictions;
  }, [seasonData]);


  // Use dynamic significance for rising/declining instead of just predictedChange
  const periods = seasonData?.periods?.length || 0;
  const baseSignificance = 40;
  const dynamicSignificance = baseSignificance + Math.max(0, 10 - periods); // Lower threshold for short seasons

  const displayRisers = predictions
    .filter(p => p.predictedChange > 0 && p.significance > dynamicSignificance)
    .sort((a, b) => b.significance - a.significance)
    .slice(0, DISPLAY_COUNT);

  const displayDecliners = predictions
    .filter(p => p.predictedChange < 0 && p.significance > dynamicSignificance)
    .sort((a, b) => b.significance - a.significance)
    .slice(0, DISPLAY_COUNT);

  const risingCount = predictions.filter(p => p.predictedChange > SIGNIFICANT_CHANGE).length;
  const decliningCount = predictions.filter(p => p.predictedChange < -SIGNIFICANT_CHANGE).length;

  return (
    <div className="prediction-dashboard dashboard-refactored">
      <div className="dashboard-header">
        <h2 className="dashboard-title">
          🤖 Advanced AI Predictions
          <Tooltip content="This section uses AI to analyze all dungeon runs for the season and predict which specializations are rising, declining, or stable in the meta. It looks at trends, success rates, and consistency over time to forecast future performance.">
            <svg className="ai-tooltip-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-label="Info" role="img" style={{marginLeft: '0.5rem', verticalAlign: 'middle'}}>
              <circle cx="10" cy="10" r="10" fill="#3b82f6" />
              <text x="10" y="15" textAnchor="middle" fontSize="13" fill="#fff" fontWeight="bold">i</text>
            </svg>
          </Tooltip>
        </h2>
        <p className="dashboard-subtitle">
          AI analysis using {seasonData?.total_periods || 0} periods and {seasonData?.total_keys || 0} keys for comprehensive temporal analysis
        </p>
      </div>

      <div className="predictions-summary-row">
        <div className="summary-badge rising">Rising Specs <span>{risingCount}</span></div>
        <div className="summary-badge declining">Declining Specs <span>{decliningCount}</span></div>
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
          <div className="predictions-list">
            {displayRisers.map(prediction => (
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
          <div className="predictions-list">
            {displayDecliners.map(prediction => (
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