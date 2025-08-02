// Web Worker for fetching composition data
// This runs in the background to avoid blocking the UI

self.onmessage = async (event) => {
  const { season_id, period_id, dungeon_id, limit, apiBaseUrl } = event.data;
  
  try {
    console.log(`🔄 [WORKER] Starting composition data fetch for season ${season_id}`);
    
    // Build the API URL
    const baseUrl = apiBaseUrl || 'http://localhost:3000';
    let url = `${baseUrl}/meta/composition-data/${season_id}`;
    
    // Add query parameters if provided
    const params = new URLSearchParams();
    if (period_id) params.append('period_id', period_id);
    if (dungeon_id) params.append('dungeon_id', dungeon_id);
    if (limit) params.append('limit', limit);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    console.log(`🔗 [WORKER] Fetching from URL: ${url}`);
    
    // Fetch the composition data
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const seasonData = await response.json();
    
    console.log(`✅ [WORKER] Composition data fetched successfully:`, {
      season_id: seasonData.season_id,
      total_periods: seasonData.total_periods,
      total_keys: seasonData.total_keys
    });
    
    // Send the data back to the main thread
    self.postMessage({ 
      success: true, 
      seasonData 
    });
    
  } catch (error) {
    console.error(`❌ [WORKER] Error fetching composition data:`, error);
    
    // Send error back to main thread
    self.postMessage({ 
      success: false, 
      error: error.message 
    });
  }
}; 