import React from 'react';
import type { ChartView } from '../types';

interface ChartViewSelectorProps {
  chartView: ChartView;
  setChartView: (view: ChartView) => void;
  isMobile: boolean;
  loading: boolean;
}

const CHART_VIEWS = [
  { key: 'all' as ChartView, label: 'All', mobileIcon: '📚', title: 'All' },
  { key: 'tank' as ChartView, label: 'Tank', mobileIcon: '🛡️', title: 'Tank' },
  { key: 'healer' as ChartView, label: 'Healer', mobileIcon: '💚', title: 'Healer' },
  { key: 'dps' as ChartView, label: 'DPS', mobileIcon: '⚔️', title: 'DPS' },
  { key: 'melee' as ChartView, label: 'Melee', mobileIcon: '🗡️', title: 'Melee' },
  { key: 'ranged' as ChartView, label: 'Ranged', mobileIcon: '🔥', title: 'Ranged' }
];

export const ChartViewSelector: React.FC<ChartViewSelectorProps> = ({
  chartView,
  setChartView,
  isMobile,
  loading
}) => {
  return (
    <div className="button-group chart-view-selector">
      {CHART_VIEWS.map(({ key, label, mobileIcon, title }) => (
        <button
          key={key}
          className={`chart-view-button ${chartView === key ? 'active' : ''}`}
          onClick={() => setChartView(key)}
          title={title}
          disabled={loading}
        >
          {isMobile ? mobileIcon : label}
        </button>
      ))}
    </div>
  );
}; 