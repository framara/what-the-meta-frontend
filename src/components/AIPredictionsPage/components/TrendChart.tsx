import React from 'react';
import '../styles/TrendChart.css';

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
}

interface TrendChartProps {
  predictions: Prediction[];
}

export const TrendChart: React.FC<TrendChartProps> = ({ predictions }) => {
  if (!predictions.length) {
    return (
      <div className="trend-chart">
        <div className="no-data">
          <span className="no-data-icon">📊</span>
          <p>No prediction data available</p>
        </div>
      </div>
    );
  }

  const maxChange = Math.max(...predictions.map(p => Math.abs(p.predictedChange)));
  const maxConfidence = Math.max(...predictions.map(p => p.confidence));

  return (
    <div className="trend-chart">
      <div className="chart-container">
        <div className="chart-header">
          <h4>Prediction Confidence vs Change</h4>
          <p>Higher confidence predictions are more reliable</p>
        </div>
        
        <div className="chart-grid">
          {predictions.slice(0, 8).map((prediction, index) => (
            <div key={prediction.specId} className="chart-item">
              <div className="item-header">
                <div 
                  className="spec-dot"
                  style={{ backgroundColor: prediction.classColor }}
                ></div>
                <span className="spec-name">{prediction.specName}</span>
              </div>
              
              <div className="prediction-bars">
                <div className="bar-container">
                  <span className="bar-label">Change</span>
                  <div className="bar">
                    <div 
                      className="bar-fill change-bar"
                      style={{
                        width: `${(Math.abs(prediction.predictedChange) / maxChange) * 100}%`,
                        backgroundColor: prediction.predictedChange > 0 ? '#10B981' : '#EF4444'
                      }}
                    ></div>
                  </div>
                  <span className="bar-value">
                    {prediction.predictedChange > 0 ? '+' : ''}{prediction.predictedChange.toFixed(1)}%
                  </span>
                </div>
                
                <div className="bar-container">
                  <span className="bar-label">Confidence</span>
                  <div className="bar">
                    <div 
                      className="bar-fill confidence-bar"
                      style={{
                        width: `${(prediction.confidence / maxConfidence) * 100}%`,
                        backgroundColor: prediction.confidence > 80 ? '#10B981' : prediction.confidence > 65 ? '#F59E0B' : '#EF4444'
                      }}
                    ></div>
                  </div>
                  <span className="bar-value">{prediction.confidence.toFixed(0)}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="chart-legend">
        <div className="legend-item">
          <div className="legend-color rising"></div>
          <span>Rising Specs</span>
        </div>
        <div className="legend-item">
          <div className="legend-color declining"></div>
          <span>Declining Specs</span>
        </div>
        <div className="legend-item">
          <div className="legend-color high-confidence"></div>
          <span>High Confidence (&gt;80%)</span>
        </div>
        <div className="legend-item">
          <div className="legend-color medium-confidence"></div>
          <span>Medium Confidence (65-80%)</span>
        </div>
        <div className="legend-item">
          <div className="legend-color low-confidence"></div>
          <span>Low Confidence (&lt;65%)</span>
        </div>
      </div>
    </div>
  );
};