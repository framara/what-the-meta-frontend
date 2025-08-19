import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';

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
  // Ref to detect outside clicks
  const navContainerRef = useRef<HTMLDivElement | null>(null);

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
    timeoutRef.current = setTimeout(() => setDropdownOpen(false), 200);
  };

  const clearDropdownTimeout = (timeoutRef: React.MutableRefObject<NodeJS.Timeout | null>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  // Close menus on outside click
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent | TouchEvent) => {
      if (!navContainerRef.current) return;
      const target = event.target as Node;
      if (!navContainerRef.current.contains(target)) {
        setNavOpen(false);
        setAiDropdownOpen(false);
        setMetaDropdownOpen(false);
        setGroupCompositionDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, []);

  // Close menus when route changes
  useEffect(() => {
    setNavOpen(false);
    setAiDropdownOpen(false);
    setMetaDropdownOpen(false);
    setGroupCompositionDropdownOpen(false);
  }, [location.pathname]);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    if (navOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = originalOverflow || '';
    }
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [navOpen]);

  // Keyboard: Escape closes any open menu
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      setNavOpen(false);
      setAiDropdownOpen(false);
      setMetaDropdownOpen(false);
      setGroupCompositionDropdownOpen(false);
    }
  }, []);

  return (
    <nav className="flex items-center" role="navigation" aria-label="Primary" onKeyDown={handleKeyDown}>
      {/* Hamburger menu for mobile */}
      <button
        className="md:hidden block p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Open navigation menu"
        aria-expanded={navOpen}
        aria-controls="primary-mobile-menu"
        onClick={() => setNavOpen(v => !v)}
      >
        {/* Hamburger icon */}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>
      {/* Mobile backdrop */}
      {navOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setNavOpen(false)}
          aria-hidden="true"
        />
      )}
      
      {/* Nav links - hidden on mobile unless menu open, always visible on md+ */}
      <div 
        ref={navContainerRef}
        id="primary-mobile-menu"
        className={`flex-col md:flex md:flex-row md:gap-6 md:static absolute top-full right-0 w-72 bg-gray-900 md:bg-transparent z-50 transition-all duration-200 ${navOpen ? 'flex' : 'hidden'} md:!flex`} 
        style={{ 
          boxShadow: navOpen ? '0 4px 16px 0 rgba(0,0,0,0.18)' : undefined, 
          marginTop: navOpen ? '0.5rem' : undefined 
        }}
      >
        <NavLink 
          to="/" 
          className={({ isActive }: { isActive: boolean }) => {
            const base = "font-bold text-lg transition px-6 py-3 md:px-0 md:py-0 whitespace-nowrap";
            return `${base} ${isActive ? 'text-blue-400 border-b-2 border-blue-400 md:border-b-2' : 'hover:text-blue-400'}`;
          }}
          onClick={() => setNavOpen(false)}
        >
          Dashboard
        </NavLink>

        {/* 0.1% Cutoff - direct link (second item) */}
        <NavLink
          to="/cutoff"
          className={({ isActive }: { isActive: boolean }) => {
            const base = "font-bold text-lg transition px-6 py-3 md:px-0 md:py-0 whitespace-nowrap";
            return `${base} ${isActive ? 'text-blue-400 border-b-2 border-blue-400 md:border-b-2' : 'hover:text-blue-400'}`;
          }}
          onClick={() => setNavOpen(false)}
        >
          0.1% Cutoff
        </NavLink>
        
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
            id="meta-menu-button-desktop"
            aria-haspopup="true"
            aria-expanded={metaDropdownOpen}
            aria-controls="meta-menu-desktop"
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
              id="meta-menu-desktop"
              role="menu"
              aria-labelledby="meta-menu-button-desktop"
              className="absolute top-full left-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg border border-gray-700 z-50"
              onMouseEnter={() => {
                clearDropdownTimeout(metaTimeoutRef);
                setMetaDropdownOpen(true);
              }}
              onMouseLeave={() => {
                startDropdownTimeout(metaTimeoutRef, setMetaDropdownOpen);
              }}
            >
              <NavLink 
                to="/meta-evolution" 
                className={({ isActive }: { isActive: boolean }) => `block px-4 py-2 transition-colors rounded-t-lg ${isActive ? 'text-blue-400 bg-gray-700' : 'text-gray-300 hover:text-blue-400 hover:bg-gray-700'}`}
                role="menuitem"
                onClick={() => setMetaDropdownOpen(false)}
              >
                Charts
              </NavLink>
              <NavLink 
                to="/race-bars" 
                className={({ isActive }: { isActive: boolean }) => `block px-4 py-2 transition-colors rounded-b-lg ${isActive ? 'text-blue-400 bg-gray-700' : 'text-gray-300 hover:text-blue-400 hover:bg-gray-700'}`}
                role="menuitem"
                onClick={() => setMetaDropdownOpen(false)}
              >
                Race Bars
              </NavLink>
            </div>
          )}
        </div>

        {/* Removed Cutoff dropdown for desktop; direct link added above */}

        {/* 0.1% Cutoff - duplicate mobile link removed to avoid double entry */}
        
        {/* Spec Evolution dropdown - mobile */}
        <div className="md:hidden">
          <button
            className={`font-bold text-lg transition px-6 py-3 md:px-0 md:py-0 whitespace-nowrap flex items-center justify-between w-full ${
              isActive('/meta-evolution') || isActive('/race-bars')
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'hover:text-blue-400'
            }`}
            id="meta-menu-button-mobile"
            aria-haspopup="true"
            aria-expanded={metaDropdownOpen}
            aria-controls="meta-menu-mobile"
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
            <div id="meta-menu-mobile" role="menu" aria-labelledby="meta-menu-button-mobile" className="pl-6 bg-gray-800 border-l-2 border-blue-500">
              <NavLink 
                to="/meta-evolution" 
                className={({ isActive }: { isActive: boolean }) => `block px-4 py-2 transition-colors ${isActive ? 'text-blue-400 bg-gray-700' : 'text-gray-300 hover:text-blue-400'}`}
                role="menuitem"
                onClick={() => {
                  setMetaDropdownOpen(false);
                  setNavOpen(false);
                }}
              >
                Charts
              </NavLink>
              <NavLink 
                to="/race-bars" 
                className={({ isActive }: { isActive: boolean }) => `block px-4 py-2 transition-colors ${isActive ? 'text-blue-400 bg-gray-700' : 'text-gray-300 hover:text-blue-400'}`}
                role="menuitem"
                onClick={() => {
                  setMetaDropdownOpen(false);
                  setNavOpen(false);
                }}
              >
                Race Bars
              </NavLink>
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
            id="group-menu-button-desktop"
            aria-haspopup="true"
            aria-expanded={groupCompositionDropdownOpen}
            aria-controls="group-menu-desktop"
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
              id="group-menu-desktop"
              role="menu"
              aria-labelledby="group-menu-button-desktop"
              className="absolute top-full left-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg border border-gray-700 z-50"
              onMouseEnter={() => {
                clearDropdownTimeout(groupCompositionTimeoutRef);
                setGroupCompositionDropdownOpen(true);
              }}
              onMouseLeave={() => {
                startDropdownTimeout(groupCompositionTimeoutRef, setGroupCompositionDropdownOpen);
              }}
            >
              <NavLink 
                to="/group-composition" 
                className={({ isActive }: { isActive: boolean }) => `block px-4 py-2 transition-colors rounded-t-lg ${isActive ? 'text-blue-400 bg-gray-700' : 'text-gray-300 hover:text-blue-400 hover:bg-gray-700'}`}
                role="menuitem"
                onClick={() => setGroupCompositionDropdownOpen(false)}
              >
                Composition Details
              </NavLink>
              <NavLink 
                to="/historical-composition" 
                className={({ isActive }: { isActive: boolean }) => `block px-4 py-2 transition-colors rounded-b-lg ${isActive ? 'text-blue-400 bg-gray-700' : 'text-gray-300 hover:text-blue-400 hover:bg-gray-700'}`}
                role="menuitem"
                onClick={() => setGroupCompositionDropdownOpen(false)}
              >
                Historical Overview
              </NavLink>
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
            id="group-menu-button-mobile"
            aria-haspopup="true"
            aria-expanded={groupCompositionDropdownOpen}
            aria-controls="group-menu-mobile"
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
            <div id="group-menu-mobile" role="menu" aria-labelledby="group-menu-button-mobile" className="pl-6 bg-gray-800 border-l-2 border-blue-500">
              <NavLink 
                to="/group-composition" 
                className={({ isActive }: { isActive: boolean }) => `block px-4 py-2 transition-colors ${isActive ? 'text-blue-400 bg-gray-700' : 'text-gray-300 hover:text-blue-400'}`}
                role="menuitem"
                onClick={() => {
                  setGroupCompositionDropdownOpen(false);
                  setNavOpen(false);
                }}
              >
                Composition Details
              </NavLink>
              <NavLink 
                to="/historical-composition"     
                className={({ isActive }: { isActive: boolean }) => `block px-4 py-2 transition-colors ${isActive ? 'text-blue-400 bg-gray-700' : 'text-gray-300 hover:text-blue-400'}`}
                role="menuitem"
                onClick={() => {
                  setGroupCompositionDropdownOpen(false);
                  setNavOpen(false);
                }}
              >
                Historical Overview
              </NavLink>
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
            id="ai-menu-button-desktop"
            aria-haspopup="true"
            aria-expanded={aiDropdownOpen}
            aria-controls="ai-menu-desktop"
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
              id="ai-menu-desktop"
              role="menu"
              aria-labelledby="ai-menu-button-desktop"
              className="absolute top-full left-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg border border-gray-700 z-50"
              onMouseEnter={() => {
                clearDropdownTimeout(aiTimeoutRef);
                setAiDropdownOpen(true);
              }}
              onMouseLeave={() => {
                startDropdownTimeout(aiTimeoutRef, setAiDropdownOpen);
              }}
            >
              <NavLink 
                to="/ai-predictions" 
                className={({ isActive }: { isActive: boolean }) => `block px-4 py-2 transition-colors rounded-t-lg ${isActive ? 'text-blue-400 bg-gray-700' : 'text-gray-300 hover:text-blue-400 hover:bg-gray-700'}`}
                role="menuitem"
                onClick={() => setAiDropdownOpen(false)}
              >
                AI Predictions
              </NavLink>
              <NavLink 
                to="/meta-health" 
                className={({ isActive }: { isActive: boolean }) => `block px-4 py-2 transition-colors rounded-b-lg ${isActive ? 'text-blue-400 bg-gray-700' : 'text-gray-300 hover:text-blue-400 hover:bg-gray-700'}`}
                role="menuitem"
                onClick={() => setAiDropdownOpen(false)}
              >
                AI Meta Health
              </NavLink>
            </div>
          )}
        </div>
        
        {/* AI Analysis dropdown - mobile */}
        <div className="md:hidden">
          <button
            className={`font-bold text-lg transition px-6 py-3 md:px-0 md:py-0 whitespace-nowrap flex items-center justify-between w-full ${
              isActive('/ai-predictions') || isActive('/meta-health') || isActive('/ai-analysis') || isActive('/ai-insights')
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'hover:text-blue-400'
            }`}
            id="ai-menu-button-mobile"
            aria-haspopup="true"
            aria-expanded={aiDropdownOpen}
            aria-controls="ai-menu-mobile"
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
            <div id="ai-menu-mobile" role="menu" aria-labelledby="ai-menu-button-mobile" className="pl-6 bg-gray-800 border-l-2 border-blue-500">
              <NavLink 
                to="/ai-predictions" 
                className={({ isActive }: { isActive: boolean }) => `block px-4 py-2 transition-colors ${isActive ? 'text-blue-400 bg-gray-700' : 'text-gray-300 hover:text-blue-400'}`}
                role="menuitem"
                onClick={() => {
                  setAiDropdownOpen(false);
                  setNavOpen(false);
                }}
              >
                AI Predictions
              </NavLink>
              <NavLink 
                to="/meta-health" 
                className={({ isActive }: { isActive: boolean }) => `block px-4 py-2 transition-colors ${isActive ? 'text-blue-400 bg-gray-700' : 'text-gray-300 hover:text-blue-400'}`}
                role="menuitem"
                onClick={() => {
                  setAiDropdownOpen(false);
                  setNavOpen(false);
                }}
              >
                AI Meta Health
              </NavLink>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;