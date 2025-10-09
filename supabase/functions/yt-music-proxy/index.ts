import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import YouTubeMusic from 'https://esm.sh/youtube-music-api@1.0.6';

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

      const ytMusic = new YouTubeMusic();
      console.log('[yt-music-proxy] YouTubeMusic API instantiated.');
      console.log('[yt-music-proxy] Type of ytMusic:', typeof ytMusic);
      console.log('[yt-music-proxy] ytMusic object keys:', Object.keys(ytMusic));
      // console.log('[yt-music-proxy] Full ytMusic object (may be verbose):', ytMusic); // Uncomment for very detailed debugging if needed

      console.log('[yt-music-proxy] Attempting to call ytMusic.search...');
      const results = await ytMusic.search(query);
      console.log(`[yt-music-proxy] Search results obtained: ${JSON.stringify(results).substring(0, 200)}...`); // Log first 200 chars

      return new Response(JSON.stringify(results), {
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
    console.error('[yt-music-proxy] Stack:', error.stack); // Log the stack trace
    return new Response(JSON.stringify({ error: error.message, stack: error.stack }), { // Return stack trace in response
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});