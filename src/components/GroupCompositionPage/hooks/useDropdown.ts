import { useState, useRef, useEffect } from 'react';

export const useDropdown = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [hoveredClass, setHoveredClass] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  return {
    isDropdownOpen,
    setIsDropdownOpen,
    hoveredClass,
    setHoveredClass,
    dropdownRef
  };
}; 