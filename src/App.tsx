import React, { Suspense } from 'react';
import LoadingScreen from './components/LoadingScreen';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useFilterState } from './components/FilterContext';
import Navigation from './components/Navigation';
import ScrollUpNavigation from './components/ScrollUpNavigation';
import Footer from './components/Footer';
import HomePage from './components/HomePage';

// Route-level code splitting for heavy pages
const MetaEvolutionPage = React.lazy(() => import('./components/MetaEvolutionPage/index').then(m => ({ default: m.MetaEvolutionPage })));
const RaceBarsPage = React.lazy(() => import('./components/RaceBarsPage').then(m => ({ default: m.RaceBarsPage })));
const GroupCompositionPage = React.lazy(() => import('./components/GroupCompositionPage/index').then(m => ({ default: m.GroupCompositionPage })));
const CompAllSeasonsPage = React.lazy(() => import('./components/CompAllSeasonsPage/index').then(m => ({ default: m.CompAllSeasonsPage })));
const AIPredictionsPage = React.lazy(() => import('./components/AIPredictionsPage').then(m => ({ default: m.AIPredictionsPage })));
const MetaHealthPage = React.lazy(() => import('./components/MetaHealthPage').then(m => ({ default: m.MetaHealthPage })));
const AITierListPage = React.lazy(() => import('./components/AITierListPage').then(m => ({ default: m.AITierListPage })));
const AboutPage = React.lazy(() => import('./components/AboutPage'));
const PrivacyPage = React.lazy(() => import('./components/PrivacyPage'));
const TermsPage = React.lazy(() => import('./components/TermsPage'));
const CutoffPage = React.lazy(() => import('./components/CutoffPage'));
const Season3LandingPage = React.lazy(() => import('./components/Season3LandingPage'));

function App() {
  const filter = useFilterState();

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        {/* Fixed scroll-up navigation */}
        <ScrollUpNavigation />
        
        <header className="w-full flex flex-row items-center justify-between py-4 bg-gradient-to-b from-gray-950 to-gray-900 shadow-lg mb-6 relative z-40">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 flex flex-row items-center justify-between">
                  <div className="flex flex-col justify-center">
          <Link to="/" className="cursor-pointer hover:opacity-80 transition-opacity duration-200">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-blue-400 drop-shadow-lg leading-tight">What the Meta?</h1>
          </Link>
          <span className="text-sm sm:text-base text-gray-300 font-medium tracking-wide leading-tight">M+ stats and charts for nerds</span>
        </div>
          <Navigation />
          </div>
        </header>
        <main className="flex-1">
          <Suspense fallback={<LoadingScreen />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            {/* SEO: season landing routes */}
            <Route path="/wow-meta-season-3" element={<Season3LandingPage />} />
            <Route path="/wow-meta-tww-s3" element={<Season3LandingPage />} />
            <Route path="/tww-s3-meta" element={<Season3LandingPage />} />
            <Route path="/meta-evolution" element={<MetaEvolutionPage />} />
            <Route path="/race-bars" element={<RaceBarsPage />} />
            <Route path="/group-composition" element={<GroupCompositionPage />} />
            <Route path="/historical-composition" element={<CompAllSeasonsPage />} />
            <Route path="/ai-predictions" element={<AIPredictionsPage />} />
            <Route path="/meta-health" element={<MetaHealthPage />} />
            <Route path="/ai-tier-list" element={<AITierListPage />} />
            <Route path="/cutoff" element={<CutoffPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/ai-analysis" element={
              <div className="max-w-7xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-gray-200 mb-6">AI Analysis</h1>
                <div className="bg-gray-800 rounded-lg p-6">
                  <p className="text-gray-300 mb-4">Coming soon! Deep AI analysis of Mythic+ data patterns.</p>
                  <div className="text-6xl mb-4">🧠</div>
                </div>
              </div>
            } />
            <Route path="/ai-insights" element={
              <div className="max-w-7xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-gray-200 mb-6">AI Insights</h1>
                <div className="bg-gray-800 rounded-lg p-6">
                  <p className="text-gray-300 mb-4">Coming soon! AI-generated insights and recommendations.</p>
                  <div className="text-6xl mb-4">💡</div>
                </div>
              </div>
            } />
            <Route path="*" element={
              <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="text-6xl mb-4">404</div>
                  <h1 className="text-3xl font-bold text-gray-200 mb-4">Page Not Found</h1>
                  <p className="text-gray-400 mb-6">The page you're looking for doesn't exist.</p>
                  <Link to="/" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Go Home
                  </Link>
                </div>
              </div>
            } />
          </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
