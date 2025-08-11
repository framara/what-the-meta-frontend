import React, { useState, useEffect, useRef } from 'react';
import { getMetaHealthAnalysis } from '../../services/aiService';
import AILoadingScreen from '../AILoadingScreen';
import { FilterBar } from '../FilterBar';
import { useFilterState, useFilterDispatch } from '../FilterContext';
import { WOW_SPEC_NAMES } from '../../constants/wow-constants';
import './styles/MetaHealthPage.css';
import SEO from '../SEO';
import { useSeasonLabel } from '../../hooks/useSeasonLabel';

  // Local interfaces for meta health data
  interface RoleAnalysis {
    dominantSpecs: Array<{ specId: number; usage: number; name: string }>;
    underusedSpecs: Array<{ specId: number; usage: number; name: string }>;
    healthStatus: string;
    totalRuns: number;
  }

  interface CompositionAnalysis {
    mostPopularGroup?: {
      specs: number[];
      specNames: string[];
      usage: number;
      avgLevel: number;
      count: number;
    };
    specReplacements?: {
      [specId: number]: {
        specName: string;
        role: string;
        replacements: Array<{
          specId: number;
          specName: string;
          count: number;
          avgLevel: number;
          usage: number;
          role: string;
        }>;
      };
    };
    compositionDiversity: string;
    dominantPatterns: string[];
  }

  interface MetaHealthData {
    metaSummary: {
      overallState: string;
      summary: string;
      keyInsights: string[];
    };
    roleAnalysis: {
      tank: RoleAnalysis;
      healer: RoleAnalysis;
      dps: RoleAnalysis;
    };
    compositionAnalysis: CompositionAnalysis;
    balanceIssues: Array<{
      type: string;
      description: string;
      severity: string;
    }>;
  }

export const MetaHealthPage: React.FC = () => {
  const { seasonLabel } = useSeasonLabel(useFilterState().season_id);
  const [metaHealthData, setMetaHealthData] = useState<MetaHealthData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const filter = useFilterState();
  const dispatch = useFilterDispatch();
  const completedSeasonRef = useRef<number | null>(null);
  const pendingRequestRef = useRef<Promise<any> | null>(null);

  // Load data when season changes
  useEffect(() => {
    if (!filter.season_id) {
      return;
    }

    const currentSeasonId = filter.season_id;
    let isCancelled = false;

    if (completedSeasonRef.current === currentSeasonId) {
      return;
    }

    const loadData = async () => {
      if (completedSeasonRef.current !== currentSeasonId) {
        setLoading(true);
        setError(null);
      }

      try {
        await startMetaHealthAnalysis(currentSeasonId);

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
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isCancelled = true;
    };
  }, [filter.season_id]);

  const startMetaHealthAnalysis = async (seasonId: number) => {
    const currentSeasonId = filter.season_id;
    
    if (pendingRequestRef.current) {
      try {
        const analysis = await pendingRequestRef.current;
        return analysis;
      } catch (error) {
        console.log('MetaHealthPage: Pending request failed, proceeding with new request');
      }
    }

    try {
      const requestPromise = getMetaHealthAnalysis({
        seasonId: currentSeasonId!
      });
      pendingRequestRef.current = requestPromise;
      
      const analysis = await requestPromise;

      if (filter.season_id !== currentSeasonId) {
        return;
      }

      setMetaHealthData(analysis);
      pendingRequestRef.current = null;
      completedSeasonRef.current = currentSeasonId || null;
    } catch (err) {
      console.error('MetaHealthPage: Failed to get meta health analysis:', err);
      setError('Failed to get meta health analysis');
      pendingRequestRef.current = null;
    }
  };

  const handleRefresh = () => {
    if (filter.season_id) {
      dispatch({ type: 'SET_SEASON', season_id: filter.season_id });
    }
  };

  const getStateColor = (state: string) => {
    switch (state.toLowerCase()) {
      case 'healthy':
        return '#10B981';
      case 'concerning':
        return '#F59E0B';
      case 'unhealthy':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'low':
        return '#10B981';
      case 'medium':
        return '#F59E0B';
      case 'high':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const calculateUsagePercentage = (usage: number, totalRuns: number) => {
    // The AI already returns usage as a percentage, so we just return it directly
    return usage;
  };

  return (
    <div className="mh-meta-health-page">
      <SEO
  title={`Meta Health – ${seasonLabel} – What the Meta?`}
        description="Balance snapshot of the Mythic+ meta by role, composition diversity, and dominant patterns across seasons."
        keywords={[ 'WoW','Mythic+','meta health','balance','role analysis','composition diversity','dominant patterns' ]}
        canonicalUrl="/meta-health"
        image="/og-image.jpg"
    structuredData={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: (typeof window !== 'undefined' ? window.location.origin : 'https://whatthemeta.io') + '/' },
      { '@type': 'ListItem', position: 2, name: `Meta Health (${seasonLabel})`, item: (typeof window !== 'undefined' ? window.location.origin : 'https://whatthemeta.io') + '/meta-health' }
          ]
        }}
      />
      <div className="mh-meta-health-header">
        <h1>Meta Analysis</h1>
        <p className="mh-subtitle">
          Simple insights about the current meta state
        </p>
      </div>

      <FilterBar 
        showExpansion={false}
        showPeriod={false}
        showDungeon={false}
        showLimit={false}
        className="mh-meta-health-filter"
      />

      <div className="mh-content-wrapper" style={{ position: 'relative' }}>
        {loading && (
          <div className="mh-skeleton-overlay">
            <div className="mh-skeleton">
              <div className="mh-skeleton-bar" />
              <div className="mh-skeleton-bar wide" />
              <div className="mh-skeleton-grid">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="mh-skeleton-card" />
                ))}
              </div>
            </div>
          </div>
        )}

      {error && (
        <div className="mh-error-container">
          <h2>Error Loading Meta Analysis</h2>
          <p>{error}</p>
          <button onClick={handleRefresh} className="mh-retry-button">
            Retry
          </button>
        </div>
      )}

      {metaHealthData && (
        <div className={`mh-meta-health-content ${loading ? 'mh-fade-dim' : 'mh-fade-in'}`}>
          {/* Meta Summary */}
          <div className="mh-summary-section">
            <div className="mh-summary-header">
              <h2>Meta Overview</h2>
              <div 
                className="mh-state-badge"
                style={{ backgroundColor: getStateColor(metaHealthData.metaSummary.overallState) }}
              >
                {metaHealthData.metaSummary.overallState}
              </div>
            </div>
            <p className="mh-summary-text">{metaHealthData.metaSummary.summary}</p>
            
            <div className="mh-insights-section">
              <h3>Key Insights</h3>
              <ul className="mh-insights-list">
                {metaHealthData.metaSummary.keyInsights.map((insight, index) => (
                  <li key={index} className="mh-insight-item">
                    {insight}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Role Analysis */}
          <div className="mh-roles-section">
            <h2>Role Analysis</h2>
            <div className="mh-roles-grid">
              {['tank', 'healer', 'dps'].map((role) => {
                const data = metaHealthData.roleAnalysis[role as keyof typeof metaHealthData.roleAnalysis];
                
                // Sort specs by usage descending
                const sortedDominantSpecs = [...data.dominantSpecs].sort((a, b) => b.usage - a.usage);
                const sortedUnderusedSpecs = [...data.underusedSpecs].sort((a, b) => b.usage - a.usage);
                
                return (
                  <div key={role} className="mh-role-card">
                                         <div className="mh-role-header">
                       <h3 className="mh-role-title">{role === 'dps' ? 'DPS' : role.charAt(0).toUpperCase() + role.slice(1)}</h3>
                      <div 
                        className="mh-health-badge"
                        style={{ backgroundColor: getStateColor(data.healthStatus) }}
                      >
                        {data.healthStatus}
                      </div>
                    </div>
                    
                    <div className="mh-dominant-spec">
                      <h4>Most Popular</h4>
                      <div className="mh-specs-list">
                        {sortedDominantSpecs.map((spec, index) => (
                          <div key={index} className="mh-spec-item">
                            <span className="mh-spec-name">{spec.name}</span>
                            <span className="mh-usage">
                              {calculateUsagePercentage(spec.usage, data.totalRuns).toFixed(1)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {sortedUnderusedSpecs.length > 0 && (
                      <div className="mh-underused-specs">
                        <h4>Underused Specs</h4>
                        <div className="mh-specs-list">
                          {sortedUnderusedSpecs.map((spec, index) => (
                            <div key={index} className="mh-spec-item">
                              <span className="mh-spec-name">{spec.name}</span>
                              <span className="mh-usage">
                                {calculateUsagePercentage(spec.usage, data.totalRuns).toFixed(1)}%
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Composition Analysis */}
          {metaHealthData.compositionAnalysis && (
            <div className="mh-composition-section">
              <h2>Composition Analysis</h2>
              <div className="mh-composition-content">
                <div className="mh-composition-overview">
                  <div className="mh-diversity-badge">
                    <span className="mh-diversity-label">Diversity:</span>
                    <span className={`mh-diversity-value mh-diversity-${metaHealthData.compositionAnalysis.compositionDiversity.toLowerCase()}`}>
                      {metaHealthData.compositionAnalysis.compositionDiversity}
                    </span>
                  </div>
                  
                  {metaHealthData.compositionAnalysis.dominantPatterns.length > 0 && (
                    <div className="mh-patterns-section">
                      <h3>Dominant Patterns</h3>
                      <ul className="mh-patterns-list">
                        {metaHealthData.compositionAnalysis.dominantPatterns.map((pattern, index) => (
                          <li key={index} className="mh-pattern-item">
                            {pattern}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Most Popular Group */}
                {metaHealthData.compositionAnalysis.mostPopularGroup && (
                  <div className="mh-most-popular-group">
                    <h3>Most Popular Group</h3>
                    <div className="mh-composition-card mh-popular-group-card">
                      <div className="mh-composition-header">
                        <span className="mh-composition-usage">{metaHealthData.compositionAnalysis.mostPopularGroup.usage.toFixed(1)}%</span>
                        <span className="mh-composition-count">({metaHealthData.compositionAnalysis.mostPopularGroup.count} runs)</span>
                      </div>
                      <div className="mh-composition-specs">
                        {metaHealthData.compositionAnalysis.mostPopularGroup.specNames.map((specName, specIndex) => (
                          <span key={specIndex} className="mh-composition-spec">
                            {specName}
                          </span>
                        ))}
                      </div>
                      <div className="mh-composition-level">
                        Avg Level: {metaHealthData.compositionAnalysis.mostPopularGroup.avgLevel}
                      </div>
                    </div>
                  </div>
                )}

                {/* Spec Replacements */}
                {metaHealthData.compositionAnalysis.specReplacements && (
                  <div className="mh-spec-replacements">
                    <h3>Spec Replacements</h3>
                    <div className="mh-replacements-grid">
                      {Object.entries(metaHealthData.compositionAnalysis.specReplacements).map(([specId, specData]) => (
                        <div key={specId} className="mh-replacement-card">
                          <div className="mh-replacement-header">
                            <h4 className="mh-replacement-spec">{specData.specName}</h4>
                            <span className="mh-replacement-role">{specData.role}</span>
                          </div>
                          
                          {specData.replacements.length > 0 ? (
                            <div className="mh-replacements-list">
                              <h5>Most Common Replacements:</h5>
                              {specData.replacements.map((replacement, index) => (
                                <div key={index} className="mh-replacement-item">
                                  <span className="mh-replacement-name">{replacement.specName}</span>
                                  <span className="mh-replacement-usage">{replacement.usage.toFixed(1)}%</span>
                                  <span className="mh-replacement-count">({replacement.count} runs)</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="mh-no-replacements">
                              <p>No common replacements found</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Balance Issues */}
          {metaHealthData.balanceIssues.length > 0 && (
            <div className="mh-issues-section">
              <h2>Balance Issues</h2>
              <div className="mh-issues-list">
                {metaHealthData.balanceIssues.map((issue, index) => (
                  <div key={index} className="mh-issue-card">
                    <div className="mh-issue-header">
                      <span className="mh-issue-type">{issue.type}</span>
                      <div 
                        className="mh-severity-badge"
                        style={{ backgroundColor: getSeverityColor(issue.severity) }}
                      >
                        {issue.severity}
                      </div>
                    </div>
                    <p className="mh-issue-description">{issue.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

  {!filter.season_id && !loading && !error && (
        <div className="mh-initial-state">
          <div className="mh-initial-state-content">
            <h2>Select a Season</h2>
            <p>Choose a season from the dropdown above to analyze its meta state.</p>
          </div>
        </div>
      )}
  </div>
    </div>
  );
}; 