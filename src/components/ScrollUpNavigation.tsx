import React, { useState, useEffect, useRef } from 'react';
import Navigation from './Navigation';
import { Link } from 'react-router-dom';

const ScrollUpNavigation: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isScrollingUp, setIsScrollingUp] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDelta = currentScrollY - lastScrollY;
      
      // Only show if user has scrolled down at least 100px and is now scrolling up
      if (currentScrollY > 100) {
        if (scrollDelta < -10) { // Scrolling up with some threshold
          setIsScrollingUp(true);
          setIsVisible(true);
          
          // Clear existing timeout
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
          
          // Hide after 3 seconds of no scroll
          timeoutRef.current = setTimeout(() => {
            setIsVisible(false);
          }, 3000);
        } else if (scrollDelta > 10) { // Scrolling down
          setIsScrollingUp(false);
          setIsVisible(false);
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
        }
      } else {
        // Hide when near top
        setIsVisible(false);
        setIsScrollingUp(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    // Throttle scroll events
    let ticking = false;
    const throttledHandleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledHandleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', throttledHandleScroll);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [lastScrollY]);

  return (
    <div 
      className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ease-in-out ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
      style={{ 
        background: 'linear-gradient(to bottom, rgba(3, 7, 18, 0.95), rgba(15, 23, 42, 0.95))',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(59, 130, 246, 0.2)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
      }}
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 flex flex-row items-center justify-between py-3">
        <div className="flex flex-col justify-center">
          <Link to="/" className="cursor-pointer hover:opacity-80 transition-opacity duration-200">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-blue-400 drop-shadow-lg leading-tight">What the Meta?</h1>
          </Link>
          <span className="text-xs sm:text-sm text-gray-300 font-medium tracking-wide leading-tight">M+ stats and charts for nerds</span>
        </div>
        <Navigation />
      </div>
    </div>
  );
};

export default ScrollUpNavigation;
