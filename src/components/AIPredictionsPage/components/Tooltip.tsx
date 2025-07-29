import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import '../styles/Tooltip.css';

interface TooltipProps {
  content: React.ReactNode;
  children?: React.ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children }) => {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const wrapperRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (visible && wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      setCoords({
        top: rect.top + window.scrollY + rect.height / 2,
        left: rect.left + window.scrollX + rect.width + 8
      });
    }
  }, [visible]);

  return (
    <span
      className="ai-tooltip-wrapper"
      ref={wrapperRef}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
      tabIndex={0}
    >
      {children ? children : (
        <svg className="ai-tooltip-icon" width="18" height="18" viewBox="0 0 20 20" fill="none" aria-label="Info" role="img">
          <circle cx="10" cy="10" r="10" fill="#3b82f6" />
          <text x="10" y="15" textAnchor="middle" fontSize="13" fill="#fff" fontWeight="bold">i</text>
        </svg>
      )}
      {visible && typeof window !== 'undefined' && ReactDOM.createPortal(
        <span
          className="ai-tooltip-content ai-tooltip-debug"
          style={{
            position: 'absolute',
            top: coords.top,
            left: coords.left,
            zIndex: 9999,
            background: '#fff',
            color: '#222',
            border: '2px solid red',
            padding: '0.75rem 1rem',
            borderRadius: 8,
            minWidth: 180,
            fontWeight: 600
          }}
        >
          {typeof content === 'string' ? content : content}
        </span>,
        document.body
      )}
    </span>
  );
};