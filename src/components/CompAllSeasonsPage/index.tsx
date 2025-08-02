import React, { useState, useEffect } from 'react';
import { fetchTopKeysAllSeasons } from '../../services/api';
import LoadingScreen from '../LoadingScreen';
import { WOW_SPECIALIZATIONS, WOW_CLASS_COLORS, WOW_SPEC_ROLES } from '../../constants/wow-constants';
import './styles/CompAllSeasonsPage.css';

interface GroupMember {
  character_name: string;
  class_id: number;
  spec_id: number;
  role: string;
}

interface Run {
  id: number;
  keystone_level: number;
  dungeon_id: number;
  duration_ms: number;
  members: GroupMember[];
}

interface AllSeasonsResponse {
  total_seasons: number;
  total_keys: number;
  seasons: Array<{
    season_id: number;
    season_name: string;
    expansion: string;
    patch: string;
    keys_count: number;
    data: Run[];
  }>;
}

interface SeasonComposition {
  season_id: number;
  season_name: string;
  expansion: string;
  patch: string;
  keys_count: number;
  top_composition: {
    spec_combination: string;
    count: number;
    percentage: number;
    runs: Run[];
  };
}

export const CompAllSeasonsPage: React.FC = () => {
  const [seasonsData, setSeasonsData] = useState<AllSeasonsResponse | null>(null);
  const [seasonCompositions, setSeasonCompositions] = useState<SeasonComposition[]>([]);
  const [groupedCompositions, setGroupedCompositions] = useState<{ [key: string]: SeasonComposition[] }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch and process data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        const allSeasonsResponse = await fetchTopKeysAllSeasons({
          limit: 1000 // Get enough data for analysis
        });
        
        setSeasonsData(allSeasonsResponse);
        
        // Process each season to find the most used composition
        const compositions = allSeasonsResponse.seasons.map((season: { data: Run[]; season_id: number; season_name: string; expansion: string; patch: string; keys_count: number }) => {
          const compositionCounts = new Map<string, { count: number; runs: Run[] }>();
          
          // Count compositions
          season.data.forEach((run: Run) => {
            const specCombo = run.members
              .sort((a: GroupMember, b: GroupMember) => getRoleOrder(a.spec_id) - getRoleOrder(b.spec_id) || a.spec_id - b.spec_id) // Sort by role first, then spec_id
              .map((member: GroupMember) => member.spec_id)
              .join('-');
            
            if (compositionCounts.has(specCombo)) {
              compositionCounts.get(specCombo)!.count++;
              compositionCounts.get(specCombo)!.runs.push(run);
            } else {
              compositionCounts.set(specCombo, { count: 1, runs: [run] });
            }
          });
          
          // Find the most used composition
          let topComposition = { spec_combination: '', count: 0, percentage: 0, runs: [] as Run[] };
          
          compositionCounts.forEach((value, key) => {
            const percentage = (value.count / season.data.length) * 100;
            if (value.count > topComposition.count) {
              topComposition = {
                spec_combination: key,
                count: value.count,
                percentage,
                runs: value.runs
              };
            }
          });
          
          return {
            season_id: season.season_id,
            season_name: season.season_name,
            expansion: season.expansion,
            patch: season.patch,
            keys_count: season.keys_count,
            top_composition: topComposition
          };
        });
        
                 // Group compositions by expansion
         const groupedCompositions = compositions.reduce((acc: { [key: string]: SeasonComposition[] }, composition: SeasonComposition) => {
           const expansion = composition.expansion;
           if (!acc[expansion]) {
             acc[expansion] = [];
           }
           acc[expansion].push(composition);
           return acc;
         }, {} as { [key: string]: SeasonComposition[] });

         // Sort seasons within each expansion by season_id in descending order
         Object.keys(groupedCompositions).forEach(expansion => {
           groupedCompositions[expansion].sort((a: SeasonComposition, b: SeasonComposition) => b.season_id - a.season_id);
         });
        
        setSeasonCompositions(compositions);
        setGroupedCompositions(groupedCompositions);
        setSeasonsData(allSeasonsResponse);
      } catch (err) {
        setError('Failed to load all seasons data');
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Helper function to get spec name from spec_id
  const getSpecName = (specId: number): string => {
    return WOW_SPECIALIZATIONS[specId] || `Spec ${specId}`;
  };

  // Helper function to get class color
  const getClassColor = (classId: number): string => {
    return WOW_CLASS_COLORS[classId] || '#FFFFFF';
  };

  // Helper function to get role order for sorting
  const getRoleOrder = (specId: number): number => {
    const role = WOW_SPEC_ROLES[specId];
    if (role === 'tank') return 1;
    if (role === 'healer') return 2;
    return 3; // DPS
  };

  if (error) {
    return (
      <div className="comp-all-seasons-page">
        <div className="error-container">
          <h2 className="error-title">Error Loading Data</h2>
          <p className="error-message">{error}</p>
          <button 
            className="retry-button"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="comp-all-seasons-page">
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">
            Historical Compositions
          </h1>
          <p className="page-description">
            Discover the most popular group compositions across {seasonsData?.total_seasons || 0} seasons of Mythic+ history.
          </p>
        </div>
      </div>

      {loading ? (
        <LoadingScreen />
      ) : (
                 <div className="comp-all-seasons-content">
           {Object.entries(groupedCompositions)
             .sort(([, seasonsA], [, seasonsB]) => {
               // Sort by the highest season_id in each expansion (newest first)
               const maxSeasonIdA = Math.max(...seasonsA.map(s => s.season_id));
               const maxSeasonIdB = Math.max(...seasonsB.map(s => s.season_id));
               return maxSeasonIdB - maxSeasonIdA;
             })
             .map(([expansion, seasons]) => (
             <div key={expansion} className="expansion-section">
               <h2 className="expansion-title">{expansion}</h2>
               <div className="seasons-grid">
                 {seasons.map((season) => {
                   const specIds = season.top_composition.spec_combination.split('-').map(id => parseInt(id));
                   
                   return (
                     <div key={season.season_id} className="season-card">
                       <div className="season-header">
                         <div className="season-header-top">
                           <h3 className="season-name">{season.season_name}</h3>
                           <div className="season-info">
                             <span className="patch">{season.patch}</span>
                             <span className="expansion-badge">{season.expansion}</span>
                           </div>
                         </div>
                         <div className="season-stats">
                           <div className="popularity-bar">
                             <div className="popularity-header">
                               <span className="popularity-label">Popularity</span>
                               <span className="popularity-percentage">{season.top_composition.percentage.toFixed(1)}%</span>
                             </div>
                             <div className="popularity-progress">
                               <div 
                                 className="popularity-fill" 
                                 style={{ width: `${season.top_composition.percentage}%` }}
                               />
                             </div>
                           </div>
                         </div>
                       </div>
                       
                       <div className="composition-display">
                         <h4 className="composition-title">Most Popular Composition</h4>
                         <div className="specs-grid">
                           {specIds.map((specId, index) => {
                             // Find the member with this spec_id from the first run
                             const member = season.top_composition.runs[0]?.members.find(m => m.spec_id === specId);
                             const classColor = member ? getClassColor(member.class_id) : '#FFFFFF';
                             // Check if color is light (white or yellow)
                             const isLightColor = classColor === '#FFFFFF' || classColor === '#FFF569';
                             
                             return (
                               <div 
                                 key={index} 
                                 className="spec-item"
                                 style={{ 
                                   backgroundColor: classColor
                                 }}
                               >
                                 <span 
                                   className="spec-name"
                                   style={{ 
                                     color: isLightColor ? '#000000' : '#ffffff'
                                   }}
                                 >
                                   {getSpecName(specId)}
                                 </span>
                               </div>
                             );
                           })}
                         </div>
                       </div>
                     </div>
                   );
                 })}
               </div>
             </div>
           ))}
         </div>
      )}
    </div>
  );
}; 