import React, { useState, useEffect, useRef } from 'react';
import { getMetaHealthAnalysis } from '../../services/aiService';
import AILoadingScreen from '../AILoadingScreen';
import { FilterBar } from '../FilterBar';
import { useFilterState, useFilterDispatch } from '../FilterContext';
import { MetaHealthDashboard } from './components/MetaHealthDashboard';
import { RoleHealthAnalysis } from './components/RoleHealthAnalysis';
import { CompositionHealthAnalysis } from './components/CompositionHealthAnalysis';
import { TemporalAnalysis } from './components/TemporalAnalysis';
import { MetaHealthInsights } from './components/MetaHealthInsights';
import './styles/MetaHealthPage.css';

interface MetaHealthData {
  metaHealth: {
    overallScore: number;
    diversityScore: number;
    balanceScore: number;
    compositionHealth: number;
    trends: {
      improving: boolean;
      diversityTrend: string;
      balanceTrend: string;
    };
  };
  roleAnalysis: {
    tank: RoleAnalysis;
    healer: RoleAnalysis;
    dps: RoleAnalysis;
  };
  compositionAnalysis: {
    totalCompositions: number;
    dominantComposition: {
      specs: number[];
      usage: number;
      healthStatus: string;
    };
    compositionDiversity: number;
    flexibility: {
      highFlexibility: string[];
      lowFlexibility: string[];
      recommendations: string[];
    };
  };
  temporalAnalysis: {
    seasonStartDiversity: number;
    currentDiversity: number;
    diversityChange: number;
    dramaticChanges: Array<{
      week: number;
      description: string;
      impact: string;
    }>;
    seasonEvolution: {
      startState: string;
      currentState: string;
      keyChanges: string[];
    };
  };
  aiInsights: string[];
  recommendations: string[];
}

interface RoleAnalysis {
  viableSpecs: number;
  dominanceScore: number;
  topSpec: { specId: number; usage: number };
  healthStatus: string;
  recommendations: string[];
}

export const MetaHealthPage: React.FC = () => {
  const [metaHealthData, setMetaHealthData] = useState<MetaHealthData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const filter = useFilterState();
  const dispatch = useFilterDispatch();
  const completedSeasonRef = useRef<number | null>(null);
  const pendingRequestRef = useRef<Promise<any> | null>(null);

  console.log('MetaHealthPage: Component rendered', {
    loading,
    error,
    currentSeasonId: filter.season_id,
    hasMetaHealthData: !!metaHealthData
  });

  // Load data when season changes
  useEffect(() => {
    console.log('MetaHealthPage: Season changed, currentSeasonId:', filter.season_id);
    if (!filter.season_id) {
      console.log('MetaHealthPage: No currentSeasonId, skipping loadData');
      return;
    }

    const currentSeasonId = filter.season_id;
    let isCancelled = false;

    // Check if we've already completed this season
    if (completedSeasonRef.current === currentSeasonId) {
      console.log('MetaHealthPage: Season already completed, skipping loadData');
      return;
    }

    const loadData = async () => {
      console.log('MetaHealthPage: Starting loadData for season:', currentSeasonId);
      
      // Only set loading if we haven't completed this season yet
      if (completedSeasonRef.current !== currentSeasonId) {
        setLoading(true);
        setError(null);
      }

      try {
        console.log('MetaHealthPage: Starting meta health analysis...');
        await startMetaHealthAnalysis(currentSeasonId);

        // Mark this season as completed after analysis finishes
        if (!isCancelled) {
          completedSeasonRef.current = currentSeasonId;
        }

      } catch (err) {
        if (!isCancelled) {
          console.error('MetaHealthPage: Failed to load meta health data:', err);
          setError('Failed to load meta health data');
        }
      } finally {
        if (!isCancelled) {
          console.log('MetaHealthPage: loadData completed, setting loading to false');
          setLoading(false);
        }
      }
    };

    loadData();

    // Cleanup function to handle React StrictMode double-invocation
    return () => {
      console.log('MetaHealthPage: Effect cleanup - cancelling loadData');
      isCancelled = true;
    };
  }, [filter.season_id]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('MetaHealthPage: Component unmounting');
    };
  }, []);

  const startMetaHealthAnalysis = async (seasonId: number) => {
    const currentSeasonId = filter.season_id;
    
    console.log('MetaHealthPage: startMetaHealthAnalysis called', {
      seasonId: currentSeasonId
    });

    // Check if there's already a pending request for this season
    if (pendingRequestRef.current) {
      console.log('MetaHealthPage: Request already in progress, waiting for completion');
      try {
        const analysis = await pendingRequestRef.current;
        return analysis;
      } catch (error) {
        console.log('MetaHealthPage: Pending request failed, proceeding with new request');
      }
    }

    try {
      console.log('MetaHealthPage: Calling getMetaHealthAnalysis...');
      
      // Create the request and store it in the ref
      const requestPromise = getMetaHealthAnalysis({
        seasonId: currentSeasonId!
      });
      pendingRequestRef.current = requestPromise;
      
      const analysis = await requestPromise;

      // Check if we're still on the same season
      if (filter.season_id !== currentSeasonId) {
        console.log('MetaHealthPage: Season changed during analysis, skipping state updates');
        return;
      }

      console.log('MetaHealthPage: Meta health analysis completed successfully', {
        analysisKeys: Object.keys(analysis || {}),
        hasMetaHealth: !!analysis?.metaHealth,
        hasRoleAnalysis: !!analysis?.roleAnalysis,
        hasCompositionAnalysis: !!analysis?.compositionAnalysis,
        hasTemporalAnalysis: !!analysis?.temporalAnalysis
      });

      setMetaHealthData(analysis);
      
      // Clear the pending request ref
      pendingRequestRef.current = null;
      
      // Mark this season as completed AFTER setting the data
      completedSeasonRef.current = currentSeasonId || null;
    } catch (err) {
      console.error('MetaHealthPage: Failed to get meta health analysis:', err);
      setError('Failed to get meta health analysis');
      
      // Clear the pending request ref on error
      pendingRequestRef.current = null;
    }
  };

  const handleRefresh = () => {
    console.log('MetaHealthPage: Refresh requested');
    if (filter.season_id) {
      // Trigger a refresh by dispatching the same season ID
      // This will cause the useEffect to run again
      dispatch({ type: 'SET_SEASON', season_id: filter.season_id });
    }
  };

  console.log('MetaHealthPage: Render state', {
    loading,
    error,
    hasMetaHealthData: !!metaHealthData,
    currentSeasonId: filter.season_id
  });

  return (
    <div className="mh-meta-health-page">
      <div className="mh-meta-health-header">
        <h1>Meta Health Monitor</h1>
        <p className="mh-subtitle">
          AI-powered analysis of meta diversity, balance, and composition health
        </p>
      </div>

      <FilterBar 
        showExpansion={false}
        showPeriod={false}
        showDungeon={false}
        showLimit={false}
        className="mh-meta-health-filter"
      />

      {/* Show loading when season is selected and data is being fetched */}
      {loading && (
        <div className="mh-data-loading-section">
          <AILoadingScreen />
        </div>
      )}

      {/* Show error if data loading failed */}
      {error && (
        <div className="mh-error-container">
          <h2>Error Loading Meta Health Data</h2>
          <p>{error}</p>
          <button onClick={handleRefresh} className="mh-retry-button">
            Retry
          </button>
        </div>
      )}

      {/* Show analysis results when data is available */}
      {metaHealthData && !loading && (
        <div className="mh-meta-health-content">
          <MetaHealthDashboard metaHealth={metaHealthData.metaHealth} />
          
          <div className="mh-analysis-sections">
            <RoleHealthAnalysis roleAnalysis={metaHealthData.roleAnalysis} />
            <CompositionHealthAnalysis compositionAnalysis={metaHealthData.compositionAnalysis} />
            <TemporalAnalysis temporalAnalysis={metaHealthData.temporalAnalysis} />
            <MetaHealthInsights 
              insights={metaHealthData.aiInsights}
              recommendations={metaHealthData.recommendations}
            />
          </div>
        </div>
      )}

      {/* Show initial state when no season is selected */}
      {!filter.season_id && !loading && !error && (
        <div className="mh-initial-state">
          <div className="mh-initial-state-content">
            <h2>Select a Season</h2>
            <p>Choose a season from the dropdown above to analyze its meta health and diversity.</p>
          </div>
        </div>
      )}
    </div>
  );
}; 