import React, { useState, useMemo } from 'react';
import { WOW_CLASS_COLORS, WOW_SPECIALIZATIONS, WOW_SPEC_TO_CLASS, WOW_SPEC_ROLES } from '../../../constants/wow-constants';
import { SpecIconImage } from '../../../utils/specIconImages';
import { getTextColor } from '../utils/compositionUtils';
import type { Composition } from '../utils/compositionUtils';
import type { TooltipState } from '../hooks/useTooltip';

interface SeasonData {
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
        role: string;
      }>;
      [key: string]: any;
    }>;
  }>;
}

interface CompositionCardProps {
  composition: Composition;
  index: number;
  selectedSpec: number | null;
  onSpecClick: (specId: number) => void;
  setSpecTooltip: (tooltip: TooltipState | null) => void;
  seasonData: SeasonData | null;
  trendLoading?: boolean;
}

interface CompositionStats {
  highestKey: number;
  averageKeyLevel: number;
  totalRuns: number;
  successRate: number;
  averageScore: number;
  bestPeriod: number;
}

interface CompositionTrendData {
  periodId: number;
  weekNumber: number;
  usage: number;
}

// Mini trend chart component
const MiniTrendChart: React.FC<{ trendData: CompositionTrendData[] }> = ({ trendData }) => {
  if (!trendData.length) {
    return (
      <div className="mini-trend-chart">
        <div className="chart-container">
          <span style={{ color: '#9ca3af', fontSize: '0.8rem' }}>No trend data</span>
        </div>
      </div>
    );
  }

  const maxUsage = Math.max(...trendData.map(d => d.usage));
  const minUsage = Math.min(...trendData.map(d => d.usage));
  const range = maxUsage - minUsage;

  // Ensure we have at least 2 points for a line
  if (trendData.length < 2) {
    return (
      <div className="mini-trend-chart">
        <div className="chart-container">
          <span style={{ color: '#9ca3af', fontSize: '0.8rem' }}>
            {trendData.length === 0 ? 'Loading trend...' : 'Single period data'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="mini-trend-chart">
      <div className="chart-container">
        <svg width="100%" height="40" viewBox="0 0 200 40" style={{ display: 'block' }}>
          <defs>
            <linearGradient id="trendGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.3" />
            </linearGradient>
          </defs>
          
          {/* Background grid */}
          <g className="grid">
            {[0, 10, 20, 30, 40].map(y => (
              <line key={y} x1="0" y1={y} x2="200" y2={y} stroke="#374151" strokeWidth="0.5" opacity="0.2" />
            ))}
          </g>
          
          {/* Trend line with gradient fill */}
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          
          {/* Filled area under the line */}
          <path
            d={`M 10,${range > 0 ? 35 - ((trendData[0].usage - minUsage) / range) * 30 : 20} ${trendData.map((d, i) => {
              const x = (i / (trendData.length - 1)) * 180 + 10;
              const y = range > 0 ? 35 - ((d.usage - minUsage) / range) * 30 : 20;
              return `L ${x},${y}`;
            }).join(' ')} L ${(trendData.length - 1) / (trendData.length - 1) * 180 + 10},35 L 10,35 Z`}
            fill="url(#lineGradient)"
            opacity="0.3"
          />
          
          {/* Main trend line */}
          <polyline
            points={trendData.map((d, i) => {
              const x = (i / (trendData.length - 1)) * 180 + 10;
              const y = range > 0 ? 35 - ((d.usage - minUsage) / range) * 30 : 20;
              return `${x},${y}`;
            }).join(' ')}
            stroke="#3b82f6"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="drop-shadow(0 1px 2px rgba(59, 130, 246, 0.3))"
          />
          
          {/* Only show dots at start, end, and peak points */}
          {trendData.map((d, i) => {
            const x = (i / (trendData.length - 1)) * 180 + 10;
            const y = range > 0 ? 35 - ((d.usage - minUsage) / range) * 30 : 20;
            
            // Only show dots at start, end, and peak points
            const isStart = i === 0;
            const isEnd = i === trendData.length - 1;
            const isPeak = d.usage === maxUsage;
            const isValley = d.usage === minUsage;
            
            if (isStart || isEnd || isPeak || isValley) {
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r="3"
                  fill="#3b82f6"
                  stroke="#1e293b"
                  strokeWidth="1.5"
                  filter="drop-shadow(0 1px 1px rgba(0, 0, 0, 0.3))"
                />
              );
            }
            return null;
          })}
        </svg>
      </div>
    </div>
  );
};

export const CompositionCard: React.FC<CompositionCardProps> = ({
  composition,
  index,
  selectedSpec,
  onSpecClick,
  setSpecTooltip,
  seasonData,
  trendLoading = false
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';

  // Handle touch events for better mobile experience
  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsFlipped(!isFlipped);
  };

  const handleSpecClick = (e: React.MouseEvent, specId: number) => {
    e.preventDefault();
    e.stopPropagation();
    onSpecClick(specId);
  };

  const handleSpecTouch = (e: React.TouchEvent, specId: number) => {
    e.preventDefault();
    e.stopPropagation();
    onSpecClick(specId);
  };

  const handleSpecMouseEnter = (e: React.MouseEvent, specId: number, classId: number) => {
    e.stopPropagation();
    setSpecTooltip({
      x: e.clientX,
      y: e.clientY,
      content: WOW_SPECIALIZATIONS[specId] || '-',
      color: WOW_CLASS_COLORS[classId] || '#23263a',
    });
  };

  const handleSpecMouseMove = (e: React.MouseEvent, specId: number, classId: number) => {
    e.stopPropagation();
    setSpecTooltip({
      x: e.clientX,
      y: e.clientY,
      content: WOW_SPECIALIZATIONS[specId] || '-',
      color: WOW_CLASS_COLORS[classId] || '#23263a',
    });
  };

  const handleSpecMouseLeave = () => {
    setSpecTooltip(null);
  };

  // Calculate detailed statistics for this composition
  const compositionStats = useMemo((): CompositionStats | null => {
    if (!seasonData) return null;

    const compositionSpecs = new Set(composition.specs);
    let totalRuns = 0;
    let highestKey = 0;
    let totalKeyLevel = 0;
    let totalScore = 0;
    let successfulRuns = 0;
    const periodStats: Record<number, { runs: number; keyLevels: number[]; scores: number[] }> = {};

    // Analyze all periods
    seasonData.periods.forEach(period => {
      period.keys.forEach(key => {
        const keySpecs = key.members.map(m => Number(m.spec_id));
        
        // Check if this key has the exact composition (all specs match)
        // Convert both to sorted arrays for comparison
        const sortedCompositionSpecs = Array.from(compositionSpecs).sort((a, b) => a - b);
        const sortedKeySpecs = keySpecs.sort((a, b) => a - b);
        
        const hasExactComposition = sortedCompositionSpecs.length === sortedKeySpecs.length && 
          sortedCompositionSpecs.every((spec, index) => spec === sortedKeySpecs[index]);

        if (hasExactComposition) {
          totalRuns++;
          highestKey = Math.max(highestKey, key.keystone_level);
          totalKeyLevel += key.keystone_level;
          totalScore += key.score || 0;
          successfulRuns++;

          if (!periodStats[period.period_id]) {
            periodStats[period.period_id] = { runs: 0, keyLevels: [], scores: [] };
          }
          periodStats[period.period_id].runs++;
          periodStats[period.period_id].keyLevels.push(key.keystone_level);
          periodStats[period.period_id].scores.push(key.score || 0);
        }
      });
    });

    const averageKeyLevel = totalRuns > 0 ? totalKeyLevel / totalRuns : 0;
    const averageScore = totalRuns > 0 ? totalScore / totalRuns : 0;
    const successRate = totalRuns > 0 ? (successfulRuns / totalRuns) * 100 : 0;

    // Find best performing period and calculate its week number
    let bestPeriodId = 0;
    let bestAvgKeyLevel = 0;
    Object.entries(periodStats).forEach(([periodId, stats]) => {
      const avgKeyLevel = stats.keyLevels.reduce((a, b) => a + b, 0) / stats.keyLevels.length;
      if (avgKeyLevel > bestAvgKeyLevel) {
        bestAvgKeyLevel = avgKeyLevel;
        bestPeriodId = Number(periodId);
      }
    });

    // Calculate week number based on ordinal position of the best period
    const sortedPeriods = seasonData.periods.map(p => p.period_id).sort((a, b) => a - b);
    const weekNumber = sortedPeriods.indexOf(bestPeriodId) + 1;

    return {
      highestKey,
      averageKeyLevel: Math.round(averageKeyLevel * 10) / 10,
      totalRuns,
      successRate: Math.round(successRate * 10) / 10,
      averageScore: Math.round(averageScore * 10) / 10,
      bestPeriod: weekNumber,
    };
  }, [composition, seasonData]);

    // Calculate trend data for the mini chart
  const trendData = useMemo((): CompositionTrendData[] => {
    if (!seasonData) return [];

    const compositionSpecs = new Set(composition.specs);
    const sortedPeriods = seasonData.periods.map(p => p.period_id).sort((a, b) => a - b);
    
    
    
    return sortedPeriods.map((periodId, index) => {
      const period = seasonData.periods.find(p => p.period_id === periodId);
      if (!period) return { periodId, weekNumber: index + 1, usage: 0 };

      let usage = 0;
      period.keys.forEach(key => {
        const keySpecs = key.members.map(m => Number(m.spec_id));
        
        // Check if this key has the exact composition (all specs match)
        // Convert both to sorted arrays for comparison
        const sortedCompositionSpecs = Array.from(compositionSpecs).sort((a, b) => a - b);
        const sortedKeySpecs = keySpecs.sort((a, b) => a - b);
        
        const hasExactComposition = sortedCompositionSpecs.length === sortedKeySpecs.length && 
          sortedCompositionSpecs.every((spec, index) => spec === sortedKeySpecs[index]);
        
        if (hasExactComposition) {
          usage++;
        }
      });

      return {
        periodId,
        weekNumber: index + 1,
        usage
      };
    });
  }, [composition, seasonData]);

  return (
    <div 
      className={`composition-card ${isFlipped ? 'flipped' : ''}`}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      aria-label={`Composition ${index + 1} - Click to ${isFlipped ? 'flip back' : 'see stats'}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setIsFlipped(!isFlipped);
        }
      }}
    >
      <div className="card-inner">
        {/* Front of card */}
        <div className="card-front">
          <div className="composition-header">
            <span className="composition-rank">{medal} #{index + 1}</span>
            <span className="composition-count">x{composition.count}</span>
          </div>
          <div className="composition-specs">
            {composition.specs.map((specId, specIndex) => {
              const classId = Number(WOW_SPEC_TO_CLASS[specId]) || 0;
              const role = WOW_SPEC_ROLES[specId] || '';
              const isSelectedSpec = selectedSpec === specId;
              const specName = WOW_SPECIALIZATIONS[specId] || 'Unknown Spec';
              
              return (
                <div
                  key={specIndex}
                  className={`composition-spec ${isSelectedSpec ? 'selected-spec' : ''}`}
                  style={{
                    border: isSelectedSpec 
                      ? '3px solid #3b82f6' 
                      : `3px solid ${WOW_CLASS_COLORS[classId] || '#fff'}`,
                    boxShadow: isSelectedSpec ? '0 0 0 2px rgba(59, 130, 246, 0.3)' : '0 2px 4px rgba(0, 0, 0, 0.2)',
                  }}
                  onMouseEnter={(e) => handleSpecMouseEnter(e, specId, classId)}
                  onMouseMove={(e) => handleSpecMouseMove(e, specId, classId)}
                  onMouseLeave={handleSpecMouseLeave}
                  onClick={(e) => handleSpecClick(e, specId)}
                  onTouchStart={(e) => handleSpecTouch(e, specId)}
                  role="button"
                  tabIndex={0}
                  aria-label={`${specName} - ${role}`}
                  aria-pressed={isSelectedSpec}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      e.stopPropagation();
                      onSpecClick(specId);
                    }
                  }}
                >
                  <SpecIconImage 
                    specId={specId} 
                    alt={specName}
                  />
                </div>
              );
            })}
          </div>
          
          {/* Mini trend chart; show spinner only while hydrating */}
          <div className="trend-chart-container" style={{ position: 'relative' }}>
            {trendLoading ? (
              <div className="gc-mini-spinner" role="status" aria-label="Loading trend" />
            ) : (
              <MiniTrendChart trendData={trendData} />
            )}
          </div>
          
          <div className="flip-hint">
            <span>Click to see stats</span>
          </div>
        </div>

        {/* Back of card */}
        <div className="card-back">
          <div className="stats-header">
            <span className="stats-title">Composition Stats</span>
            <span className="stats-rank">{medal} #{index + 1}</span>
          </div>
          
          {compositionStats ? (
            <div className="stats-content">
              <div className="stat-row">
                <span className="stat-label">Highest Key:</span>
                <span className="stat-value">+{compositionStats.highestKey}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Avg Key Level:</span>
                <span className="stat-value">+{compositionStats.averageKeyLevel}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Total Runs across all periods:</span>
                <span className="stat-value">{compositionStats.totalRuns}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Avg Score:</span>
                <span className="stat-value">{compositionStats.averageScore}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Best Week:</span>
                <span className="stat-value">Week {compositionStats.bestPeriod}</span>
              </div>
            </div>
          ) : (
            <div className="no-stats">
              <span>No detailed stats available</span>
            </div>
          )}
          
          <div className="flip-hint">
            <span>Click to flip back</span>
          </div>
        </div>
      </div>
    </div>
  );
}; 