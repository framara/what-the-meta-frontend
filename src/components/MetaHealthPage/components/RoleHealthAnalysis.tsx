import React from 'react';
import { WOW_SPEC_NAMES, WOW_SPEC_COLORS } from '../../../constants/wow-constants';
import './RoleHealthAnalysis.css';

interface RoleAnalysis {
  viableSpecs: number;
  dominanceScore: number;
  topSpec: { specId: number; usage: number };
  healthStatus: string;
  recommendations: string[];
}

interface RoleHealthAnalysisProps {
  roleAnalysis: {
    tank: RoleAnalysis;
    healer: RoleAnalysis;
    dps: RoleAnalysis;
  };
}

export const RoleHealthAnalysis: React.FC<RoleHealthAnalysisProps> = ({ roleAnalysis }) => {
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

  const getDominanceScoreColor = (score: number) => {
    if (score <= 30) return '#10B981'; // Low dominance = good
    if (score <= 50) return '#F59E0B'; // Medium dominance
    return '#EF4444'; // High dominance = bad
  };

  const getDominanceLabel = (score: number) => {
    if (score <= 30) return 'Low';
    if (score <= 50) return 'Medium';
    return 'High';
  };

  const roles = [
    { key: 'tank', label: 'Tank', icon: '🛡️' },
    { key: 'healer', label: 'Healer', icon: '💚' },
    { key: 'dps', label: 'DPS', icon: '⚔️' }
  ];

  return (
    <div className="mh-role-health-analysis">
      <h2>Role Health Analysis</h2>
      <p className="mh-section-description">
        Detailed analysis of each role's diversity and balance
      </p>

      <div className="mh-roles-grid">
        {roles.map(({ key, label, icon }) => {
          const role = roleAnalysis[key as keyof typeof roleAnalysis];
          
          return (
            <div key={key} className="mh-role-card">
              <div className="mh-role-header">
                <span className="mh-role-icon">{icon}</span>
                <h3>{label}</h3>
                <div 
                  className="mh-health-status"
                  style={{ backgroundColor: getHealthStatusColor(role.healthStatus) }}
                >
                  {role.healthStatus}
                </div>
              </div>

              <div className="mh-role-metrics">
                <div className="mh-metric-row">
                  <span className="mh-metric-label">Viable Specs:</span>
                  <span className="mh-metric-value">{role.viableSpecs}</span>
                </div>

                <div className="mh-metric-row">
                  <span className="mh-metric-label">Dominance Score:</span>
                  <span 
                    className="mh-metric-value"
                    style={{ color: getDominanceScoreColor(role.dominanceScore) }}
                  >
                    {role.dominanceScore} ({getDominanceLabel(role.dominanceScore)})
                  </span>
                </div>

                <div className="mh-metric-row">
                  <span className="mh-metric-label">Top Spec:</span>
                  <div className="mh-top-spec-info">
                    <span 
                      className="mh-spec-name"
                      style={{ color: WOW_SPEC_COLORS[role.topSpec.specId] }}
                    >
                      {WOW_SPEC_NAMES[role.topSpec.specId]}
                    </span>
                    <span className="mh-usage-percentage">
                      {role.topSpec.usage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="mh-role-recommendations">
                <h4>AI Recommendations:</h4>
                <ul>
                  {role.recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>

              <div className="mh-role-visualization">
                <div className="mh-viable-specs-bar">
                  <div className="mh-bar-label">Viable Specs</div>
                  <div className="mh-bar-container">
                    <div 
                      className="mh-bar-fill"
                      style={{ 
                        width: `${Math.min((role.viableSpecs / 12) * 100, 100)}%`,
                        backgroundColor: getHealthStatusColor(role.healthStatus)
                      }}
                    ></div>
                  </div>
                  <div className="mh-bar-value">{role.viableSpecs}/12</div>
                </div>

                <div className="mh-dominance-bar">
                  <div className="mh-bar-label">Dominance (Lower = Better)</div>
                  <div className="mh-bar-container">
                    <div 
                      className="mh-bar-fill"
                      style={{ 
                        width: `${role.dominanceScore}%`,
                        backgroundColor: getDominanceScoreColor(role.dominanceScore)
                      }}
                    ></div>
                  </div>
                  <div className="mh-bar-value">{role.dominanceScore}%</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}; 