import React, { Suspense, useEffect, useRef, useState } from 'react';
import LoadingScreen from './components/LoadingScreen';
import './App.css';
import { fetchTopKeys, fetchSeasonInfo, fetchSeasons } from './services/api';
import type { TopKeyParams } from './services/api';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useFilterDispatch, useFilterState } from './components/FilterContext';
import { FilterBar } from './components/FilterBar';
import { LeaderboardTable } from './components/LeaderboardTable';
import { SummaryStats } from './components/SummaryStats';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import toast from 'react-hot-toast';

// Route-level code splitting for heavy pages
const MetaEvolutionPage = React.lazy(() => import('./components/MetaEvolutionPage/index').then(m => ({ default: m.MetaEvolutionPage })));
const RaceBarsPage = React.lazy(() => import('./components/RaceBarsPage').then(m => ({ default: m.RaceBarsPage })));
const GroupCompositionPage = React.lazy(() => import('./components/GroupCompositionPage/index').then(m => ({ default: m.GroupCompositionPage })));
const CompAllSeasonsPage = React.lazy(() => import('./components/CompAllSeasonsPage/index').then(m => ({ default: m.CompAllSeasonsPage })));
const AIPredictionsPage = React.lazy(() => import('./components/AIPredictionsPage').then(m => ({ default: m.AIPredictionsPage })));
const MetaHealthPage = React.lazy(() => import('./components/MetaHealthPage').then(m => ({ default: m.MetaHealthPage })));
const AboutPage = React.lazy(() => import('./components/AboutPage'));
const PrivacyPage = React.lazy(() => import('./components/PrivacyPage'));
const TermsPage = React.lazy(() => import('./components/TermsPage'));
const CutoffPage = React.lazy(() => import('./components/CutoffPage'));
const Season3LandingPage = React.lazy(() => import('./components/Season3LandingPage'));

function App() {
  // Types aligned with LeaderboardTable's expectations
  type GroupMember = { character_name: string; class_id: number; spec_id: number; role: string };
  type Run = {
    id: number;
    rank: number;
    keystone_level: number;
    score: number;
    dungeon_id: number;
    duration_ms: number;
    completed_at: string;
    members: GroupMember[];
  };
  type Dungeon = { dungeon_id: number; dungeon_name: string };

  const [apiData, setApiData] = useState<Run[] | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [dungeons, setDungeons] = useState<Dungeon[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasBooted, setHasBooted] = useState(false);
  const filter = useFilterState();
  const dispatch = useFilterDispatch();
  const fallbackTriedRef = useRef<number | null>(null);
  // Allow fallback again whenever the user changes the season explicitly
  useEffect(() => {
    fallbackTriedRef.current = null;
  }, [filter.season_id]);

  useEffect(() => {
    if (!filter.season_id) return;
    // Only clear data when changing filters; keeps skeleton inline
    setApiError(null);
    setLoading(true);
  const seasonId = Number(filter.season_id);
  const params: TopKeyParams = { season_id: seasonId };
    if (filter.period_id) params.period_id = filter.period_id;
    if (filter.dungeon_id) params.dungeon_id = filter.dungeon_id;
    // Cap list size on mobile to reduce JS/render cost
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
    const maxMobile = 250;
    const defaultLimit = filter.limit ?? 1000;
    const effectiveLimit = isMobile ? Math.min(defaultLimit, maxMobile) : defaultLimit;
    params.limit = effectiveLimit;
    fetchTopKeys(params)
      .then(async (data) => {
        // If no data and this is the latest season, fallback to previous season once
        if ((Array.isArray(data) && data.length === 0) && fallbackTriedRef.current !== filter.season_id) {
          try {
            type Season = { season_id: number; season_name?: string };
            const seasons = await fetchSeasons() as Season[];
            const sorted = [...seasons].sort((a: Season, b: Season) => b.season_id - a.season_id);
            const latestId = sorted[0]?.season_id;
            if (latestId && filter.season_id === latestId) {
              const prev = sorted[1];
              if (prev?.season_id) {
                const latestLabel = sorted[0]?.season_name || `Season ${latestId}`;
                toast.dismiss('season-fallback');
                toast.success(`${latestLabel} has not started yet. Showing previous season instead.`, { id: 'season-fallback' });
                fallbackTriedRef.current = filter.season_id ?? null;
                dispatch({ type: 'SET_SEASON', season_id: prev.season_id });
                return; // effect will re-run with the new season
              }
            }
          } catch (e) {
            void e;
            // If fallback fails, just proceed to set empty data
          }
        }
        setApiData((data || []) as Run[]);
      })
      .catch(err => setApiError(err.message || 'API error'))
      .finally(() => {
        setLoading(false);
        if (!hasBooted) setHasBooted(true);
      });
  }, [filter.season_id, filter.period_id, filter.dungeon_id, filter.limit, dispatch, hasBooted]);

  useEffect(() => {
    if (!filter.season_id) return;
    fetchSeasonInfo(filter.season_id).then(info => setDungeons(info.dungeons as Dungeon[]));
  }, [filter.season_id]);

  if (!hasBooted && loading) {
    return <LoadingScreen />; // initial app boot only
  }

  if (apiError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 text-gray-100">
        <h1 className="text-2xl font-bold text-red-400 mb-4">There was a deplete but key is resilient</h1>
        <p className="mb-2">We are under maintenance, please try again in a few minutes.</p>
        <button
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => {
            setApiError(null);
            setLoading(true);
            const params: TopKeyParams = { season_id: Number(filter.season_id) };
            if (filter.period_id) params.period_id = filter.period_id;
            if (filter.dungeon_id) params.dungeon_id = filter.dungeon_id;
            const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
            const maxMobile = 250;
            const defaultLimit = filter.limit ?? 1000;
            const effectiveLimit = isMobile ? Math.min(defaultLimit, maxMobile) : defaultLimit;
            params.limit = effectiveLimit;
            fetchTopKeys(params)
              .then(data => setApiData((data || []) as Run[]))
              .catch(err => setApiError(err.message || 'API error'))
              .finally(() => setLoading(false));
          }}
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <header className="w-full flex flex-row items-center justify-between py-4 bg-gradient-to-b from-gray-950 to-gray-900 shadow-lg mb-6 relative z-40">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 flex flex-row items-center justify-between">
                  <div className="flex flex-col justify-center">
          <Link to="/" className="cursor-pointer hover:opacity-80 transition-opacity duration-200">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-blue-400 drop-shadow-lg leading-tight">What the Meta?</h1>
          </Link>
          <span className="text-sm sm:text-base text-gray-300 font-medium tracking-wide leading-tight">M+ stats and charts for nerds</span>
        </div>
          <Navigation />
          </div>
        </header>
        <main className="flex-1">
          <Suspense fallback={<LoadingScreen />}>
          <Routes>
            <Route path="/" element={
              <div className="max-w-7xl mx-auto px-4">
                <FilterBar 
                  showExpansion={false}
                  showPeriod={true}
                  showDungeon={true}
                  showLimit={true}
                />
                {/* Inline loading: show skeleton table while fetching */}
                <div className="mb-4 text-sm text-gray-300">
                  Looking for the latest meta? Check out
                  {' '}<Link to="/wow-meta-season-3" className="text-blue-400 hover:underline">WoW Meta — TWW Season 3</Link>.
                </div>
                <div className="cv-auto">
                  <SummaryStats runs={apiData || []} dungeons={dungeons} />
                </div>
                <div className="cv-auto-table">
                  <LeaderboardTable runs={apiData || []} dungeons={dungeons} loading={loading} />
                </div>
                {!loading && (!apiData || apiData.length === 0) && (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="text-6xl mb-4">📊</div>
                    <h2 className="text-2xl font-bold text-gray-200 mb-2">All keys were depleted this week</h2>
                    <h3 className="text-1xl font-bold text-gray-200 mb-2">or perhaps season was not on going yet/already</h3>
                    <p className="text-gray-400 max-w-md">
                      Try adjusting the season, period or dungeon.
                    </p>
                  </div>
                )}
              </div>
            } />
            {/* SEO: season landing routes */}
            <Route path="/wow-meta-season-3" element={<Season3LandingPage />} />
            <Route path="/wow-meta-tww-s3" element={<Season3LandingPage />} />
            <Route path="/tww-s3-meta" element={<Season3LandingPage />} />
            <Route path="/meta-evolution" element={<MetaEvolutionPage />} />
            <Route path="/race-bars" element={<RaceBarsPage />} />
            <Route path="/group-composition" element={<GroupCompositionPage />} />
            <Route path="/historical-composition" element={<CompAllSeasonsPage />} />
            <Route path="/ai-predictions" element={<AIPredictionsPage />} />
            <Route path="/meta-health" element={<MetaHealthPage />} />
            <Route path="/cutoff" element={<CutoffPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/ai-analysis" element={
              <div className="max-w-7xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-gray-200 mb-6">AI Analysis</h1>
                <div className="bg-gray-800 rounded-lg p-6">
                  <p className="text-gray-300 mb-4">Coming soon! Deep AI analysis of Mythic+ data patterns.</p>
                  <div className="text-6xl mb-4">🧠</div>
                </div>
              </div>
            } />
            <Route path="/ai-insights" element={
              <div className="max-w-7xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-gray-200 mb-6">AI Insights</h1>
                <div className="bg-gray-800 rounded-lg p-6">
                  <p className="text-gray-300 mb-4">Coming soon! AI-generated insights and recommendations.</p>
                  <div className="text-6xl mb-4">💡</div>
                </div>
              </div>
            } />
            <Route path="*" element={
              <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="text-6xl mb-4">404</div>
                  <h1 className="text-3xl font-bold text-gray-200 mb-4">Page Not Found</h1>
                  <p className="text-gray-400 mb-6">The page you're looking for doesn't exist.</p>
                  <Link to="/" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Go Home
                  </Link>
                </div>
              </div>
            } />
          </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
