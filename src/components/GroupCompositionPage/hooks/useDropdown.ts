import { useState, useRef, useEffect } from 'react';

export const useDropdown = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [hoveredClass, setHoveredClass] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      // Check if click is within the dropdown
      if (dropdownRef.current && dropdownRef.current.contains(target)) {
        return;
      }
      
      // Check if click is within a submenu (specs-submenu class)
      const submenu = (target as Element).closest('.specs-submenu');
      if (submenu) {
        return;
      }
      
      // If neither, close the dropdown
      setIsDropdownOpen(false);
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