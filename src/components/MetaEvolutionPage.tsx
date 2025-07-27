import React, { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, Treemap, Tooltip, ResponsiveContainer, XAxis, YAxis, Legend } from 'recharts';
import { fetchSpecEvolution, fetchSeasons } from '../api';
import { WOW_SPECIALIZATIONS, WOW_CLASS_COLORS, WOW_SPEC_TO_CLASS, WOW_MELEE_SPECS, WOW_RANGED_SPECS } from './wow-constants';
import type { TooltipProps } from 'recharts';
import { WOW_SPEC_ROLES } from './wow-constants';
import './styles/MetaEvolutionPage.css';

// Custom tooltip for better readability
const CustomTooltip = (props: TooltipProps<number, string> & { percent?: boolean }) => {
  const { active, payload, label, percent } = props as any;
  if (!active || !payload || payload.length === 0) return null;

  // Sort by value (descending), then by class, then spec name
  const classOrder = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
  const sortedPayload = [...payload]
    .filter((entry: any) => entry.value !== 0)
    .sort((a: any, b: any) => {
      // First sort by value (descending)
      if (b.value !== a.value) return b.value - a.value;

      // Then by class
      const aClass = WOW_SPEC_TO_CLASS[Number(a.dataKey)] || 99;
      const bClass = WOW_SPEC_TO_CLASS[Number(b.dataKey)] || 99;
      if (aClass !== bClass) return classOrder.indexOf(aClass) - classOrder.indexOf(bClass);

      // Finally by spec name
      const aSpec = WOW_SPECIALIZATIONS[Number(a.dataKey)] || '';
      const bSpec = WOW_SPECIALIZATIONS[Number(b.dataKey)] || '';
      return aSpec.localeCompare(bSpec);
    });

  // Calculate total for percentage display
  const total = sortedPayload.reduce((sum, entry) => sum + entry.value, 0);

  // Split into three columns for better layout
  const colSize = Math.ceil(sortedPayload.length / 3);
  const col1 = sortedPayload.slice(0, colSize);
  const col2 = sortedPayload.slice(colSize, colSize * 2);
  const col3 = sortedPayload.slice(colSize * 2);
  const columns = [col1, col2, col3];

  return (
    <div className="meta-tooltip">
      <div className="meta-tooltip__header">
        <div className="meta-tooltip__title">Week {label}</div>
        {percent && (
          <div className="meta-tooltip__total">Total: {total.toFixed(1)}%</div>
        )}
      </div>
      <div className="meta-tooltip__columns">
        {columns.map((col, i) => (
          <div key={i} className="meta-tooltip__column">
            {col.map((entry: any, idx: number) => {
              const specId = Number(entry.dataKey);
              const specName = WOW_SPECIALIZATIONS[specId] || `Spec ${specId}`;
              const classId = WOW_SPEC_TO_CLASS[specId];
              const color = WOW_CLASS_COLORS[classId] || '#888';
              const value = entry.value;

              return (
                <div key={specId} className="meta-tooltip__row">
                  <div className="meta-tooltip__spec-info">
                    <div className="meta-tooltip__spec-name" style={{ color }}>
                      {specName}
                    </div>
                  </div>
                  <div className="meta-tooltip__value">
                    <div className="meta-tooltip__primary-value">
                      {percent ? `${value.toFixed(1)}%` : value}
                    </div>
                  </div>
                </div>
              );
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
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
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
    // Find the first week with any data for the current chartView
    const chartData = charts[chartView].data;
    let firstWithData: number | null = null;
    if (chartData && chartData.length > 0) {
      for (let i = 0; i < chartData.length; ++i) {
        const week = chartData[i];
        const specs = chartView === 'all' ? allSpecs : charts[chartView].topSpecs;
        if (specs.some((specId: number) => week[specId] && week[specId] > 0)) {
          firstWithData = i;
          break;
        }
      }
    }
    setTreemapWeek(firstWithData);
  }, [chartView, charts]);

  // Before rendering the BarChart, calculate the max value for the Y axis:
  const barChartMax = Math.max(
    ...charts[chartView].data.flatMap(row =>
      charts[chartView].topSpecs.map(specId => row[specId] || 0)
    )
  );

  return (
    <div className="meta-evolution-page max-w-7xl mx-auto px-4">
      {/* Controls Section */}
      <div className="controls-section">
        <div className="controls-row">
          <div className="season-filter">
            <label>Season:</label>
            <select
              value={selectedSeason || ''}
              onChange={(e) => setSelectedSeason(Number(e.target.value))}
              disabled={loading}
            >
              {seasons
                .filter(season => season.season_id >= 10)
                .map(s => (
                  <option key={s.season_id} value={s.season_id}>{s.season_name}</option>
                ))}
            </select>
          </div>
          <div className="button-group chart-view-selector">
            <button className={`chart-view-button ${chartView === 'all' ? 'active' : ''}`} onClick={() => setChartView('all')}>All</button>
            <button className={`chart-view-button ${chartView === 'tank' ? 'active' : ''}`} onClick={() => setChartView('tank')}>Tank</button>
            <button className={`chart-view-button ${chartView === 'healer' ? 'active' : ''}`} onClick={() => setChartView('healer')}>Healer</button>
            <button className={`chart-view-button ${chartView === 'dps' ? 'active' : ''}`} onClick={() => setChartView('dps')}>DPS</button>
            <button className={`chart-view-button ${chartView === 'melee' ? 'active' : ''}`} onClick={() => setChartView('melee')}>Melee</button>
            <button className={`chart-view-button ${chartView === 'ranged' ? 'active' : ''}`} onClick={() => setChartView('ranged')}>Ranged</button>
          </div>
        </div>
        <div className="chart-controls-row">
          <div className="button-group chart-type-toggle">
            <button className={`chart-view-button ${showLineChart ? 'active' : ''}`} onClick={() => setShowLineChart(!showLineChart)}>{showLineChart ? 'Hide' : 'Show'} Line Chart</button>
            <button className={`chart-view-button ${showBarChart ? 'active' : ''}`} onClick={() => setShowBarChart(!showBarChart)}>{showBarChart ? 'Hide' : 'Show'} Bar Chart</button>
            <button className={`chart-view-button ${showPercentAreaChart ? 'active' : ''}`} onClick={() => setShowPercentAreaChart(!showPercentAreaChart)}>{showPercentAreaChart ? 'Hide' : 'Show'} Area Chart</button>
            <button className={`chart-view-button ${showHeatmapGrid ? 'active' : ''}`} onClick={() => setShowHeatmapGrid(!showHeatmapGrid)}>{showHeatmapGrid ? 'Hide' : 'Show'} Heatmap</button>
            <button className={`chart-view-button ${showTreemap ? 'active' : ''}`} onClick={() => setShowTreemap(!showTreemap)}>{showTreemap ? 'Hide' : 'Show'} Treemap</button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
      ) : (
        <>
          {/* Line Chart */}
          {showLineChart && (
            <div className="chart-container">
              <div className="chart-header">
                <h3 className="chart-title">Spec Popularity Over Time</h3>
                <button className="chart-toggle" onClick={() => setShowLineChart(false)}>
                  Hide
                </button>
              </div>
              <div className="meta-chart-scroll">
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={charts[chartView].data}>
                    <XAxis dataKey="week" tick={{ fontSize: '0.75rem' }} />
                    <YAxis tick={{ fontSize: '0.75rem' }} />
                    <Tooltip content={<CustomTooltip />} wrapperStyle={{ marginTop: '-40px' }} />
                    {charts[chartView].topSpecs.map(specId => (
                      <Line
                        key={specId}
                        type="monotone"
                        dataKey={specId}
                        stroke={WOW_CLASS_COLORS[WOW_SPEC_TO_CLASS[specId]] || '#888'}
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Stacked Bar Chart */}
          {showBarChart && (
            <div className="chart-container">
              <div className="chart-header">
                <h3 className="chart-title">Spec Distribution by Week</h3>
                <button className="chart-toggle" onClick={() => setShowBarChart(false)}>
                  Hide
                </button>
              </div>
              <div className="meta-chart-scroll">
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={charts[chartView].data}>
                    <XAxis dataKey="week" tick={{ fontSize: '0.75rem' }} />
                    <YAxis tick={{ fontSize: '0.75rem' }} domain={[0, barChartMax]} />
                    <Tooltip content={<CustomTooltip />} wrapperStyle={{ marginTop: '-40px' }} />
                    {charts[chartView].topSpecs.map(specId => (
                      <Bar
                        key={specId}
                        dataKey={specId}
                        stackId="a"
                        fill={WOW_CLASS_COLORS[WOW_SPEC_TO_CLASS[specId]] || '#888'}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Percent Area Chart */}
          {showPercentAreaChart && (
            <div className="chart-container">
              <div className="chart-header">
                <h3 className="chart-title">Spec Popularity Percentage</h3>
                <button className="chart-toggle" onClick={() => setShowPercentAreaChart(false)}>
                  Hide
                </button>
              </div>
              <div className="meta-chart-scroll">
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={percentData}>
                    <XAxis dataKey="week" tick={{ fontSize: '0.75rem' }} />
                    <YAxis tick={{ fontSize: '0.75rem' }} domain={[0, 100]} tickFormatter={v => `${Math.round(v * 100) / 100}%`} ticks={[25, 50, 75, 100]} />
                    <Tooltip content={<CustomTooltip percent />} wrapperStyle={{ marginTop: '-40px' }} />
                    {charts[chartView].topSpecs.map(specId => (
                      <Area
                        key={specId}
                        type="monotone"
                        dataKey={specId}
                        stackId="1"
                        stroke={WOW_CLASS_COLORS[WOW_SPEC_TO_CLASS[specId]] || '#888'}
                        fill={WOW_CLASS_COLORS[WOW_SPEC_TO_CLASS[specId]] || '#888'}
                      />
                    ))}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Heatmap */}
          {showHeatmapGrid && (
            <div className="chart-container">
              <div className="chart-header">
                <h3 className="chart-title">Spec Popularity Heatmap</h3>
                <button className="chart-toggle" onClick={() => setShowHeatmapGrid(false)}>
                  Hide
                </button>
              </div>
              <HeatmapGrid data={charts[chartView].data} specs={charts[chartView].topSpecs} />
            </div>
          )}

          {/* Treemap */}
          {showTreemap && (
            <div className="chart-container">
              <div className="chart-header">
                <h3 className="chart-title">Spec Popularity Treemap</h3>
                <button className="chart-toggle" onClick={() => setShowTreemap(false)}>
                  Hide
                </button>
              </div>
              {(() => {
                const chartData = charts[chartView].data;
                if (!chartData || chartData.length === 0) return <div className="text-center text-gray-400">No data</div>;
                const weekCount = chartData.length;
                const weekIdx = treemapWeek !== null ? treemapWeek : weekCount - 1;
                const weekData = chartData[weekIdx];
                const specs = (chartView === 'all' ? allSpecs : charts[chartView].topSpecs);
                const treemapData = specs.map(specId => ({
                  name: WOW_SPECIALIZATIONS[specId] || specId,
                  value: weekData[specId] || 0,
                  color: WOW_CLASS_COLORS[WOW_SPEC_TO_CLASS[specId]] || '#888',
                })).filter(d => d.value > 0);
                return (
                  <>
                    <div className="treemap-controls">
                      <span className="treemap-label">Week</span>
                      <input
                        type="range"
                        className="treemap-slider"
                        min={0}
                        max={weekCount - 1}
                        value={treemapWeek !== null ? treemapWeek : 0}
                        onChange={e => setTreemapWeek(Number(e.target.value))}
                      />
                      <span className="treemap-info">{treemapWeek !== null ? treemapWeek + 1 : 1} / {weekCount}</span>
                    </div>
                    {treemapData.length === 0 ? (
                      <div className="text-center text-gray-400">No data</div>
                    ) : (
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
                    )}
                  </>
                );
              })()}
            </div>
          )}
        </>
      )}
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
                onMouseEnter={e => {
                  const container = e.currentTarget.parentElement?.parentElement;
                  if (container) {
                    const containerRect = container.getBoundingClientRect();
                    const cellRect = e.currentTarget.getBoundingClientRect();
                    setTooltip({
                      x: cellRect.left - containerRect.left,
                      y: cellRect.top - containerRect.top + 60,
                      specId,
                      week,
                      value
                    });
                  }
                }}
                onMouseLeave={() => setTooltip(null)}
              />
            );
          })}
        </div>
      ))}
      {tooltip && (
        <div
          className="meta-heatmap-tooltip absolute z-50 px-3 py-2 rounded bg-gray-800 text-xs text-white shadow-lg pointer-events-none"
          style={{ left: tooltip.x + 32, top: tooltip.y - 8 }}
        >
          <div><b>{WOW_SPECIALIZATIONS[tooltip.specId] || tooltip.specId}</b></div>
          <div>Week {tooltip.week}</div>
          <div>Runs: <b>{tooltip.value}</b></div>
        </div>
      )}
    </div>
  );
}; 