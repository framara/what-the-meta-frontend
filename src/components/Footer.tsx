import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();

    return (
    <footer className="w-full bg-gradient-to-t from-gray-950 to-gray-900 border-t border-blue-500/20 mt-12 min-h-[220px]">
            <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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

                    {/* Middle - Legal/Info Links */}
                    <div className="flex flex-col items-center">
                        <h4 className="text-blue-400 font-semibold mb-3">Explore</h4>
                        <div className="flex flex-col gap-2 text-sm">
                            <Link
                                to="/wow-meta-season-3"
                                className="text-gray-300 hover:text-blue-400 transition-colors duration-200 flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7H7v10h10V7h-4z" />
                                </svg>
                                WoW Meta TWW S3
                            </Link>
                            <Link
                                to="/about"
                                className="text-gray-300 hover:text-blue-400 transition-colors duration-200 flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                About
                            </Link>
                            <Link
                                to="/privacy"
                                className="text-gray-300 hover:text-blue-400 transition-colors duration-200 flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                Privacy Policy
                            </Link>
                            <Link
                                to="/terms"
                                className="text-gray-300 hover:text-blue-400 transition-colors duration-200 flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Terms of Service
                            </Link>
                        </div>
                    </div>

                    {/* Right side - Connect */}
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
                                href="mailto:contact@whatthemeta.io"
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