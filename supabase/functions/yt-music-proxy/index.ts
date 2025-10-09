import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { YouTubeMusic } from 'https://esm.sh/youtube-music-api@1.0.6';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // --- TEMPORARILY REMOVED AUTHENTICATION FOR DEVELOPMENT ---
  // For a production app, you would re-enable and properly handle authentication.
  // const supabase = createClient(
  //   Deno.env.get('SUPABASE_URL') ?? '',
  //   Deno.env.get('SUPABASE_ANON_KEY') ?? '',
  //   {
  //     global: {
  //       headers: { Authorization: req.headers.get('Authorization')! },
  //     },
  //   }
  // );

  // const authHeader = req.headers.get('Authorization');
  // if (!authHeader) {
  //   return new Response(JSON.stringify({ error: 'Unauthorized' }), {
  //     status: 401,
  //     headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  //   });
  // }

  // const { data: { user } } = await supabase.auth.getUser();
  // if (!user) {
  //   return new Response(JSON.stringify({ error: 'Unauthorized: Invalid user session' }), {
  //     status: 401,
  //     headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  //   });
  // }
  // --- END TEMPORARY REMOVAL ---

  try {
    const { pathname, searchParams } = new URL(req.url);
    const ytMusic = new YouTubeMusic();
    await ytMusic.initialize();

    if (pathname.endsWith('/search')) {
      // The body for invoke is passed as a JSON object, so we need to parse it
      const requestBody = await req.json();
      const query = requestBody.query;

      if (!query) {
        return new Response(JSON.stringify({ error: 'Missing search query' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const results = await ytMusic.search(query);
      return new Response(JSON.stringify(results), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    } 

    return new Response(JSON.stringify({ error: 'Not Found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in yt-music-proxy:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});