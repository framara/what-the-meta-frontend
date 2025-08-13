import React, { useEffect, useMemo, useState } from 'react';
import { getAffixInsights, type AffixInsightsResponse } from '../../../services/aiService';
import { WOW_CLASS_COLORS, WOW_SPEC_NAMES, WOW_SPEC_TO_CLASS } from '../../../constants/wow-constants';
import '../styles/AffixInsightsPanel.css';

interface AffixInsightsPanelProps {
  seasonId: number;
  periodId?: number;
}

export const AffixInsightsPanel: React.FC<AffixInsightsPanelProps> = ({ seasonId, periodId }) => {
  const [data, setData] = useState<AffixInsightsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!seasonId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    getAffixInsights({ seasonId, periodId })
      .then((resp) => {
        if (!cancelled) setData(resp);
      })
      .catch((e) => {
        if (!cancelled) setError('Failed to load weekly insights');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [seasonId, periodId]);

  const winners = useMemo(() => data?.winners || [], [data]);
  const losers = useMemo(() => data?.losers || [], [data]);

  const summaryLine = useMemo(() => {
    if (!data) return '';
    return `This week: ${winners.length} rising · ${losers.length} declining`;
  }, [data, winners.length, losers.length]);

  function extractDelta(reason: string, isWinner: boolean): string | null {
    if (!reason) return null;
    const m = reason.match(/([+-]?\d+(?:\.\d+)?)%/);
    if (m) {
      const val = parseFloat(m[1]);
      const signed = isWinner ? Math.abs(val) : -Math.abs(val);
      const sign = signed > 0 ? '+' : '';
      return `${sign}${signed.toFixed(1)}%`;
    }
    return null;
  }

  if (!seasonId) return null;

  return (
    <div className="affix-panel">
      <div className="affix-header">
        <h3 className="affix-title">Weekly Meta Shifts</h3>
        {data?._cache && (
          <div className="affix-cache">💾 Cached • {new Date(data._cache.created_at).toLocaleString()}</div>
        )}
      </div>
      {loading && (
        <div className="affix-loading">
          <div className="affix-spinner" /> Loading weekly insights…
        </div>
      )}
      {error && (
        <div className="affix-error">{error}</div>
      )}
      {!loading && !error && data && (
        <div className="affix-content">
          <p className="affix-summary">{summaryLine}</p>
          <div className="affix-columns">
            <div className="affix-column">
              <h4 className="affix-subtitle">Rising</h4>
              <ul className="affix-list">
                {winners.length === 0 && <li className="affix-empty">No clear risers</li>}
                {winners.slice(0, 6).map((w) => {
                  const classId = WOW_SPEC_TO_CLASS[w.specId];
                  const color = WOW_CLASS_COLORS[classId] || '#888888';
                  const name = WOW_SPEC_NAMES[w.specId] || `Spec ${w.specId}`;
                  const delta = extractDelta(w.reason, true);
                  return (
                    <li key={`w-${w.specId}`} className="affix-item">
                      <span className="affix-dot" style={{ backgroundColor: color }} />
                      <span className="affix-spec">{name}</span>
                      {delta && <span className="affix-delta delta-up" title={w.reason}>{delta}</span>}
                      <span className="affix-confidence" title="Confidence">{Math.round(w.confidence)}%</span>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div className="affix-column">
              <h4 className="affix-subtitle">Declining</h4>
              <ul className="affix-list">
                {losers.length === 0 && <li className="affix-empty">No clear decliners</li>}
                {losers.slice(0, 6).map((l) => {
                  const classId = WOW_SPEC_TO_CLASS[l.specId];
                  const color = WOW_CLASS_COLORS[classId] || '#888888';
                  const name = WOW_SPEC_NAMES[l.specId] || `Spec ${l.specId}`;
                  const delta = extractDelta(l.reason, false);
                  return (
                    <li key={`l-${l.specId}`} className="affix-item">
                      <span className="affix-dot" style={{ backgroundColor: color }} />
                      <span className="affix-spec">{name}</span>
                      {delta && <span className="affix-delta delta-down" title={l.reason}>{delta}</span>}
                      <span className="affix-confidence" title="Confidence">{Math.round(l.confidence)}%</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
          {data.citations?.periodIds?.length > 0 && (
            <div className="affix-citations">
              Based on periods: {data.citations.periodIds.join(', ')}
            </div>
          )}
        </div>
      )}
    </div>
  );
};


