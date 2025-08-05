import React, { useMemo, useState, useEffect } from 'react';
import { Tooltip } from './Tooltip';
import '../styles/SpecDetailsModal.css';

interface SpecDetailsModalProps {
  specId: number;
  prediction: any;
  seasonData: any;
  onClose: () => void;
  clickPosition?: { x: number; y: number } | null;
}

export const SpecDetailsModal: React.FC<SpecDetailsModalProps> = ({ 
  specId, 
  prediction, 
  seasonData, 
  onClose, 
  clickPosition 
}) => {
  const { specName, className, classColor, reasoning } = prediction;
  const periods = seasonData.periods;
  const [modalPosition, setModalPosition] = useState({ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' });

  useEffect(() => {
    if (clickPosition) {
      const modalWidth = 380;
      const modalHeight = 500;
      const padding = 10; // Space between card and modal
      
      // Position directly above the card
      let top = clickPosition.y - modalHeight - padding;
      let left = clickPosition.x;
      
      // If there's not enough space above, position below
      if (top < 20) {
        top = clickPosition.y + padding;
      }
      
      setModalPosition({
        top: `${top}px`,
        left: `${left}px`,
        transform: 'translateX(-50%)', // Center horizontally
      });
    }
  }, [clickPosition]);

  const usageHistory = useMemo(() => periods.map((p: any) => p.keys
    .flatMap((run: any) => run.members)
    .filter((m: any) => m.spec_id === specId).length), [periods, specId]);
  const successHistory = useMemo(() => periods.map((p: any, i: number) => {
    const periodKeys = p.keys;
    const totalLevel = periodKeys.reduce((sum: number, run: any) => sum + run.keystone_level, 0);
    const avgLevel = periodKeys.length > 0 ? totalLevel / periodKeys.length : 0;
    const specRuns = periodKeys.flatMap((run: any) => run.members.filter((m: any) => m.spec_id === specId).map(() => run.keystone_level));
    const aboveAvg = specRuns.filter((lvl: number) => lvl > avgLevel).length;
    return specRuns.length > 0 ? (aboveAvg / specRuns.length) * 100 : 0;
  }), [periods, specId]);

  const Chart = ({ data, color, label }: { data: number[]; color: string; label: string }) => {
    if (data.length === 0) return <div className="chart-placeholder">No data available</div>;
    
    const maxValue = Math.max(...data);
    const minValue = Math.min(...data);
    const range = maxValue - minValue || 1;
    
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * 200; // Use pixel coordinates
      const y = 80 - ((value - minValue) / range) * 60; // Use pixel coordinates
      return `${x},${y}`;
    }).join(' ');
    
    return (
      <div className="chart-container">
        <h4>{label}</h4>
        <svg width="100%" height="120" viewBox="0 0 220 90" className="chart">
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
                r="3"
                fill={color}
              />
            );
          })}
        </svg>
      </div>
    );
  };

  return (
    <div className="spec-modal-overlay" onClick={onClose}>
      <div 
        className="spec-modal-card" 
        onClick={e => e.stopPropagation()}
        style={modalPosition}
      >
        <button className="spec-modal-close" onClick={onClose}>&times;</button>
        <div className="spec-modal-header">
          <div className="spec-modal-color" style={{ background: classColor }}></div>
          <div className="spec-modal-title">{specName} <span className="spec-modal-class">({className})</span></div>
        </div>
        <div className="spec-modal-charts">
          <Chart data={usageHistory} color={classColor} label="Usage per period" />
          <Chart data={successHistory} color="#3b82f6" label="Success rate (%)" />
        </div>
        <div className="spec-modal-stats">
          <div><b>Total Runs:</b> {usageHistory.reduce((a: number, b: number) => a + b, 0)}</div>
          <div><b>Best Period:</b> {usageHistory.indexOf(Math.max(...usageHistory)) + 1}</div>
          <div>
            <b>Average Success Rate:</b>
            <Tooltip content="Success rate is the percentage of this spec's runs that were above the average keystone level for each period. This shows how often the spec is outperforming the meta.">
              <svg className="ai-tooltip-icon" width="15" height="15" viewBox="0 0 20 20" fill="none" aria-label="Info" role="img" style={{marginLeft: '0.4rem', verticalAlign: 'middle'}}>
                <circle cx="10" cy="10" r="10" fill="#64748b" />
                <text x="10" y="15" textAnchor="middle" fontSize="11" fill="#fff" fontWeight="bold">i</text>
              </svg>
            </Tooltip>
            {successHistory.length > 0 ? (successHistory.reduce((a: number, b: number) => a + b, 0) / successHistory.length).toFixed(1) : '0'}%
          </div>
        </div>
        <div className="spec-modal-reasoning">
          <h4>🤖 Why?</h4>
          <p>{reasoning}</p>
        </div>
      </div>
    </div>
  );
};