import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import YouTubeMusic from 'npm:ytmusic-api'; // Corrected import: YouTubeMusic is likely the default export

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize YouTubeMusic client outside the serve function to reuse it
const ytmusic = new YouTubeMusic();
let isInitialized = false;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { pathname } = new URL(req.url);
    console.log(`[yt-music-proxy] Request received for: ${pathname}`);

    // Initialize ytmusic-api if not already initialized
    if (!isInitialized) {
      await ytmusic.initialize();
      isInitialized = true;
      console.log('[yt-music-proxy] YouTubeMusic API initialized.');
    }

    if (pathname.endsWith('/search')) {
      const requestBody = await req.json();
      const query = requestBody.query;
      console.log(`[yt-music-proxy] Search query: "${query}"`);

      if (!query) {
        console.log('[yt-music-proxy] Missing search query');
        return new Response(JSON.stringify({ error: 'Missing search query' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Use ytmusic-api to search for songs
      const searchResults = await ytmusic.search(query, 'songs');
      console.log(`[yt-music-proxy] Raw search results count: ${searchResults.length}`);

      // Process ytmusic-api results to match expected format
      const tracks = searchResults.map((item: any) => {
        console.log(`[yt-music-proxy] Processing item: ${JSON.stringify(item).substring(0, 200)}...`); // Log raw item for debugging

        const title = item.title || item.name || 'Unknown Title'; // More robust title check
        let artist = 'Unknown Artist';
        if (item.artists && item.artists.length > 0 && item.artists[0].name) {
          artist = item.artists[0].name;
        } else if (item.artist) { // Sometimes artist might be a top-level string
          artist = item.artist;
        }

        const album = item.album ? item.album.name : undefined;
        const thumbnail = item.thumbnails && item.thumbnails.length > 0 ? item.thumbnails[item.thumbnails.length - 1].url : undefined;
        const videoId = item.videoId;

        return {
          title,
          artist,
          album,
          thumbnail,
          videoId,
        };
      });

      console.log(`[yt-music-proxy] Processed search results: ${JSON.stringify(tracks).substring(0, 200)}...`);

      return new Response(JSON.stringify({ tracks }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    console.log(`[yt-music-proxy] Path not found: ${pathname}`);
    return new Response(JSON.stringify({ error: 'Not Found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[yt-music-proxy] Error:', error.message);
    console.error('[yt-music-proxy] Stack:', error.stack);
    return new Response(JSON.stringify({ error: error.message, stack: error.stack }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});