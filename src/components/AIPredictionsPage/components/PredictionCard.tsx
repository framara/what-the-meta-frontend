import React, { useState } from 'react';
import { Tooltip } from './Tooltip';
import '../styles/PredictionCard.css';

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
  confidenceInterval?: string;
  temporalData: {
    appearances: number[];
    successRates: number[];
    totalRuns: number;
  };
}

interface PredictionCardProps {
  prediction: {
    specId: number;
    specName: string;
    className: string;
    classColor: string;
    currentUsage: number;
    predictedChange: number;
    confidence: number;
    successRate: number;
    reasoning: string;
    confidenceInterval?: string;
    temporalData: {
      appearances: number[];
      successRates: number[];
      totalRuns: number;
    };
  };
  type: 'rising' | 'declining' | 'stable';
  style?: React.CSSProperties;
}

export const PredictionCard: React.FC<PredictionCardProps> = ({ prediction, type, style }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const { 
    specName, 
    className, 
    classColor, 
    currentUsage,
    predictedChange,
    confidence,
    successRate,
    reasoning,
    confidenceInterval,
    temporalData
  } = prediction;

  const handleClick = () => {
    setIsFlipped(!isFlipped);
  };

  const Chart = ({ data, color, label }: { data: number[]; color: string; label: string }) => {
    if (data.length === 0) return null;
    
    const maxValue = Math.max(...data);
    const minValue = Math.min(...data);
    const range = maxValue - minValue || 1;
    
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * 200;
      const y = 80 - ((value - minValue) / range) * 60;
      return `${x},${y}`;
    }).join(' ');
    
    return (
      <div className="mini-chart">
        <svg width="100%" height="60" viewBox="0 0 220 90">
          <polyline
            fill="none"
            stroke={color}
            strokeWidth="2"
            points={points}
          />
          {data.map((value, index) => {
            const x = (index / (data.length - 1)) * 200;
            const y = 80 - ((value - minValue) / range) * 60;
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="2"
                fill={color}
              />
            );
          })}
        </svg>
      </div>
    );
  };

  return (
    <div 
      className={`prediction-card-container ${isFlipped ? 'flipped' : ''}`} 
      onClick={handleClick}
      style={style}
    >
      {/* Front of card */}
      <div className={`prediction-card front ${type}`}>
        <div className="card-header">
          <div className="spec-info">
            <div className="spec-icon" style={{ backgroundColor: classColor }}></div>
            <div className="spec-text">
              <div className="spec-name">{specName}</div>
              <div className="spec-class">{className}</div>
            </div>
          </div>
          <div className="predicted-change">
            <Tooltip content="The AI's predicted change in usage rate for this spec in upcoming periods, based on current trends, success rates, and meta patterns. A positive value suggests the spec is likely to become more popular. The confidence interval shows the expected range for this change.">
              <span>
                {predictedChange >= 0 ? '+' : ''}{predictedChange.toFixed(1)}%
                {confidenceInterval && (
                  <span className="confidence-interval"> ±{confidenceInterval}%</span>
                )}
                <svg className="ai-tooltip-icon" width="15" height="15" viewBox="0 0 20 20" fill="none" aria-label="Info" role="img" style={{marginLeft: '0.4rem', verticalAlign: 'middle'}}>
                  <circle cx="10" cy="10" r="10" fill="#64748b" />
                  <text x="10" y="15" textAnchor="middle" fontSize="11" fill="#fff" fontWeight="bold">i</text>
                </svg>
              </span>
            </Tooltip>
          </div>
        </div>

        <div className="card-stats">
          <div className="stat-row">
            <span className="stat-label">Current Usage
              <Tooltip content="The percentage of all dungeon runs that include this specialization in the current period. This shows how popular the spec is in the current meta.">
                <svg className="ai-tooltip-icon" width="15" height="15" viewBox="0 0 20 20" fill="none" aria-label="Info" role="img" style={{marginLeft: '0.4rem', verticalAlign: 'middle'}}>
                  <circle cx="10" cy="10" r="10" fill="#64748b" />
                  <text x="10" y="15" textAnchor="middle" fontSize="11" fill="#fff" fontWeight="bold">i</text>
                </svg>
              </Tooltip>
            </span>
            <span className="stat-value">{currentUsage.toFixed(1)}%</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Success Rate
              <Tooltip content="Success rate is the percentage of this spec's runs that were above the average keystone level for each period. This shows how often the spec is outperforming the meta.">
                <svg className="ai-tooltip-icon" width="15" height="15" viewBox="0 0 20 20" fill="none" aria-label="Info" role="img" style={{marginLeft: '0.4rem', verticalAlign: 'middle'}}>
                  <circle cx="10" cy="10" r="10" fill="#64748b" />
                  <text x="10" y="15" textAnchor="middle" fontSize="11" fill="#fff" fontWeight="bold">i</text>
                </svg>
              </Tooltip>
            </span>
            <span className="stat-value">{successRate.toFixed(1)}%</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Confidence</span>
            <span className="stat-value">{confidence}%</span>
          </div>
          {confidenceInterval && (
            <div className="stat-row">
              <span className="stat-label">95% CI (Predicted Change)</span>
              <span className="stat-value">±{confidenceInterval}%</span>
            </div>
          )}
        </div>

        <div className="confidence-bar" style={{ '--confidence': `${confidence}%` } as React.CSSProperties}></div>

        <div className="card-footer">
          <div className="ai-reasoning">
            <span className="ai-icon">🤖</span> Why?
            <p>{reasoning}</p>
          </div>
          <div className="card-tags">
            <span className={`confidence-tag confidence-${confidence < 65 ? 'low' : confidence < 85 ? 'medium' : 'high'}`}>
              Confidence: {confidence}%
            </span>
            <span className="type-tag">{type}</span>
          </div>
        </div>
      </div>

      {/* Back of card */}
      <div className={`prediction-card back ${type}`}>
        <div className="card-header">
          <div className="spec-info">
            <div className="spec-icon" style={{ backgroundColor: classColor }}></div>
            <div className="spec-text">
              <div className="spec-name">{specName}</div>
              <div className="spec-class">{className}</div>
            </div>
          </div>
          <div className="close-icon" onClick={(e) => { e.stopPropagation(); setIsFlipped(false); }}>×</div>
        </div>

        <div className="card-charts">
          <div className="chart-section">
            <h4>Usage per period</h4>
            <Chart data={temporalData.appearances} color={classColor} label="Usage" />
          </div>
          <div className="chart-section">
            <h4>Success rate (%)</h4>
            <Chart data={temporalData.successRates} color="#3b82f6" label="Success" />
          </div>
        </div>

        <div className="card-stats">
          <div className="stat-row">
            <span className="stat-label">Total Runs</span>
            <span className="stat-value">{temporalData.totalRuns}</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Best Period</span>
            <span className="stat-value">{temporalData.appearances.indexOf(Math.max(...temporalData.appearances)) + 1}</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">
              Average Success Rate
              <Tooltip content="Success rate is the percentage of this spec's runs that were above the average keystone level for each period. This shows how often the spec is outperforming the meta.">
                <svg className="ai-tooltip-icon" width="15" height="15" viewBox="0 0 20 20" fill="none" aria-label="Info" role="img" style={{marginLeft: '0.4rem', verticalAlign: 'middle'}}>
                  <circle cx="10" cy="10" r="10" fill="#64748b" />
                  <text x="10" y="15" textAnchor="middle" fontSize="11" fill="#fff" fontWeight="bold">i</text>
                </svg>
              </Tooltip>
            </span>
            <span className="stat-value">{successRate.toFixed(1)}%</span>
          </div>
        </div> 
      </div>
    </div>
  );
};