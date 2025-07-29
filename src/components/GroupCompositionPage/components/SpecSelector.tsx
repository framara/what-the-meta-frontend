import React, { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { WOW_CLASS_COLORS, WOW_SPECIALIZATIONS, WOW_SPEC_TO_CLASS, WOW_SPEC_ROLES, WOW_CLASS_NAMES } from '../../wow-constants';

interface SpecSelectorProps {
  selectedClass: number | null;
  selectedSpec: number | null;
  onClassChange: (classId: number | null) => void;
  onSpecChange: (specId: number | null) => void;
  onClearFilter: () => void;
  isDropdownOpen: boolean;
  setIsDropdownOpen: (open: boolean) => void;
  hoveredClass: number | null;
  setHoveredClass: (classId: number | null) => void;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
}

export const SpecSelector: React.FC<SpecSelectorProps> = ({
  selectedClass,
  selectedSpec,
  onClassChange,
  onSpecChange,
  onClearFilter,
  isDropdownOpen,
  setIsDropdownOpen,
  hoveredClass,
  setHoveredClass,
  dropdownRef
}) => {
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Update dropdown position when it opens
  useEffect(() => {
    if (isDropdownOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  }, [isDropdownOpen]);

  // Create class options for the selector
  const classOptions = Object.entries(WOW_CLASS_NAMES)
    .map(([classId, className]) => ({
      id: Number(classId),
      name: className,
      color: WOW_CLASS_COLORS[Number(classId)] || '#fff'
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  // Get specs for selected class
  const getSpecsForClass = (classId: number) => {
    return Object.entries(WOW_SPECIALIZATIONS)
      .filter(([specId]) => WOW_SPEC_TO_CLASS[Number(specId)] === classId)
      .map(([specId, specName]) => ({
        id: Number(specId),
        name: specName,
        role: WOW_SPEC_ROLES[Number(specId)] || ''
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  };

  // Get display text for the dropdown button
  const getDisplayText = () => {
    if (selectedSpec) {
      return WOW_SPECIALIZATIONS[selectedSpec];
    }
    if (selectedClass) {
      return `Select ${WOW_CLASS_NAMES[selectedClass]} Spec`;
    }
    return 'Select Class & Spec';
  };

  const handleDropdownToggle = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleSpecChange = (specId: number) => {
    onSpecChange(specId);
    setIsDropdownOpen(false); // Close dropdown after selection
  };

  const handleSpecClick = (e: React.MouseEvent, specId: number) => {
    e.preventDefault();
    e.stopPropagation();
    handleSpecChange(specId);
  };

  const handleSubmenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleClassItemMouseEnter = (classId: number) => {
    setHoveredClass(classId);
  };

  const handleClassItemMouseLeave = () => {
    setHoveredClass(null);
  };

  return (
    <div className="spec-selector-section">
      <h3 className="section-title">
        {selectedSpec ? `Most Common Compositions with ${WOW_SPECIALIZATIONS[selectedSpec]}` : 'Most Popular Group Compositions'}
      </h3>
      <div className="spec-selector-container">
        <div className={`multi-level-dropdown ${isDropdownOpen ? 'open' : ''}`} ref={dropdownRef}>
          <button
            ref={buttonRef}
            className="dropdown-button"
            onClick={handleDropdownToggle}
            type="button"
          >
            <span className="dropdown-text">{getDisplayText()}</span>
            <svg className="dropdown-arrow" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path>
            </svg>
          </button>

          {isDropdownOpen && createPortal(
            <div 
              className="dropdown-menu"
              style={{
                position: 'absolute',
                top: dropdownPosition.top,
                left: dropdownPosition.left,
                width: dropdownPosition.width,
                zIndex: 99999
              }}
            >
              <div className="dropdown-content">
                {/* Classes */}
                <div className="class-section">
                  <div className="section-header">Classes</div>
                  <div className="class-list">
                    {classOptions.map(classOption => (
                      <div
                        key={classOption.id}
                        className={`class-item ${selectedClass === classOption.id ? 'selected' : ''}`}
                        onMouseEnter={() => handleClassItemMouseEnter(classOption.id)}
                        onMouseLeave={handleClassItemMouseLeave}
                      >
                        <div
                          className="class-color-indicator"
                          style={{ backgroundColor: classOption.color }}
                        ></div>
                        <span className="class-name">{classOption.name}</span>
                        
                        {/* Specs submenu */}
                        {hoveredClass === classOption.id && (
                          <div 
                            className="specs-submenu" 
                            onClick={handleSubmenuClick}
                          >
                            <div className="spec-list">
                              {getSpecsForClass(classOption.id).map(spec => (
                                <button
                                  key={spec.id}
                                  className={`spec-item ${selectedSpec === spec.id ? 'selected' : ''}`}
                                  onClick={(e) => {
                                    handleSpecClick(e, spec.id);
                                  }}
                                  type="button"
                                >
                                  <span 
                                    className="spec-name"
                                    onClick={(e) => {
                                      handleSpecClick(e, spec.id);
                                    }}
                                  >
                                    {spec.name}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>,
            document.body
          )}
        </div>

        <button
          className="clear-filter-btn"
          onClick={onClearFilter}
          disabled={!selectedClass && !selectedSpec}
        >
          Clear Filter
        </button>
      </div>
    </div>
  );
}; 