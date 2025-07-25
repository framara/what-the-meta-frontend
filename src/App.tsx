import { useEffect, useState } from 'react';
import LoadingScreen from './components/LoadingScreen';
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
  const [loading, setLoading] = useState(true);
  const filter = useFilterState();
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    if (!filter.season_id) return;
    setApiData(null);
    setApiError(null);
    setLoading(true);
    const params: any = { season_id: filter.season_id };
    if (filter.period_id) params.period_id = filter.period_id;
    if (filter.dungeon_id) params.dungeon_id = filter.dungeon_id;
    if (filter.limit) params.limit = filter.limit;
    fetchTopKeys(params)
      .then(data => setApiData(data))
      .catch(err => setApiError(err.message || 'API error'))
      .finally(() => setLoading(false));
  }, [filter.season_id, filter.period_id, filter.dungeon_id, filter.limit]);

  useEffect(() => {
    if (!filter.season_id) return;
    fetchSeasonInfo(filter.season_id).then(info => setDungeons(info.dungeons));
  }, [filter.season_id]);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Router>
      <header className="w-full flex flex-row items-center justify-between px-4 sm:px-8 py-4 bg-gradient-to-b from-gray-950 to-gray-900 shadow-lg mb-6 flex-nowrap">
        <div className="flex flex-col justify-center">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-blue-400 drop-shadow-lg leading-tight">What the Meta?</h1>
          <span className="text-sm sm:text-base text-gray-300 font-medium tracking-wide leading-tight">m+ statistics for nerds</span>
        </div>
        <nav className="relative flex items-center md:mr-8">
          {/* Hamburger menu for mobile */}
          <button
            className="md:hidden block p-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Open navigation menu"
            onClick={() => setNavOpen(v => !v)}
            style={{ minWidth: 0, minHeight: 0 }}
          >
            {/* Hamburger icon */}
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
          </button>
          {/* Nav links - hidden on mobile unless menu open, always visible on md+ */}
          <div className={`flex-col md:flex md:flex-row md:gap-6 md:static absolute top-full right-0 w-56 bg-gray-900 md:bg-transparent z-20 transition-all duration-200 ${navOpen ? 'flex' : 'hidden'} md:!flex`} style={{ boxShadow: navOpen ? '0 4px 16px 0 rgba(0,0,0,0.18)' : undefined }}>
            <Link to="/" className="font-bold text-lg hover:text-blue-400 transition px-6 py-3 md:px-0 md:py-0 whitespace-nowrap" onClick={() => setNavOpen(false)}>Dashboard</Link>
            <Link to="/meta-evolution" className="font-bold text-lg hover:text-blue-400 transition px-6 py-3 md:px-0 md:py-0 whitespace-nowrap" onClick={() => setNavOpen(false)}>Meta Evolution</Link>
          </div>
        </nav>
      </header>
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
