import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navigation = () => {
  const [navOpen, setNavOpen] = useState(false);
  const [aiDropdownOpen, setAiDropdownOpen] = useState(false);
  const [metaDropdownOpen, setMetaDropdownOpen] = useState(false);
  const [groupCompositionDropdownOpen, setGroupCompositionDropdownOpen] = useState(false);
  const location = useLocation();

  // Helper function to check if a link is active
  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  // Helper function to get link classes with active state
  const getLinkClasses = (path: string) => {
    const baseClasses = "font-bold text-lg transition px-6 py-3 md:px-0 md:py-0 whitespace-nowrap";
    const activeClasses = isActive(path) 
      ? "text-blue-400 border-b-2 border-blue-400 md:border-b-2" 
      : "hover:text-blue-400";
    return `${baseClasses} ${activeClasses}`;
  };

  return (
    <nav className="flex items-center">
      {/* Hamburger menu for mobile */}
      <button
        className="md:hidden block p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Open navigation menu"
        onClick={() => setNavOpen(v => !v)}
      >
        {/* Hamburger icon */}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>
      
      {/* Nav links - hidden on mobile unless menu open, always visible on md+ */}
      <div 
        className={`flex-col md:flex md:flex-row md:gap-6 md:static absolute top-full right-0 w-56 bg-gray-900 md:bg-transparent z-50 transition-all duration-200 ${navOpen ? 'flex' : 'hidden'} md:!flex`} 
        style={{ 
          boxShadow: navOpen ? '0 4px 16px 0 rgba(0,0,0,0.18)' : undefined, 
          marginTop: navOpen ? '0.5rem' : undefined 
        }}
      >
        <Link 
          to="/" 
          className={getLinkClasses('/')} 
          onClick={() => setNavOpen(false)}
        >
          Dashboard
        </Link>
        
        {/* Meta Evolution dropdown - desktop */}
        <div className="hidden md:block relative">
          <button
            className={`font-bold text-lg transition px-6 py-3 md:px-0 md:py-0 whitespace-nowrap flex items-center gap-1 ${
              isActive('/meta-evolution') || isActive('/race-bars')
                ? 'text-blue-400 border-b-2 border-blue-400 md:border-b-2'
                : 'hover:text-blue-400'
            }`}
            onClick={() => setMetaDropdownOpen(!metaDropdownOpen)}
            onMouseEnter={() => setMetaDropdownOpen(true)}
          >
            Meta Evolution
            <svg 
              className={`w-4 h-4 transition-transform ${metaDropdownOpen ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {metaDropdownOpen && (
            <div 
              className="absolute top-full left-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg border border-gray-700 z-50"
              onMouseLeave={() => setMetaDropdownOpen(false)}
            >
              <Link 
                to="/meta-evolution" 
                className={`block px-4 py-2 transition-colors rounded-t-lg ${
                  isActive('/meta-evolution')
                    ? 'text-blue-400 bg-gray-700'
                    : 'text-gray-300 hover:text-blue-400 hover:bg-gray-700'
                }`}
                onClick={() => setMetaDropdownOpen(false)}
              >
                Charts
              </Link>
              <Link 
                to="/race-bars" 
                className={`block px-4 py-2 transition-colors rounded-b-lg ${
                  isActive('/race-bars')
                    ? 'text-blue-400 bg-gray-700'
                    : 'text-gray-300 hover:text-blue-400 hover:bg-gray-700'
                }`}
                onClick={() => setMetaDropdownOpen(false)}
              >
                Race Bars
              </Link>
            </div>
          )}
        </div>
        
        {/* Meta Evolution dropdown - mobile */}
        <div className="md:hidden">
          <button
            className={`font-bold text-lg transition px-6 py-3 md:px-0 md:py-0 whitespace-nowrap flex items-center justify-between w-full ${
              isActive('/meta-evolution') || isActive('/race-bars')
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'hover:text-blue-400'
            }`}
            onClick={() => setMetaDropdownOpen(!metaDropdownOpen)}
          >
            <span>Meta Evolution</span>
            <svg 
              className={`w-4 h-4 transition-transform ${metaDropdownOpen ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {metaDropdownOpen && (
            <div className="pl-6 bg-gray-800 border-l-2 border-blue-500">
              <Link 
                to="/meta-evolution" 
                className={`block px-4 py-2 transition-colors ${
                  isActive('/meta-evolution')
                    ? 'text-blue-400 bg-gray-700'
                    : 'text-gray-300 hover:text-blue-400'
                }`}
                onClick={() => {
                  setMetaDropdownOpen(false);
                  setNavOpen(false);
                }}
              >
                Charts
              </Link>
              <Link 
                to="/race-bars" 
                className={`block px-4 py-2 transition-colors ${
                  isActive('/race-bars')
                    ? 'text-blue-400 bg-gray-700'
                    : 'text-gray-300 hover:text-blue-400'
                }`}
                onClick={() => {
                  setMetaDropdownOpen(false);
                  setNavOpen(false);
                }}
              >
                Race Bars
              </Link>
            </div>
          )}
        </div>
        
        {/* Group Composition dropdown - desktop */}
        <div className="hidden md:block relative">
          <button
            className={`font-bold text-lg transition px-6 py-3 md:px-0 md:py-0 whitespace-nowrap flex items-center gap-1 ${
              isActive('/group-composition') || isActive('/all-seasons')
                ? 'text-blue-400 border-b-2 border-blue-400 md:border-b-2'
                : 'hover:text-blue-400'
            }`}
            onClick={() => setGroupCompositionDropdownOpen(!groupCompositionDropdownOpen)}
            onMouseEnter={() => setGroupCompositionDropdownOpen(true)}
          >
            Group Composition
            <svg 
              className={`w-4 h-4 transition-transform ${groupCompositionDropdownOpen ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {groupCompositionDropdownOpen && (
            <div 
              className="absolute top-full left-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg border border-gray-700 z-50"
              onMouseLeave={() => setGroupCompositionDropdownOpen(false)}
            >
              <Link 
                to="/group-composition" 
                className={`block px-4 py-2 transition-colors rounded-t-lg ${
                  isActive('/group-composition')
                    ? 'text-blue-400 bg-gray-700'
                    : 'text-gray-300 hover:text-blue-400 hover:bg-gray-700'
                }`}
                onClick={() => setGroupCompositionDropdownOpen(false)}
              >
                Details per season
              </Link>
              <Link 
                to="/all-seasons" 
                className={`block px-4 py-2 transition-colors rounded-b-lg ${
                  isActive('/all-seasons')
                    ? 'text-blue-400 bg-gray-700'
                    : 'text-gray-300 hover:text-blue-400 hover:bg-gray-700'
                }`}
                onClick={() => setGroupCompositionDropdownOpen(false)}
              >
                Historical
              </Link>
            </div>
          )}
        </div>
        
        {/* Group Composition dropdown - mobile */}
        <div className="md:hidden">
          <button
            className={`font-bold text-lg transition px-6 py-3 md:px-0 md:py-0 whitespace-nowrap flex items-center justify-between w-full ${
              isActive('/group-composition') || isActive('/all-seasons')
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'hover:text-blue-400'
            }`}
            onClick={() => setGroupCompositionDropdownOpen(!groupCompositionDropdownOpen)}
          >
            <span>Group Composition</span>
            <svg 
              className={`w-4 h-4 transition-transform ${groupCompositionDropdownOpen ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {groupCompositionDropdownOpen && (
            <div className="pl-6 bg-gray-800 border-l-2 border-blue-500">
              <Link 
                to="/group-composition" 
                className={`block px-4 py-2 transition-colors ${
                  isActive('/group-composition')
                    ? 'text-blue-400 bg-gray-700'
                    : 'text-gray-300 hover:text-blue-400'
                }`}
                onClick={() => {
                  setGroupCompositionDropdownOpen(false);
                  setNavOpen(false);
                }}
              >
                Details per season
              </Link>
              <Link 
                to="/all-seasons" 
                className={`block px-4 py-2 transition-colors ${
                  isActive('/all-seasons')
                    ? 'text-blue-400 bg-gray-700'
                    : 'text-gray-300 hover:text-blue-400'
                }`}
                onClick={() => {
                  setGroupCompositionDropdownOpen(false);
                  setNavOpen(false);
                }}
              >
                All seasons
              </Link>
            </div>
          )}
        </div>
        
        {/* AI going wild dropdown - desktop */}
        <div className="hidden md:block relative">
          <button
            className={`font-bold text-lg transition px-6 py-3 md:px-0 md:py-0 whitespace-nowrap flex items-center gap-1 ${
              isActive('/ai-predictions') || isActive('/ai-analysis') || isActive('/ai-insights')
                ? 'text-blue-400 border-b-2 border-blue-400 md:border-b-2'
                : 'hover:text-blue-400'
            }`}
            onClick={() => setAiDropdownOpen(!aiDropdownOpen)}
            onMouseEnter={() => setAiDropdownOpen(true)}
          >
            AI going wild
            <svg 
              className={`w-4 h-4 transition-transform ${aiDropdownOpen ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {aiDropdownOpen && (
            <div 
              className="absolute top-full left-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg border border-gray-700 z-50"
              onMouseLeave={() => setAiDropdownOpen(false)}
            >
              <Link 
                to="/ai-predictions" 
                className={`block px-4 py-2 transition-colors rounded-t-lg ${
                  isActive('/ai-predictions')
                    ? 'text-blue-400 bg-gray-700'
                    : 'text-gray-300 hover:text-blue-400 hover:bg-gray-700'
                }`}
                onClick={() => setAiDropdownOpen(false)}
              >
                AI Predictions
              </Link>
              <Link 
                to="/ai-analysis" 
                className={`block px-4 py-2 transition-colors ${
                  isActive('/ai-analysis')
                    ? 'text-blue-400 bg-gray-700'
                    : 'text-gray-300 hover:text-blue-400 hover:bg-gray-700'
                }`}
                onClick={() => setAiDropdownOpen(false)}
              >
                AI Analysis
              </Link>
              <Link 
                to="/ai-insights" 
                className={`block px-4 py-2 transition-colors rounded-b-lg ${
                  isActive('/ai-insights')
                    ? 'text-blue-400 bg-gray-700'
                    : 'text-gray-300 hover:text-blue-400 hover:bg-gray-700'
                }`}
                onClick={() => setAiDropdownOpen(false)}
              >
                AI Insights
              </Link>
            </div>
          )}
        </div>
        
        {/* AI going wild dropdown - mobile */}
        <div className="md:hidden">
          <button
            className={`font-bold text-lg transition px-6 py-3 md:px-0 md:py-0 whitespace-nowrap flex items-center justify-between w-full ${
              isActive('/ai-predictions') || isActive('/ai-analysis') || isActive('/ai-insights')
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'hover:text-blue-400'
            }`}
            onClick={() => setAiDropdownOpen(!aiDropdownOpen)}
          >
            <span>AI going wild</span>
            <svg 
              className={`w-4 h-4 transition-transform ${aiDropdownOpen ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {aiDropdownOpen && (
            <div className="pl-6 bg-gray-800 border-l-2 border-blue-500">
              <Link 
                to="/ai-predictions" 
                className={`block px-4 py-2 transition-colors ${
                  isActive('/ai-predictions')
                    ? 'text-blue-400 bg-gray-700'
                    : 'text-gray-300 hover:text-blue-400'
                }`}
                onClick={() => {
                  setAiDropdownOpen(false);
                  setNavOpen(false);
                }}
              >
                AI Predictions
              </Link>
              <Link 
                to="/ai-analysis" 
                className={`block px-4 py-2 transition-colors ${
                  isActive('/ai-analysis')
                    ? 'text-blue-400 bg-gray-700'
                    : 'text-gray-300 hover:text-blue-400'
                }`}
                onClick={() => {
                  setAiDropdownOpen(false);
                  setNavOpen(false);
                }}
              >
                AI Analysis
              </Link>
              <Link 
                to="/ai-insights" 
                className={`block px-4 py-2 transition-colors ${
                  isActive('/ai-insights')
                    ? 'text-blue-400 bg-gray-700'
                    : 'text-gray-300 hover:text-blue-400'
                }`}
                onClick={() => {
                  setAiDropdownOpen(false);
                  setNavOpen(false);
                }}
              >
                AI Insights
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;