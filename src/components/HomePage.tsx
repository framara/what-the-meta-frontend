import React, { useEffect, useRef, useState } from 'react';
import { useFilterDispatch, useFilterState } from './FilterContext';
import { FilterBar } from './FilterBar';
import { LeaderboardTable } from './LeaderboardTable';
import { SummaryStats } from './SummaryStats';
import LoadingScreen from '../components/LoadingScreen';
import { Link } from 'react-router-dom';
// no eager toast import; we'll load it on demand when needed
import { fetchTopKeys, fetchSeasonInfo, fetchSeasons } from '../services/api';
import type { TopKeyParams } from '../services/api';

// Home page only: contains heavy data fetching for table and stats
export const HomePage: React.FC = () => {
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

  // Fetch the leaderboard data for the home page only
  useEffect(() => {
    if (!filter.season_id) return;
    setApiError(null);
    setLoading(true);

    let cancelled = false;

    const seasonId = Number(filter.season_id);
    const baseParams: TopKeyParams = { season_id: seasonId };
    if (filter.period_id) baseParams.period_id = filter.period_id;
    if (filter.dungeon_id) baseParams.dungeon_id = filter.dungeon_id;
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
    const maxMobileInitial = 250; // fast first paint on mobile
    const targetLimit = filter.limit ?? 1000;
    const initialLimit = isMobile ? Math.min(targetLimit, maxMobileInitial) : targetLimit;

    (async () => {
      try {
        // First batch
        const firstBatch = await fetchTopKeys({ ...baseParams, limit: initialLimit });

        if (cancelled) return;

        // If no data and this is the latest season, fallback to previous season once
        if ((Array.isArray(firstBatch) && firstBatch.length === 0) && fallbackTriedRef.current !== filter.season_id) {
          try {
            type Season = { season_id: number; season_name?: string };
            const seasons = await fetchSeasons() as Season[];
            const sorted = [...seasons].sort((a: Season, b: Season) => b.season_id - a.season_id);
            const latestId = sorted[0]?.season_id;
            if (latestId && filter.season_id === latestId) {
              const prev = sorted[1];
              if (prev?.season_id) {
                const latestLabel = sorted[0]?.season_name || `Season ${latestId}`;
                import('react-hot-toast').then(m => {
                  const t: any = (m as any).default || (m as any).toast || m;
                  t.dismiss?.('season-fallback');
                  t.success?.(`${latestLabel} has not started yet. Showing previous season instead.`, { id: 'season-fallback' });
                }).catch(() => {/* ignore */});
                fallbackTriedRef.current = filter.season_id ?? null;
                dispatch({ type: 'SET_SEASON', season_id: prev.season_id });
                return; // effect will re-run with the new season
              }
            }
          } catch {
            // If fallback fails, just proceed to set empty data
          }
        }

        setApiData((firstBatch || []) as Run[]);
        if (!hasBooted) setHasBooted(true);
        setLoading(false); // render immediately with the first batch

        // If we still need more (mobile requested Top 1000), fetch the rest in the background
        if (initialLimit < targetLimit) {
          const remaining = targetLimit - initialLimit;
          try {
            const rest = await fetchTopKeys({ ...baseParams, limit: remaining, offset: initialLimit });
            if (cancelled) return;
            const combined = [
              ...((firstBatch || []) as Run[]),
              ...((rest || []) as Run[]),
            ];
            setApiData(combined);
          } catch (e) {
            // Ignore background fetch errors; user still sees initial data
            console.error('Background fetch (remaining runs) failed:', e);
          }
        }
      } catch (err: any) {
        if (cancelled) return;
        setApiError(err?.message || 'API error');
        setLoading(false);
        if (!hasBooted) setHasBooted(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [filter.season_id, filter.period_id, filter.dungeon_id, filter.limit, dispatch, hasBooted]);

  // Fetch season info (dungeons) for the home page only
  useEffect(() => {
    if (!filter.season_id) return;
    fetchSeasonInfo(filter.season_id).then(info => setDungeons(info.dungeons as Dungeon[]));
  }, [filter.season_id]);

  if (!hasBooted && loading) {
    return <LoadingScreen />; // initial app boot only for the home page
  }

  if (apiError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 text-gray-100">
        <h1 className="text-2xl font-bold text-red-400 mb-4">There was a deplete but key is resilient</h1>
        <p className="mb-2">We are under maintenance, please try again in a few minutes.</p>
        <button
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={async () => {
            setApiError(null);
            setLoading(true);
            const baseParams: TopKeyParams = { season_id: Number(filter.season_id) };
            if (filter.period_id) baseParams.period_id = filter.period_id;
            if (filter.dungeon_id) baseParams.dungeon_id = filter.dungeon_id;
            const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
            const maxMobileInitial = 250;
            const targetLimit = filter.limit ?? 1000;
            const initialLimit = isMobile ? Math.min(targetLimit, maxMobileInitial) : targetLimit;
            try {
              const first = await fetchTopKeys({ ...baseParams, limit: initialLimit });
              setApiData((first || []) as Run[]);
              setLoading(false);
              if (initialLimit < targetLimit) {
                try {
                  const rest = await fetchTopKeys({ ...baseParams, limit: targetLimit - initialLimit, offset: initialLimit });
                  setApiData([...(first || []), ...(rest || [])] as Run[]);
                } catch (e) {
                  console.error('Background fetch (remaining runs) failed:', e);
                }
              }
            } catch (err: any) {
              setApiError(err?.message || 'API error');
              setLoading(false);
            }
          }}
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4">
      <FilterBar
        showExpansion={false}
        showPeriod={true}
        showDungeon={true}
        showLimit={true}
      />
      {/* Inline loading: show skeleton table while fetching */}
      <div className="mb-4 text-sm text-gray-300">
        Looking for the latest meta? Check out{' '}
        <Link to="/wow-meta-season-3" className="text-blue-400 hover:underline">WoW Meta — TWW Season 3</Link>.
      </div>
      <div>
        <SummaryStats runs={apiData || []} dungeons={dungeons} />
      </div>
      <div>
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
  );
};

export default HomePage;
