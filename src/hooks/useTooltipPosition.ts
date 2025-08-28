import { useCallback } from 'react';

interface TooltipDimensions {
  width: number;
  height: number;
}

interface TooltipPosition {
  x: number;
  y: number;
}

export const useTooltipPosition = () => {
  const calculateTooltipPosition = useCallback((
    targetElement: HTMLElement,
    containerSelector: string,
    tooltipDimensions: TooltipDimensions = { width: 250, height: 100 },
    padding: number = 10
  ): TooltipPosition => {
    const rect = targetElement.getBoundingClientRect();
    const container = targetElement.closest(containerSelector) as HTMLElement;
    const containerRect = container?.getBoundingClientRect();
    
    if (!containerRect) {
      return { x: rect.left + rect.width / 2, y: rect.top - tooltipDimensions.height - padding };
    }

    const { width: tooltipWidth, height: tooltipHeight } = tooltipDimensions;

    // Calculate initial position (centered above the element)
    let x = rect.left + rect.width / 2 - tooltipWidth / 2;
    let y = rect.top - tooltipHeight - padding;

    // Adjust horizontal position to stay within container bounds
    const minX = containerRect.left + padding;
    const maxX = containerRect.right - tooltipWidth - padding;
    
    if (x < minX) {
      x = minX;
    } else if (x > maxX) {
      x = maxX;
    }

    // Adjust vertical position to stay within container bounds
    const minY = containerRect.top + padding;
    const maxY = containerRect.bottom - tooltipHeight - padding;
    
    if (y < minY) {
      // If tooltip would go above container, position it below the element
      y = rect.bottom + padding;
    }
    
    if (y > maxY) {
      y = maxY;
    }

    return { x, y };
  }, []);

  const calculateMouseTooltipPosition = useCallback((
    mouseX: number,
    mouseY: number,
    containerSelector: string,
    tooltipDimensions: TooltipDimensions = { width: 250, height: 100 },
    padding: number = 20
  ): TooltipPosition => {
    const container = document.querySelector(containerSelector) as HTMLElement;
    if (!container) {
      return { x: mouseX + 10, y: mouseY - 50 };
    }
    
    const containerRect = container.getBoundingClientRect();
    const containerLeft = containerRect.left;
    const containerTop = containerRect.top;
    const containerWidth = containerRect.width;
    const containerHeight = containerRect.height;
    
    // Calculate position relative to container
    let x = mouseX - containerLeft + 10;
    let y = mouseY - containerTop - tooltipDimensions.height - 10;
    
    // Check if tooltip would go off the right edge of container
    if (x + tooltipDimensions.width + padding > containerWidth) {
      x = mouseX - containerLeft - tooltipDimensions.width - 10;
    }
    
    // Check if tooltip would go off the left edge of container
    if (x < padding) {
      x = padding;
    }
    
    // Check if tooltip would go off the top edge of container
    if (y < padding) {
      y = mouseY - containerTop + 10;
    }
    
    // Check if tooltip would go off the bottom edge of container
    if (y + tooltipDimensions.height + padding > containerHeight) {
      y = mouseY - containerTop - tooltipDimensions.height - 10;
    }
    
    return { x, y };
  }, []);

  return {
    calculateTooltipPosition,
    calculateMouseTooltipPosition
  };
};
