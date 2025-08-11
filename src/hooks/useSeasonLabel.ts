import { useEffect, useMemo, useState } from 'react';
import { fetchSeasons } from '../services/api';

interface Season {
  season_id: number;
  season_name: string;
}

let seasonsCache: { data: Season[]; fetchedAt: number } | null = null;
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

const fallbackLabel = (seasonId?: number | null) =>
  seasonId ? `Season ${seasonId}` : 'Current Season';

export function useSeasonLabel(seasonId?: number | null) {
  const [label, setLabel] = useState<string>(fallbackLabel(seasonId));
  const [loading, setLoading] = useState<boolean>(false);

  const isFresh = useMemo(() => {
    return seasonsCache && Date.now() - seasonsCache.fetchedAt < CACHE_TTL;
  }, []);

  useEffect(() => {
    let cancelled = false;

    const computeLabel = (list: Season[]) => {
      if (!seasonId) {
        // Choose highest season if available
        const highest = list.reduce<Season | null>((acc, s) => (!acc || s.season_id > acc.season_id ? s : acc), null);
        return highest?.season_name || fallbackLabel(seasonId);
      }
      const match = list.find((s) => s.season_id === seasonId);
      return match?.season_name || fallbackLabel(seasonId);
    };

    const run = async () => {
      try {
        if (isFresh && seasonsCache) {
          const computed = computeLabel(seasonsCache.data);
          if (!cancelled) setLabel(computed);
          return;
        }
        setLoading(true);
        const seasons = await fetchSeasons();
        seasonsCache = { data: seasons as Season[], fetchedAt: Date.now() };
        const computed = computeLabel(seasonsCache.data);
        if (!cancelled) setLabel(computed);
      } catch (_) {
        if (!cancelled) setLabel(fallbackLabel(seasonId));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
    // seasonId changes should recompute
  }, [seasonId, isFresh]);

  return { seasonLabel: label, loading };
}
