import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import SEO from '../SEO';
import { fetchSeasonInfo, fetchSeasons } from '../../services/api';
import type { TierListResponse, TierListEntry, TierKey } from '../../services/aiService';
import { getTierListCached, generateTierList } from '../../services/aiService';
import { WOW_CLASS_COLORS, WOW_SPEC_COLORS, WOW_SPECIALIZATIONS, WOW_CLASS_NAMES, WOW_SPEC_TO_CLASS, SEASON_METADATA } from '../../constants/wow-constants';
import { SpecIconImage } from '../../utils/specIconImages';
import { Tooltip } from '../AIPredictionsPage/components/Tooltip';
import './styles/AITierListPage.css';

const formatLocalTimestamp = (iso?: string) => {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleString();
  } catch {
    return '';
  }
};

export const AITierListPage: React.FC = () => {
  const [seasonId, setSeasonId] = useState<number | null>(null);
  const [tierList, setTierList] = useState<TierListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fallbackTriedRef = useRef<number | null>(null);

  // Function to convert season ID to user-friendly name
  const getSeasonName = (seasonId: number | null): string => {
    if (!seasonId) return 'Current Season';
    return SEASON_METADATA[seasonId]?.name || `Season ${seasonId}`;
  };

  // Tooltip state for spec icons
  const [specTooltip, setSpecTooltip] = useState<{
    x: number;
    y: number;
    content: string;
    color: string;
  } | null>(null);

  // Helper to determine text color for tooltip
  function getTextColor(bgColor: string): string {
    const hex = bgColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#23263a' : '#fff';
  }

  const start = useCallback(async (sid: number) => {
    setAiLoading(true);
    setError(null);
    try {
      let data: TierListResponse;
      try {
        data = await getTierListCached(sid);
      } catch (err: any) {
        if (err?.message === 'CACHE_MISS' || err?.response?.status === 404) {
          data = await generateTierList(sid);
        } else {
          throw err;
        }
      }
      setTierList(data);
    } catch (e: any) {
      setError(e?.message || 'Failed to load tier list');
    } finally {
      setAiLoading(false);
    }
  }, []);

  // initialize to latest season; fallback to previous if no data
  useEffect(() => {
    (async () => {
      try {
        const seasons = await fetchSeasons();
        const highest = seasons.reduce((m: any, s: any) => (s.season_id > m.season_id ? s : m));
        setSeasonId(highest.season_id);
      } catch (e) {
        setError('Failed to load seasons');
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (!seasonId) return;
      setLoading(true);
      setError(null);
      try {
        // fallback check similar to predictions
        try {
          const info = await fetchSeasonInfo(seasonId);
          const hasData = (info?.periods?.length ?? 0) > 0 || (info?.dungeons?.length ?? 0) > 0;
          if (!hasData && fallbackTriedRef.current !== seasonId) {
            const seasons = await fetchSeasons();
            const sorted = [...seasons].sort((a: any, b: any) => b.season_id - a.season_id);
            if (sorted.length > 1 && seasonId === sorted[0].season_id) {
              const prev = sorted[1];
              if (prev?.season_id) {
                fallbackTriedRef.current = seasonId;
                setSeasonId(prev.season_id);
                setLoading(false);
                return;
              }
            }
          }
        } catch { }
        await start(seasonId);
      } catch (e) {
        setError('Failed to load AI Tier List');
      } finally {
        setLoading(false);
      }
    })();
  }, [seasonId, start]);

  const lanes: TierKey[] = useMemo(() => ['S', 'A', 'B', 'C', 'D'], []);

  const renderIcon = (e: TierListEntry) => {
    const classId = WOW_SPEC_TO_CLASS[e.specId];
    const classColor = WOW_CLASS_COLORS[classId] || '#23263a';
    const tooltipContent = e.specName;

    return (
      <div
        key={e.specId}
        className="spec-chip"
        style={{
          border: `3px solid ${classColor}`,
        }}
        onMouseEnter={(event: React.MouseEvent) => {
          const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
          setSpecTooltip({
            x: rect.left + rect.width / 2,
            y: rect.top,
            content: tooltipContent,
            color: classColor,
          });
        }}
        onMouseLeave={() => setSpecTooltip(null)}
      >
        <div className="icon"><SpecIconImage specId={e.specId} /></div>
      </div>
    );
  };

  const renderRow = (t: TierKey) => {
    const specs = (tierList?.tiers?.[t] || []).slice().sort((a, b) => (b.usage || 0) - (a.usage || 0));
    return (
      <div key={t} className="tier-row">
        <div className={`tier-label tier-${t}`} aria-label={`Tier ${t}`}>{t}</div>
        <div className="tier-icons">
          {specs.length === 0 ? (
            <div className="empty">No specs placed.</div>
          ) : (
            specs.map(renderIcon)
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="ai-tier-page">
      <SEO
        title="AI Tier List – What the Meta?"
        description="S–D AI tier list for Mythic+ specs, based on usage and trends."
        keywords={["WoW", "Mythic+", "Tier List", "AI", "spec tiers"]}
        canonicalUrl="/ai-tier-list"
        image="/og-image.jpg"
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: (typeof window !== 'undefined' ? window.location.origin : 'https://whatthemeta.io') + '/' },
            { '@type': 'ListItem', position: 2, name: 'AI Tier List', item: (typeof window !== 'undefined' ? window.location.origin : 'https://whatthemeta.io') + '/ai-tier-list' }
          ]
        }}
      />

      {!seasonId ? (
        <div className="select-season-container">
          <div className="select-season-content">
            <h2>📊 Loading Current Season</h2>
            <p>Loading AI tier list for the current season...</p>
          </div>
        </div>
      ) : (
        <div className="ai-content-wrapper">
          {/* Skeleton overlay for loading states */}
          {(loading || (aiLoading && !tierList)) && (
            <div className="ai-skeleton-overlay">
              <div className="ai-robot-buddy" aria-hidden="true">
                <div className="ai-robot-emoji" role="img" aria-label="robot">🤖</div>
                <div className="ai-robot-bubble">
                  <span className="ai-robot-msg ai-robot-msg-1">Analyzing meta...</span>
                  <span className="ai-robot-msg ai-robot-msg-2">Ranking specs...</span>
                  <span className="ai-robot-msg ai-robot-msg-3">Building tier list...</span>
                </div>
              </div>
              <div className="ai-tier-skeleton">
                <div className="sk-title" />
                <div className="sk-rows">
                  {Array.from({ length: 5 }).map((_, i) => <div key={i} className="sk-lane" />)}
                </div>
                <div className="ai-skeleton-note">
                  <div className="ai-inline-spinner" />
                  <div className="ai-skeleton-text">
                    {aiLoading ? 'AI tier list generation in progress...' : 'Loading tier list...'}
                  </div>
                  <div className="ai-skeleton-subtext">This may take up to 1 minute.</div>
                </div>
              </div>
            </div>
          )}

          <div className={`ai-tier-content ${(loading || (aiLoading && !tierList)) ? 'ai-fade-dim' : 'ai-fade-in'}`}>
            <div className="dashboard-header">
              <h1 className="dashboard-title">
                Tier List for {getSeasonName(seasonId)} - AI Analysis
                <Tooltip content="Our AI analyzes thousands of Mythic+ runs to rank specializations from S (dominant) to D (underperforming). The algorithm considers: current usage rates, success rates across different key levels, recent performance trends, and class balance changes. S-tier specs dominate the meta, while D-tier specs may need buffs or have niche applications.">
                  <svg className="ai-tooltip-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-label="Info" role="img" style={{marginLeft: '0.5rem', verticalAlign: 'middle'}}>
                    <circle cx="10" cy="10" r="10" fill="#3b82f6" />
                    <text x="10" y="15" textAnchor="middle" fontSize="13" fill="#fff" fontWeight="bold">?</text>
                  </svg>
                </Tooltip>
              </h1>
              <p className="dashboard-subtitle">AI-generated spec rankings using OpenAI models.</p>
              <p className="dashboard-data-info">
                S–D tier ranking based on usage and performance trends
              </p>
            </div>

            {error && (
              <div className="error">
                <div className="err-title">Failed to load</div>
                <div className="err-msg">{error}</div>
              </div>
            )}

            {tierList ? (
              <div className="tier-list-wrapper">
                <div className="tiers-table">
                  {lanes.map(renderRow)}
                  {tierList._cache?.created_at && (
                    <div className="ai-tier-timestamp">
                      <span className="label">Generated:</span> {formatLocalTimestamp(tierList._cache.created_at)}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              !loading && !aiLoading && (
                <div className="ai-fallback-container">
                  <div className="ai-fallback-content">
                    <h3>📊 No Tier List Available</h3>
                    <p>AI tier list is not available. Please try refreshing the page.</p>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* Enhanced Tooltip */}
      {specTooltip && createPortal(
        <div
          className="spec-tooltip"
          style={{
            left: specTooltip.x,
            top: specTooltip.y - 10,
            background: specTooltip.color,
            borderColor: specTooltip.color,
            color: getTextColor(specTooltip.color),
          }}
        >
          {specTooltip.content}
        </div>,
        document.body
      )}
    </div>
  );
};

export default AITierListPage;
