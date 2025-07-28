import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

export const ChartDescriptionPopover: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isVisible && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.top - 12, // Position above the button
        left: rect.left + rect.width / 2 // Center horizontally
      });
    }
  }, [isVisible]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
        setIsVisible(false);
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVisible]);

  return (
    <div className="chart-description-popover">
      <button
        ref={triggerRef}
        className="chart-description-trigger"
        onClick={() => setIsVisible(!isVisible)}
        title="Data sample information"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
        </svg>
      </button>
      {isVisible && createPortal(
        <div 
          className="chart-description-content"
          style={{
            top: position.top,
            left: position.left,
            transform: 'translateX(-50%)'
          }}
        >
          <div className="chart-description-text">
            Data sample: Top 1,000 runs per week across all regions and dungeons for the selected season.
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}; 