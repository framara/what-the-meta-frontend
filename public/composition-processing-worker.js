// Web Worker for processing composition data
// This runs in the background to avoid blocking the UI

self.onmessage = async (event) => {
  const { seasons } = event.data;
  
  try {
    console.log(`🔄 [WORKER] Starting composition processing for ${seasons.length} seasons...`);
    
    // Process each season to find the most used composition
    const compositions = seasons.map((season) => {
      const compositionCounts = new Map();
      
      // Count compositions
      season.data.forEach((run) => {
        const specCombo = run.members
          .sort((a, b) => getRoleOrder(Number(a.spec_id)) - getRoleOrder(Number(b.spec_id)) || Number(a.spec_id) - Number(b.spec_id))
          .map((member) => member.spec_id)
          .join('-');
        
        if (compositionCounts.has(specCombo)) {
          compositionCounts.get(specCombo).count++;
          compositionCounts.get(specCombo).runs.push(run);
        } else {
          compositionCounts.set(specCombo, { count: 1, runs: [run] });
        }
      });
      
      // Find the most used composition
      let topComposition = { spec_combination: '', count: 0, percentage: 0, runs: [] };
      
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
    const groupedCompositions = compositions.reduce((acc, composition) => {
      const expansion = composition.expansion;
      if (!acc[expansion]) {
        acc[expansion] = [];
      }
      acc[expansion].push(composition);
      return acc;
    }, {});
    
    // Sort seasons within each expansion by season_id in descending order
    Object.keys(groupedCompositions).forEach(expansion => {
      groupedCompositions[expansion].sort((a, b) => b.season_id - a.season_id);
    });
    
    console.log(`✅ [WORKER] Processing completed:`, {
      total_compositions: compositions.length,
      total_expansions: Object.keys(groupedCompositions).length
    });
    
    // Send the processed data back to the main thread
    self.postMessage({ 
      success: true, 
      compositions,
      groupedCompositions
    });
    
  } catch (error) {
    console.error(`❌ [WORKER] Error processing composition data:`, error);
    
    // Send error back to main thread
    self.postMessage({ 
      success: false, 
      error: error.message 
    });
  }
};

// Helper function to get role order for sorting
function getRoleOrder(specId) {
  // This would need to be passed from the main thread or defined here
  // For now, using a simple mapping
  const roleMap = {
    // Tank specs
    250: 1, 251: 1, 252: 1, // Death Knight
    104: 1, 105: 1, 106: 1, // Druid
    66: 1, 70: 1, 73: 1,    // Paladin
    268: 1, 270: 1, 269: 1, // Monk
    263: 1, 264: 1, 262: 1, // Shaman
    73: 1, 66: 1, 70: 1,    // Warrior
    // Healer specs
    105: 2, 102: 2, 104: 2, // Druid
    65: 2, 66: 2, 70: 2,    // Paladin
    256: 2, 257: 2, 258: 2, // Priest
    264: 2, 263: 2, 262: 2, // Shaman
    270: 2, 268: 2, 269: 2, // Monk
    // DPS specs (default)
  };
  
  return roleMap[specId] || 3; // Default to DPS
} 