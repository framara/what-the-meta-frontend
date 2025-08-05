// Web Worker for fetching composition data
// This runs in the background to avoid blocking the UI

self.onmessage = async (event) => {
  const { season_id, period_id, dungeon_id, limit, apiBaseUrl } = event.data;
  
  try {
    // Build the API URL - require apiBaseUrl to be provided
    if (!apiBaseUrl) {
      throw new Error('API base URL is required');
    }
    
    let url = `${apiBaseUrl}/meta/composition-data/${season_id}`;
    
    // Add query parameters if provided
    const params = new URLSearchParams();
    if (period_id) params.append('period_id', period_id);
    if (dungeon_id) params.append('dungeon_id', dungeon_id);
    if (limit) params.append('limit', limit);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    // Fetch the composition data
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const seasonData = await response.json();
    
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