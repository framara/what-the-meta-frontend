import React from 'react';
import './MetaHealthInsights.css';

interface MetaHealthInsightsProps {
  insights: string[];
  recommendations: string[];
}

export const MetaHealthInsights: React.FC<MetaHealthInsightsProps> = ({ 
  insights, 
  recommendations 
}) => {
  return (
    <div className="mh-meta-health-insights">
      <h2>AI Insights & Recommendations</h2>
      <p className="mh-section-description">
        AI-powered analysis of meta health trends and actionable recommendations
      </p>

      <div className="mh-insights-section">
        <h3>Key Insights</h3>
        <div className="mh-insights-grid">
          {insights.map((insight, index) => (
            <div key={index} className="mh-insight-card">
              <div className="mh-insight-icon">💡</div>
              <div className="mh-insight-content">
                <p>{insight}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mh-recommendations-section">
        <h3>AI Recommendations</h3>
        <div className="mh-recommendations-list">
          {recommendations.map((recommendation, index) => (
            <div key={index} className="mh-recommendation-item">
              <div className="mh-recommendation-icon">🎯</div>
              <div className="mh-recommendation-content">
                <p>{recommendation}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mh-meta-health-summary">
        <h3>Meta Health Summary</h3>
        <div className="mh-summary-content">
          <p>
            This analysis provides a comprehensive view of the current meta health, 
            identifying areas of concern and opportunities for improvement. The AI 
            considers multiple factors including spec diversity, balance distribution, 
            and group composition variety to provide actionable insights.
          </p>
          <p>
            Use these insights to understand the current state of the meta and 
            identify potential balance issues that may need attention from developers 
            or community feedback.
          </p>
        </div>
      </div>
    </div>
  );
}; 