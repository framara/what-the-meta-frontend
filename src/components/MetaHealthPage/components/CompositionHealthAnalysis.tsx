import React from 'react';
import { WOW_SPEC_NAMES, WOW_SPEC_COLORS } from '../../../constants/wow-constants';
import './CompositionHealthAnalysis.css';

interface CompositionHealthAnalysisProps {
  compositionAnalysis: {
    totalCompositions: number;
    dominantComposition: {
      specs: number[];
      usage: number;
      healthStatus: string;
    };
    compositionDiversity: number;
    flexibility: {
      highFlexibility: string[];
      lowFlexibility: string[];
      recommendations: string[];
    };
  };
}

export const CompositionHealthAnalysis: React.FC<CompositionHealthAnalysisProps> = ({ 
  compositionAnalysis 
}) => {
  const getHealthStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'excellent':
        return '#10B981';
      case 'good':
        return '#3B82F6';
      case 'acceptable':
        return '#F59E0B';
      case 'concerning':
        return '#EF4444';
      case 'poor':
        return '#DC2626';
      default:
        return '#6B7280';
    }
  };

  const getDiversityColor = (diversity: number) => {
    if (diversity >= 80) return '#10B981';
    if (diversity >= 60) return '#F59E0B';
    return '#EF4444';
  };

  const getFlexibilityIcon = (role: string) => {
    return compositionAnalysis.flexibility.highFlexibility.includes(role) ? '✅' : '⚠️';
  };

  return (
    <div className="mh-composition-health-analysis">
      <h2>Group Composition Health</h2>
      <p className="mh-section-description">
        Analysis of group composition diversity and role flexibility
      </p>

      <div className="mh-composition-overview">
        <div className="mh-overview-card">
          <h3>Composition Diversity</h3>
          <div className="mh-diversity-score">
            <div 
              className="mh-score-circle"
              style={{ borderColor: getDiversityColor(compositionAnalysis.compositionDiversity) }}
            >
              <span 
                className="mh-score-value"
                style={{ color: getDiversityColor(compositionAnalysis.compositionDiversity) }}
              >
                {compositionAnalysis.compositionDiversity}
              </span>
              <span className="mh-score-label">/100</span>
            </div>
            <div className="mh-score-description">
              {compositionAnalysis.compositionDiversity >= 80 ? 'Excellent diversity' :
               compositionAnalysis.compositionDiversity >= 60 ? 'Good diversity' :
               'Low diversity - concerning'}
            </div>
          </div>
        </div>

        <div className="mh-overview-card">
          <h3>Total Compositions</h3>
          <div className="mh-composition-count">
            <span className="mh-count-value">{compositionAnalysis.totalCompositions}</span>
            <span className="mh-count-label">different group compositions</span>
          </div>
          <div className="mh-count-description">
            Higher numbers indicate more viable group combinations
          </div>
        </div>
      </div>

      <div className="mh-dominant-composition-section">
        <h3>Dominant Composition</h3>
        <div className="mh-dominant-composition-card">
          <div className="mh-composition-header">
            <span className="mh-usage-percentage">{compositionAnalysis.dominantComposition.usage.toFixed(1)}% usage</span>
            <div 
              className="mh-health-badge"
              style={{ backgroundColor: getHealthStatusColor(compositionAnalysis.dominantComposition.healthStatus) }}
            >
              {compositionAnalysis.dominantComposition.healthStatus}
            </div>
          </div>
          
          <div className="mh-composition-specs">
            {compositionAnalysis.dominantComposition.specs.map((specId, index) => (
              <div key={index} className="mh-spec-chip">
                <span 
                  className="mh-spec-name"
                  style={{ color: WOW_SPEC_COLORS[specId] }}
                >
                  {WOW_SPEC_NAMES[specId]}
                </span>
              </div>
            ))}
          </div>
          
          <div className="mh-composition-analysis">
            {compositionAnalysis.dominantComposition.usage > 20 ? (
              <div className="mh-warning-message">
                ⚠️ This composition shows concerning dominance. Consider balance changes.
              </div>
            ) : (
              <div className="mh-healthy-message">
                ✅ This composition shows healthy usage levels.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mh-flexibility-analysis">
        <h3>Role Flexibility</h3>
        <p className="mh-flexibility-description">
          Analysis of which roles have multiple viable options vs. being locked to specific specs
        </p>
        
        <div className="mh-flexibility-grid">
          <div className="mh-flexibility-card high">
            <h4>High Flexibility Roles</h4>
            <div className="mh-flexibility-list">
              {compositionAnalysis.flexibility.highFlexibility.map((role, index) => (
                <div key={index} className="mh-flexibility-item">
                  <span className="mh-flexibility-icon">✅</span>
                  <span className="mh-role-name">{role}</span>
                  <span className="mh-flexibility-description">Multiple viable options</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mh-flexibility-card low">
            <h4>Low Flexibility Roles</h4>
            <div className="mh-flexibility-list">
              {compositionAnalysis.flexibility.lowFlexibility.length > 0 ? (
                compositionAnalysis.flexibility.lowFlexibility.map((role, index) => (
                  <div key={index} className="mh-flexibility-item">
                    <span className="mh-flexibility-icon">⚠️</span>
                    <span className="mh-role-name">{role}</span>
                    <span className="mh-flexibility-description">Limited options</span>
                  </div>
                ))
              ) : (
                <div className="mh-no-issues">
                  <span className="mh-flexibility-icon">✅</span>
                  <span className="mh-no-issues-text">All roles have good flexibility</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {compositionAnalysis.flexibility.recommendations.length > 0 && (
          <div className="mh-flexibility-recommendations">
            <h4>AI Recommendations for Flexibility:</h4>
            <ul>
              {compositionAnalysis.flexibility.recommendations.map((rec, index) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}; 