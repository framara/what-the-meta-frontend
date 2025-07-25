import React, { useEffect, useState } from 'react';
import { useFilterState, useFilterDispatch } from '../FilterContext';
import { fetchSeasons, fetchSeasonInfo } from '../api';

export const FilterBar: React.FC = () => {
  const filter = useFilterState();
  const dispatch = useFilterDispatch();

  const [seasonOptions, setSeasonOptions] = useState<Array<{ label: string; value: number }>>([]);
  const [periodOptions, setPeriodOptions] = useState<Array<{ label: string; value: number }>>([]);
  const [dungeonOptions, setDungeonOptions] = useState<Array<{ label: string; value: number }>>([]);
  const [loading, setLoading] = useState(true);

  // Fetch seasons on mount
  useEffect(() => {
    setLoading(true);
    fetchSeasons().then(seasons => {
      // Descending order
      const sorted = [...seasons].sort((a, b) => b.season_id - a.season_id);
      setSeasonOptions(sorted.map(s => ({ label: s.season_name, value: s.season_id })));
      setLoading(false);
    });
  }, []);

  // Fetch periods and dungeons when season changes
  useEffect(() => {
    if (!filter.season_id) return;
    setLoading(true);
    fetchSeasonInfo(filter.season_id).then(info => {
      // Descending order for periods
      const sortedPeriods = [...info.periods].sort((a, b) => b.period_id - a.period_id);
      setPeriodOptions(sortedPeriods.map(p => ({ label: p.period_name, value: p.period_id })));
      setDungeonOptions(info.dungeons.map(d => ({ label: d.dungeon_name, value: d.dungeon_id })));
      setLoading(false);
    });
  }, [filter.season_id]);

  return (
    <div className="w-full flex flex-wrap items-center justify-between gap-4 px-8 py-4 bg-gray-800/80 rounded-2xl shadow-md border border-gray-700 mb-8">
      <div className="flex items-center gap-2 mb-2">
        <span className="font-medium text-gray-100">Season:</span>
        <select
          className="px-4 py-2 rounded-md font-semibold border-2 bg-gray-900 text-gray-100 border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={filter.season_id}
          onChange={e => dispatch({ type: 'SET_SEASON', season_id: Number(e.target.value) })}
          disabled={loading || seasonOptions.length === 0}
        >
          {seasonOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2 mb-2">
        <span className="font-medium text-gray-100">Week:</span>
        <select
          className="px-4 py-2 rounded-md font-semibold border-2 bg-gray-900 text-gray-100 border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={filter.period_id || ''}
          onChange={e => dispatch({ type: 'SET_PERIOD', period_id: e.target.value ? Number(e.target.value) : undefined })}
          disabled={loading || periodOptions.length === 0}
        >
          <option value="">All</option>
          {periodOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2 mb-2">
        <span className="font-medium text-gray-100">Dungeon:</span>
        <select
          className="px-4 py-2 rounded-md font-semibold border-2 bg-gray-900 text-gray-100 border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-[220px]"
          value={filter.dungeon_id || ''}
          onChange={e => dispatch({ type: 'SET_DUNGEON', dungeon_id: e.target.value ? Number(e.target.value) : undefined })}
          disabled={loading || dungeonOptions.length === 0}
        >
          <option value="">All</option>
          {dungeonOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2 mb-2">
        <span className="font-medium text-gray-100">Top:</span>
        <select
          className="px-4 py-2 rounded-md font-semibold border-2 bg-gray-900 text-gray-100 border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={filter.limit}
          onChange={e => dispatch({ type: 'SET_LIMIT', limit: Number(e.target.value) })}
        >
          <option value={100}>100</option>
          <option value={250}>250</option>
          <option value={500}>500</option>
          <option value={1000}>1000</option>
        </select>
      </div>
    </div>
  );
}; 