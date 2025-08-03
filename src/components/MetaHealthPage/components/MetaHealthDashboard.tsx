import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import './MetaHealthDashboard.css';

interface MetaHealthProps {
  metaHealth: {
    overallScore: number;
    diversityScore: number;
    balanceScore: number;
    compositionHealth: number;
    trends: {
      improving: boolean;
      diversityTrend: string;
      balanceTrend: string;
    };
  };
}

export const MetaHealthDashboard: React.FC<MetaHealthProps> = ({ metaHealth }) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10B981'; // Green
    if (score >= 60) return '#F59E0B'; // Yellow
    if (score >= 40) return '#EF4444'; // Red
    return '#6B7280'; // Gray
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Concerning';
    return 'Poor';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return '↗️';
      case 'decreasing':
        return '↘️';
      case 'stable':
        return '→';
      default:
        return '→';
    }
  };

  const chartData = [
    { name: 'Diversity', value: metaHealth.diversityScore, color: '#3B82F6' },
    { name: 'Balance', value: metaHealth.balanceScore, color: '#10B981' },
    { name: 'Composition', value: metaHealth.compositionHealth, color: '#8B5CF6' }
  ];

  return (
    <div className="mh-meta-health-dashboard">
      <div className="mh-dashboard-header">
        <h2>Meta Health Overview</h2>
        <div className="mh-trend-indicator">
          <span className={`mh-trend-arrow ${metaHealth.trends.improving ? 'improving' : 'declining'}`}>
            {metaHealth.trends.improving ? '↗️' : '↘️'}
          </span>
          <span className="mh-trend-text">
            {metaHealth.trends.improving ? 'Improving' : 'Declining'}
          </span>
        </div>
      </div>

      <div className="mh-dashboard-content">
        <div className="mh-overall-score-section">
          <div className="mh-score-circle">
            <div 
              className="mh-score-value"
              style={{ color: getScoreColor(metaHealth.overallScore) }}
            >
              {metaHealth.overallScore}
            </div>
            <div className="mh-score-label">{getScoreLabel(metaHealth.overallScore)}</div>
          </div>
          <div className="mh-score-details">
            <h3>Overall Meta Health</h3>
            <p>Comprehensive analysis of diversity, balance, and composition health</p>
          </div>
        </div>

        <div className="mh-metrics-grid">
          <div className="mh-metric-card">
            <div className="mh-metric-header">
              <h4>Diversity Score</h4>
              <span className="mh-trend-icon">
                {getTrendIcon(metaHealth.trends.diversityTrend)}
              </span>
            </div>
            <div className="mh-metric-value" style={{ color: getScoreColor(metaHealth.diversityScore) }}>
              {metaHealth.diversityScore}
            </div>
            <div className="mh-metric-description">
              Measures variety of viable specs and compositions
            </div>
          </div>

          <div className="mh-metric-card">
            <div className="mh-metric-header">
              <h4>Balance Score</h4>
              <span className="mh-trend-icon">
                {getTrendIcon(metaHealth.trends.balanceTrend)}
              </span>
            </div>
            <div className="mh-metric-value" style={{ color: getScoreColor(metaHealth.balanceScore) }}>
              {metaHealth.balanceScore}
            </div>
            <div className="mh-metric-description">
              Measures how evenly specs are distributed
            </div>
          </div>

          <div className="mh-metric-card">
            <div className="mh-metric-header">
              <h4>Composition Health</h4>
            </div>
            <div className="mh-metric-value" style={{ color: getScoreColor(metaHealth.compositionHealth) }}>
              {metaHealth.compositionHealth}
            </div>
            <div className="mh-metric-description">
              Measures diversity of group compositions
            </div>
          </div>
        </div>

        <div className="mh-chart-section">
          <h4>Health Breakdown</h4>
          <div className="mh-chart-container">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => [`${value}%`, 'Score']}
                  labelFormatter={(label) => `${label} Score`}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mh-chart-legend">
            {chartData.map((item, index) => (
              <div key={index} className="mh-legend-item">
                <div className="mh-legend-color" style={{ backgroundColor: item.color }}></div>
                <span>{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}; 