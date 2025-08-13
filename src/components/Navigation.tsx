import { useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navigation = () => {
  const [navOpen, setNavOpen] = useState(false);
  const [aiDropdownOpen, setAiDropdownOpen] = useState(false);
  const [metaDropdownOpen, setMetaDropdownOpen] = useState(false);
  const [groupCompositionDropdownOpen, setGroupCompositionDropdownOpen] = useState(false);
  const location = useLocation();
  // Cutoff is a direct link now; remove dropdown state
  
  // Refs to track timeout IDs for each dropdown
  const metaTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const groupCompositionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const aiTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // Helper functions to manage dropdown timeouts
  const startDropdownTimeout = (timeoutRef: React.MutableRefObject<NodeJS.Timeout | null>, setDropdownOpen: (open: boolean) => void) => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    // Start new timeout
    timeoutRef.current = setTimeout(() => setDropdownOpen(false), 300);
  };

  const clearDropdownTimeout = (timeoutRef: React.MutableRefObject<NodeJS.Timeout | null>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
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
        className={`flex-col md:flex md:flex-row md:gap-6 md:static absolute top-full right-0 w-72 bg-gray-900 md:bg-transparent z-50 transition-all duration-200 ${navOpen ? 'flex' : 'hidden'} md:!flex`} 
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

        {/* 0.1% Cutoff - direct link (second item) */}
        <Link
          to="/cutoff"
          className={getLinkClasses('/cutoff')}
          onClick={() => setNavOpen(false)}
        >
          0.1% Cutoff
        </Link>
        
        {/* Spec Evolution dropdown - desktop */}
        <div 
          className="hidden md:block relative"
          onMouseEnter={() => {
            clearDropdownTimeout(metaTimeoutRef);
            setMetaDropdownOpen(true);
          }}
          onMouseLeave={() => {
            startDropdownTimeout(metaTimeoutRef, setMetaDropdownOpen);
          }}
        >
          <button
            className={`font-bold text-lg transition px-6 py-3 md:px-0 md:py-0 whitespace-nowrap flex items-center gap-1 ${
              isActive('/meta-evolution') || isActive('/race-bars')
                ? 'text-blue-400 border-b-2 border-blue-400 md:border-b-2'
                : 'hover:text-blue-400'
            }`}
            onClick={() => setMetaDropdownOpen(!metaDropdownOpen)}
          >
            Spec Evolution
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
              onMouseEnter={() => {
                clearDropdownTimeout(metaTimeoutRef);
                setMetaDropdownOpen(true);
              }}
              onMouseLeave={() => {
                startDropdownTimeout(metaTimeoutRef, setMetaDropdownOpen);
              }}
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

        {/* Removed Cutoff dropdown for desktop; direct link added above */}

        {/* 0.1% Cutoff - mobile direct link (placed second) */}
        <div className="md:hidden">
          <Link 
            to="/cutoff" 
            className={getLinkClasses('/cutoff')} 
            onClick={() => setNavOpen(false)}
          >
            0.1% Cutoff
          </Link>
        </div>
        
        {/* Spec Evolution dropdown - mobile */}
        <div className="md:hidden">
          <button
            className={`font-bold text-lg transition px-6 py-3 md:px-0 md:py-0 whitespace-nowrap flex items-center justify-between w-full ${
              isActive('/meta-evolution') || isActive('/race-bars')
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'hover:text-blue-400'
            }`}
            onClick={() => setMetaDropdownOpen(!metaDropdownOpen)}
          >
            <span>Spec Evolution</span>
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
        <div 
          className="hidden md:block relative"
          onMouseEnter={() => {
            clearDropdownTimeout(groupCompositionTimeoutRef);
            setGroupCompositionDropdownOpen(true);
          }}
          onMouseLeave={() => {
            startDropdownTimeout(groupCompositionTimeoutRef, setGroupCompositionDropdownOpen);
          }}
        >
          <button
            className={`font-bold text-lg transition px-6 py-3 md:px-0 md:py-0 whitespace-nowrap flex items-center gap-1 ${
              isActive('/group-composition') || isActive('/historical-composition')
                ? 'text-blue-400 border-b-2 border-blue-400 md:border-b-2'
                : 'hover:text-blue-400'
            }`}
            onClick={() => setGroupCompositionDropdownOpen(!groupCompositionDropdownOpen)}
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
              onMouseEnter={() => {
                clearDropdownTimeout(groupCompositionTimeoutRef);
                setGroupCompositionDropdownOpen(true);
              }}
              onMouseLeave={() => {
                startDropdownTimeout(groupCompositionTimeoutRef, setGroupCompositionDropdownOpen);
              }}
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
                Composition Details
              </Link>
              <Link 
                to="/historical-composition" 
                className={`block px-4 py-2 transition-colors rounded-b-lg ${
                  isActive('/historical-composition')
                    ? 'text-blue-400 bg-gray-700'
                    : 'text-gray-300 hover:text-blue-400 hover:bg-gray-700'
                }`}
                onClick={() => setGroupCompositionDropdownOpen(false)}
              >
                Historical Overview
              </Link>
            </div>
          )}
        </div>
        
        {/* Group Composition dropdown - mobile */}
        <div className="md:hidden">
          <button
            className={`font-bold text-lg transition px-6 py-3 md:px-0 md:py-0 whitespace-nowrap flex items-center justify-between w-full ${
              isActive('/group-composition') || isActive('/historical-composition')
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
                Composition Details
              </Link>
              <Link 
                to="/historical-composition"     
                className={`block px-4 py-2 transition-colors ${
                  isActive('/historical-composition')
                    ? 'text-blue-400 bg-gray-700'
                    : 'text-gray-300 hover:text-blue-400'
                }`}
                onClick={() => {
                  setGroupCompositionDropdownOpen(false);
                  setNavOpen(false);
                }}
              >
                Historical Overview
              </Link>
            </div>
          )}
        </div>
        
        {/* AI Analysis dropdown - desktop */}
        <div 
          className="hidden md:block relative"
          onMouseEnter={() => {
            clearDropdownTimeout(aiTimeoutRef);
            setAiDropdownOpen(true);
          }}
          onMouseLeave={() => {
            startDropdownTimeout(aiTimeoutRef, setAiDropdownOpen);
          }}
        >
          <button
            className={`font-bold text-lg transition px-6 py-3 md:px-0 md:py-0 whitespace-nowrap flex items-center gap-1 ${
              isActive('/ai-predictions') || isActive('/ai-analysis') || isActive('/ai-insights') || isActive('/meta-health')
                ? 'text-blue-400 border-b-2 border-blue-400 md:border-b-2'
                : 'hover:text-blue-400'
            }`}
            onClick={() => setAiDropdownOpen(!aiDropdownOpen)}
          >
            AI Analysis
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
              onMouseEnter={() => {
                clearDropdownTimeout(aiTimeoutRef);
                setAiDropdownOpen(true);
              }}
              onMouseLeave={() => {
                startDropdownTimeout(aiTimeoutRef, setAiDropdownOpen);
              }}
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
                to="/meta-health" 
                className={`block px-4 py-2 transition-colors rounded-b-lg ${
                  isActive('/meta-health')
                    ? 'text-blue-400 bg-gray-700'
                    : 'text-gray-300 hover:text-blue-400 hover:bg-gray-700'
                }`}
                onClick={() => setAiDropdownOpen(false)}
              >
                Meta Health
              </Link>
            </div>
          )}
        </div>
        
        {/* AI Analysis dropdown - mobile */}
        <div className="md:hidden">
          <button
            className={`font-bold text-lg transition px-6 py-3 md:px-0 md:py-0 whitespace-nowrap flex items-center justify-between w-full ${
              isActive('/ai-predictions') || isActive('/ai-analysis') || isActive('/ai-insights')
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'hover:text-blue-400'
            }`}
            onClick={() => setAiDropdownOpen(!aiDropdownOpen)}
          >
            <span>AI Analysis</span>
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
              <div className="px-4 py-2 text-gray-500 text-sm italic">
                More coming soon...
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;