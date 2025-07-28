import React from 'react';

const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="w-full bg-gradient-to-t from-gray-950 to-gray-900 border-t border-blue-500/20 mt-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    {/* Left side - Brand and description */}
                    <div className="flex flex-col items-center md:items-start text-center md:text-left">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">📊</span>
                            <h3 className="text-xl font-bold text-blue-400">What the Meta?</h3>
                        </div>
                        <p className="text-gray-400 text-sm max-w-md">
                            M+ stats and charts for nerds.
                        </p>
                        <p className="text-gray-400 text-sm max-w-md">
                            Track the meta evolution in World of Warcraft Mythic+ dungeons.
                        </p>
                    </div>

                                         {/* Center and Right side - Quick links and Connect */}
                     <div className="flex flex-row gap-8 md:gap-12">
                         {/* Quick links */}
                         <div className="flex flex-col items-center">
                             <h4 className="text-blue-400 font-semibold mb-3">Quick Links</h4>
                             <div className="flex flex-col gap-2 text-sm">
                                 <a
                                     href="/"
                                     className="text-gray-300 hover:text-blue-400 transition-colors duration-200"
                                 >
                                     Dashboard
                                 </a>
                                 <a
                                     href="/meta-evolution"
                                     className="text-gray-300 hover:text-blue-400 transition-colors duration-200"
                                 >
                                     Meta Evolution
                                 </a>
                                 <a
                                     href="/group-composition"
                                     className="text-gray-300 hover:text-blue-400 transition-colors duration-200"
                                 >
                                     Group Composition
                                 </a>
                             </div>
                         </div>

                                                  {/* Connect */}
                         <div className="flex flex-col items-center">
                             <h4 className="text-blue-400 font-semibold mb-3">Connect</h4>
                             <div className="flex flex-col gap-2 text-sm">
                                 <a
                                     href="https://github.com/framara"
                                     target="_blank"
                                     rel="noopener noreferrer"
                                     className="text-gray-300 hover:text-blue-400 transition-colors duration-200 flex items-center gap-2"
                                 >
                                     <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                         <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                     </svg>
                                     GitHub
                                 </a>
                                 <a
                                     href="mailto:framarale@gmail.com"
                                     className="text-gray-300 hover:text-blue-400 transition-colors duration-200 flex items-center gap-2"
                                 >
                                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                     </svg>
                                     Contact
                                 </a>
                                 <a
                                     href="https://www.paypal.com/donate/?business=AVL6N4UXZZH8W&no_recurring=0&item_name=I+%E2%9D%A4%EF%B8%8F+WhatTheMeta.io&currency_code=EUR"
                                     target="_blank"
                                     rel="noopener noreferrer"
                                     className="text-gray-300 hover:text-blue-400 transition-colors duration-200 flex items-center gap-2"
                                 >
                                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                     </svg>
                                     Donate
                                 </a>
                             </div>
                         </div>
                     </div>
                 </div>

                {/* Bottom section - Copyright and additional info */}
                <div className="mt-8 pt-6 border-t border-gray-700/50">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
                        <div className="flex flex-col sm:flex-row items-center gap-2">
                            <span>© {currentYear} What the Meta?. All rights reserved.</span>
                            <span className="hidden sm:inline">•</span>
                            <span>Not affiliated with Blizzard Entertainment</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-xs text-gray-500">
                                Data from Blizzard API
                            </span>
                            <div className="flex items-center gap-1">
                                <span className="text-xs text-gray-500">Made with</span>
                                <span className="text-red-400">❤️</span>
                                <span className="text-xs text-gray-500">for the WoW community</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer; 