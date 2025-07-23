import { useEffect, useState } from 'react';
import './App.css';
import { fetchTopKeys, fetchSeasonInfo } from './api';
import { FilterBar } from './components/FilterBar';
import { useFilterState } from './FilterContext';
import { LeaderboardTable } from './components/LeaderboardTable';
import { SummaryStats } from './components/SummaryStats';

function App() {
  const [apiData, setApiData] = useState<any>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [dungeons, setDungeons] = useState<any[]>([]);
  const filter = useFilterState();

  useEffect(() => {
    if (!filter.season_id) return;
    setApiData(null);
    setApiError(null);
    const params: any = { season_id: filter.season_id };
    if (filter.period_id) params.period_id = filter.period_id;
    if (filter.dungeon_id) params.dungeon_id = filter.dungeon_id;
    if (filter.limit) params.limit = filter.limit;
    fetchTopKeys(params)
      .then(data => setApiData(data))
      .catch(err => setApiError(err.message || 'API error'));
  }, [filter.season_id, filter.period_id, filter.dungeon_id, filter.limit]);

  useEffect(() => {
    if (!filter.season_id) return;
    fetchSeasonInfo(filter.season_id).then(info => setDungeons(info.dungeons));
  }, [filter.season_id]);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans">
      <header className="w-full py-6 px-4 bg-gray-900 shadow-md mb-8">
        <h1 className="text-2xl font-bold tracking-wide text-center">What The Meta?</h1>
      </header>
      <main className="max-w-5xl mx-auto px-4">
        <div className="bg-gray-900 rounded-xl shadow-lg p-6 mb-8">
          <FilterBar />
          <SummaryStats runs={apiData || []} dungeons={dungeons} />
          {apiError && <div className="text-red-400 mb-4">Error: {apiError}</div>}
          <LeaderboardTable runs={apiData || []} dungeons={dungeons} />
        </div>
      </main>
    </div>
  );
}

export default App;
