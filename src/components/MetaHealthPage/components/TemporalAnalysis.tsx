import React from 'react';
import './TemporalAnalysis.css';

interface TemporalAnalysisProps {
  temporalAnalysis: {
    seasonStartDiversity: number;
    currentDiversity: number;
    diversityChange: number;
    dramaticChanges: Array<{
      week: number;
      description: string;
      impact: string;
    }>;
    seasonEvolution: {
      startState: string;
      currentState: string;
      keyChanges: string[];
    };
  };
}

export const TemporalAnalysis: React.FC<TemporalAnalysisProps> = ({ temporalAnalysis }) => {
  const getDiversityChangeColor = (change: number) => {
    if (change > 0) return '#10B981'; // Green for improvement
    if (change < 0) return '#EF4444'; // Red for decline
    return '#6B7280'; // Gray for no change
  };

  const getImpactColor = (impact: string) => {
    switch (impact.toLowerCase()) {
      case 'high':
        return '#EF4444';
      case 'medium':
        return '#F59E0B';
      case 'low':
        return '#10B981';
      default:
        return '#6B7280';
    }
  };

  const getImpactLabel = (impact: string) => {
    switch (impact.toLowerCase()) {
      case 'high':
        return 'High Impact';
      case 'medium':
        return 'Medium Impact';
      case 'low':
        return 'Low Impact';
      default:
        return 'Unknown Impact';
    }
  };

  return (
    <div className="mh-temporal-analysis">
      <h2>Season Evolution Analysis</h2>
      <p className="mh-section-description">
        Analysis of how the meta has evolved from season start to current state
      </p>

      <div className="mh-diversity-evolution">
        <h3>Diversity Evolution</h3>
        <div className="mh-diversity-comparison">
          <div className="mh-diversity-card start">
            <h4>Season Start</h4>
            <div className="mh-diversity-score">
              <span className="mh-score-value">{temporalAnalysis.seasonStartDiversity}</span>
              <span className="mh-score-label">/100</span>
            </div>
            <div className="mh-diversity-description">
              Initial meta diversity when season began
            </div>
          </div>

          <div className="mh-diversity-card current">
            <h4>Current State</h4>
            <div className="mh-diversity-score">
              <span className="mh-score-value">{temporalAnalysis.currentDiversity}</span>
              <span className="mh-score-label">/100</span>
            </div>
            <div className="mh-diversity-description">
              Current meta diversity
            </div>
          </div>

          <div className="mh-diversity-card change">
            <h4>Change</h4>
            <div 
              className="mh-diversity-score"
              style={{ color: getDiversityChangeColor(temporalAnalysis.diversityChange) }}
            >
              <span className="mh-score-value">
                {temporalAnalysis.diversityChange > 0 ? '+' : ''}{temporalAnalysis.diversityChange}
              </span>
              <span className="mh-score-label">points</span>
            </div>
            <div className="mh-diversity-description">
              {temporalAnalysis.diversityChange > 0 ? 'Improvement' : 
               temporalAnalysis.diversityChange < 0 ? 'Decline' : 'No change'}
            </div>
          </div>
        </div>
      </div>

      <div className="mh-season-evolution">
        <h3>Season Evolution</h3>
        <div className="mh-evolution-comparison">
          <div className="mh-evolution-card start">
            <h4>Season Start State</h4>
            <p className="mh-evolution-description">{temporalAnalysis.seasonEvolution.startState}</p>
          </div>

          <div className="mh-evolution-card current">
            <h4>Current State</h4>
            <p className="mh-evolution-description">{temporalAnalysis.seasonEvolution.currentState}</p>
          </div>
        </div>

        <div className="mh-key-changes">
          <h4>Key Changes During Season</h4>
          <ul className="mh-changes-list">
            {temporalAnalysis.seasonEvolution.keyChanges.map((change, index) => (
              <li key={index} className="mh-change-item">
                <span className="mh-change-icon">🔄</span>
                <span className="mh-change-text">{change}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {temporalAnalysis.dramaticChanges.length > 0 && (
        <div className="mh-dramatic-changes">
          <h3>Dramatic Changes</h3>
          <p className="mh-section-description">
            Significant meta shifts that occurred during specific weeks
          </p>
          
          <div className="mh-changes-grid">
            {temporalAnalysis.dramaticChanges.map((change, index) => (
              <div key={index} className="mh-change-card">
                <div className="mh-change-header">
                  <span className="mh-week-label">Week {change.week}</span>
                  <div 
                    className="mh-impact-badge"
                    style={{ backgroundColor: getImpactColor(change.impact) }}
                  >
                    {getImpactLabel(change.impact)}
                  </div>
                </div>
                <p className="mh-change-description">{change.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {temporalAnalysis.dramaticChanges.length === 0 && (
        <div className="mh-no-dramatic-changes">
          <h3>Dramatic Changes</h3>
          <div className="mh-no-changes-message">
            <span className="mh-no-changes-icon">✅</span>
            <span className="mh-no-changes-text">No dramatic changes detected during this season</span>
          </div>
          <p className="mh-no-changes-description">
            The meta has remained relatively stable throughout the season
          </p>
        </div>
      )}
    </div>
  );
}; 