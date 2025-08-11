// Web Worker for fetching composition data with progress notifications
// Sends staged and, when possible, byte-level progress updates to the main thread

self.onmessage = async (event) => {
  const { season_id, period_id, dungeon_id, limit, apiBaseUrl, requestId } = event.data || {};

  const safePost = (msg) => {
    try { self.postMessage(msg); } catch (_) { /* ignore */ }
  };

  try {
    if (!apiBaseUrl) {
      throw new Error('API base URL is required');
    }

    let url = `${apiBaseUrl}/meta/composition-data/${season_id}`;

    const params = new URLSearchParams();
    if (period_id) params.append('period_id', String(period_id));
    if (dungeon_id) params.append('dungeon_id', String(dungeon_id));
    if (limit) params.append('limit', String(limit));

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    // Stage: request start
    safePost({ type: 'progress', requestId, stage: 'requesting', progress: 5 });

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const contentLengthHeader = response.headers.get('Content-Length') || response.headers.get('content-length');
    const totalBytes = contentLengthHeader ? parseInt(contentLengthHeader, 10) : undefined;

    // If stream is available, read progressively; else fallback to response.json()
    if (response.body && 'getReader' in response.body) {
      safePost({ type: 'progress', requestId, stage: 'downloading', progress: 15 });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let received = 0;
      let chunks = '';
      let lastEmit = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        received += value.byteLength;
        chunks += decoder.decode(value, { stream: true });

        // Throttle progress emits to ~10 per second
        const now = Date.now();
        if (totalBytes && now - lastEmit > 100) {
          const pct = Math.max(15, Math.min(85, Math.floor((received / totalBytes) * 70) + 15));
          safePost({ type: 'progress', requestId, stage: 'downloading', progress: pct });
          lastEmit = now;
        }
      }

      // Final decode flush
      chunks += decoder.decode();
      safePost({ type: 'progress', requestId, stage: 'parsing', progress: 90 });

      const seasonData = JSON.parse(chunks);
      safePost({ type: 'progress', requestId, stage: 'finalizing', progress: 98 });

      safePost({ success: true, requestId, seasonData });
    } else {
      // Fallback path
      safePost({ type: 'progress', requestId, stage: 'downloading', progress: 50 });
      const seasonData = await response.json();
      safePost({ type: 'progress', requestId, stage: 'finalizing', progress: 98 });
      safePost({ success: true, requestId, seasonData });
    }
  } catch (error) {
    // Propagate error
    safePost({ success: false, requestId, error: error && error.message ? error.message : String(error) });
  }
};