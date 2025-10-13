import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { corsHeaders, initializeYtmusic } from './utils.ts';
import { handleSearch } from './handlers/search.ts';
import { handleAlbumTracks } from './handlers/albumTracks.ts';
import { handleArtistTracks } from './handlers/artistTracks.ts';
import { handleSuggestions } from './handlers/suggestions.ts';
import { handleAlbums } from './handlers/albums.ts';
import { handleArtists } from './handlers/artists.ts';
import { handlePlaylists } from './handlers/playlists.ts';
import { handlePlaylistTracks } from './handlers/playlistTracks.ts';
import { handleRelatedTracks } from './handlers/relatedTracks.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { pathname } = new URL(req.url);
    console.log(`[yt-music-proxy] Request received for: ${pathname}`);

    await initializeYtmusic();

    if (pathname.endsWith('/search')) {
      return handleSearch(req);
    }
    
    if (pathname.endsWith('/album-tracks')) {
      return handleAlbumTracks(req);
    }

    if (pathname.endsWith('/artist-tracks')) {
      return handleArtistTracks(req);
    }

    if (pathname.endsWith('/suggestions')) {
      return handleSuggestions(req);
    }

    if (pathname.endsWith('/albums')) {
      return handleAlbums(req);
    }

    if (pathname.endsWith('/artists')) {
      return handleArtists(req);
    }

    if (pathname.endsWith('/playlists')) {
      return handlePlaylists(req);
    }

    if (pathname.endsWith('/playlist-tracks')) {
      return handlePlaylistTracks(req);
    }

    if (pathname.endsWith('/related-tracks')) {
      return handleRelatedTracks(req);
    }

    console.log(`[yt-music-proxy] Path not found: ${pathname}`);
    return new Response(JSON.stringify({ error: 'Not Found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('[yt-music-proxy] Error:', error.message);
    console.error('[yt-music-proxy] Stack:', error.stack);
    return new Response(JSON.stringify({ error: error.message, stack: error.stack }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});