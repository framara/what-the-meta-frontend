import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
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
        {sortedPayload.map((entry: any, idx: number) => {
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
  const [chartView, setChartView] = useState<'all' | 'tank' | 'healer' | 'melee' | 'ranged'>('all');

  // Fetch all seasons on mount (only if not already loaded)
  useEffect(() => {
    if (seasons.length > 0) return;
    setError(null);
    fetchSeasons()
      .then(data => {
        const sorted = (data || []).sort((a, b) => b.season_id - a.season_id);
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

  // Compute all specs that appear in any week for the stacked bar chart
  const allSpecsSet = new Set<number>();
  (chartData || []).forEach(week => {
    Object.keys(week).forEach(key => {
      if (key !== 'week') allSpecsSet.add(Number(key));
    });
  });
  const allSpecs = Array.from(allSpecsSet);

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
      {/* Charts */}
      {chartView === 'all' && (
        <div className="bg-gray-900 rounded-xl shadow p-6">
          <h3 className="text-xl font-semibold mb-4">All specs per period</h3>
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
      )}
      {chartView === 'tank' && (
        <div className="bg-gray-900 rounded-xl shadow p-6">
          <h3 className="text-xl font-semibold mb-4">All tank specs per period</h3>
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
      )}
      {chartView === 'healer' && (
        <div className="bg-gray-900 rounded-xl shadow p-6">
          <h3 className="text-xl font-semibold mb-4">All healer specs per period</h3>
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
      )}
      {chartView === 'melee' && (
        <div className="bg-gray-900 rounded-xl shadow p-6">
          <h3 className="text-xl font-semibold mb-4">All melee specs per period</h3>
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
      )}
      {chartView === 'ranged' && (
        <div className="bg-gray-900 rounded-xl shadow p-6">
          <h3 className="text-xl font-semibold mb-4">All ranged specs per period</h3>
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
      )}
      {/* Stacked Bar Chart */}
      <div className="bg-gray-900 rounded-xl shadow p-6 mt-8">
        <h3 className="text-xl font-semibold mb-4"></h3>
        <ResponsiveContainer width="100%" height={450}>
          <BarChart
            data={
              chartView === 'all' ? chartData :
              chartView === 'tank' ? tankChartData :
              chartView === 'healer' ? healerChartData :
              chartView === 'melee' ? meleeChartData :
              chartView === 'ranged' ? rangedChartData :
              chartData
            }
            margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
          >
            <XAxis dataKey="week" stroke="#aaa" />
            <YAxis stroke="#aaa" allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} />
            {(
              chartView === 'all' ? allSpecs :
              chartView === 'tank' ? topTankSpecs :
              chartView === 'healer' ? topHealerSpecs :
              chartView === 'melee' ? topMeleeSpecs :
              chartView === 'ranged' ? topRangedSpecs :
              allSpecs
            ).map(specId => (
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
      </div>
    </div>
  );
}; 