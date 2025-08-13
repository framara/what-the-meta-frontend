import { useEffect, useMemo, useState } from 'react';
import { fetchCutoffLatest } from '../../services/api';
import type { CutoffSnapshot } from '../../services/api';
import { FilterBar } from '../FilterBar';
import { ChartViewSelector } from '../MetaEvolutionPage/components/ChartViewSelector';
import { SimpleBarChart, TwoLevelSpecPieChart } from './CutoffCharts';
import { WOW_CLASS_NAMES, WOW_CLASS_COLORS, WOW_SPEC_NAMES, WOW_SPEC_ROLES, WOW_MELEE_SPECS, WOW_RANGED_SPECS, getRaiderIoSeasonSlug } from '../../constants/wow-constants';
import { useFilterState } from '../FilterContext';
import './styles/CutoffPage.css';

type ChartView = 'all' | 'tank' | 'healer' | 'dps' | 'melee' | 'ranged';
type ChartKind = 'pie' | 'bar';

export default function CutoffPage() {
  const filter = useFilterState();
  const [region, setRegion] = useState<string>('us');
  const [snapshot, setSnapshot] = useState<CutoffSnapshot | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [chartView, setChartView] = useState<ChartView>('all');
  const [chartKind, setChartKind] = useState<ChartKind>('pie');

  useEffect(() => {
    const seasonSlug = getRaiderIoSeasonSlug(filter.season_id);
    if (!seasonSlug || !region) return;
    setLoading(true);
    setError(null);
    fetchCutoffLatest(seasonSlug, region)
      .then(setSnapshot)
      .catch(e => setError(e?.response?.data?.message || e.message || 'Error'))
      .finally(() => setLoading(false));
  }, [filter.season_id, region]);

  const specNameToId: Record<string, number> = useMemo(() => {
    const inv: Record<string, number> = {};
    Object.entries(WOW_SPEC_NAMES).forEach(([idStr, name]) => { inv[name] = Number(idStr); });
    return inv;
  }, []);

  const classNameToId: Record<string, number> = useMemo(() => {
    const inv: Record<string, number> = {};
    Object.entries(WOW_CLASS_NAMES).forEach(([idStr, name]) => { inv[name] = Number(idStr); });
    return inv;
  }, []);

  const classColor = (className: string): string => {
    const id = classNameToId[className];
    return id ? WOW_CLASS_COLORS[id] || '#60a5fa' : '#60a5fa';
  };

  const specIncludedByView = (specName: string): boolean => {
    if (chartView === 'all') return true;
    const specId = specNameToId[specName];
    if (!specId) return true;
    if (chartView === 'melee') return WOW_MELEE_SPECS.has(specId);
    if (chartView === 'ranged') return WOW_RANGED_SPECS.has(specId);
    const role = WOW_SPEC_ROLES[specId];
    return role === chartView;
  };

  const classRows = useMemo(() => {
    const rows: Array<{ name: string; total: number; specs: Record<string, number>; color: string }> = [];
    if (!snapshot?.distribution) return rows;
    for (const [className, info] of Object.entries(snapshot.distribution)) {
      const filteredSpecs: Record<string, number> = {};
      let total = 0;
      for (const [specName, count] of Object.entries(info.specs)) {
        if (specIncludedByView(specName)) {
          filteredSpecs[specName] = count;
          total += count;
        }
      }
      if (total > 0) rows.push({ name: className, total, specs: filteredSpecs, color: classColor(className) });
    }
    rows.sort((a, b) => b.total - a.total);
    return rows;
  }, [snapshot, chartView]);

  // Build spec-level rows aggregated across classes
  const specRows = useMemo(() => {
    const totals = new Map<string, { name: string; total: number; color: string }>();
    if (!snapshot?.distribution) return [] as Array<{ name: string; total: number; color: string }>;
    for (const [className, info] of Object.entries(snapshot.distribution)) {
      const color = classColor(className);
      for (const [specName, count] of Object.entries(info.specs)) {
        if (!specIncludedByView(specName)) continue;
        const label = `${specName} – ${className}`;
        const current = totals.get(label);
        if (current) {
          current.total += count;
        } else {
          totals.set(label, { name: label, total: count, color });
        }
      }
    }
    return Array.from(totals.values()).sort((a, b) => b.total - a.total);
  }, [snapshot, chartView]);

  // Prepare class-only rows for inner pie
  const classOnlyRows = useMemo(() => classRows.map(r => ({ name: r.name, value: r.total, color: r.color })), [classRows]);
  // Prepare spec-only rows with parent class for outer pie
  const specOnlyRows = useMemo(() => {
    const rows: Array<{ name: string; value: number; color: string; parent: string }> = [];
    if (!snapshot?.distribution) return rows;
    for (const [className, info] of Object.entries(snapshot.distribution)) {
      const color = classColor(className);
      for (const [specName, count] of Object.entries(info.specs)) {
        if (!specIncludedByView(specName)) continue;
        rows.push({ name: specName, value: count, color, parent: className });
      }
    }
    return rows.sort((a, b) => b.value - a.value);
  }, [snapshot, chartView]);

  return (
    <div className="cutoff-page">
      <div className="cutoff-page-header">
        <div className="cp-header-content">
          <h1 className="cutoff-page-title">Top 0.1% Cutoff</h1>
          <p className="cutoff-page-description">Class and role distribution of players at or above the Raider.IO 0.1% cutoff.</p>
        </div>
      </div>

      <FilterBar 
        showExpansion={false}
        showPeriod={false}
        showDungeon={false}
        showLimit={false}
        showRegion={true}
        region={region}
        onRegionChange={setRegion}
        className="cutoff-page-filter"
      />

        <div className="cp-controls-section">
          <ChartViewSelector chartView={chartView as any} setChartView={(v) => setChartView(v as ChartView)} isMobile={false} loading={loading} />
          <div className="button-group chart-type-toggle">
            <button className={`chart-view-button ${chartKind === 'pie' ? 'active' : ''}`} onClick={() => setChartKind('pie')}>Pie</button>
            <button className={`chart-view-button ${chartKind === 'bar' ? 'active' : ''}`} onClick={() => setChartKind('bar')}>Bar</button>
          </div>
        </div>
        
        {loading && <div className="cp-loading"><div className="cp-spinner" /></div>}
        {error && <div className="text-red-400 mb-4">{error}</div>}

        {!loading && !error && snapshot && (
          <div className="cp-chart-container cp-chart-fade cp-card">
            <div className="cp-chart-header">
              <div className="cp-chart-title">{chartKind === 'bar' ? 'Spec distribution' : 'Class/Spec distribution'}</div>
            </div>
            {chartKind === 'bar'
              ? (
                <SimpleBarChart 
                  data={specRows.map(r => ({ name: r.name, value: r.total, color: r.color }))} 
                  metrics={{ cutoffScore: snapshot?.cutoff_score, characters: snapshot?.total_qualifying, cutoffColor: snapshot?.allColor }}
                />
              ) : (
                <TwoLevelSpecPieChart 
                  classData={classOnlyRows} 
                  specData={specOnlyRows}
                  metrics={{ cutoffScore: snapshot?.cutoff_score, characters: snapshot?.total_qualifying, cutoffColor: snapshot?.allColor }}
                />
              )}
          </div>
        )}

        {!loading && !error && !snapshot && (
          <div className="text-gray-400">No snapshot found for the selected season and region.</div>
        )}
    </div>
  );
}


