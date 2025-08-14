import React, { useMemo, useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';

export type ChartItem = { name: string; value: number; color?: string };

type CutoffTooltipProps = {
  active?: boolean;
  label?: string | number;
  payload?: any[];
  total?: number; // legacy
  totals?: { inner: number; outer: number };
  activeRing?: 'inner' | 'outer' | null;
};

const CutoffTooltip: React.FC<CutoffTooltipProps> = ({ active, label, payload, total = 0, totals, activeRing }) => {
  if (!active || !payload || payload.length === 0) return null as any;
  const items = Array.isArray(payload) ? payload : [];
  // Choose target based on the ring being hovered to avoid cross-ring mixups
  const innerItem = items.find(it => it && it.payload && !(it.payload as any).parent);
  const outerItem = items.find(it => it && it.payload && (it.payload as any).parent);
  const target = activeRing === 'inner' ? (innerItem || items[0])
    : activeRing === 'outer' ? (outerItem || items[0])
    : (outerItem || items[0]);
  const p = target?.payload || {};
  const value = Number(target?.value ?? 0);
  const color = p.color || p.fill || target?.color || '#60a5fa';
  const effectiveTotal = totals ? ((activeRing === 'outer') ? totals.outer : totals.inner) : total;
  const pct = effectiveTotal > 0 ? (value / effectiveTotal) * 100 : 0;
  const baseName = target?.name ?? p.name ?? (typeof label !== 'undefined' ? String(label) : '');
  const title = p.parent ? `${baseName} – ${p.parent}` : baseName;
  return (
    <div className="cutoff-tooltip">
      <div className="cutoff-tooltip__header">
        <span className="cutoff-tooltip__dot" style={{ background: color }} />
        <span className="cutoff-tooltip__title">{title}</span>
      </div>
      <div className="cutoff-tooltip__values">
        <span className="cutoff-tooltip__value">{value.toLocaleString()}</span>
        <span className="cutoff-tooltip__percentage">{pct.toFixed(1)}%</span>
      </div>
    </div>
  );
};

type ChartMetrics = { cutoffScore?: number; characters?: number; cutoffColor?: string };

export const SimpleBarChart: React.FC<{ data: ChartItem[]; metrics?: ChartMetrics }> = ({ data, metrics }) => {
  const total = data.reduce((sum, d) => sum + (d.value || 0), 0);
  const showTicks = data.length <= 40; // show labels only if not too many specs
  const bottomMargin = showTicks ? 100 : 8;
  const formatSpecName = (name: string | number) => {
    if (typeof name !== 'string') return String(name);
    const [spec] = name.split(' – ');
    return spec || name;
  };
  return (
    <div style={{ width: '100%', height: 800, position: 'relative' }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: bottomMargin }}>
          {showTicks ? (
            <XAxis
              dataKey="name"
              tick={{ fill: '#cbd5e1', fontSize: 12 }}
              tickFormatter={formatSpecName}
              interval={0}
              angle={-90}
              textAnchor="end"
              height={88}
            />
          ) : (
            <XAxis dataKey="name" tick={false} />
          )}
          <YAxis tick={{ fill: '#cbd5e1', fontSize: 12 }} />
          <Tooltip wrapperStyle={{ outline: 'none' }} content={(props) => <CutoffTooltip {...props} total={total} />} />
          <Bar dataKey="value">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color || '#60a5fa'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      {metrics && (
        <div className="cp-chart-metrics-overlay" style={{ ['--cutoff-color' as any]: metrics.cutoffColor || '#f77149' }}>
          {typeof metrics.cutoffScore !== 'undefined' && (
            <div className="cp-chart-metric cutoff"><span className="label">Cutoff</span><span className="value">{metrics.cutoffScore}</span></div>
          )}
          {typeof metrics.characters !== 'undefined' && (
            <div className="cp-chart-metric"><span className="label">Characters</span><span className="value">{metrics.characters}</span></div>
          )}
        </div>
      )}
    </div>
  );
};

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = (props: any) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  const pct = Math.round(percent * 100);
  return (
    <text x={x} y={y} fill="#fff" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={12}>
      {pct >= 5 ? `${pct}%` : ''}
    </text>
  );
};

export const TwoLevelSpecPieChart: React.FC<{ classData: ChartItem[]; specData: (ChartItem & { parent: string })[]; metrics?: ChartMetrics }> = ({ classData, specData, metrics }) => {

  // Build quick lookups
  const classColorByName = useMemo(() => {
    const map = new Map<string, string>();
    classData.forEach(c => map.set(c.name, c.color || '#60a5fa'));
    return map;
  }, [classData]);

  const outerByParent = useMemo(() => {
    const map = new Map<string, (ChartItem & { parent: string })[]>();
    specData.forEach(s => {
      const list = map.get(s.parent) || [];
      list.push(s);
      map.set(s.parent, list);
    });
    return map;
  }, [specData]);

  const hexToRgb = (hex: string) => {
    const clean = hex.replace('#', '');
    const num = parseInt(clean, 16);
    return { r: (num >> 16) & 0xff, g: (num >> 8) & 0xff, b: num & 0xff };
  };
  const rgbToHex = (r: number, g: number, b: number) =>
    `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  const blend = (hex: string, targetHex: string, factor: number) => {
    const a = hexToRgb(hex);
    const b = hexToRgb(targetHex);
    const mix = (c1: number, c2: number) => Math.round(c1 + (c2 - c1) * factor);
    return rgbToHex(mix(a.r, b.r), mix(a.g, b.g), mix(a.b, b.b));
  };
  const isVeryLight = (hex: string) => {
    const { r, g, b } = hexToRgb(hex);
    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return luminance > 235; // close to white
  };
  const shadeColor = (hex: string, factor: number) => {
    // For very light class colors (e.g., Priest white), shade towards slate-400 for separation
    if (isVeryLight(hex)) {
      return blend(hex, '#94a3b8', factor); // slate-400
    }
    // Otherwise lighten towards white
    return blend(hex, '#ffffff', factor);
  };

  // Assign shades per spec based on index within its parent
  const shadedOuterData = useMemo(() => {
    // Build in the SAME class order as inner pie, to align angles and flag first slice per class
    const result: (ChartItem & { parent: string; isFirst?: boolean })[] = [];
    classData.forEach(cls => {
      const parent = cls.name;
      const list = outerByParent.get(parent) || [];
      const base = classColorByName.get(parent) || '#60a5fa';
      const sorted = [...list].sort((a, b) => b.value - a.value);
      const n = sorted.length || 1;
      sorted.forEach((s, i) => {
        const shade = shadeColor(base, Math.min(0.65, 0.15 + (i / Math.max(3, n)) * 0.5));
        result.push({ ...s, color: shade, isFirst: i === 0 });
      });
    });
    return result;
  }, [classData, outerByParent, classColorByName]);

  // Dynamic Top-N labels for outer ring with minimum percent threshold to avoid clutter
  const topSpecNames = useMemo(() => {
    const count = specData.length;
    const dynamicTopN = count;// count <= 24 ? 12 : count <= 36 ? 8 : 6;
    return new Set([...specData]
      .sort((a,b) => b.value - a.value)
      .slice(0, dynamicTopN)
      .map(s => s.name));
  }, [specData]);
  const MIN_LABEL_PERCENT = 0.025; // 3.5%
  // Fast lookup for class percentage for legend label substitution
  const classPctByName = useMemo(() => {
    const map = new Map<string, number>();
    const total = classData.reduce((s, d) => s + (d.value || 0), 0);
    classData.forEach(c => {
      const pct = total > 0 ? Math.round((c.value / total) * 100) : 0;
      map.set(c.name, pct);
    });
    return map;
  }, [classData]);

  const manySpecs = specData.length > 40;
  const outerLabel = (props: any) => {
    const { name, cx, cy, midAngle, outerRadius, percent, index, payload } = props;
    const RAD = Math.PI / 180;
    const r = outerRadius + 16;
    const x = cx + r * Math.cos(-midAngle * RAD);
    const y = cy + r * Math.sin(-midAngle * RAD);
    const isRight = x >= cx;
    if (manySpecs) {
      // Only render one label per class: on first spec slice for that class
      if (!payload?.parent || !payload?.isFirst) return null;
      const pct = classPctByName.get(payload.parent) ?? 0;
      return (
        <text x={x} y={y} fill="#cbd5e1" fontSize={12} textAnchor={isRight ? 'start' : 'end'} dominantBaseline="central">
          {payload.parent} ({pct}%)
        </text>
      );
    }
    if (!topSpecNames.has(name) || (typeof percent === 'number' && percent < MIN_LABEL_PERCENT)) return null;
    return (
      <text x={x} y={y} fill="#cbd5e1" fontSize={12} textAnchor={isRight ? 'start' : 'end'} dominantBaseline="central">
        {name} ({Math.round(percent * 100)}%)
      </text>
    );
  };

  const totalInner = classData.reduce((s, d) => s + (d.value || 0), 0);
  const totalOuter = specData.reduce((s, d) => s + (d.value || 0), 0);

  // Track which ring is currently hovered so tooltip can disambiguate
  const [activeRing, setActiveRing] = useState<'inner' | 'outer' | null>(null);

  return (
    <div style={{ width: '100%', height: 800, position: 'relative' }}>
      <ResponsiveContainer>
        <PieChart>
          <Tooltip
            wrapperStyle={{ outline: 'none' }}
            content={(props) => (
              <CutoffTooltip
                {...(props as any)}
                totals={{ inner: totalInner, outer: totalOuter }}
                activeRing={activeRing}
              />
            )}
          />
          {/* Inner: classes */}
          <Pie
            data={classData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={100}
            outerRadius={180}
            labelLine={false}
            isAnimationActive={false}
            startAngle={90}
            endAngle={-270}
            paddingAngle={0}
            onMouseEnter={() => setActiveRing('inner')}
            onMouseLeave={() => setActiveRing(null)}
          >
            {classData.map((entry, index) => (
              <Cell 
                key={`inner-${index}`} 
                fill={entry.color || '#60a5fa'} 
                opacity={1} 
                stroke={isVeryLight(entry.color || '#ffffff') ? 'rgba(148,163,184,0.6)' : 'rgba(0,0,0,0.15)'}
                strokeWidth={1}
              />
            ))}
          </Pie>
          {/* Outer: specs (shaded by class color) */}
          <Pie
            data={shadedOuterData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={200}
            outerRadius={300}
            labelLine={false}
            label={outerLabel}
            isAnimationActive={false}
            startAngle={90}
            endAngle={-270}
            paddingAngle={0}
            onMouseEnter={() => setActiveRing('outer')}
            onMouseLeave={() => setActiveRing(null)}
          >
            {shadedOuterData.map((entry, index) => (
              <Cell 
                key={`outer-${index}`} 
                fill={entry.color || '#60a5fa'} 
                opacity={1} 
                stroke={isVeryLight(entry.color || '#ffffff') ? 'rgba(148,163,184,0.6)' : 'rgba(0,0,0,0.12)'}
                strokeWidth={1}
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      {metrics && (
        <div className="cp-chart-metrics-overlay" style={{ ['--cutoff-color' as any]: metrics.cutoffColor || '#f77149' }}>
          {typeof metrics.cutoffScore !== 'undefined' && (
            <div className="cp-chart-metric cutoff"><span className="label">Cutoff</span><span className="value">{metrics.cutoffScore}</span></div>
          )}
          {typeof metrics.characters !== 'undefined' && (
            <div className="cp-chart-metric"><span className="label">Characters</span><span className="value">{metrics.characters}</span></div>
          )}
        </div>
      )}
    </div>
  );
};


