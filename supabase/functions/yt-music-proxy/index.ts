import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import YouTubeMusic from 'npm:ytmusic-api';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ytmusic = new YouTubeMusic();
let isInitialized = false;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { pathname } = new URL(req.url);
    console.log(`[yt-music-proxy] Request received for: ${pathname}`);

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

      const [songResults, albumResults, artistResults] = await Promise.all([
        ytmusic.search(query, 'songs'),
        ytmusic.search(query, 'albums'),
        ytmusic.search(query, 'artists'), // Fetch artist results
      ]);

      const formattedResults: any[] = [];

      // Process song results
      songResults.forEach((item: any) => {
        const title = item.title || item.name || 'Unknown Title';
        let artist = 'Unknown Artist';
        if (item.artists && item.artists.length > 0 && item.artists[0].name) {
          artist = item.artists[0].name;
        } else if (item.artist) {
          if (typeof item.artist === 'object' && item.artist !== null && item.artist.name) {
            artist = item.artist.name;
          } else if (typeof item.artist === 'string') {
            artist = item.artist;
          }
        }
        const album = item.album ? item.album.name : undefined;
        const thumbnail = item.thumbnails && item.thumbnails.length > 0 ? item.thumbnails[item.thumbnails.length - 1].url : undefined;
        const videoId = item.videoId;
        const duration = item.duration;

        formattedResults.push({
          type: 'track',
          title,
          artist,
          album,
          thumbnail,
          videoId,
          duration,
        });
      });

      // Process album results
      albumResults.forEach((item: any) => {
        const title = item.title || item.name || 'Unknown Album';
        let artist = 'Unknown Artist';
        if (item.artists && item.artists.length > 0 && item.artists[0].name) {
          artist = item.artists[0].name;
        } else if (item.artist) {
          if (typeof item.artist === 'object' && item.artist !== null && item.artist.name) {
            artist = item.artist.name;
          } else if (typeof item.artist === 'string') {
            artist = item.artist;
          }
        }
        const thumbnail = item.thumbnails && item.thumbnails.length > 0 ? item.thumbnails[item.thumbnails.length - 1].url : undefined;
        const albumId = item.albumId; // YouTube Music specific album ID

        formattedResults.push({
          type: 'album',
          title,
          artist,
          thumbnail,
          albumId,
        });
      });

      // Process artist results
      artistResults.forEach((item: any) => {
        const name = item.title || item.name || 'Unknown Artist';
        const thumbnail = item.thumbnails && item.thumbnails.length > 0 ? item.thumbnails[item.thumbnails.length - 1].url : undefined;
        const artistId = item.artistId;

        formattedResults.push({
          type: 'artist',
          name,
          thumbnail,
          artistId,
          genre: 'Various', // Default genre for search results
        });
      });


      console.log(`[yt-music-proxy] Processed search results count: ${formattedResults.length}`);

      return new Response(JSON.stringify({ results: formattedResults }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }
    
    // New endpoint for fetching album tracks
    if (pathname.endsWith('/album-tracks')) {
      const requestBody = await req.json();
      const { albumId } = requestBody;
      console.log(`[yt-music-proxy] Fetching tracks for albumId: "${albumId}"`);

      if (!albumId) {
        return new Response(JSON.stringify({ error: 'Missing albumId' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const albumInfo = await ytmusic.getAlbum(albumId);
      const albumTracks = albumInfo.tracks || [];

      const formattedTracks = albumTracks.map((item: any) => {
        const title = item.title || item.name || 'Unknown Title';
        let artist = 'Unknown Artist';
        if (item.artists && item.artists.length > 0 && item.artists[0].name) {
          artist = item.artists[0].name;
        } else if (item.artist) {
          if (typeof item.artist === 'object' && item.artist !== null && item.artist.name) {
            artist = item.artist.name;
          } else if (typeof item.artist === 'string') {
            artist = item.artist;
          }
        }
        const album = albumInfo.title; // Use the album title from getAlbum response
        const thumbnail = albumInfo.thumbnails && albumInfo.thumbnails.length > 0 ? albumInfo.thumbnails[albumInfo.thumbnails.length - 1].url : undefined;
        const videoId = item.videoId;
        const duration = item.duration; // Duration might be available

        return {
          type: 'track',
          title,
          artist,
          album,
          thumbnail,
          videoId,
          duration,
        };
      });

      return new Response(JSON.stringify({ tracks: formattedTracks, albumTitle: albumInfo.title, albumArtist: albumInfo.artist }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // NEW: Endpoint for fetching artist details and top tracks
    if (pathname.endsWith('/artist-tracks')) {
      const requestBody = await req.json();
      const { artistId } = requestBody;
      console.log(`[yt-music-proxy] Fetching tracks for artistId: "${artistId}"`);

      if (!artistId) {
        return new Response(JSON.stringify({ error: 'Missing artistId' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const artistInfo = await ytmusic.getArtist(artistId);
      const topSongs = artistInfo.topSongs || [];

      const formattedTracks = topSongs.map((item: any) => {
        const title = item.title || item.name || 'Unknown Title';
        let artist = artistInfo.name || 'Unknown Artist'; // Use artistInfo.name for consistency
        const album = item.album ? item.album.name : undefined;
        const thumbnail = item.thumbnails && item.thumbnails.length > 0 ? item.thumbnails[item.thumbnails.length - 1].url : undefined;
        const videoId = item.videoId;
        const duration = item.duration;

        return {
          type: 'track',
          title,
          artist,
          album,
          thumbnail,
          videoId,
          duration,
        };
      });

      return new Response(JSON.stringify({
        artistName: artistInfo.name,
        artistThumbnail: artistInfo.thumbnails && artistInfo.thumbnails.length > 0 ? artistInfo.thumbnails[artistInfo.thumbnails.length - 1].url : undefined,
        tracks: formattedTracks
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // New endpoint for fetching search suggestions
    if (pathname.endsWith('/suggestions')) {
      const requestBody = await req.json();
      const query = requestBody.query;
      console.log(`[yt-music-proxy] Fetching suggestions for query: "${query}"`);

      if (!query) {
        return new Response(JSON.stringify({ error: 'Missing query for suggestions' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const suggestions = await ytmusic.getSearchSuggestions(query);
      console.log(`[yt-music-proxy] Suggestions found: ${suggestions.length}`);

      return new Response(JSON.stringify({ suggestions }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Endpoint for fetching albums (new releases or search)
    if (pathname.endsWith('/albums')) {
      const requestBody = await req.json();
      const query = requestBody.query;
      console.log(`[yt-music-proxy] Fetching albums for query: "${query || 'new releases'}"`);

      let albumResults: any[] = [];
      if (query) {
        const searchRes = await ytmusic.search(query, 'albums');
        albumResults = searchRes;
      } else {
        const newReleases = await ytmusic.search('new releases', 'albums');
        albumResults = newReleases; // Use all results from the search
      }

      const formattedAlbums = albumResults.map((item: any) => {
        const title = item.title || item.name || 'Unknown Album';
        let artist = 'Unknown Artist';
        if (item.artists && item.artists.length > 0 && item.artists[0].name) {
          artist = item.artists[0].name;
        } else if (item.artist) {
          if (typeof item.artist === 'object' && item.artist !== null && item.artist.name) {
            artist = item.artist.name;
          } else if (typeof item.artist === 'string') {
            artist = item.artist;
          }
        }
        const thumbnail = item.thumbnails && item.thumbnails.length > 0 ? item.thumbnails[item.thumbnails.length - 1].url : undefined;
        const albumId = item.albumId;

        return {
          type: 'album',
          title,
          artist,
          thumbnail,
          albumId,
        };
      }).filter(album => album.albumId); // Filter out any items that genuinely don't have an albumId

      console.log(`[yt-music-proxy] Formatted album results count: ${formattedAlbums.length}`);

      return new Response(JSON.stringify({ albums: formattedAlbums }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // NEW: Endpoint for fetching artists (simulated browse via search)
    if (pathname.endsWith('/artists')) {
      console.log(`[yt-music-proxy] Fetching popular artists.`);
      const artistResults = await ytmusic.search('popular artists', 'artists');

      const formattedArtists = artistResults.map((item: any) => {
        const name = item.title || item.name || 'Unknown Artist';
        const thumbnail = item.thumbnails && item.thumbnails.length > 0 ? item.thumbnails[item.thumbnails.length - 1].url : undefined;
        const artistId = item.artistId; // YouTube Music specific artist ID

        return {
          type: 'artist',
          name,
          thumbnail,
          artistId,
          // Genre is not directly available from this search, can be added if needed from another source
          genre: 'Various', 
        };
      });

      return new Response(JSON.stringify({ artists: formattedArtists }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // NEW: Endpoint for fetching playlists (simulated browse via search)
    if (pathname.endsWith('/playlists')) {
      console.log(`[yt-music-proxy] Fetching trending playlists.`);
      const playlistResults = await ytmusic.search('trending playlists', 'playlists');

      const formattedPlaylists = playlistResults.map((item: any) => {
        const name = item.title || item.name || 'Unknown Playlist';
        const thumbnail = item.thumbnails && item.thumbnails.length > 0 ? item.thumbnails[item.thumbnails.length - 1].url : undefined;
        const playlistId = item.playlistId; // YouTube Music specific playlist ID
        const trackCount = item.itemCount || 0; // Number of tracks in playlist

        return {
          type: 'playlist',
          name,
          thumbnail,
          playlistId,
          trackCount,
        };
      });

      return new Response(JSON.stringify({ playlists: formattedPlaylists }), {
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