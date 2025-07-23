import React, { useEffect, useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { fetchSpecEvolution, fetchSeasons } from '../api';
import { WOW_SPECIALIZATIONS, WOW_CLASS_COLORS, WOW_SPEC_TO_CLASS, WOW_MELEE_SPECS, WOW_RANGED_SPECS } from './wow-constants';
import type { TooltipProps } from 'recharts';
import { WOW_SPEC_ROLES } from './wow-constants';

// Custom tooltip for better readability
const CustomTooltip = (props: TooltipProps<number, string>) => {
  const { active, payload, label } = props as any;
  if (!active || !payload || payload.length === 0) return null;

  // Sort by class, then spec name
  const classOrder = [1,2,3,4,5,6,7,8,9,10,11,12,13];
  const sortedPayload = [...payload]
    .filter((entry: any) => entry.value !== 0)
    .sort((a: any, b: any) => {
      const aClass = WOW_SPEC_TO_CLASS[Number(a.dataKey)] || 99;
      const bClass = WOW_SPEC_TO_CLASS[Number(b.dataKey)] || 99;
      if (aClass !== bClass) return classOrder.indexOf(aClass) - classOrder.indexOf(bClass);
      const aSpec = WOW_SPECIALIZATIONS[Number(a.dataKey)] || '';
      const bSpec = WOW_SPECIALIZATIONS[Number(b.dataKey)] || '';
      return aSpec.localeCompare(bSpec);
    });

  return (
    <div style={{
      background: '#181c2a',
      borderRadius: 10,
      boxShadow: '0 4px 24px 0 rgba(0,0,0,0.18)',
      padding: '8px 12px',
      minWidth: 100,
      maxWidth: 320,
      color: '#f5f5f5',
      fontWeight: 500,
      fontSize: 13,
      lineHeight: 1.4,
    }}>
      <div style={{ fontSize: 12, color: '#aaa', marginBottom: 2 }}>Week {label}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {sortedPayload.map((entry: any) => {
          const specId = Number(entry.dataKey);
          const color = WOW_CLASS_COLORS[WOW_SPEC_TO_CLASS[specId]] || '#888';
          return (
            <div key={specId} style={{ color, minWidth: 110, display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
              <span style={{ fontWeight: 600 }}>{WOW_SPECIALIZATIONS[specId] || specId}</span>
              <span style={{ marginLeft: 4, fontWeight: 400 }}>:</span>
              <span style={{ fontWeight: 700 }}>{entry.value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const MetaEvolutionPage: React.FC = () => {
  type ChartGroup = { data: any[]; topSpecs: number[] };
  type ChartDataState = Record<'all' | 'tank' | 'healer' | 'dps' | 'melee' | 'ranged', ChartGroup>;
  const [charts, setCharts] = useState<ChartDataState>({
    all: { data: [], topSpecs: [] },
    tank: { data: [], topSpecs: [] },
    healer: { data: [], topSpecs: [] },
    dps: { data: [], topSpecs: [] },
    melee: { data: [], topSpecs: [] },
    ranged: { data: [], topSpecs: [] },
  });
  const [seasons, setSeasons] = useState<{ season_id: number; season_name: string }[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  // const [error, setError] = useState<string | null>(null);
  // const [infoHover, setInfoHover] = useState(false);
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
  const [chartView, setChartView] = useState<'all' | 'tank' | 'healer' | 'dps' | 'melee' | 'ranged'>('all');

  // Fetch all seasons on mount (only if not already loaded)
  useEffect(() => {
    if (seasons.length > 0) return;
    // setError(null); // error state removed
    fetchSeasons()
      .then(data => {
        const sorted = (data || []).sort((a, b) => b.season_id - a.season_id);
        setSeasons(sorted);
        if (sorted.length > 0) {
          setSelectedSeason(sorted[0].season_id);
        }
      })
      .catch(err => {
        // Error handling UI removed (error state unused)
      });
  }, [seasons.length]);

  // Fetch spec evolution when season changes
  useEffect(() => {
    if (!selectedSeason) return;
    setLoading(true);
    // setError(null); // error state removed
    fetchSpecEvolution(selectedSeason)
      .then(data => {
        const evolution = data.evolution || [];
        // DPS/Healer chart logic (existing)
        const weekTopSpecs: number[][] = evolution.map(period => {
          return Object.entries(period.spec_counts)
            .sort((a, b) => b[1] - a[1])
            .map(([specId]) => Number(specId));
        });
        const allTopSpecsSet = new Set<number>();
        weekTopSpecs.forEach(specs => specs.forEach(specId => allTopSpecsSet.add(specId)));
        const allTopSpecs = Array.from(allTopSpecsSet);
        const chartRows = evolution.map((period, idx) => {
          const row: any = { week: idx + 1 };
          allTopSpecs.forEach(specId => {
            row[specId] = weekTopSpecs[idx].includes(specId) ? (period.spec_counts[specId] || 0) : 0;
          });
          return row;
        });
        // Tank chart logic
        const tankSpecIds = Object.entries(WOW_SPEC_ROLES)
          .filter(([specId, role]) => role === 'tank')
          .map(([specId]) => Number(specId));
        const weekTopTankSpecs: number[][] = evolution.map(period => {
          return Object.entries(period.spec_counts)
            .filter(([specId]) => tankSpecIds.includes(Number(specId)))
            .sort((a, b) => b[1] - a[1])
            .map(([specId]) => Number(specId));
        });
        const allTopTankSpecsSet = new Set<number>();
        weekTopTankSpecs.forEach(specs => specs.forEach(specId => allTopTankSpecsSet.add(specId)));
        const allTopTankSpecs = Array.from(allTopTankSpecsSet);
        const tankChartRows = evolution.map((period, idx) => {
          const row: any = { week: idx + 1 };
          allTopTankSpecs.forEach(specId => {
            row[specId] = weekTopTankSpecs[idx].includes(specId) ? (period.spec_counts[specId] || 0) : 0;
          });
          return row;
        });
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
        const healerChartRows = evolution.map((period, idx) => {
          const row: any = { week: idx + 1 };
          allTopHealerSpecs.forEach(specId => {
            row[specId] = weekTopHealerSpecs[idx].includes(specId) ? (period.spec_counts[specId] || 0) : 0;
          });
          return row;
        });
        // Melee DPS chart logic
        const weekTopMeleeSpecs: number[][] = evolution.map(period => {
          return Object.entries(period.spec_counts)
            .filter(([specId]) => WOW_MELEE_SPECS.has(Number(specId)) && WOW_SPEC_ROLES[Number(specId)] === 'dps')
            .sort((a, b) => b[1] - a[1])
            .map(([specId]) => Number(specId));
        });
        const allTopMeleeSpecsSet = new Set<number>();
        weekTopMeleeSpecs.forEach(specs => specs.forEach(specId => allTopMeleeSpecsSet.add(specId)));
        const allTopMeleeSpecs = Array.from(allTopMeleeSpecsSet);
        const meleeChartRows = evolution.map((period, idx) => {
          const row: any = { week: idx + 1 };
          allTopMeleeSpecs.forEach(specId => {
            row[specId] = weekTopMeleeSpecs[idx].includes(specId) ? (period.spec_counts[specId] || 0) : 0;
          });
          return row;
        });
        // Ranged DPS chart logic
        const weekTopRangedSpecs: number[][] = evolution.map(period => {
          return Object.entries(period.spec_counts)
            .filter(([specId]) => WOW_RANGED_SPECS.has(Number(specId)) && WOW_SPEC_ROLES[Number(specId)] === 'dps')
            .sort((a, b) => b[1] - a[1])
            .map(([specId]) => Number(specId));
        });
        const allTopRangedSpecsSet = new Set<number>();
        weekTopRangedSpecs.forEach(specs => specs.forEach(specId => allTopRangedSpecsSet.add(specId)));
        const allTopRangedSpecs = Array.from(allTopRangedSpecsSet);
        const rangedChartRows = evolution.map((period, idx) => {
          const row: any = { week: idx + 1 };
          allTopRangedSpecs.forEach(specId => {
            row[specId] = weekTopRangedSpecs[idx].includes(specId) ? (period.spec_counts[specId] || 0) : 0;
          });
          return row;
        });
        // DPS chart logic (melee + ranged)
        const dpsSpecIds = Object.entries(WOW_SPEC_ROLES)
          .filter(([specId, role]) => role === 'dps')
          .map(([specId]) => Number(specId));
        const weekTopDpsSpecs: number[][] = evolution.map(period => {
          return Object.entries(period.spec_counts)
            .filter(([specId]) => dpsSpecIds.includes(Number(specId)))
            .sort((a, b) => b[1] - a[1])
            .map(([specId]) => Number(specId));
        });
        const allTopDpsSpecsSet = new Set<number>();
        weekTopDpsSpecs.forEach(specs => specs.forEach(specId => allTopDpsSpecsSet.add(specId)));
        const allTopDpsSpecs = Array.from(allTopDpsSpecsSet);
        const dpsChartRows = evolution.map((period, idx) => {
          const row: any = { week: idx + 1 };
          allTopDpsSpecs.forEach(specId => {
            row[specId] = weekTopDpsSpecs[idx].includes(specId) ? (period.spec_counts[specId] || 0) : 0;
          });
          return row;
        });
        setCharts({
          all: { data: chartRows, topSpecs: allTopSpecs },
          tank: { data: tankChartRows, topSpecs: allTopTankSpecs },
          healer: { data: healerChartRows, topSpecs: allTopHealerSpecs },
          dps: { data: dpsChartRows, topSpecs: allTopDpsSpecs },
          melee: { data: meleeChartRows, topSpecs: allTopMeleeSpecs },
          ranged: { data: rangedChartRows, topSpecs: allTopRangedSpecs },
        });
        setLoading(false);
      })
      .catch(err => {
        setLoading(false);
        // Error handling UI removed (error state unused)
      });
  }, [selectedSeason]);

  // Compute all specs that appear in any week for the stacked bar chart
  const allSpecs = useMemo(() => {
    const set = new Set<number>();
    (charts.all.data || []).forEach((week: Record<string, any>) => {
      Object.keys(week).forEach((key: string) => {
        if (key !== 'week') set.add(Number(key));
      });
    });
    return Array.from(set);
  }, [charts.all.data]);

  // Calculate the max Y value for the current chart view
  const maxDataValue = useMemo(() => {
    const chart = charts[chartView].data;
    let max = 0;
    chart.forEach((row: Record<string, any>) => {
      Object.keys(row).forEach((key: string) => {
        if (key !== 'week') {
          max = Math.max(max, row[key]);
        }
      });
    });
    // Add a 5% buffer for visual clarity
    return Math.ceil(max * 1.05);
  }, [charts, chartView]);

  const chartTitles = {
    all: 'All Specs Evolution',
    tank: 'Tank Evolution',
    healer: 'Healer Evolution',
    dps: 'DPS Evolution',
    melee: 'Melee DPS Evolution',
    ranged: 'Ranged DPS Evolution',
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-6 text-center">Meta Evolution</h2>
      <div className="text-center text-md text-gray-400 mb-8">Sample data: Top 1000 dungeons per week.</div>
      {/* Filter bar and chart view selector on the same line */}
      <div className="flex items-center justify-between mb-8 gap-4">
        <div className="flex-1">
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
        </div>
        <div className="flex-1 flex justify-center">
          {[
            { key: 'all', label: 'All Specs' },
            { key: 'tank', label: 'Tank' },
            { key: 'healer', label: 'Healer' },
            { key: 'dps', label: 'DPS' },
            { key: 'melee', label: 'Melee DPS' },
            { key: 'ranged', label: 'Ranged DPS' },
          ].map(({ key, label }) => (
            <button
              key={key}
              className={`px-6 py-1.5 rounded-full font-semibold transition border-2 mx-1 ${chartView === key ? 'bg-blue-600 text-white border-blue-600 shadow' : 'bg-gray-800 text-gray-200 border-gray-700 hover:bg-gray-700'}`}
              onClick={() => setChartView(key as any)}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex-1" />
      </div>
      {/* Unified Line Chart for all views */}
      <div className="bg-gray-900 rounded-xl shadow p-6">
        <h3 className="text-xl font-semibold mb-4">{chartTitles[chartView]}</h3>
        {loading ? (
          <div className="flex justify-center items-center h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500"></div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={450}>
            <LineChart
              data={charts[chartView].data}
              margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
            >
              <XAxis dataKey="week" stroke="#aaa" />
              <YAxis stroke="#aaa" allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              {charts[chartView].topSpecs.map((specId: number) => (
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
        )}
      </div>
      {/* Stacked Bar Chart */}
      <div className="bg-gray-900 rounded-xl shadow p-6 mt-8">
        <h3 className="text-xl font-semibold mb-4"></h3>
        {loading ? (
          <div className="flex justify-center items-center h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500"></div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={450}>
            <BarChart
              data={charts[chartView].data}
              margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
            >
              <XAxis dataKey="week" stroke="#aaa" />
              <YAxis stroke="#aaa" allowDecimals={false} domain={[0, maxDataValue]} />
              <Tooltip content={<CustomTooltip />} />
              {(chartView === 'all' ? allSpecs : charts[chartView].topSpecs).map((specId: number) => (
                <Bar
                  key={specId}
                  dataKey={specId.toString()}
                  stackId="a"
                  fill={WOW_CLASS_COLORS[WOW_SPEC_TO_CLASS[specId]] || '#888'}
                  name={WOW_SPECIALIZATIONS[specId] || specId.toString()}
                  barSize={20}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}; 