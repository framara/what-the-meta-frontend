import React, { createContext, useReducer, useContext } from 'react';
import type { ReactNode, Dispatch } from 'react';

// Filter state type
export interface FilterState {
  season_id: number;
  period_id?: number;
  dungeon_id?: number;
  limit: number;
}

// Actions
export type FilterAction =
  | { type: 'SET_SEASON'; season_id: number }
  | { type: 'SET_PERIOD'; period_id?: number }
  | { type: 'SET_DUNGEON'; dungeon_id?: number }
  | { type: 'SET_LIMIT'; limit: number };

// Reducer
function filterReducer(state: FilterState, action: FilterAction): FilterState {
  switch (action.type) {
    case 'SET_SEASON':
      return { 
        ...state, 
        season_id: action.season_id,
        period_id: undefined,  // Reset period when season changes
        dungeon_id: undefined  // Reset dungeon when season changes
      };
    case 'SET_PERIOD':
      return { ...state, period_id: action.period_id };
    case 'SET_DUNGEON':
      return { ...state, dungeon_id: action.dungeon_id };
    case 'SET_LIMIT':
      return { ...state, limit: action.limit };
    default:
      return state;
  }
}

// Context
const FilterStateContext = createContext<FilterState | undefined>(undefined);
const FilterDispatchContext = createContext<Dispatch<FilterAction> | undefined>(undefined);

// Provider
export const FilterProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(filterReducer, { season_id: 14, limit: 1000 });
  return (
    <FilterStateContext.Provider value={state}>
      <FilterDispatchContext.Provider value={dispatch}>
        {children}
      </FilterDispatchContext.Provider>
    </FilterStateContext.Provider>
  );
};

// Custom hooks
export function useFilterState() {
  const context = useContext(FilterStateContext);
  if (context === undefined) {
    throw new Error('useFilterState must be used within a FilterProvider');
  }
  return context;
}

export function useFilterDispatch() {
  const context = useContext(FilterDispatchContext);
  if (context === undefined) {
    throw new Error('useFilterDispatch must be used within a FilterProvider');
  }
  return context;
}