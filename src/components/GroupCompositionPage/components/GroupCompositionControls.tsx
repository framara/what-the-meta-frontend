import React from 'react';
import { ChartDescriptionPopover } from '../../MetaEvolutionPage/components/ChartDescriptionPopover';

interface Season {
  season_id: number;
  season_name: string;
}

interface GroupCompositionControlsProps {
  seasons: Season[];
  selectedSeason: number | null;
  setSelectedSeason: (season: number) => void;
  loading: boolean;
}

export const GroupCompositionControls: React.FC<GroupCompositionControlsProps> = ({
  seasons,
  selectedSeason,
  setSelectedSeason,
  loading,
}) => {
  return (
    <div className="controls-section">
      <div className="controls-row" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
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
              .sort((a, b) => b.season_id - a.season_id)
              .map(s => (
                <option key={s.season_id} value={s.season_id}>
                  {s.season_name}
                </option>
              ))}
          </select>
        </div>
        <ChartDescriptionPopover />
      </div>
    </div>
  );
}; 