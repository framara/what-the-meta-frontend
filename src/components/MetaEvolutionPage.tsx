import React, { useEffect, useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, AreaChart, Area, Treemap } from 'recharts';
import { fetchSpecEvolution, fetchSeasons } from '../api';
import { WOW_SPECIALIZATIONS, WOW_CLASS_COLORS, WOW_SPEC_TO_CLASS, WOW_MELEE_SPECS, WOW_RANGED_SPECS } from './wow-constants';
import type { TooltipProps } from 'recharts';
import { WOW_SPEC_ROLES } from './wow-constants';
import { FaChevronUp, FaChevronDown } from 'react-icons/fa';
import './styles/MetaEvolutionPage.css';

// Custom tooltip for better readability
const CustomTooltip = (props: TooltipProps<number, string> & { percent?: boolean }) => {
  const { active, payload, label, percent } = props as any;
  if (!active || !payload || payload.length === 0) return null;

  // Sort by class, then spec name
  const classOrder = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
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

  // Split into two columns
  const mid = Math.ceil(sortedPayload.length / 2);
  const col1 = sortedPayload.slice(0, mid);
  const col2 = sortedPayload.slice(mid);

  return (
    <div className="meta-tooltip">
      <div className="meta-tooltip__label">Week {label}</div>
      <div className="meta-tooltip__columns">
        {[col1, col2].map((col, i) => (
          <div
            key={i}
            className="meta-tooltip__column"
          >
            {col.map((entry: any) => {
              const specId = Number(entry.dataKey);
              const color = WOW_CLASS_COLORS[WOW_SPEC_TO_CLASS[specId]] || '#888';
              return [
                <span key={specId + '-name'} style={{ color, fontWeight: 600 }}>{WOW_SPECIALIZATIONS[specId] || specId}</span>,
                <span key={specId + '-val'} style={{ color, fontWeight: 700, textAlign: 'right' }}>
                  {percent ? `${Number(entry.value).toFixed(2)}%` : entry.value}
                </span>
              ];
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

// Helper to determine readable text color based on background
const getTextColor = (bg: string) => {
  if (!bg) return '#fff';
  const hex = bg.replace('#', '');
  if (hex.length !== 6) return '#fff';
  const r = parseInt(hex.substring(0,2),16);
  const g = parseInt(hex.substring(2,4),16);
  const b = parseInt(hex.substring(4,6),16);
  const luminance = (0.299*r + 0.587*g + 0.114*b)/255;
  return luminance > 0.5 ? '#23263a' : '#fff';
};

// Helper to shorten spec name based on cell width
const getShortName = (name: string, width: number) => {
  if (width < 60) return name.slice(0, 4);
  if (width < 80) return name.slice(0, 5);
  return name;
};

// Custom content renderer for Treemap
const CustomContentTreemap = (props: any) => {
  const { x, y, width, height, name, value, color } = props;
  const textColor = getTextColor(color);
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} style={{ fill: color, stroke: '#23263a', strokeWidth: 1.5 }} />
      {width > 40 && height > 24 && (
        <text x={x + width / 2} y={y + height / 2 - 4} textAnchor="middle" fill={textColor} fontSize={12} fontWeight={700}>
          {getShortName(name, width)}
        </text>
      )}
      {width > 40 && height > 24 && (
        <text x={x + width / 2} y={y + height / 2 + 12} textAnchor="middle" fill={textColor} fontSize={11} fontWeight={500}>
          {value}
        </text>
      )}
    </g>
  );
};

// Custom tooltip for Treemap
const TreemapTooltip = ({ active, payload }: any) => {
  if (!active || !payload || !payload[0]) return null;
  const { name, value, color } = payload[0].payload;
  return (
    <div style={{
      background: color || '#23263a',
      color: getTextColor(color),
      borderRadius: 8,
      padding: '8px 12px',
      fontWeight: 500,
      fontSize: 13,
      boxShadow: '0 4px 24px 0 rgba(0,0,0,0.18)',
      border: `1.5px solid ${color || '#23263a'}`,
      minWidth: 100,
      textAlign: 'center',
    }}>
      <div><b>{name}</b></div>
      <div>Runs: {value}</div>
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
  const [chartView, setChartView] = useState<'all' | 'tank' | 'healer' | 'dps' | 'melee' | 'ranged'>('all');
  // Restore chart visibility state for all charts
  const [showLineChart, setShowLineChart] = useState(true);
  const [showBarChart, setShowBarChart] = useState(true);
  const [showPercentAreaChart, setShowPercentAreaChart] = useState(true);
  const [showHeatmapGrid, setShowHeatmapGrid] = useState(true);
  const [showTreemap, setShowTreemap] = useState(true);
  const [treemapWeek, setTreemapWeek] = useState<number | null>(null);

  // Helper to detect mobile
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

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

  // Add percentData computation
  const percentData = useMemo(() => {
    const data = charts[chartView].data;
    if (!data || data.length === 0) return [];
    return data.map((row: any) => {
      const total = Object.keys(row)
        .filter(k => k !== 'week')
        .reduce((sum, k) => sum + (row[k] || 0), 0);
      const percentRow: any = { week: row.week };
      (chartView === 'all' ? allSpecs : charts[chartView].topSpecs).forEach((specId: number) => {
        percentRow[specId] = total > 0 ? ((row[specId] || 0) / total) * 100 : 0;
      });
      return percentRow;
    });
  }, [charts, chartView, allSpecs]);

  // Reset treemapWeek when chartView or charts change (e.g., season or role changes)
  React.useEffect(() => {
    setTreemapWeek(null);
  }, [chartView, charts]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-6 text-center">Meta Evolution</h2>
      <div className="text-center text-md text-gray-400 mb-8">Sample data: Top 1000 dungeons per week.</div>
      {/* Filter bar and chart view selector on the same line */}

      <div className="flex w-full items-center gap-2 mb-2">
        <select
          className="px-4 py-2 rounded bg-gray-800 text-gray-100 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={selectedSeason || ''}
          onChange={e => setSelectedSeason(Number(e.target.value))}
          disabled={loading}
        >
          {seasons
            .filter(season => season.season_id >= 12)
            .map(s => (
            <option key={s.season_id} value={s.season_id}>{s.season_name}</option>
          ))}
        </select>
        <div className="flex-1 flex justify-center gap-2">
          {isMobile ? (
            <select
              className="px-4 py-2 rounded bg-gray-800 text-gray-100 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full max-w-xs"
              value={chartView}
              onChange={e => setChartView(e.target.value as any)}
            >
              <option value="all">All Specs</option>
              <option value="tank">Tank</option>
              <option value="healer">Healer</option>
              <option value="dps">DPS</option>
              <option value="melee">Melee DPS</option>
              <option value="ranged">Ranged DPS</option>
            </select>
          ) : ([
            { key: 'all', label: 'All Specs' },
            { key: 'tank', label: 'Tank' },
            { key: 'healer', label: 'Healer' },
            { key: 'dps', label: 'DPS' },
            { key: 'melee', label: 'Melee DPS' },
            { key: 'ranged', label: 'Ranged DPS' },
          ].map(({ key, label }) => (
            <button
              key={key}
              className={`px-6 py-1.5 rounded-full font-semibold transition border-2 ${chartView === key  ? 'bg-blue-600 text-white border-blue-600 shadow' : 'bg-gray-800 text-gray-200 border-gray-700 hover:bg-gray-700'}`}
              onClick={() => { setChartView(key as any); }}
            >
              {label}
            </button>
          )))}
        </div>
      </div>
      <div>

        {/* Line Chart */}
        <div className="meta-chart-scroll bg-gray-900 rounded-xl shadow p-6 mb-8 relative">
          <button
            className="absolute top-4 right-4 text-gray-400 hover:text-blue-400 transition"
            onClick={() => setShowLineChart(v => !v)}
            aria-label={showLineChart ? 'Hide chart' : 'Show chart'}
          >
            {showLineChart ? <FaChevronUp /> : <FaChevronDown />}
          </button>
          <h3 className="text-xl font-semibold mb-4">Spec Popularity: simple line chart</h3>
          {showLineChart && (
            loading ? (
              <div className="flex justify-center items-center h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={450}>
                <LineChart
                  data={charts[chartView].data}
                  margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                >
                  {typeof window === 'undefined' || window.innerWidth > 768 ? (
                    <>
                      <XAxis dataKey="week" stroke="#aaa" />
                      <YAxis stroke="#aaa" allowDecimals={false} />
                      <Tooltip content={<CustomTooltip />} />
                    </>
                  ) : null}
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
            )
          )}
        </div>

        {/* Stacked Bar Chart */}
        <div className="meta-chart-scroll bg-gray-900 rounded-xl shadow p-6 mb-8 relative">
          <button
            className="absolute top-4 right-4 text-gray-400 hover:text-blue-400 transition"
            onClick={() => setShowBarChart(v => !v)}
            aria-label={showBarChart ? 'Hide chart' : 'Show chart'}
          >
            {showBarChart ? <FaChevronUp /> : <FaChevronDown />}
          </button>
          <h3 className="text-xl font-semibold mb-4">Spec Popularity: stacked bars</h3>
          {showBarChart && (
            loading ? (
              <div className="flex justify-center items-center h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={450}>
                <BarChart
                  data={charts[chartView].data}
                  margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                >
                  {typeof window === 'undefined' || window.innerWidth > 768 ? (
                    <>
                      <XAxis dataKey="week" stroke="#aaa" />
                      <YAxis stroke="#aaa" allowDecimals={false} domain={[0, maxDataValue]} />
                      <Tooltip content={<CustomTooltip />} />
                    </>
                  ) : null}
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
            )
          )}
        </div>

        {/* Percent Area Chart */}
        <div className="meta-chart-scroll bg-gray-900 rounded-xl shadow p-6 mt-8 relative">
          <button
            className="absolute top-4 right-4 text-gray-400 hover:text-blue-400 transition"
            onClick={() => setShowPercentAreaChart(v => !v)}
            aria-label={showPercentAreaChart ? 'Hide chart' : 'Show chart'}
          >
            {showPercentAreaChart ? <FaChevronUp /> : <FaChevronDown />}
          </button>
          <h3 className="text-xl font-semibold mb-4">Spec Popularity: percent area chart</h3>
          {showPercentAreaChart && (
            loading ? (
              <div className="flex justify-center items-center h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={450}>
                <AreaChart
                  data={percentData}
                  margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                  stackOffset="expand"
                >
                  {typeof window === 'undefined' || window.innerWidth > 768 ? (
                    <>
                      <XAxis dataKey="week" stroke="#aaa" />
                      <YAxis stroke="#aaa" allowDecimals={false} domain={[0, 100]} tickFormatter={v => `${v.toFixed(0)}%`} />
                      <Tooltip content={<CustomTooltip percent={true} />} />
                    </>
                  ) : null}
                  {(chartView === 'all' ? allSpecs : charts[chartView].topSpecs).map((specId: number) => (
                    <Area
                      key={specId}
                      type="monotone"
                      dataKey={specId.toString()}
                      stackId="percent"
                      stroke={WOW_CLASS_COLORS[WOW_SPEC_TO_CLASS[specId]] || '#888'}
                      fill={WOW_CLASS_COLORS[WOW_SPEC_TO_CLASS[specId]] || '#888'}
                      name={WOW_SPECIALIZATIONS[specId] || specId.toString()}
                      isAnimationActive={true}
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            )
          )}
        </div>

        {/* Treemap Chart */}
        <div className="meta-chart-scroll bg-gray-900 rounded-xl shadow p-6 mt-8 relative">
          <button
            className="absolute top-4 right-4 text-gray-400 hover:text-blue-400 transition"
            onClick={() => setShowTreemap(v => !v)}
            aria-label={showTreemap ? 'Hide treemap' : 'Show treemap'}
          >
            {showTreemap ? <FaChevronUp /> : <FaChevronDown />}
          </button>
          <h3 className="text-xl font-semibold mb-4">Spec Popularity: treemap</h3>
          {showTreemap && (() => {
            // Use the selected week's data for the selected chartView
            const chartData = charts[chartView].data;
            if (!chartData || chartData.length === 0) return <div className="text-center text-gray-400">No data</div>;
            const weekCount = chartData.length;
            // Default to last week if not set
            const weekIdx = treemapWeek !== null ? treemapWeek : weekCount - 1;
            const weekData = chartData[weekIdx];
            const specs = (chartView === 'all' ? allSpecs : charts[chartView].topSpecs);
            const treemapData = specs.map(specId => ({
              name: WOW_SPECIALIZATIONS[specId] || specId,
              value: weekData[specId] || 0,
              color: WOW_CLASS_COLORS[WOW_SPEC_TO_CLASS[specId]] || '#888',
            })).filter(d => d.value > 0);
            if (treemapData.length === 0) return <div className="text-center text-gray-400">No data</div>;
            return (
              <>
                <div className="flex items-center gap-4 mb-2 mt-2">
                  <span className="text-xs text-gray-400">Week</span>
                  <input
                    type="range"
                    min={0}
                    max={weekCount - 1}
                    value={weekIdx}
                    onChange={e => setTreemapWeek(Number(e.target.value))}
                    style={{ flex: 1, accentColor: '#2563eb' }}
                  />
                  <span className="text-xs text-gray-400">{weekIdx + 1} / {weekCount}</span>
                </div>
                <ResponsiveContainer width="100%" height={400}>
                  <Treemap
                    data={treemapData}
                    dataKey="value"
                    aspectRatio={4 / 3}
                    content={<CustomContentTreemap />}
                    animationDuration={200}
                    animationEasing='ease-in-out'
                  >
                    <Tooltip content={<TreemapTooltip />} />
                  </Treemap>
                </ResponsiveContainer>
              </>
            );
          })()}
        </div>

        {/* Heatmap view */}
        <div className="bg-gray-900 rounded-xl shadow p-6 mt-8 relative">
          <button
            className="absolute top-4 right-4 text-gray-400 hover:text-blue-400 transition"
            onClick={() => setShowHeatmapGrid(v => !v)}
            aria-label={showHeatmapGrid ? 'Hide heatmap' : 'Show heatmap'}
          >
            {showHeatmapGrid ? <FaChevronUp /> : <FaChevronDown />}
          </button>
          <h3 className="text-xl font-semibold mb-4">Spec Popularity: heatmap</h3>
          {showHeatmapGrid && (
            <HeatmapGrid data={charts[chartView].data} specs={chartView === 'all' ? allSpecs : charts[chartView].topSpecs} />
          )}
        </div>

      </div>
    </div>
  );
};

// HeatmapGrid component
const HeatmapGrid: React.FC<{ data: any[]; specs: number[] }> = ({ data, specs }) => {
  // Build a matrix: rows = specs, cols = weeks
  const weeks = data.map((row: any) => row.week);
  // Find max value for each week (column) for color scaling
  const weekMaxes = data.map((row: any) => {
    let max = 0;
    specs.forEach(specId => {
      max = Math.max(max, row[specId] || 0);
    });
    return max;
  });
  // Determine if first period has 0 runs for all specs
  const firstPeriodZero = data.length > 0 && specs.every(specId => (data[0]?.[specId] || 0) === 0);
  // Build week labels accordingly
  const weekLabels = weeks.map((w, idx) => firstPeriodZero ? `W${idx}` : `W${idx + 1}`);
  // Tooltip state
  const [tooltip, setTooltip] = React.useState<{ x: number; y: number; specId: number; week: number; value: number } | null>(null);
  // Grid template: 1 column for spec name, then one for each week
  const gridTemplate = `minmax(100px, 1fr) repeat(${weeks.length}, 40px)`;
  return (
    <div className="relative">
      {/* Header row */}
      <div
        className="meta-heatmap-header grid text-xs text-gray-400 mb-1"
        style={{ gridTemplateColumns: gridTemplate }}
      >
        <div />
        {weekLabels.map((label, idx) => (
          <div key={label} className="text-center">{label}</div>
        ))}
      </div>
      {/* Data rows */}
      {specs.map(specId => (
        <div
          key={specId}
          className="meta-heatmap-row grid items-center mb-0.5"
          style={{ gridTemplateColumns: gridTemplate }}
        >
          <div className="meta-heatmap-spec truncate text-xs pr-2" style={{ color: WOW_CLASS_COLORS[WOW_SPEC_TO_CLASS[specId]] || '#aaa' }}>{WOW_SPECIALIZATIONS[specId] || specId}</div>
          {weeks.map((week, colIdx) => {
            const value = data[colIdx]?.[specId] || 0;
            // Color intensity: interpolate from gray to class color
            const color = WOW_CLASS_COLORS[WOW_SPEC_TO_CLASS[specId]] || '#888';
            const bg = value === 0 ? '#23263a' : color;
            const weekMax = weekMaxes[colIdx] || 1;
            const opacity = value === 0 ? 0.05 : Math.max(0.1, value / weekMax);
            return (
              <div
                key={week}
                className="h-6 rounded cursor-pointer relative"
                style={{ background: bg, opacity, border: value > 0 ? '1px solid #222' : '1px solid #23263a', marginLeft: 2, marginRight: 2 }}
                onMouseEnter={e => setTooltip({ x: e.currentTarget.getBoundingClientRect().x, y: e.currentTarget.getBoundingClientRect().y, specId, week, value })}
                onMouseLeave={() => setTooltip(null)}
              />
            );
          })}
        </div>
      ))}
      {tooltip && (
        <div
          className="meta-heatmap-tooltip fixed z-50 px-3 py-2 rounded bg-gray-800 text-xs text-white shadow-lg pointer-events-none"
          style={{ left: tooltip.x + 24, top: tooltip.y - 8 }}
        >
          <div><b>{WOW_SPECIALIZATIONS[tooltip.specId] || tooltip.specId}</b></div>
          <div>Week {tooltip.week}</div>
          <div>Runs: <b>{tooltip.value}</b></div>
        </div>
      )}
    </div>
  );
}; 