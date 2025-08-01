declare module 'racing-bars' {
  export interface Data {
    date: string;
    value: number;
    name: string;
    color?: string;
  }

  export interface RacingBarsOptions {
    currentIndex?: number;
    height?: number;
    width?: string | number;
    barHeight?: number;
    barGap?: number;
    duration?: number;
    easing?: string;
    showValue?: boolean;
    valueFormatter?: (value: number) => string;
    onIndexChange?: (index: number) => void;
    labelsPosition?: 'inside' | 'outside';
    labelsWidth?: number;
    topN?: number;
    controlButtons?: 'none' | 'play' | 'pause' | 'play-pause';
    autorun?: boolean;
    autoplay?: boolean;
    autoplaySpeed?: number;
    dateCounter?: string;
    fixedScale?: boolean;
    fixedOrder?: boolean | string[];
    injectStyles?: boolean;
    loop?: boolean;
  }

  export function race(data: Data[], container?: string | HTMLElement, options?: Partial<RacingBarsOptions>): Promise<unknown>;
} 