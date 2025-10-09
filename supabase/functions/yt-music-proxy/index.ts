import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
// Removed YouTubeMusic import as it's incompatible with Deno runtime

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { pathname } = new URL(req.url);
    console.log(`[yt-music-proxy] Request received for: ${pathname}`);

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

      // Retrieve YouTube API Key from environment variables
      const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY');

      if (!YOUTUBE_API_KEY) {
        console.error('[yt-music-proxy] YOUTUBE_API_KEY is not set in environment variables.');
        return new Response(JSON.stringify({ error: 'YouTube API Key not configured.' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Construct the YouTube Data API v3 search URL
      const youtubeSearchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&videoCategoryId=10&key=${YOUTUBE_API_KEY}`;
      console.log(`[yt-music-proxy] Calling YouTube Data API: ${youtubeSearchUrl}`);

      const youtubeResponse = await fetch(youtubeSearchUrl);
      const youtubeData = await youtubeResponse.json();

      if (!youtubeResponse.ok) {
        console.error('[yt-music-proxy] YouTube API Error:', youtubeData);
        return new Response(JSON.stringify({ error: 'YouTube API Error', details: youtubeData }), {
          status: youtubeResponse.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Process YouTube Data API results to match expected format
      const tracks = youtubeData.items.map((item: any) => ({
        title: item.snippet.title,
        artist: item.snippet.channelTitle, // YouTube channel is often the artist for music videos
        album: undefined, // YouTube Data API doesn't directly provide album info in search results
        thumbnail: item.snippet.thumbnails.default.url, // Add thumbnail for display
        videoId: item.id.videoId, // Add video ID for potential playback
      }));

      console.log(`[yt-music-proxy] Processed search results: ${JSON.stringify(tracks).substring(0, 200)}...`);

      return new Response(JSON.stringify({ tracks }), { // Wrap in 'tracks' object to match previous structure
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