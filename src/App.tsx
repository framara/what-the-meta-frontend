import { useEffect, useState } from 'react';
import './App.css';
import { fetchTopKeys, fetchSeasonInfo } from './api';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useFilterState } from './FilterContext';
import { FilterBar } from './components/FilterBar';
import { LeaderboardTable } from './components/LeaderboardTable';
import { SummaryStats } from './components/SummaryStats';
import { MetaEvolutionPage } from './components/MetaEvolutionPage';

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
    <Router>
      <nav className="flex gap-6 px-8 py-4 bg-gray-900 text-gray-100 shadow mb-8 rounded-b-2xl">
        <Link to="/" className="font-bold text-lg hover:text-blue-400 transition">Dashboard</Link>
        <Link to="/meta-evolution" className="font-bold text-lg hover:text-blue-400 transition">Meta Evolution</Link>
      </nav>
      <Routes>
        <Route path="/" element={
          <div className="max-w-7xl mx-auto px-4">
            <FilterBar />
            <SummaryStats runs={apiData || []} dungeons={dungeons} />
            <LeaderboardTable runs={apiData || []} dungeons={dungeons} />
          </div>
        } />
        <Route path="/meta-evolution" element={<MetaEvolutionPage />} />
      </Routes>
    </Router>
  );
}

export default App;
