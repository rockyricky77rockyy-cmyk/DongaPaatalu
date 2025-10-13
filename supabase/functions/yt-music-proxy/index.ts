import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import YouTubeMusic from 'npm:ytmusic-api';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ytmusic = new YouTubeMusic();
let isInitialized = false;

// Helper function to safely extract artist name
function getArtistName(artistData: any): string {
  if (typeof artistData === 'string') {
    return artistData;
  }
  if (typeof artistData === 'object' && artistData !== null && artistData.name) {
    return artistData.name;
  }
  if (Array.isArray(artistData) && artistData.length > 0 && artistData[0].name) {
    return artistData[0].name;
  }
  return 'Unknown Artist';
}

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
        const videoId = item.videoId;
        if (!videoId) { // Only include tracks that have a videoId
          console.log(`[yt-music-proxy] Skipping track "${item.title}" due to missing videoId.`);
          return;
        }
        const title = item.title || item.name || 'Unknown Title';
        const artist = getArtistName(item.artists || item.artist);
        const album = item.album ? item.album.name : undefined;
        const thumbnail = item.thumbnails && item.thumbnails.length > 0 ? item.thumbnails[item.thumbnails.length - 1].url : undefined;
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
        const artist = getArtistName(item.artists || item.artist);
        const thumbnail = item.thumbnails && item.thumbnails.length > 0 ? item.thumbnails[item.thumbnails.length - 1].url : undefined;
        const albumId = item.albumId; // YouTube Music specific album ID

        if (!albumId) {
          console.warn(`[yt-music-proxy] Skipping album "${title}" due to missing albumId in search results.`);
          return;
        }

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
      console.log(`[yt-music-proxy] Fetching tracks for albumId: "${albumId}" (type: ${typeof albumId})`); // Added type log

      // Ensure albumId is a non-empty string
      if (!albumId || typeof albumId !== 'string' || albumId.trim() === '') {
        console.error('[yt-music-proxy] Missing or invalid albumId for /album-tracks');
        return new Response(JSON.stringify({ error: 'Missing or invalid albumId' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      let albumInfo;
      try {
        albumInfo = await ytmusic.getAlbum(albumId);
        console.log(`[yt-music-proxy] RAW albumInfo for ${albumId}:`, JSON.stringify(albumInfo, null, 2)); // Log full raw albumInfo
      } catch (ytError: any) {
        console.error(`[yt-music-proxy] Error fetching album ${albumId}:`, ytError.message);
        return new Response(JSON.stringify({ error: `Album not found or inaccessible: ${ytError.message}` }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      const albumTracksRaw = albumInfo.songs || []; 
      console.log(`[yt-music-proxy] RAW albumTracks count for ${albumId}: ${albumTracksRaw.length}`);
      console.log(`[yt-music-proxy] First 5 RAW albumTracks for ${albumId}:`, JSON.stringify(albumTracksRaw.slice(0, 5), null, 2));

      const albumThumbnail = albumInfo.thumbnails && albumInfo.thumbnails.length > 0 ? albumInfo.thumbnails[albumInfo.thumbnails.length - 1].url : undefined;

      let formattedTracks = albumTracksRaw.map((item: any) => {
        // Enhanced videoId extraction logic
        let videoId = item.videoId;
        if (!videoId && item.setVideoId) {
          videoId = item.setVideoId;
        }
        if (!videoId && item.playlistSetVideoId) {
          videoId = item.playlistSetVideoId;
        }
        if (!videoId && item.feedbackTokens?.add) {
          videoId = item.feedbackTokens.add;
        }
        if (!videoId && item.feedbackTokens?.remove) {
          videoId = item.feedbackTokens.remove;
        }
        if (!videoId && item.video?.videoId) { // Check for nested video object
          videoId = item.video.videoId;
        }
        // NEW: Check for content.videoId if it's a more complex object
        if (!videoId && item.content?.videoId) {
          videoId = item.content.videoId;
        }


        console.log(`[yt-music-proxy] Processing album track "${item.title}" (extracted videoId: ${videoId})`); // Added log for each item
        if (!videoId) { // Only include tracks that have a videoId
          console.log(`[yt-music-proxy] Skipping album track "${item.title}" due to missing videoId after exhaustive check.`);
          return null; // Return null for unplayable tracks
        }
        const title = item.title || item.name || 'Unknown Title';
        const artist = getArtistName(item.artists || item.artist || albumInfo.artist); // Fallback to album's artist
        const album = albumInfo.title; // Use the album title from getAlbum response
        const thumbnail = item.thumbnails && item.thumbnails.length > 0 ? item.thumbnails[item.thumbnails.length - 1].url : albumThumbnail; // Use track thumbnail or album thumbnail
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
      }).filter(Boolean); // Filter out null entries
      console.log(`[yt-music-proxy] Formatted album tracks count from getAlbum for ${albumId}: ${formattedTracks.length}`);

      // Fallback search if no playable tracks found directly from the album
      if (formattedTracks.length === 0 && albumInfo.title && albumInfo.artist) {
        console.log(`[yt-music-proxy] No direct playable tracks found for album "${albumInfo.title}". Attempting fallback search.`);
        const fallbackQuery = `${albumInfo.title} by ${getArtistName(albumInfo.artist)} songs`;
        console.log(`[yt-music-proxy] Fallback search query: "${fallbackQuery}"`);
        const fallbackSearchResults = await ytmusic.search(fallbackQuery, 'songs');
        console.log(`[yt-music-proxy] RAW fallbackSearchResults count: ${fallbackSearchResults.length}`);
        console.log(`[yt-music-proxy] First 5 RAW fallbackSearchResults:`, JSON.stringify(fallbackSearchResults.slice(0, 5), null, 2));


        fallbackSearchResults.forEach((item: any) => {
          const videoId = item.videoId;
          if (!videoId) {
            console.log(`[yt-music-proxy] Skipping fallback track "${item.title}" due to missing videoId.`);
            return;
          }
          const title = item.title || item.name || 'Unknown Title';
          const artist = getArtistName(item.artists || item.artist);
          const album = item.album ? item.album.name : undefined;
          const thumbnail = item.thumbnails && item.thumbnails.length > 0 ? item.thumbnails[item.thumbnails.length - 1].url : undefined;
          const duration = item.duration;

          formattedTracks.push({
            type: 'track',
            title,
            artist,
            album,
            thumbnail,
            videoId,
            duration,
          });
        });
        console.log(`[yt-music-proxy] Total formatted tracks after fallback search: ${formattedTracks.length}`);
      }


      return new Response(JSON.stringify({ 
        tracks: formattedTracks, 
        albumTitle: albumInfo.title, 
        albumArtist: getArtistName(albumInfo.artist), // Use helper for albumArtist
        albumThumbnail: albumThumbnail, // Explicitly return album thumbnail
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // NEW: Endpoint for fetching artist details and top tracks
    if (pathname.endsWith('/artist-tracks')) {
      const requestBody = await req.json();
      const { artistId } = requestBody;
      console.log(`[yt-music-proxy] Received artistId for /artist-tracks: "${artistId}" (type: ${typeof artistId})`); // Added log here

      if (!artistId || artistId === 'undefined') { // Added check for 'undefined' string
        console.error('[yt-music-proxy] Missing or invalid artistId for /artist-tracks');
        return new Response(JSON.stringify({ error: 'Missing or invalid artistId' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      let artistInfo;
      try {
        console.log(`[yt-music-proxy] Calling ytmusic.getArtist with ID: "${artistId}"`); // Added log before API call
        artistInfo = await ytmusic.getArtist(artistId);
        console.log(`[yt-music-proxy] Raw artistInfo for ${artistId}:`, JSON.stringify(artistInfo, null, 2)); // Log full raw artistInfo
      } catch (ytError: any) {
        console.error(`[yt-music-proxy] Error fetching artist ${artistId}:`, ytError.message);
        return new Response(JSON.stringify({ error: `Artist not found or inaccessible: ${ytError.message}` }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const topSongs = artistInfo.topSongs || [];
      console.log(`[yt-music-proxy] RAW topSongs count for ${artistId}: ${topSongs.length}`);
      console.log(`[yt-music-proxy] First 3 RAW topSongs for ${artistId}:`, JSON.stringify(topSongs.slice(0, 3), null, 2));


      const formattedTracks = topSongs.map((item: any) => {
        const videoId = item.videoId;
        if (!videoId) { // Only include tracks that have a videoId
          console.log(`[yt-music-proxy] Skipping artist track "${item.title}" due to missing videoId.`);
          return null; // Return null for unplayable tracks
        }
        const title = item.title || item.name || 'Unknown Title';
        const artist = getArtistName(artistInfo.name); // Use helper for artist name
        const album = item.album ? item.album.name : undefined;
        const thumbnail = item.thumbnails && item.thumbnails.length > 0 ? item.thumbnails[item.thumbnails.length - 1].url : undefined;
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
      }).filter(Boolean); // Filter out null entries
      console.log(`[yt-music-proxy] Formatted artist tracks count for ${artistId}: ${formattedTracks.length}`);


      return new Response(JSON.stringify({
        artistName: getArtistName(artistInfo.name), // Use helper for artistName
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
      const query = requestBody.query; // Allow custom query, default to 'popular albums'
      console.log(`[yt-music-proxy] Fetching albums for query: "${query || 'popular albums'}"`);

      let albumResults: any[] = [];
      if (query) {
        const searchRes = await ytmusic.search(query, 'albums');
        albumResults = searchRes;
      } else {
        const popularAlbums = await ytmusic.search('popular albums', 'albums'); // Default to popular albums
        albumResults = popularAlbums;
      }

      const formattedAlbums = albumResults.map((item: any) => {
        const title = item.title || item.name || 'Unknown Album';
        const artist = getArtistName(item.artists || item.artist);
        const thumbnail = item.thumbnails && item.thumbnails.length > 0 ? item.thumbnails[item.thumbnails.length - 1].url : undefined;
        const albumId = item.albumId;

        if (!albumId) {
          console.warn(`[yt-music-proxy] Skipping album "${title}" due to missing albumId.`);
          return null; // Filter out albums without a valid ID
        }

        return {
          type: 'album',
          title,
          artist,
          thumbnail,
          albumId,
        };
      }).filter(Boolean); // Filter out any items that genuinely don't have an albumId

      console.log(`[yt-music-proxy] Formatted album results count: ${formattedAlbums.length}`);

      return new Response(JSON.stringify({ albums: formattedAlbums }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // NEW: Endpoint for fetching artists (simulated browse via search)
    if (pathname.endsWith('/artists')) {
      const requestBody = await req.json();
      const query = requestBody.query; // Allow custom query, default to 'popular artists'
      console.log(`[yt-music-proxy] Fetching artists for query: "${query || 'popular artists'}"`);

      let artistResults: any[] = [];
      if (query) {
        const searchRes = await ytmusic.search(query, 'artists');
        artistResults = searchRes;
      } else {
        const popularArtists = await ytmusic.search('popular artists', 'artists'); // Default to popular artists
        artistResults = popularArtists;
      }

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
      const requestBody = await req.json();
      const query = requestBody.query; // Allow custom query, default to 'trending playlists'
      console.log(`[yt-music-proxy] Fetching trending playlists for query: "${query || 'trending playlists'}"`);
      
      let playlistResults: any[] = [];
      if (query) {
        const searchRes = await ytmusic.search(query, 'playlists');
        playlistResults = searchRes;
      } else {
        const trendingPlaylists = await ytmusic.search('popular playlists', 'playlists'); // Changed to 'popular playlists' for potentially better results
        playlistResults = trendingPlaylists;
      }

      const formattedPlaylists = playlistResults.map((item: any) => {
        const name = item.title || item.name || 'Unknown Playlist';
        const thumbnail = item.thumbnails && item.thumbnails.length > 0 ? item.thumbnails[item.thumbnails.length - 1].url : undefined;
        const playlistId = item.playlistId; // YouTube Music specific playlist ID
        // Removed trackCount from here as it's not reliably available in search results

        console.log(`[yt-music-proxy] Initial playlist search result: "${name}" (ID: ${playlistId}), raw itemCount: ${item.itemCount || 'N/A'}`); // Added log for initial search

        if (!playlistId) {
          console.warn(`[yt-music-proxy] Skipping playlist "${name}" due to missing playlistId.`);
          return null; // Filter out playlists without a valid ID
        }

        return {
          type: 'playlist',
          name,
          thumbnail,
          playlistId,
        };
      }).filter(Boolean); // Filter out null entries

      console.log(`[yt-music-proxy] Formatted playlist results count: ${formattedPlaylists.length}`);

      return new Response(JSON.stringify({ playlists: formattedPlaylists }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // NEW: Endpoint for fetching playlist tracks
    if (pathname.endsWith('/playlist-tracks')) {
      const requestBody = await req.json();
      const { playlistId } = requestBody;
      console.log(`[yt-music-proxy] Received playlistId for /playlist-tracks: "${playlistId}" (type: ${typeof playlistId})`); // Added log here

      if (!playlistId || typeof playlistId !== 'string' || playlistId.trim() === '' || playlistId === 'undefined') { // Added check for 'undefined' string
        console.error('[yt-music-proxy] Missing or invalid playlistId for /playlist-tracks');
        return new Response(JSON.stringify({ error: 'Missing or invalid playlistId' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      let playlistInfo;
      try {
        console.log(`[yt-music-proxy] Calling ytmusic.getPlaylist with ID: "${playlistId}"`); // Added log before API call
        playlistInfo = await ytmusic.getPlaylist(playlistId);
        console.log(`[yt-music-proxy] Raw playlistInfo for ${playlistId}:`, JSON.stringify(playlistInfo, null, 2));
      } catch (ytError: any) {
        console.error(`[yt-music-proxy] Error fetching playlist ${playlistId}:`, ytError.message);
        let statusCode = 500; // Default to internal server error
        let errorMessage = `Error fetching playlist: ${ytError.message}`;

        // Attempt to parse status code from error message if it's a string
        if (typeof ytError.message === 'string' && ytError.message.includes('status code')) {
          const match = ytError.message.match(/status code (\d{3})/);
          if (match && match[1]) {
            statusCode = parseInt(match[1], 10);
          }
        } else if (ytError.statusCode) { // If the error object itself has a statusCode
            statusCode = ytError.statusCode;
        }

        // Specific handling for 400 and 404
        if (statusCode === 400) {
            errorMessage = `Invalid playlist ID or bad request: ${ytError.message}`;
        } else if (statusCode === 404) {
            errorMessage = `Playlist not found or inaccessible: ${ytError.message}`;
        }

        return new Response(JSON.stringify({ error: errorMessage }), {
          status: statusCode,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      const playlistTracks = playlistInfo.tracks || [];
      console.log(`[yt-music-proxy] Raw playlistTracks count for ${playlistId}: ${playlistTracks.length}`);
      console.log(`[yt-music-proxy] First 3 raw playlistTracks for ${playlistId}:`, JSON.stringify(playlistTracks.slice(0, 3), null, 2));

      const playlistThumbnail = playlistInfo.thumbnails && playlistInfo.thumbnails.length > 0 ? playlistInfo.thumbnails[playlistInfo.thumbnails.length - 1].url : undefined;


      const formattedTracks = playlistTracks.map((item: any) => {
        // Enhanced videoId extraction logic for playlist tracks
        let videoId = item.videoId;
        if (!videoId && item.setVideoId) {
          videoId = item.setVideoId;
        }
        if (!videoId && item.playlistSetVideoId) {
          videoId = item.playlistSetVideoId;
        }
        if (!videoId && item.feedbackTokens?.add) {
          videoId = item.feedbackTokens.add;
        }
        if (!videoId && item.feedbackTokens?.remove) {
          videoId = item.feedbackTokens.remove;
        }
        if (!videoId && item.video?.videoId) { // Check for nested video object
          videoId = item.video.videoId;
        }
        // NEW: Check for content.videoId if it's a more complex object
        if (!videoId && item.content?.videoId) {
          videoId = item.content.videoId;
        }

        console.log(`[yt-music-proxy] Processing playlist track "${item.title}" (extracted videoId: ${videoId})`); // Added log
        if (!videoId) {
          console.log(`[yt-music-proxy] Skipping playlist track "${item.title}" due to missing videoId.`);
          return null;
        }
        const title = item.title || item.name || 'Unknown Title';
        const artist = getArtistName(item.artists || item.artist || playlistInfo.author); // Fallback to playlist's author
        const album = item.album ? item.album.name : undefined;
        const thumbnail = item.thumbnails && item.thumbnails.length > 0 ? item.thumbnails[item.thumbnails.length - 1].url : playlistThumbnail; // Use track thumbnail or playlist thumbnail
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
      }).filter(Boolean);
      console.log(`[yt-music-proxy] Formatted playlist tracks count for ${playlistId}: ${formattedTracks.length}`);


      return new Response(JSON.stringify({
        tracks: formattedTracks,
        playlistName: playlistInfo.title,
        playlistThumbnail: playlistThumbnail, // Explicitly return playlist thumbnail
        trackCount: playlistInfo.itemCount || 0,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // NEW: Endpoint for fetching related tracks
    if (pathname.endsWith('/related-tracks')) {
      const requestBody = await req.json();
      const { videoId, artist, album } = requestBody;
      console.log(`[yt-music-proxy] Fetching related tracks for videoId: "${videoId}", artist: "${artist}", album: "${album}"`);

      let relatedResults: any[] = [];

      // Ensure videoId is a non-empty string before attempting to use it with getSong
      if (videoId && videoId.trim() !== '') {
        try {
          const songInfo = await ytmusic.getSong(videoId);
          relatedResults = songInfo.related?.results || [];
        } catch (error) {
          console.warn(`[yt-music-proxy] Failed to get song info for videoId "${videoId}": ${error.message}. Falling back to search.`);
          // Fallback to search if getSong fails for a valid-looking videoId
          const searchQuery = `${artist || ''} ${album || ''} songs`.trim();
          if (searchQuery) {
            const searchRes = await ytmusic.search(searchQuery, 'songs');
            relatedResults = searchRes;
          }
        }
      } else if (artist || album) {
        // Fallback to searching if no valid videoId, combine artist and album for better results
        const searchQuery = `${artist || ''} ${album || ''} songs`.trim();
        if (searchQuery) {
          const searchRes = await ytmusic.search(searchQuery, 'songs');
          relatedResults = searchRes;
        }
      }

      const formattedTracks = relatedResults.map((item: any) => {
        const trackVideoId = item.videoId;
        if (!trackVideoId) {
          console.log(`[yt-music-proxy] Skipping related track "${item.title}" due to missing videoId.`);
          return null;
        }
        const title = item.title || item.name || 'Unknown Title';
        const trackArtist = getArtistName(item.artists || item.artist);
        const trackAlbum = item.album ? item.album.name : undefined;
        const thumbnail = item.thumbnails && item.thumbnails.length > 0 ? item.thumbnails[item.thumbnails.length - 1].url : undefined;
        const duration = item.duration;

        return {
          type: 'track',
          title,
          artist: trackArtist,
          album: trackAlbum,
          thumbnail,
          videoId: trackVideoId,
          duration,
        };
      }).filter(Boolean);

      return new Response(JSON.stringify({ relatedTracks: formattedTracks }), {
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