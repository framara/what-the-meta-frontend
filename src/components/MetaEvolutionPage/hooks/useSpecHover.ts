import { useState, useCallback } from 'react';

export const useSpecHover = () => {
  const [hoveredSpecId, setHoveredSpecId] = useState<number | null>(null);

  const handleSpecMouseEnter = useCallback((specId: number) => {
    setHoveredSpecId(specId);
  }, []);

  const handleSpecMouseLeave = useCallback(() => {
    setHoveredSpecId(null);
  }, []);

  const isSpecHovered = useCallback((specId: number) => {
    return hoveredSpecId === specId;
  }, [hoveredSpecId]);

  return {
    hoveredSpecId,
    handleSpecMouseEnter,
    handleSpecMouseLeave,
    isSpecHovered,
    hasHoveredSpec: hoveredSpecId !== null
  };
};
