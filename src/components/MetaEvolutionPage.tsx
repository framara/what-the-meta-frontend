import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { fetchSpecEvolution, fetchSeasons } from '../api';
import { WOW_SPECIALIZATIONS, WOW_CLASS_COLORS, WOW_SPEC_TO_CLASS, WOW_MELEE_SPECS, WOW_RANGED_SPECS } from './wow-constants';
import type { TooltipProps } from 'recharts';
import { WOW_SPEC_ROLES } from './wow-constants';

// Custom tooltip for better readability
const CustomTooltip = (props: TooltipProps<number, string>) => {
  const { active, payload, label } = props as any;
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div style={{
      background: '#181c2a',
      borderRadius: 12,
      boxShadow: '0 4px 24px 0 rgba(0,0,0,0.18)',
      padding: '12px 18px',
      minWidth: 120,
      color: '#f5f5f5',
      fontWeight: 500,
      fontSize: 15,
      lineHeight: 1.6,
    }}>
      <div style={{ fontSize: 13, color: '#aaa', marginBottom: 4 }}>Week {label}</div>
      {payload
        .filter((entry: any) => entry.value !== 0)
        .sort((a: any, b: any) => b.value - a.value)
        .map((entry: any, idx: number) => {
          const specId = Number(entry.dataKey);
          const color = WOW_CLASS_COLORS[WOW_SPEC_TO_CLASS[specId]] || '#888';
          const textColor = color;
          return (
            <div key={specId} style={{ color: textColor, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontWeight: 600 }}>{WOW_SPECIALIZATIONS[specId] || specId}</span>
              <span style={{ marginLeft: 6, fontWeight: 400 }}>:</span>
              <span style={{ fontWeight: 700 }}>{entry.value}</span>
            </div>
          );
        })}
    </div>
  );
};

export const MetaEvolutionPage: React.FC = () => {
  const [seasons, setSeasons] = useState<{ season_id: number; season_name: string }[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<number | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [topSpecs, setTopSpecs] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoHover, setInfoHover] = useState(false);
  const [tankChartData, setTankChartData] = useState<any[]>([]);
  const [topTankSpecs, setTopTankSpecs] = useState<number[]>([]);
  const [healerChartData, setHealerChartData] = useState<any[]>([]);
  const [topHealerSpecs, setTopHealerSpecs] = useState<number[]>([]);
  const [dpsChartData, setDpsChartData] = useState<any[]>([]);
  const [topDpsSpecs, setTopDpsSpecs] = useState<number[]>([]);
  const [meleeChartData, setMeleeChartData] = useState<any[]>([]);
  const [topMeleeSpecs, setTopMeleeSpecs] = useState<number[]>([]);
  const [rangedChartData, setRangedChartData] = useState<any[]>([]);
  const [topRangedSpecs, setTopRangedSpecs] = useState<number[]>([]);

  // Fetch all seasons on mount (only if not already loaded)
  useEffect(() => {
    if (seasons.length > 0) return;
    setError(null);
    fetchSeasons()
      .then(data => {
        const sorted = (data || []).slice().sort((a, b) => b.season_id - a.season_id);
        setSeasons(sorted);
        if (sorted.length > 0) {
          setSelectedSeason(sorted[0].season_id);
        }
      })
      .catch(err => {
        if (err.response && err.response.status === 429) {
          setError('Rate limited: Too many requests. Please wait and try again.');
        } else {
          setError('Failed to load seasons.');
        }
      });
  }, [seasons.length]);

  // Fetch spec evolution when season changes
  useEffect(() => {
    if (!selectedSeason) return;
    setChartData([]);
    setTopSpecs([]);
    setTankChartData([]);
    setTopTankSpecs([]);
    setHealerChartData([]);
    setTopHealerSpecs([]);
    setDpsChartData([]);
    setTopDpsSpecs([]);
    setMeleeChartData([]);
    setTopMeleeSpecs([]);
    setRangedChartData([]);
    setTopRangedSpecs([]);
    setLoading(true);
    setError(null);
    fetchSpecEvolution(selectedSeason)
      .then(data => {
        const evolution = data.evolution || [];
        // DPS/Healer chart logic (existing)
        const weekTopSpecs: number[][] = evolution.map(period => {
          return Object.entries(period.spec_counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 15)
            .map(([specId]) => Number(specId));
        });
        const allTopSpecsSet = new Set<number>();
        weekTopSpecs.forEach(specs => specs.forEach(specId => allTopSpecsSet.add(specId)));
        const allTopSpecs = Array.from(allTopSpecsSet);
        setTopSpecs(allTopSpecs);
        const chartRows = evolution.map((period, idx) => {
          const row: any = { week: idx + 1 };
          allTopSpecs.forEach(specId => {
            row[specId] = weekTopSpecs[idx].includes(specId) ? (period.spec_counts[specId] || 0) : 0;
          });
          return row;
        });
        setChartData(chartRows);
        // Tank chart logic
        const tankSpecIds = Object.entries(WOW_SPEC_ROLES)
          .filter(([specId, role]) => role === 'tank')
          .map(([specId]) => Number(specId));
        const weekTopTankSpecs: number[][] = evolution.map(period => {
          return Object.entries(period.spec_counts)
            .filter(([specId]) => tankSpecIds.includes(Number(specId)))
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([specId]) => Number(specId));
        });
        const allTopTankSpecsSet = new Set<number>();
        weekTopTankSpecs.forEach(specs => specs.forEach(specId => allTopTankSpecsSet.add(specId)));
        const allTopTankSpecs = Array.from(allTopTankSpecsSet);
        setTopTankSpecs(allTopTankSpecs);
        const tankChartRows = evolution.map((period, idx) => {
          const row: any = { week: idx + 1 };
          allTopTankSpecs.forEach(specId => {
            row[specId] = weekTopTankSpecs[idx].includes(specId) ? (period.spec_counts[specId] || 0) : 0;
          });
          return row;
        });
        setTankChartData(tankChartRows);
        // Healer chart logic
        const healerSpecIds = Object.entries(WOW_SPEC_ROLES)
          .filter(([specId, role]) => role === 'healer')
          .map(([specId]) => Number(specId));
        const weekTopHealerSpecs: number[][] = evolution.map(period => {
          return Object.entries(period.spec_counts)
            .filter(([specId]) => healerSpecIds.includes(Number(specId)))
            .sort((a, b) => b[1] - a[1])
            .map(([specId]) => Number(specId));
        });
        const allTopHealerSpecsSet = new Set<number>();
        weekTopHealerSpecs.forEach(specs => specs.forEach(specId => allTopHealerSpecsSet.add(specId)));
        const allTopHealerSpecs = Array.from(allTopHealerSpecsSet);
        setTopHealerSpecs(allTopHealerSpecs);
        const healerChartRows = evolution.map((period, idx) => {
          const row: any = { week: idx + 1 };
          allTopHealerSpecs.forEach(specId => {
            row[specId] = weekTopHealerSpecs[idx].includes(specId) ? (period.spec_counts[specId] || 0) : 0;
          });
          return row;
        });
        setHealerChartData(healerChartRows);
        // Melee DPS chart logic
        const weekTopMeleeSpecs: number[][] = evolution.map(period => {
          return Object.entries(period.spec_counts)
            .filter(([specId]) => WOW_MELEE_SPECS.has(Number(specId)) && WOW_SPEC_ROLES[Number(specId)] === 'dps')
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([specId]) => Number(specId));
        });
        const allTopMeleeSpecsSet = new Set<number>();
        weekTopMeleeSpecs.forEach(specs => specs.forEach(specId => allTopMeleeSpecsSet.add(specId)));
        const allTopMeleeSpecs = Array.from(allTopMeleeSpecsSet);
        setTopMeleeSpecs(allTopMeleeSpecs);
        const meleeChartRows = evolution.map((period, idx) => {
          const row: any = { week: idx + 1 };
          allTopMeleeSpecs.forEach(specId => {
            row[specId] = weekTopMeleeSpecs[idx].includes(specId) ? (period.spec_counts[specId] || 0) : 0;
          });
          return row;
        });
        setMeleeChartData(meleeChartRows);
        // Ranged DPS chart logic
        const weekTopRangedSpecs: number[][] = evolution.map(period => {
          return Object.entries(period.spec_counts)
            .filter(([specId]) => WOW_RANGED_SPECS.has(Number(specId)) && WOW_SPEC_ROLES[Number(specId)] === 'dps')
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([specId]) => Number(specId));
        });
        const allTopRangedSpecsSet = new Set<number>();
        weekTopRangedSpecs.forEach(specs => specs.forEach(specId => allTopRangedSpecsSet.add(specId)));
        const allTopRangedSpecs = Array.from(allTopRangedSpecsSet);
        setTopRangedSpecs(allTopRangedSpecs);
        const rangedChartRows = evolution.map((period, idx) => {
          const row: any = { week: idx + 1 };
          allTopRangedSpecs.forEach(specId => {
            row[specId] = weekTopRangedSpecs[idx].includes(specId) ? (period.spec_counts[specId] || 0) : 0;
          });
          return row;
        });
        setRangedChartData(rangedChartRows);
        setLoading(false);
      })
      .catch(err => {
        setLoading(false);
        if (err.response && err.response.status === 429) {
          setError('Rate limited: Too many requests. Please wait and try again.');
        } else {
          setError('Failed to load meta evolution data.');
        }
      });
  }, [selectedSeason]);

  const selectedSeasonObj = seasons.find(s => s.season_id === selectedSeason);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-6 text-center">Meta Evolution</h2>
      <div className="text-center text-md text-gray-400 mb-8">Sample data: Top 1000 dungeons per week.</div>
      {/* Filter bar */}
      <div className="flex gap-4 justify-center mb-8">
        <select
          className="px-4 py-2 rounded bg-gray-800 text-gray-100 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={selectedSeason || ''}
          onChange={e => setSelectedSeason(Number(e.target.value))}
          disabled={loading}
        >
          {seasons.map(s => (
            <option key={s.season_id} value={s.season_id}>{s.season_name}</option>
          ))}
        </select>
        {loading && <span className="text-gray-400 ml-4">Loading...</span>}
        {error && <span className="text-red-400 ml-4">{error}</span>}
      </div>

      <div className="bg-gray-900 rounded-xl shadow p-6">
        <h3 className="text-xl font-semibold mb-4">Top 15 Specs Per Period</h3>
        <ResponsiveContainer width="100%" height={450}>
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
            <XAxis dataKey="week" stroke="#aaa" />
            <YAxis stroke="#aaa" allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} />
            {topSpecs.map(specId => (
              <Line
                key={specId}
                type="monotone"
                dataKey={specId.toString()}
                stroke={WOW_CLASS_COLORS[WOW_SPEC_TO_CLASS[specId]] || '#888'}
                strokeWidth={2}
                dot={false}
                name={WOW_SPECIALIZATIONS[specId] || specId.toString()}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      {/* Tank chart */}
      <div className="bg-gray-900 rounded-xl shadow p-6 mt-8">
        <h3 className="text-xl font-semibold mb-4">Top 6 Tank Specs Per Period</h3>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={tankChartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
            <XAxis dataKey="week" stroke="#aaa" />
            <YAxis stroke="#aaa" allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} />
            {topTankSpecs.map(specId => (
              <Line
                key={specId}
                type="monotone"
                dataKey={specId.toString()}
                stroke={WOW_CLASS_COLORS[WOW_SPEC_TO_CLASS[specId]] || '#888'}
                strokeWidth={2}
                dot={false}
                name={WOW_SPECIALIZATIONS[specId] || specId.toString()}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      {/* Healer chart */}
      <div className="bg-gray-900 rounded-xl shadow p-6 mt-8">
        <h3 className="text-xl font-semibold mb-4">Top 7 Healer Specs Per Period</h3>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={healerChartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
            <XAxis dataKey="week" stroke="#aaa" />
            <YAxis stroke="#aaa" allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} />
            {topHealerSpecs.map(specId => (
              <Line
                key={specId}
                type="monotone"
                dataKey={specId.toString()}
                stroke={WOW_CLASS_COLORS[WOW_SPEC_TO_CLASS[specId]] || '#888'}
                strokeWidth={2}
                dot={false}
                name={WOW_SPECIALIZATIONS[specId] || specId.toString()}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      {/* Melee DPS chart */}
      <div className="bg-gray-900 rounded-xl shadow p-6 mt-8">
        <h3 className="text-xl font-semibold mb-4">Top 10 Melee DPS Specs Per Period</h3>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={meleeChartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
            <XAxis dataKey="week" stroke="#aaa" />
            <YAxis stroke="#aaa" allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} />
            {topMeleeSpecs.map(specId => (
              <Line
                key={specId}
                type="monotone"
                dataKey={specId.toString()}
                stroke={WOW_CLASS_COLORS[WOW_SPEC_TO_CLASS[specId]] || '#888'}
                strokeWidth={2}
                dot={false}
                name={WOW_SPECIALIZATIONS[specId] || specId.toString()}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      {/* Ranged DPS chart */}
      <div className="bg-gray-900 rounded-xl shadow p-6 mt-8">
        <h3 className="text-xl font-semibold mb-4">Top 10 Ranged DPS Specs Per Period</h3>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={rangedChartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
            <XAxis dataKey="week" stroke="#aaa" />
            <YAxis stroke="#aaa" allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} />
            {topRangedSpecs.map(specId => (
              <Line
                key={specId}
                type="monotone"
                dataKey={specId.toString()}
                stroke={WOW_CLASS_COLORS[WOW_SPEC_TO_CLASS[specId]] || '#888'}
                strokeWidth={2}
                dot={false}
                name={WOW_SPECIALIZATIONS[specId] || specId.toString()}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}; 