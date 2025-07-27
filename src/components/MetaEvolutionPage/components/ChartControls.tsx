import React from 'react';
import type { ChartView, Season } from '../types';

interface ChartControlsProps {
  seasons: Season[];
  selectedSeason: number | null;
  setSelectedSeason: (season: number) => void;
  chartView: ChartView;
  setChartView: (view: ChartView) => void;
  loading: boolean;
  isMobile: boolean;
}

export const ChartControls: React.FC<ChartControlsProps> = ({
  seasons,
  selectedSeason,
  setSelectedSeason,
  chartView,
  setChartView,
  loading,
  isMobile,
}) => {
  return (
    <div className="controls-section">
      <div className="controls-row">
        <div className="season-filter">
          <label htmlFor="season-select">Season:</label>
          <select
            id="season-select"
            value={selectedSeason || ''}
            onChange={(e) => setSelectedSeason(Number(e.target.value))}
            disabled={loading}
          >
            {seasons
              .filter(season => season.season_id >= 9)
              .map(s => (
                <option key={s.season_id} value={s.season_id}>{s.season_name}</option>
              ))}
          </select>
        </div>
        <div className="button-group chart-view-selector">
          <button 
            className={`chart-view-button ${chartView === 'all' ? 'active' : ''}`} 
            onClick={() => setChartView('all')} 
            title="All"
          >
            {isMobile ? '📚' : 'All'}
          </button>
          <button 
            className={`chart-view-button ${chartView === 'tank' ? 'active' : ''}`} 
            onClick={() => setChartView('tank')} 
            title="Tank"
          >
            {isMobile ? '🛡️' : 'Tank'}
          </button>
          <button 
            className={`chart-view-button ${chartView === 'healer' ? 'active' : ''}`} 
            onClick={() => setChartView('healer')} 
            title="Healer"
          >
            {isMobile ? '💚' : 'Healer'}
          </button>
          <button 
            className={`chart-view-button ${chartView === 'dps' ? 'active' : ''}`} 
            onClick={() => setChartView('dps')} 
            title="DPS"
          >
            {isMobile ? '⚔️' : 'DPS'}
          </button>
          <button 
            className={`chart-view-button ${chartView === 'melee' ? 'active' : ''}`} 
            onClick={() => setChartView('melee')} 
            title="Melee"
          >
            {isMobile ? '🗡️' : 'Melee'}
          </button>
          <button 
            className={`chart-view-button ${chartView === 'ranged' ? 'active' : ''}`} 
            onClick={() => setChartView('ranged')} 
            title="Ranged"
          >
            {isMobile ? '🔥' : 'Ranged'}
          </button>
        </div>
      </div>
    </div>
  );
}; 