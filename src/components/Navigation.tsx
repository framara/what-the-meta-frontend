import { useState } from 'react';
import { Link } from 'react-router-dom';

const Navigation = () => {
  const [navOpen, setNavOpen] = useState(false);
  const [aiDropdownOpen, setAiDropdownOpen] = useState(false);

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
          className="font-bold text-lg hover:text-blue-400 transition px-6 py-3 md:px-0 md:py-0 whitespace-nowrap" 
          onClick={() => setNavOpen(false)}
        >
          Dashboard
        </Link>
        <Link 
          to="/meta-evolution" 
          className="font-bold text-lg hover:text-blue-400 transition px-6 py-3 md:px-0 md:py-0 whitespace-nowrap" 
          onClick={() => setNavOpen(false)}
        >
          Meta Evolution
        </Link>
        <Link 
          to="/group-composition" 
          className="font-bold text-lg hover:text-blue-400 transition px-6 py-3 md:px-0 md:py-0 whitespace-nowrap" 
          onClick={() => setNavOpen(false)}
        >
          Group Composition
        </Link>
        
        {/* AI going wild dropdown - desktop */}
        <div className="hidden md:block relative">
          <button
            className="font-bold text-lg hover:text-blue-400 transition px-6 py-3 md:px-0 md:py-0 whitespace-nowrap flex items-center gap-1"
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
                className="block px-4 py-2 text-gray-300 hover:text-blue-400 hover:bg-gray-700 transition-colors rounded-t-lg"
                onClick={() => setAiDropdownOpen(false)}
              >
                AI Predictions
              </Link>
              <Link 
                to="/ai-analysis" 
                className="block px-4 py-2 text-gray-300 hover:text-blue-400 hover:bg-gray-700 transition-colors"
                onClick={() => setAiDropdownOpen(false)}
              >
                AI Analysis
              </Link>
              <Link 
                to="/ai-insights" 
                className="block px-4 py-2 text-gray-300 hover:text-blue-400 hover:bg-gray-700 transition-colors rounded-b-lg"
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
            className="font-bold text-lg hover:text-blue-400 transition px-6 py-3 md:px-0 md:py-0 whitespace-nowrap flex items-center justify-between w-full"
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
                className="block px-4 py-2 text-gray-300 hover:text-blue-400 transition-colors"
                onClick={() => {
                  setAiDropdownOpen(false);
                  setNavOpen(false);
                }}
              >
                AI Predictions
              </Link>
              <Link 
                to="/ai-analysis" 
                className="block px-4 py-2 text-gray-300 hover:text-blue-400 transition-colors"
                onClick={() => {
                  setAiDropdownOpen(false);
                  setNavOpen(false);
                }}
              >
                AI Analysis
              </Link>
              <Link 
                to="/ai-insights" 
                className="block px-4 py-2 text-gray-300 hover:text-blue-400 transition-colors"
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