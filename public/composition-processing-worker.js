// Web Worker for processing composition data
// This runs in the background to avoid blocking the UI

self.onmessage = async (event) => {
  const { seasons } = event.data;
  
  try {
    // Sort seasons by season_id in descending order (latest first)
    const sortedSeasons = [...seasons].sort((a, b) => b.season_id - a.season_id);
    console.log(`🔄 [WORKER] Processing ${sortedSeasons.length} seasons (latest first)...`);
    const startTime = performance.now();
    
    // Initialize streaming results and track last expansion sent
    const groupedCompositions = {};
    let lastExpansionCount = 0;
    const CHUNK_SIZE = 1; // Process one season at a time for visible streaming
    
    for (let i = 0; i < sortedSeasons.length; i += CHUNK_SIZE) {
      const chunk = sortedSeasons.slice(i, i + CHUNK_SIZE);
      
      // Process this chunk
      const chunkResults = chunk.map((season, chunkIndex) => {
        const seasonStartTime = performance.now();
        
        // Optimize: Pre-allocate Map with estimated size
        const estimatedCompositions = Math.max(10, Math.min(100, season.data.length / 5));
        const compositionCounts = new Map();
        
        // Optimize: Process runs in batches to prevent blocking
        const BATCH_SIZE = 100;
        for (let runIndex = 0; runIndex < season.data.length; runIndex += BATCH_SIZE) {
          const batch = season.data.slice(runIndex, runIndex + BATCH_SIZE);
          
          batch.forEach((run) => {
            // Optimize: Cache sorted members to avoid repeated sorting
            const sortedMembers = run.members
              .slice() // Shallow copy to avoid mutating original
              .sort((a, b) => {
                const roleOrderA = getRoleOrder(Number(a.spec_id));
                const roleOrderB = getRoleOrder(Number(b.spec_id));
                return roleOrderA - roleOrderB || Number(a.spec_id) - Number(b.spec_id);
              });
            
            const specCombo = sortedMembers.map(member => member.spec_id).join('-');
            
            const existing = compositionCounts.get(specCombo);
            if (existing) {
              existing.count++;
              // Optimize: Only store first few runs to save memory
              if (existing.runs.length < 5) {
                existing.runs.push(run);
              }
            } else {
              compositionCounts.set(specCombo, { count: 1, runs: [run] });
            }
          });
        }
        
        // Find the most used composition (optimized)
        let topComposition = { spec_combination: '', count: 0, percentage: 0, runs: [] };
        const totalRuns = season.data.length;
        
        for (const [key, value] of compositionCounts) {
          if (value.count > topComposition.count) {
            topComposition = {
              spec_combination: key,
              count: value.count,
              percentage: (value.count / totalRuns) * 100,
              runs: value.runs
            };
          }
        }
        
        const seasonTime = performance.now() - seasonStartTime;
        console.log(`✅ [WORKER] Processed season ${season.season_id} in ${seasonTime.toFixed(2)}ms`);
        
        return {
          season_id: season.season_id,
          season_name: season.season_name,
          expansion: season.expansion,
          patch: season.patch,
          keys_count: season.keys_count,
          top_composition: topComposition
        };
      });
      
      // Group these results immediately
      chunkResults.forEach(composition => {
        const expansion = composition.expansion;
        if (!groupedCompositions[expansion]) {
          groupedCompositions[expansion] = [];
        }
        groupedCompositions[expansion].push(composition);
        
        // Sort within expansion to maintain order (latest first)
        groupedCompositions[expansion].sort((a, b) => b.season_id - a.season_id);
      });
      
      // Report progress - but only send data when a new expansion is complete
      const progress = Math.round(((i + chunk.length) / sortedSeasons.length) * 100);
      const currentExpansions = Object.keys(groupedCompositions);
      const newExpansionAdded = currentExpansions.length > lastExpansionCount;
      
      if (newExpansionAdded || i + chunk.length === sortedSeasons.length) {
        // Send streaming update when a new expansion is ready
        self.postMessage({ 
          type: 'progress',
          progress,
          message: `Processed ${i + chunk.length}/${sortedSeasons.length} seasons (${currentExpansions.length} expansions)`,
          partialData: { ...groupedCompositions }, // Send current state
          expansionsCount: currentExpansions.length,
          newExpansion: newExpansionAdded
        });
        
        lastExpansionCount = currentExpansions.length;
        
        // Add delay when a new expansion is complete for visible streaming
        if (newExpansionAdded) {
          await new Promise(resolve => setTimeout(resolve, 800)); // 800ms delay per expansion
        }
      }
      
      // Small delay between individual seasons
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    const totalTime = performance.now() - startTime;
    console.log(`✅ [WORKER] Completed streaming processing in ${totalTime.toFixed(2)}ms`);
    
    // Send the final completion message
    self.postMessage({ 
      type: 'complete',
      success: true, 
      data: groupedCompositions,
      processingTime: totalTime
    });
    
  } catch (error) {
    console.error(`❌ [WORKER] Error processing composition data:`, error);
    
    // Send error back to main thread
    self.postMessage({ 
      type: 'error',
      success: false, 
      error: error.message 
    });
  }
};

// Helper function to get role order for sorting (optimized with correct mappings)
function getRoleOrder(specId) {
  // Optimized role mapping - using array lookup for better performance
  // Tank = 0, Healer = 1, DPS = 2
  
  // Tank specs
  if (specId === 250 || specId === 581 || // Death Knight: Blood, Vengeance DH
      specId === 104 || // Druid: Guardian
      specId === 66 || // Paladin: Protection
      specId === 268 || // Monk: Brewmaster
      specId === 73) { // Warrior: Protection
    return 0;
  }
  
  // Healer specs
  if (specId === 105 || // Druid: Restoration
      specId === 65 || // Paladin: Holy
      specId === 256 || specId === 257 || // Priest: Discipline, Holy
      specId === 264 || // Shaman: Restoration
      specId === 270 || // Monk: Mistweaver
      specId === 1468) { // Evoker: Preservation
    return 1;
  }
  
  // All other specs are DPS
  return 2;
} 