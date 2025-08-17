import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import SEO from './SEO';

// --- Inline icons (no external deps) ---
const baseIconProps = { xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill: 'none' } as const;

const IconCheck = () => (
  <svg {...baseIconProps} className="h-4 w-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 13l4 4L19 7" />
  </svg>
);

const IconBolt = () => (
  <svg {...baseIconProps} className="h-4 w-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 2L3 14h8l-2 8 12-14h-8l2-6z" />
  </svg>
);

const IconDatabase = () => (
  <svg {...baseIconProps} className="h-4 w-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="12" cy="5" rx="7" ry="3" />
    <path d="M5 5v6c0 1.7 3.1 3 7 3s7-1.3 7-3V5" />
    <path d="M5 11v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6" />
  </svg>
);

const IconChart = () => (
  <svg {...baseIconProps} className="h-5 w-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 20h16" />
    <rect x="6" y="10" width="3" height="6" />
    <rect x="11" y="7" width="3" height="9" />
    <rect x="16" y="12" width="3" height="4" />
  </svg>
);

const IconPulse = () => (
  <svg {...baseIconProps} className="h-5 w-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12h4l2-5 4 10 2-5h6" />
  </svg>
);

const IconPuzzle = () => (
  <svg {...baseIconProps} className="h-5 w-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 6h3a2 2 0 012 2v3h-2a2 2 0 100 4h2v3a2 2 0 01-2 2h-3v-2a2 2 0 10-4 0v2H6a2 2 0 01-2-2v-3h2a2 2 0 100-4H4V8a2 2 0 012-2h3V4a2 2 0 114 0v2z" />
  </svg>
);

const IconTrend = () => (
  <svg {...baseIconProps} className="h-5 w-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 17l6-6 4 4 8-8" />
    <path d="M21 9V3h-6" />
  </svg>
);

const IconStar = () => (
  <svg {...baseIconProps} className="h-5 w-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2l2.9 6 6.6.5-5 4.2 1.6 6.3L12 16l-6.1 3 1.6-6.3-5-4.2 6.6-.5L12 2z" />
  </svg>
);

const IconBalance = () => (
  <svg {...baseIconProps} className="h-5 w-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3v2" />
    <path d="M3 7h18" />
    <path d="M6 7l3 6a3 3 0 11-6 0l3-6z" />
    <path d="M18 7l3 6a3 3 0 11-6 0l3-6z" />
    <path d="M12 9v12" />
  </svg>
);

const IconTrophy = () => (
  <svg {...baseIconProps} className="h-5 w-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 21h8" />
    <path d="M12 17a5 5 0 005-5V4H7v8a5 5 0 005 5z" />
    <path d="M4 6h3v2a4 4 0 01-4-4h1a1 1 0 001 1zM20 6h-3v2a4 4 0 004-4h-1a1 1 0 01-1 1z" />
  </svg>
);

// Small info pill component
const InfoPill: React.FC<{ icon: React.ReactNode; label: string; desc: string }> = ({ icon, label, desc }) => (
  <div className="flex items-center gap-3 rounded-xl border border-gray-700 bg-gray-900/60 p-3">
    <div className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-gray-700/80 text-gray-200 border border-gray-600/60">
      {icon}
    </div>
    <div className="leading-tight">
      <div className="text-gray-200 text-sm font-medium">{label}</div>
      <div className="text-gray-400 text-xs">{desc}</div>
    </div>
  </div>
);

const TWW_SEASON = 'The War Within Season 3';

const Season3LandingPage: React.FC = () => {
  const title = `WoW Meta ${TWW_SEASON} (TWW S3) — Specs, Tier List, Composition`;
  const description = `Live WoW Mythic+ meta for ${TWW_SEASON}: best specs, healer/tank/DPS tier list, group composition stats, cutoff scores, and weekly trends.`;
  const keywords = 'WoW meta season 3, WoW meta TWW S3, The War Within S3 meta, WoW Mythic+ tier list season 3, best specs season 3, M+ meta season 3';

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `WoW Meta ${TWW_SEASON}`,
    description,
    url: 'https://whatthemeta.io/wow-meta-season-3',
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://whatthemeta.io/' },
        { '@type': 'ListItem', position: 2, name: `WoW Meta ${TWW_SEASON}`, item: 'https://whatthemeta.io/wow-meta-season-3' }
      ]
    }
  };

  useEffect(() => {
    // Could fetch/augment content if needed
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <SEO
        title={title}
        description={description}
        keywords={keywords}
        canonicalUrl="/wow-meta-season-3"
        image="/og-image.jpg"
        structuredData={structuredData}
      />

      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl border border-blue-500/20 bg-gradient-to-br from-gray-900 to-gray-950 p-6 sm:p-10 shadow-xl">
        {/* Gradient blobs */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(59,130,246,0.25),transparent_40%),radial-gradient(circle_at_80%_100%,rgba(99,102,241,0.15),transparent_40%)]" />
        {/* Subtle grid */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.08]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 text-blue-300 border border-blue-400/30 px-2.5 py-1 text-xs font-medium">Mythic+ Meta</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-400/30 px-2.5 py-1 text-xs font-medium">{TWW_SEASON}</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-gray-700/60 text-gray-200 border border-gray-600/60 px-2.5 py-1 text-xs font-medium">Updated daily</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-gray-100 drop-shadow mb-3">
            WoW Meta — {TWW_SEASON} (TWW S3)
          </h1>
          <p className="text-gray-300/95 max-w-2xl text-sm sm:text-base mb-6">
            Live analysis of spec popularity and performance from real high-key runs. Explore tier signals, comps that time keys, and weekly shifts.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/meta-evolution" className="inline-flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 text-white px-4 py-2.5 text-sm font-semibold shadow transition">
              <span>View Meta Evolution</span>
              <span>→</span>
            </Link>
            <Link to="/group-composition" className="inline-flex items-center gap-2 rounded-lg border border-gray-600/60 bg-gray-800/70 hover:border-blue-400/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 text-gray-100 px-4 py-2.5 text-sm font-semibold transition">
              <span>Successful Compositions</span>
            </Link>
            <Link to="/cutoff" className="inline-flex items-center gap-2 rounded-lg border border-gray-600/60 bg-gray-800/70 hover:border-blue-400/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 text-gray-100 px-4 py-2.5 text-sm font-semibold transition">
              <span>Cutoff & Scores</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Info strip */}
      <section className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <InfoPill icon={<IconCheck />} label="Data-driven" desc="Real runs, no opinions" />
        <InfoPill icon={<IconBolt />} label="Fresh" desc="Daily updates" />
        <InfoPill icon={<IconDatabase />} label="Open" desc="Methodology documented" />
      </section>

      {/* Quick links grid */}
      <section className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/race-bars" className="group rounded-xl border border-gray-700 bg-gray-800/70 hover:border-blue-400/40 p-5 transition-colors hover:shadow-md hover:-translate-y-0.5 transform">
          <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/15 text-blue-300 border border-blue-400/20">
            <IconChart />
          </div>
          <h3 className="text-lg font-semibold text-gray-100">Spec Popularity</h3>
          <p className="text-gray-400 text-sm">See which specs dominate TWW S3.</p>
        </Link>
        <Link to="/meta-health" className="group rounded-xl border border-gray-700 bg-gray-800/70 hover:border-blue-400/40 p-5 transition-colors hover:shadow-md hover:-translate-y-0.5 transform">
          <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-400/20">
            <IconPulse />
          </div>
          <h3 className="text-lg font-semibold text-gray-100">Meta Health</h3>
          <p className="text-gray-400 text-sm">Balance signals and role distribution.</p>
        </Link>
        <Link to="/group-composition" className="group rounded-xl border border-gray-700 bg-gray-800/70 hover:border-blue-400/40 p-5 transition-colors hover:shadow-md hover:-translate-y-0.5 transform">
          <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/15 text-purple-300 border border-purple-400/20">
            <IconPuzzle />
          </div>
          <h3 className="text-lg font-semibold text-gray-100">Best Comps</h3>
          <p className="text-gray-400 text-sm">What groups time the highest keys.</p>
        </Link>
        <Link to="/meta-evolution" className="group rounded-xl border border-gray-700 bg-gray-800/70 hover:border-blue-400/40 p-5 transition-colors hover:shadow-md hover:-translate-y-0.5 transform">
          <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-300 border border-indigo-400/20">
            <IconTrend />
          </div>
          <h3 className="text-lg font-semibold text-gray-100">Trends Over Time</h3>
          <p className="text-gray-400 text-sm">Weekly shifts and patch impacts.</p>
        </Link>
      </section>

      {/* Highlights */}
      <section className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-xl border border-gray-700/60 bg-gray-900/60 p-5">
          <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/15 text-amber-300 border border-amber-400/20">
            <IconStar />
          </div>
          <h4 className="text-gray-100 font-semibold mb-1">Tier Signals</h4>
          <p className="text-gray-400 text-sm">Identify rising specs early with usage and success indicators.</p>
        </div>
        <div className="rounded-xl border border-gray-700/60 bg-gray-900/60 p-5">
          <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/15 text-cyan-300 border border-cyan-400/20">
            <IconBalance />
          </div>
          <h4 className="text-gray-100 font-semibold mb-1">Role Balance</h4>
          <p className="text-gray-400 text-sm">Track tank/healer/DPS representation across key levels.</p>
        </div>
        <div className="rounded-xl border border-gray-700/60 bg-gray-900/60 p-5">
          <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-pink-500/15 text-pink-300 border border-pink-400/20">
            <IconTrophy />
          </div>
          <h4 className="text-gray-100 font-semibold mb-1">Composition Wins</h4>
          <p className="text-gray-400 text-sm">See class mixes that consistently time +++ keys.</p>
        </div>
      </section>

      {/* Frequently searched */}
      <section className="mt-10">
        <h3 className="text-2xl font-bold text-gray-200 mb-3">Frequently searched</h3>
        <div className="flex flex-wrap gap-2">
          {[
            'WoW meta season 3',
            'WoW meta TWW S3',
            'best DPS season 3',
            'best healer season 3',
            'best tank season 3',
            'Mythic+ comps season 3',
          ].map((k) => (
            <span key={k} className="rounded-full border border-gray-700 bg-gray-800/70 text-gray-300 text-xs px-3 py-1">{k}</span>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Season3LandingPage;
