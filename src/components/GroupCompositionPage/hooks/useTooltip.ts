import { useState } from 'react';

export interface TooltipState {
  x: number;
  y: number;
  content: string;
  color: string;
}

export const useTooltip = () => {
  const [specTooltip, setSpecTooltip] = useState<TooltipState | null>(null);
  
  return {
    specTooltip,
    setSpecTooltip
  };
}; 